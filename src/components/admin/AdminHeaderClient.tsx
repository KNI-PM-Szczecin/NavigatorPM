"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';

export function AdminHeaderClient() {
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();

    const showBack = pathname !== '/admin-portal-721';

    return (
        <>
            {showBack && (
                <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1000 }}>
                    <button 
                        onClick={() => router.back()} 
                        style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: 'var(--background)',
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ← {t('ui.back')}
                    </button>
                </div>
            )}
            <header className="admin-header">
                <h2>{t('ui.adminDashboard')}</h2>
            </header>
        </>
    );
}
