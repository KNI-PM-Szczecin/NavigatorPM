"use client";

import { useLanguage } from '@/context/LanguageContext';
import { BuildingManifest } from '@/types/manifest';
import { useState } from 'react';
import { addBuildingAction, deleteBuildingAction, saveBuildingAction } from '@/lib/actions';

interface BuildingsClientProps {
    buildings: BuildingManifest[];
    addBuildingAction: (formData: FormData) => Promise<void>;
    deleteBuildingAction: (id: string) => Promise<void>;
    translations: Record<string, Record<string, string>>;
}

export function BuildingsClient({ buildings, addBuildingAction, deleteBuildingAction, translations }: BuildingsClientProps) {
    const { t, locale } = useLanguage();
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = async (building: BuildingManifest) => {
        const formData = new FormData();
        formData.append('id', building.id);
        formData.append('name', building.name);
        formData.append('description', building.description || '');
        formData.append('address', building.address || '');
        formData.append('isVisible', (!building.isVisible).toString());
        
        await saveBuildingAction(formData);
    };

    return (
        <div style={{ padding: '2rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>{t('ui.buildingsManagement')}</h1>
            
            <section style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>{t('ui.addNewBuilding')}</h3>
                <form action={addBuildingAction} className="form-group" style={{ width: '100%' }}>
                    <input name="id" placeholder={t('ui.buildingId')} required />
                    <input name="name" placeholder={t('ui.buildingName')} required />
                    <input name="description" placeholder={t('ui.description')} />
                    <input name="address" placeholder={t('ui.address')} />
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input type="checkbox" name="isVisible" value="true" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                        {t('ui.visibleToPublic')}
                    </label>

                    <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>{t('ui.createBuilding')}</button>
                </form>
            </section>

            <section style={{ width: '100%', maxWidth: '500px' }}>
                <h3 style={{ textAlign: 'center' }}>{t('ui.existingBuildings')}</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {buildings.map(b => {
                        const localizedName = translations[b.id]?.[locale] || translations[b.id]?.['en-US'] || b.name;
                        return (
                            <li key={b.id} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', background: b.isVisible ? 'transparent' : '#f9f9f9' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>{localizedName} ({b.id})</strong>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', background: '#eee', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!!b.isVisible} 
                                            onChange={() => toggleVisibility(b)}
                                        />
                                        {t('ui.visibleToPublic')}
                                    </label>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{b.address}</div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                                    <a href={`/admin-portal-721/buildings/${b.id}/floors`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{t('ui.manageFloors')}</a>
                                    <button 
                                        onClick={() => {
                                            if(confirm(t('ui.delete') + '?')) deleteBuildingAction(b.id);
                                        }} 
                                        className="danger" 
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                    >
                                        {t('ui.delete')}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
            
            <div style={{ marginTop: '2rem' }}>
                <a href="/admin-portal-721">{t('ui.backToDashboard')}</a>
            </div>
        </div>
    );
}
