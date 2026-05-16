"use client";

import { useLanguage } from '@/context/LanguageContext';

interface HomePageClientProps {
    buildings: any[];
}

export function HomePageClient({ buildings }: HomePageClientProps) {
    const { t, locale } = useLanguage();

    return (
        <div style={{ padding: '2rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('ui.systemName')}</h1>
            <p style={{ color: '#666', marginBottom: '3rem' }}>{t('ui.selectBuilding')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px' }}>
                {buildings.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '3rem', border: '2px dashed #eee', borderRadius: '12px' }}>
                        No buildings are currently visible to the public.
                    </div>
                ) : (
                    buildings.map(b => {
                        const localizedName = b.translations[locale] || b.translations['en-US'] || b.name;
                        return (
                            <div key={b.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ margin: '0 0 0.5rem 0' }}>{localizedName}</h2>
                                <p style={{ fontSize: '0.9rem', color: '#666', flex: 1, marginBottom: '1.5rem' }}>{b.description}</p>
                                
                                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Available Floors</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {b.floors.map((f: any) => {
                                            const floorName = f.translations[locale] || f.translations['en-US'] || f.name;
                                            return (
                                                <a 
                                                    key={f.id} 
                                                    href={`/viewer/${f.id}`}
                                                    style={{ 
                                                        padding: '0.4rem 0.8rem', 
                                                        background: 'var(--primary)', 
                                                        color: 'white', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 'bold',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    {floorName}
                                                </a>
                                            );
                                        })}
                                        {b.floors.length === 0 && <span style={{ fontSize: '0.8rem', color: '#ccc' }}>No floors available</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
