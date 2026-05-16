"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { saveTranslation } from '@/lib/actions';

interface LocalizationEditorProps {
    entityType: 'building' | 'floor' | 'node';
    entityId: string;
    fieldName: string;
    initialValues: Record<string, string>;
}

export function LocalizationEditor({ entityType, entityId, fieldName, initialValues }: LocalizationEditorProps) {
    const { availableLocales, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState(initialValues);

    const handleSave = async () => {
        for (const locale of Object.keys(values)) {
            await saveTranslation(entityType, entityId, locale, fieldName, values[locale]);
        }
        setIsOpen(false);
        alert(t('ui.translationsSaved'));
    };

    if (!isOpen) {
        return <button onClick={() => setIsOpen(true)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>🌐 {t('ui.translate')}</button>;
    }

    return (
        <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'var(--background)', padding: '2rem', border: '2px solid var(--primary)',
            borderRadius: '8px', zIndex: 2000, minWidth: '300px', boxShadow: '0 0 20px rgba(0,0,0,0.2)'
        }}>
            <h4>{t('ui.translate')} {fieldName} ({entityId})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
                {availableLocales.map(l => (
                    <div key={l.code} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.8rem' }}>{l.name}</label>
                        <input 
                            value={values[l.code] || ''} 
                            onChange={(e) => setValues({...values, [l.code]: e.target.value})}
                            placeholder={`${fieldName} in ${l.name}`}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsOpen(false)} style={{ background: '#ccc' }}>{t('ui.cancel')}</button>
                <button onClick={handleSave}>{t('ui.save')}</button>
            </div>
        </div>
    );
}
