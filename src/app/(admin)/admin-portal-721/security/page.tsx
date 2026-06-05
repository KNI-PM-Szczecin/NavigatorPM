"use client";

import { resetSystemToDefaults } from '@/lib/actions';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function SecurityPage() {
    const { t } = useLanguage();
    const [isResetting, setIsResetting] = useState(false);

    async function onReset() {
        const confirmed = confirm(t('ui.confirmReset'));
        if (confirmed) {
            setIsResetting(true);
            await resetSystemToDefaults();
        }
    }

    return (
        <div style={{ padding: '2rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>{t('ui.securitySystem')}</h1>
            
            <section style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>{t('ui.systemReset')}</h3>
                <p style={{ color: '#666', textAlign: 'center' }}>{t('ui.wipeDataWarning')}</p>
                <button 
                    onClick={onReset} 
                    className="danger"
                    disabled={isResetting}
                >
                    {isResetting ? t('ui.resetting') : t('ui.resetSystemToDefaults')}
                </button>
            </section>

            <div style={{ marginTop: '3rem' }}>
                <a href="/admin-portal-721" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {t('ui.backToDashboard')}
                </a>
            </div>
        </div>
    );
}
