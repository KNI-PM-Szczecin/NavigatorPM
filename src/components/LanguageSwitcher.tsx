"use client";

import { useLanguage } from '@/context/LanguageContext';

export function LanguageSwitcher() {
    const { locale, availableLocales, setLocale } = useLanguage();

    return (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
            <select 
                value={locale} 
                onChange={(e) => setLocale(e.target.value)}
                style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    cursor: 'pointer'
                }}
            >
                {availableLocales.map((l) => (
                    <option key={l.code} value={l.code}>
                        {l.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
