"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FloorManifest, BuildingManifest } from '@/types/manifest';
import { saveBuildingAction, saveTranslation } from '@/lib/actions';

interface FloorsClientProps {
    building: BuildingManifest;
    buildingTranslations: Record<string, string>;
    floors: FloorManifest[];
    addFloorAction: (formData: FormData) => Promise<void>;
    deleteFloorAction: (id: string) => Promise<void>;
}

export function FloorsClient({ 
    building,
    buildingTranslations: initialBuildingTranslations,
    floors, 
    addFloorAction, 
    deleteFloorAction
}: FloorsClientProps) {
    const { t, availableLocales } = useLanguage();
    const [isEditingBuilding, setIsEditingBuilding] = useState(false);
    const [buildingName, setBuildingName] = useState(building.name);
    const [buildingDesc, setBuildingDesc] = useState(building.description || '');
    const [buildingAddr, setBuildingAddr] = useState(building.address || '');
    const [localBuildingTrans, setLocalBuildingTrans] = useState(initialBuildingTranslations);
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdateBuilding = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('id', building.id);
            formData.append('name', buildingName);
            formData.append('description', buildingDesc);
            formData.append('address', buildingAddr);
            formData.append('isVisible', (building.isVisible ?? false).toString());
            
            await saveBuildingAction(formData);

                        for (const langCode of Object.keys(localBuildingTrans)) {
                await saveTranslation('building', building.id, langCode, 'name', localBuildingTrans[langCode]);
            }

            alert(t('ui.buildingSaved'));
            setIsEditingBuilding(false);
            window.location.reload();
        } catch (error) {
            alert("Error saving building");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '2rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>{t('ui.floorsFor')} {buildingName}</h1>
                <button 
                    onClick={() => setIsEditingBuilding(!isEditingBuilding)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: isEditingBuilding ? '#333' : '#fff', color: isEditingBuilding ? '#fff' : '#333', border: '1px solid #333' }}
                >
                    {t('ui.editBuilding')}
                </button>
            </div>

            
            {isEditingBuilding && (
                <section style={{ marginBottom: '3rem', width: '100%', maxWidth: '900px', border: '2px solid #333', padding: '2rem', borderRadius: '12px', background: '#fff' }}>
                    <h3 style={{ marginTop: 0 }}>{t('ui.editBuilding')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t('ui.buildingName')}</label>
                                <input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t('ui.description')}</label>
                                <textarea style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }} value={buildingDesc} onChange={(e) => setBuildingDesc(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t('ui.address')}</label>
                                <input value={buildingAddr} onChange={(e) => setBuildingAddr(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Localized Names (Friendly)</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '0.5rem', borderRadius: '4px', background: '#fcfcfc' }}>
                                {availableLocales.map(lang => (
                                    <div key={lang.code} style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>{lang.name}</label>
                                        <input 
                                            style={{ width: '100%', padding: '0.3rem', fontSize: '0.8rem' }}
                                            value={localBuildingTrans[lang.code] || ''} 
                                            onChange={(e) => setLocalBuildingTrans({ ...localBuildingTrans, [lang.code]: e.target.value })}
                                            placeholder={buildingName}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsEditingBuilding(false)} style={{ background: '#eee', color: '#333', border: '1px solid #ccc' }}>{t('ui.cancel')}</button>
                        <button onClick={handleUpdateBuilding} disabled={isSaving}>{isSaving ? '...' : t('ui.save')}</button>
                    </div>
                </section>
            )}
            
            <section style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>{t('ui.addNewFloor')}</h3>
                <form action={addFloorAction} className="form-group" style={{ width: '100%' }}>
                    <input name="level" type="number" placeholder={t('ui.floorLevel')} required />
                    <input name="name" placeholder={t('ui.friendlyName')} required />
                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>{t('ui.addFloor')}</button>
                </form>
            </section>

            <section style={{ width: '100%', maxWidth: '600px' }}>
                <h3 style={{ textAlign: 'center' }}>{t('ui.existingFloors')}</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {floors.map(f => (
                        <li key={f.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
                            <strong>{f.name} (Level {f.level})</strong>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                                <a href={`/admin-portal-721/floor/${f.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    {t('ui.manageFloor')}
                                </a>
                                <button 
                                    onClick={() => {
                                        if(confirm(t('ui.delete') + '?')) deleteFloorAction(f.id);
                                    }} 
                                    className="danger" 
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                >
                                    {t('ui.delete')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
            
            <div style={{ marginTop: '2rem' }}>
                <a href="/admin-portal-721/buildings">{t('ui.backToBuildings')}</a>
            </div>
        </div>
    );
}
