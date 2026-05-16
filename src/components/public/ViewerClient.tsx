"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { NavigationNode, FloorManifest } from '@/types/manifest';
import { findPath } from '@/lib/navigation';
import { algorithmRegistry } from '@/lib/algorithms/registry';

interface ViewerClientProps {
    buildingId: string;
    initialFloorId: string;
    isAdmin: boolean;
    initialFrom?: string;
    initialTo?: string;
}

interface FloorWithTrans extends FloorManifest {
    translations: Record<string, string>;
}

export default function ViewerClient({ buildingId, initialFloorId, isAdmin, initialFrom, initialTo }: ViewerClientProps) {
    const { t, locale } = useLanguage();
    const { algorithm, setAlgorithm } = useSettings();
    
    const [data, setData] = useState<{ floors: FloorWithTrans[], nodes: NavigationNode[] } | null>(null);
    const [currentFloorId, setCurrentFloorId] = useState(initialFloorId);
    const [searchQuery, setSearchPlaceholder] = useState("");
    const [startNodeId, setStartNodeId] = useState<string | null>(initialFrom || null);
    const [endNodeId, setEndNodeId] = useState<string | null>(initialTo || null);
    const [activeStartNodeId, setActiveStartNodeId] = useState<string | null>(null);
    const [activeEndNodeId, setActiveEndNodeId] = useState<string | null>(null);
    const [calculatedPath, setCalculatedPath] = useState<string[]>([]);
    const [showDebugNodes, setShowDebugNodes] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const availableAlgorithms = useMemo(() => algorithmRegistry.getAvailableAlgorithms(), []);

        useEffect(() => {
        const url = new URL(window.location.href);
        if (startNodeId) url.searchParams.set('from', startNodeId); else url.searchParams.delete('from');
        if (endNodeId) url.searchParams.set('to', endNodeId); else url.searchParams.delete('to');
        window.history.replaceState({}, '', url.toString());
    }, [startNodeId, endNodeId]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsMenuOpen(false);
            } else {
                setIsMenuOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetch(`/api/building/${buildingId}/nodes`, { cache: 'no-store' })
            .then(res => res.json())
            .then(setData);
    }, [buildingId]);

        useEffect(() => {
        if (data && initialFrom && initialTo && initialFrom !== initialTo) {
            handleStartNavigation(initialFrom, initialTo);
        } else if (data && initialFrom) {
                        const node = data.nodes.find(n => n.qrId === initialFrom);
            if (node) setCurrentFloorId(node.floorId);
        }
    }, [data]);

    const currentFloor = data?.floors.find(f => f.id === currentFloorId);
    
    const getFloorName = (f: FloorWithTrans | undefined) => {
        if (!f) return "";
        return f.translations[locale] || f.translations['en-US'] || f.name;
    };

    const getTranslated = (node: NavigationNode, field: 'name' | 'shortName' | 'description') => {
        const trans = node.translations;
        if (!trans) return node[field] || "";
        return trans[locale]?.[field] || trans['en-US']?.[field] || node[field] || "";
    };

    const selectionNodes = useMemo(() => {
        if (!data) return [];
        return data.nodes.filter(n => {
            const isNav = n.isNavigable !== false;
            const hasName = (n.name && n.name.trim() !== '');
            const isUserPoint = n.type !== 'invisible';
            return isNav && (isUserPoint || hasName);
        });
    }, [data]);

    const handleStartNavigation = (overrideFrom?: string, overrideTo?: string) => {
        const sId = overrideFrom || startNodeId;
        const eId = overrideTo || endNodeId;

        if (!data || !sId || !eId || sId === eId) return;
        
        setActiveStartNodeId(sId);
        setActiveEndNodeId(eId);
        
        const path = findPath(data.nodes, sId, eId, algorithm);
        setCalculatedPath(path);
        
        if (path.length > 0) {
            const firstNode = data.nodes.find(n => (n.qrId || (n as any).qr_id) === path[0]);
            if (firstNode) setCurrentFloorId(firstNode.floorId);
            if (window.innerWidth <= 768) setIsMenuOpen(false);
        } else {
            alert("No path found! Ensure points are connected.");
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 || e.button === 1) { 
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning.current && containerRef.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            containerRef.current.scrollLeft -= dx;
            containerRef.current.scrollTop -= dy;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    if (!data || !currentFloor) return <div className="centered-flex">Loading...</div>;

    return (
        <div className="viewer-layout">
            
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                    position: 'absolute', top: '10px', left: '10px', zIndex: 1001,
                    background: '#000', color: '#fff', border: '2px solid #fff',
                    borderRadius: '50%', width: '40px', height: '40px',
                    display: 'none', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
                className="mobile-overlay-toggle"
            >
                {isMenuOpen ? '✕' : '☰'}
            </button>

            <div className="side-panel" style={{ 
                display: isMenuOpen ? 'flex' : 'none',
                position: (window.innerWidth <= 768) ? 'absolute' : 'relative',
                top: 0, left: 0, height: '100%',
                maxHeight: (window.innerWidth <= 768) ? '100%' : 'none',
                zIndex: 1000
            }}>
                <div style={{ padding: '0.8rem', borderBottom: '2px solid #333', background: '#f9f9f9', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#000', fontWeight: '900' }}>NavigatorPM</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
                    <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold' }}>ALGORITHM:</label>
                        <select style={{ width: '100%', padding: '0.2rem', fontSize: '0.75rem', border: '1px solid #999', marginTop: '0.2rem', color: '#000' }} value={algorithm} onChange={(e) => setAlgorithm(e.target.value as any)}>
                            {availableAlgorithms.map(algo => <option key={algo.identifier} value={algo.identifier}>{algo.name}</option>)}
                        </select>
                    </div>

                    <div style={{ background: '#fff', padding: '0.6rem', borderRadius: '6px', border: '2px solid #333', marginBottom: '1rem' }}>
                        <div style={{ marginBottom: '0.6rem' }}>
                            <label style={{ fontSize: '0.6rem', color: '#000', fontWeight: 'bold' }}>FROM:</label>
                            <select style={{ width: '100%', padding: '0.3rem', border: '1px solid #333', color: '#000', fontSize: '0.75rem' }} value={startNodeId || ""} onChange={(e) => setStartNodeId(e.target.value)}>
                                <option value="">Select...</option>
                                {selectionNodes.map(n => {
                                    const id = (n.qrId || (n as any).qr_id);
                                    const floorObj = data.floors.find(f => f.id === n.floorId);
                                    const translatedName = getTranslated(n, 'name');
                                    const translatedDesc = getTranslated(n, 'description');
                                    const description = translatedDesc ? ` — ${translatedDesc}` : '';
                                    return <option key={id} value={id} style={{ color: '#000' }}>{translatedName || id}{description} ({getFloorName(floorObj)})</option>
                                })}
                            </select>
                        </div>
                        <div style={{ marginBottom: '0.8rem' }}>
                            <label style={{ fontSize: '0.6rem', color: '#000', fontWeight: 'bold' }}>TO:</label>
                            <select style={{ width: '100%', padding: '0.3rem', border: '1px solid #333', color: '#000', fontSize: '0.75rem' }} value={endNodeId || ""} onChange={(e) => setEndNodeId(e.target.value)}>
                                <option value="">Select destination...</option>
                                {selectionNodes.map(n => {
                                    const id = (n.qrId || (n as any).qr_id);
                                    const floorObj = data.floors.find(f => f.id === n.floorId);
                                    const translatedName = getTranslated(n, 'name');
                                    const translatedDesc = getTranslated(n, 'description');
                                    const description = translatedDesc ? ` — ${translatedDesc}` : '';
                                    return <option key={id} value={id} style={{ color: '#000' }}>{translatedName || id}{description} ({getFloorName(floorObj)})</option>
                                })}
                            </select>
                        </div>
                        <button disabled={!startNodeId || !endNodeId || startNodeId === endNodeId} onClick={() => handleStartNavigation()} style={{ width: '100%', padding: '0.5rem', background: (!startNodeId || !endNodeId || startNodeId === endNodeId) ? '#ccc' : '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: (!startNodeId || !endNodeId || startNodeId === endNodeId) ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}>
                            {t('ui.startNavigation')}
                        </button>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.65rem', color: '#000', marginBottom: '0.4rem', fontWeight: 'bold' }}>PIĘTRA</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {data.floors.sort((a,b) => a.level - b.level).map(f => (
                                <button key={f.id} onClick={() => {
                                    setCurrentFloorId(f.id);
                                    if (window.innerWidth <= 768) setIsMenuOpen(false);
                                }} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #333', background: currentFloorId === f.id ? '#000' : '#fff', color: currentFloorId === f.id ? '#fff' : '#000', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'left' }}>
                                    {getFloorName(f)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0.6rem', borderTop: '2px solid #333', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#f5f5f5' }}>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowDebugNodes(!showDebugNodes)}
                            style={{ width: '100%', padding: '0.3rem', fontSize: '0.6rem', background: showDebugNodes ? '#ff4444' : '#fff', color: showDebugNodes ? '#fff' : '#000', border: '1px solid #000' }}
                        >
                            DEBUG: {showDebugNodes ? 'Hide' : 'Show'} Connections
                        </button>
                    )}
                    <button 
                        onClick={() => window.location.href = '/'} 
                        style={{ 
                            width: '100%', padding: '0.6rem', border: '3px solid #000', 
                            background: '#000000', color: '#ffffff', 
                            borderRadius: '4px', cursor: 'pointer', fontWeight: '900', 
                            fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                        }}
                    >
                        <span style={{ color: '#ffffff' }}>WYJŚCIE</span>
                    </button>
                </div>
            </div>

            
            <div style={{ position: 'absolute', bottom: '1.2rem', left: (window.innerWidth <= 768) ? '10px' : '295px', display: 'flex', gap: '0.4rem', zIndex: 900, alignItems: 'center' }}>
                <div style={{ display: 'flex', background: '#fff', border: '2px solid #333', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <button onClick={() => setScale(s => Math.min(s * 1.2, 10))} style={{ padding: '0.4rem 0.8rem', border: 'none', background: '#fff', color: '#000', fontWeight: '900', fontSize: '1.1rem' }}>+</button>
                    <div className="desktop-only" style={{ padding: '0.4rem', background: '#000', color: '#fff', fontSize: '0.85rem', minWidth: '50px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {Math.round(scale * 100)}%
                    </div>
                    <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} style={{ padding: '0.5rem 0.8rem', border: 'none', background: '#fff', color: '#000', fontWeight: '900', fontSize: '1.1rem' }}>-</button>
                </div>
                <button onClick={() => setScale(1)} style={{ background: '#fff', border: '2px solid #333', color: '#000', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}>FIT</button>
            </div>

            
            <div ref={containerRef} className="map-canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => isPanning.current = false} onMouseLeave={() => isPanning.current = false} style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}>
                <div style={{ position: 'relative', width: (window.innerWidth <= 768) ? `${scale * 200}%` : `${scale * 90}%`, background: 'white', boxShadow: '0 0 50px rgba(0,0,0,0.1)', lineHeight: 0, flexShrink: 0 }}>
                    <img src={currentFloor.svgMapUrl} alt="Map" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }} />
                    
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 100 }}>
                        {showDebugNodes && data.nodes.filter(n => n.floorId === currentFloorId).map((node: any) => (
                            (node.connections || []).map((connId: string) => {
                                const target = data.nodes.find((n: any) => (n.qrId || n.qr_id) === connId);
                                if (!target || target.floorId !== currentFloorId) return null;
                                return <line key={`debug-${(node.qrId || node.qr_id)}-${connId}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${target.x}%`} y2={`${target.y}%`} stroke="#ff4444" strokeWidth="2" strokeOpacity="0.5" />;
                            })
                        ))}

                        {calculatedPath.map((id, index) => {
                            if (index === 0) return null;
                            const start = data.nodes.find(n => (n.qrId || (n as any).qr_id) === calculatedPath[index-1]);
                            const end = data.nodes.find(n => (n.qrId || (n as any).qr_id) === id);
                            if (start?.floorId === currentFloorId && end?.floorId === currentFloorId) {
                                return <line key={`path-${index}`} x1={`${start.x}%`} y1={`${start.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke="#0070f3" strokeWidth="5" strokeLinecap="round" strokeDasharray="6, 8" className="nav-path-line" />;
                            }
                            return null;
                        })}
                    </svg>

                    {data.nodes.filter(n => n.floorId === currentFloorId && (showDebugNodes || n.type !== 'invisible' || calculatedPath.includes(n.qrId || (n as any).qr_id))).map((n: any) => {
                        const id = n.qrId || n.qr_id;
                        const isStart = id === activeStartNodeId;
                        const isEnd = id === activeEndNodeId;
                        const onPath = calculatedPath.includes(id);

                        if (!showDebugNodes && !onPath && n.type === 'invisible') return null;

                        return (
                            <div 
                                key={id} 
                                onMouseEnter={() => setHoveredNodeId(id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                onClick={() => setHoveredNodeId(hoveredNodeId === id ? null : id)}
                                style={{
                                    position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
                                    transform: `translate(-50%, -50%) scale(${1/scale})`,
                                    width: (isStart || isEnd) ? '24px' : '10px', 
                                    height: (isStart || isEnd) ? '24px' : '10px',
                                    borderRadius: '50%', 
                                    background: isStart ? '#2ecc71' : isEnd ? '#e74c3c' : (onPath ? '#0070f3' : (n.type === 'invisible' ? '#666' : '#0070f3')),
                                    border: '1px solid #fff', zIndex: (isStart || isEnd || hoveredNodeId === id) ? 250 : 150,
                                    opacity: (showDebugNodes && !onPath && n.type === 'invisible') ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {isStart && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '900', lineHeight: 1 }}>A</span>}
                                {isEnd && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '900', lineHeight: 1 }}>B</span>}
                                
                                {hoveredNodeId === id && getTranslated(n, 'description') && (
                                    <div style={{
                                        position: 'absolute', bottom: '150%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'rgba(0, 0, 0, 0.9)', color: '#fff', padding: '8px 12px', borderRadius: '6px',
                                        fontSize: '13px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1000,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                        fontWeight: '500'
                                    }}>
                                        {getTranslated(n, 'description')}
                                        <div style={{
                                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                            width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                                            borderTop: '6px solid rgba(0, 0, 0, 0.9)'
                                        }} />
                                    </div>
                                )}

                                {n.type === 'connector' && calculatedPath.includes(id) && (
                                    (() => {
                                        const idx = calculatedPath.indexOf(id);
                                        const nextId = calculatedPath[idx + 1];
                                        const nextNode = data.nodes.find(node => node.qrId === nextId);
                                        
                                        if (nextNode && nextNode.floorId !== n.floorId) {
                                            const currentFloorObj = data.floors.find(f => f.id === n.floorId);
                                            const nextFloorObj = data.floors.find(f => f.id === nextNode.floorId);
                                            
                                            const fromName = getFloorName(currentFloorObj);
                                            const toName = getFloorName(nextFloorObj);
                                            
                                            const text = t('ui.floorChangeFromTo')
                                                .replace('{{from}}', fromName)
                                                .replace('{{to}}', toName);

                                            return (
                                                <div style={{
                                                    position: 'absolute', bottom: '150%', left: '50%', transform: 'translateX(-50%)',
                                                    background: 'var(--primary)', color: '#fff', padding: '6px 10px', borderRadius: '6px',
                                                    fontSize: '11px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 900,
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontWeight: 'bold',
                                                    border: '2px solid #fff'
                                                }}>
                                                    {text}
                                                    <div style={{
                                                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                                        width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                                                        borderTop: '5px solid var(--primary)'
                                                    }} />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()
                                )}

                                {(n.type === 'room' || n.type === 'poi') && (
                                    <div style={{
                                        position: 'absolute', top: '160%', left: '50%', transform: 'translateX(-50%)',
                                        color: '#000', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap',
                                        textShadow: '0 0 2px #fff, 0 0 2px #fff', pointerEvents: 'none'
                                    }}>
                                        {getTranslated(n, 'shortName')}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
