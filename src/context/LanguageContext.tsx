"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
    locale: string;
    translations: any;
    availableLocales: { code: string; name: string }[];
    setLocale: (code: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
    children, 
    initialLocales 
}: { 
    children: React.ReactNode;
    initialLocales: { code: string; name: string }[];
}) {
    const [locale, setLocaleState] = useState('en-US');
    const [translations, setTranslations] = useState<any>({});

    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(row => row.startsWith('locale='))?.split('=')[1];
        const defaultLocale = localeCookie || 'en-US';
        loadTranslations(defaultLocale);
    }, []);

    const loadTranslations = async (code: string) => {
        try {
            const res = await fetch(`/api/locales/${code}`);
            const data = await res.json();
            setTranslations(data);
            setLocaleState(code);
            document.cookie = `locale=${code}; path=/; max-age=31536000`;
        } catch (error) {
            console.error("Failed to load locale", code);
        }
    };

    const setLocale = (code: string) => {
        loadTranslations(code);
    };

    const t = (key: string) => {
        const keys = key.split('.');
        let val = translations;
        for (const k of keys) {
            val = val?.[k];
        }
        return val || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, translations, availableLocales: initialLocales, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
