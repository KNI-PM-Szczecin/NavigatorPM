"use client";

import { useLanguage } from '@/context/LanguageContext';

interface HomePageClientProps {
    buildings: any[];
}

export function HomePageClient({ buildings }: HomePageClientProps) {
    const { t, locale, availableLocales, setLocale } = useLanguage();

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

            {/* Header */}
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                padding: '0 24px',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: '#000', letterSpacing: '-0.3px' }}>
                    NavigatorPM
                </span>
                <select
                    value={locale}
                    onChange={e => setLocale(e.target.value)}
                    style={{
                        border: 'none',
                        background: '#f0f0f0',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#000',
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    {availableLocales.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                </select>
            </header>

            {/* Content */}
            <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px 64px' }}>

                {/* Hero */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: '#000', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                        NavigatorPM
                    </h1>
                    <p style={{ fontSize: 16, color: '#666', margin: 0 }}>
                        {t('ui.selectBuilding') || 'Select a building to start navigation.'}
                    </p>
                </div>

                {/* Building grid */}
                {buildings.length === 0 ? (
                    <div style={{
                        textAlign: 'center', color: '#999', padding: '64px 24px',
                        border: '2px dashed #e0e0e0', borderRadius: 16, background: '#fff'
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
                        <p style={{ margin: 0, fontSize: 15 }}>No buildings are currently available.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                        gap: 16,
                    }}>
                        {buildings.map(b => {
                            const name = b.translations[locale] || b.translations['en-US'] || b.name;
                            return (
                                <div key={b.id} style={{
                                    background: '#fff',
                                    borderRadius: 16,
                                    padding: '20px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    border: '1px solid #ebebeb',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#000' }}>
                                            {name}
                                        </h2>
                                        {b.description && (
                                            <p style={{ margin: 0, fontSize: 14, color: '#888', lineHeight: 1.5 }}>
                                                {b.description}
                                            </p>
                                        )}
                                        {b.address && (
                                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#aaa' }}>
                                                {b.address}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {t('ui.floor') || 'Floors'}
                                        </p>
                                        {b.floors.length === 0 ? (
                                            <span style={{ fontSize: 13, color: '#ccc' }}>No floors available</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {b.floors.map((f: any) => {
                                                    const floorName = f.translations[locale] || f.translations['en-US'] || f.name || `Level ${f.level}`;
                                                    return (
                                                        <a
                                                            key={f.id}
                                                            href={`/viewer/${f.id}`}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '8px 16px',
                                                                background: '#000',
                                                                color: '#fff',
                                                                borderRadius: 10,
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                textDecoration: 'none',
                                                                transition: 'opacity 0.15s',
                                                            }}
                                                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                                                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                                        >
                                                            {floorName}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
