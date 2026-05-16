"use client";

import { changePassword, resetSystemToDefaults, handleLogout } from '@/lib/actions';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function SecurityPage() {
    const { t } = useLanguage();
    const [isResetting, setIsResetting] = useState(false);

    async function handleUpdate(formData: FormData) {
        const newPassword = formData.get('newPassword') as string;
        await changePassword(newPassword);
        alert(t('ui.passwordUpdated'));
    }

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
            
            <section style={{ marginBottom: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ width: '100%', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3>{t('ui.changePassword')}</h3>
                    <form action={handleUpdate} className="form-group" style={{ width: '100%' }}>
                        <label>{t('ui.newPassword')}</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            required 
                        />
                        <button type="submit" style={{ width: '100%' }}>{t('ui.updatePassword')}</button>
                    </form>
                </div>

                <div style={{ width: '100%', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>{t('ui.logout')}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>End your current session.</p>
                    <button onClick={async () => await handleLogout()} style={{ width: '100%', background: '#666' }}>
                        {t('ui.logout')}
                    </button>
                </div>
            </section>

            <hr style={{ width: '100%', maxWidth: '500px' }} />

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

            <div style={{ marginTop: '2rem' }}>
                <a href="/admin-portal-721">{t('ui.backToDashboard')}</a>
            </div>
        </div>
    );
}
