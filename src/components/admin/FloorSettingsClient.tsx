"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FloorManifest } from '@/types/manifest';
import { MapUpload } from './MapUpload';
import { saveTranslation } from '@/lib/actions';

interface FloorSettingsClientProps {
    floor: FloorManifest;
    updateFloorAction: (formData: FormData) => Promise<void>;
    translations: Record<string, string>;
}

export function FloorSettingsClient({ 
    floor, 
    updateFloorAction, 
    translations: initialTranslations
}: FloorSettingsClientProps) {
    const { t, availableLocales } = useLanguage();
    const [localTranslations, setLocalTranslations] = useState<Record<string, string>>(initialTranslations);
    const [isSavingTrans, setIsSavingTrans] = useState(false);
    const [isSavingMap, setIsSavingMap] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(floor.isVisible || false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSaveTranslations = async () => {
        setIsSavingTrans(true);
        try {
            for (const langCode of Object.keys(localTranslations)) {
                await saveTranslation('floor', floor.id, langCode, 'name', localTranslations[langCode]);
            }
            alert(t('ui.translationsSaved'));
        } catch (error) {
            alert("Error saving translations");
        } finally {
            setIsSavingTrans(false);
        }
    };

    const handleUpdateMap = async (formData: FormData) => {
        setIsSavingMap(true);
        try {
            await updateFloorAction(formData);
            alert(t('ui.mapSaved'));
            window.location.reload();
        } catch (error) {
            alert("Error updating map");
        } finally {
            setIsSavingMap(false);
        }
    };

    const hasMap = !!floor.svgMapUrl;

    return (
        <div style={{ padding: '2rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ marginBottom: '2rem' }}>{t('ui.floorSettings')}: {floor.id}</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', padding: '0 1rem' }}>
                
                
                <section style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                    <h3>{t('ui.friendlyName')}</h3>
                    
                    <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        border: '1px solid #eee', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.02)',
                        marginBottom: '1rem'
                    }}>
                        {availableLocales.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>{lang.name}</label>
                                <input 
                                    value={localTranslations[lang.code] || ''} 
                                    onChange={(e) => setLocalTranslations({ ...localTranslations, [lang.code]: e.target.value })}
                                    placeholder={initialTranslations['en-US'] || floor.name}
                                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                                />
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleSaveTranslations} 
                        disabled={isSavingTrans}
                        style={{ width: '100%', fontSize: '0.9rem' }}
                    >
                        {isSavingTrans ? t('ui.resetting') : t('ui.save')}
                    </button>
                </section>

                
                <section style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                    <h3>{t('ui.svgMapSource')} & Status</h3>
                    <form action={handleUpdateMap} className="form-group" style={{ width: '100%', marginBottom: 0 }}>
                        <MapUpload />
                        <div style={{ width: '100%', margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }} />
                            <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'bold' }}>{t('ui.orUseUrl')}</span>
                            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }} />
                        </div>
                        <input name="svgUrl" placeholder={t('ui.externalSvgUrl')} defaultValue={floor.svgMapUrl || ''} style={{ width: '100%', marginBottom: '1rem' }} />
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', border: '1px solid #eee', padding: '0.5rem', borderRadius: '4px' }}>
                            <input type="checkbox" name="isVisible" value="true" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
                            <strong>{t('ui.visibleToPublic')}</strong>
                        </label>

                        <button type="submit" disabled={isSavingMap} style={{ width: '100%' }}>
                            {isSavingMap ? t('ui.resetting') : t('ui.save')}
                        </button>
                    </form>
                </section>

                
                <section style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <h4 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>Map Preview</h4>
                    <div style={{ 
                        width: '100%', 
                        height: '180px', 
                        background: '#f9f9f9', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        border: '1px solid #eee',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {hasMap ? (
                            <img 
                                key={floor.svgMapUrl}
                                src={mounted ? `${floor.svgMapUrl}?t=${Date.now()}` : floor.svgMapUrl} 
                                alt="Floor Preview" 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ color: '#999', fontSize: '0.8rem' }}>No map SVG loaded for this floor.</div>
                        )}
                    </div>
                </section>
            </div>

            
            <div style={{ marginTop: '2rem' }}>
                <a 
                    href={hasMap ? `/admin-portal-721/editor/${floor.id}` : '#'} 
                    onClick={(e) => !hasMap && e.preventDefault()}
                    style={{ 
                        padding: '0.6rem 1.5rem', 
                        background: hasMap ? 'var(--primary)' : '#ccc', 
                        color: 'white', 
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        cursor: hasMap ? 'pointer' : 'not-allowed',
                        opacity: hasMap ? 1 : 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                    }}
                >
                    {t('ui.openEditor')}
                </a>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
                <button onClick={() => window.history.back()} style={{ background: '#eee', color: '#333' }}>
                    {t('ui.back')}
                </button>
            </div>
        </div>
    );
}
