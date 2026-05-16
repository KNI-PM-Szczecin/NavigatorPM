"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Algorithm } from '@/lib/navigation';

interface SettingsContextType {
    theme: 'light' | 'dark';
    algorithm: Algorithm;
    toggleTheme: () => void;
    setAlgorithm: (algo: Algorithm) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [algorithm, setAlgorithmState] = useState<Algorithm>('A-star');

    useEffect(() => {
        const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
        const savedAlgo = document.cookie.split('; ').find(row => row.startsWith('algorithm='))?.split('=')[1];
        
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
        if (savedAlgo === 'A-star' || savedAlgo === 'Dijkstra') setAlgorithmState(savedAlgo);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const setAlgorithm = (algo: Algorithm) => {
        setAlgorithmState(algo);
        document.cookie = `algorithm=${algo}; path=/; max-age=31536000`;
    };

    return (
        <SettingsContext.Provider value={{ theme, algorithm, toggleTheme, setAlgorithm }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
}
