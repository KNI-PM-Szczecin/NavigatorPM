"use client";

import { useLanguage } from '@/context/LanguageContext';

export function AdminDashboardClient() {
    const { t } = useLanguage();

    return (
        <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1>{t('ui.adminDashboard')}</h1>
            <nav style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <a href="/admin-portal-721/buildings" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {t('ui.manageBuildings')}
                </a>
                <a href="/admin-portal-721/security" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {t('ui.securitySystem')}
                </a>
            </nav>
            <p>{t('ui.welcomeAdmin')}</p>
        </div>
    );
}
