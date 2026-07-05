"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { NavigationNode, FloorManifest } from '@/types/manifest';
import { findPath } from '@/lib/navigation';
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
    const { locale } = useLanguage();
    const { algorithm } = useSettings();

    const [data, setData] = useState<{ floors: FloorWithTrans[], nodes: NavigationNode[] } | null>(null);
    const [currentFloorId, setCurrentFloorId] = useState(initialFloorId);
    const [searchQuery, setSearchQuery] = useState("");
    const [startNodeId, setStartNodeId] = useState<string | null>(initialFrom || null);
    const [endNodeId, setEndNodeId] = useState<string | null>(initialTo || null);
    const [activeStartNodeId, setActiveStartNodeId] = useState<string | null>(null);
    const [activeEndNodeId, setActiveEndNodeId] = useState<string | null>(null);
    const [calculatedPath, setCalculatedPath] = useState<string[]>([]);
    const [showDebugNodes, setShowDebugNodes] = useState(false);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [showFloorPicker, setShowFloorPicker] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [scale, setScale] = useState(1);

    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const url = new URL(window.location.href);
        if (startNodeId) url.searchParams.set('from', startNodeId); else url.searchParams.delete('from');
        if (endNodeId) url.searchParams.set('to', endNodeId); else url.searchParams.delete('to');
        window.history.replaceState({}, '', url.toString());
    }, [startNodeId, endNodeId]);

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
        return f.translations[locale] || f.translations['en-US'] || f.name || `Level ${f.level}`;
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

    const filteredNodes = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return selectionNodes.filter(n => {
            const name = getTranslated(n, 'name').toLowerCase();
            const shortName = getTranslated(n, 'shortName').toLowerCase();
            const desc = getTranslated(n, 'description').toLowerCase();
            return name.includes(q) || shortName.includes(q) || desc.includes(q);
        });
    }, [searchQuery, selectionNodes, locale]);

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
        } else {
            alert("No path found! Ensure points are connected.");
        }
    };

    const handleSelectDestination = (nodeId: string) => {
        setEndNodeId(nodeId);
        setSearchQuery("");
        setShowResults(false);
        if (startNodeId) {
            handleStartNavigation(startNodeId, nodeId);
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

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(s => Math.min(Math.max(s * factor, 0.3), 5));
    };

    if (!data || !currentFloor) return <div className="centered-flex">Loading...</div>;

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#e8e8e8', position: 'relative' }}>

            {/* "You are here" chip */}
            {(activeStartNodeId || startNodeId) && (
                <div style={{
                    position: 'absolute', top: 20, left: 16, zIndex: 500,
                    background: 'white', borderRadius: 24, padding: '8px 16px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#000' }}>You are here</span>
                </div>
            )}

            {/* Admin debug toggle */}
            {isAdmin && (
                <button
                    onClick={() => setShowDebugNodes(!showDebugNodes)}
                    style={{
                        position: 'absolute', top: 20, right: 16, zIndex: 500,
                        background: showDebugNodes ? '#ff4444' : 'white', color: showDebugNodes ? '#fff' : '#000',
                        border: 'none', borderRadius: 20, padding: '8px 14px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    DEBUG
                </button>
            )}

            {/* Map canvas */}
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', cursor: isPanning.current ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => isPanning.current = false}
                onMouseLeave={() => isPanning.current = false}
                onWheel={handleWheel}
            >
                <div style={{ position: 'relative', width: `${scale * 100}%`, minWidth: '100%', background: 'white', lineHeight: 0, flexShrink: 0 }}>
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
                            const start = data.nodes.find(n => (n.qrId || (n as any).qr_id) === calculatedPath[index - 1]);
                            const end = data.nodes.find(n => (n.qrId || (n as any).qr_id) === id);
                            if (start?.floorId === currentFloorId && end?.floorId === currentFloorId) {
                                return <line key={`path-${index}`} x1={`${start.x}%`} y1={`${start.y}%`} x2={`${end.x}%`} y2={`${end.y}%`} stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeDasharray="6, 8" className="nav-path-line" />;
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
                                    transform: `translate(-50%, -50%) scale(${1 / scale})`,
                                    width: (isStart || isEnd) ? '24px' : '10px',
                                    height: (isStart || isEnd) ? '24px' : '10px',
                                    borderRadius: '50%',
                                    background: isStart ? '#22c55e' : isEnd ? '#e74c3c' : (onPath ? '#22c55e' : (n.type === 'invisible' ? '#666' : '#3b82f6')),
                                    border: '2px solid #fff',
                                    zIndex: (isStart || isEnd || hoveredNodeId === id) ? 250 : 150,
                                    opacity: (showDebugNodes && !onPath && n.type === 'invisible') ? 0.5 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: (isStart || isEnd) ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                                }}
                            >
                                {isStart && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900', lineHeight: 1 }}>A</span>}
                                {isEnd && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900', lineHeight: 1 }}>B</span>}

                                {hoveredNodeId === id && getTranslated(n, 'name') && (
                                    <div style={{
                                        position: 'absolute', bottom: '160%', left: '50%', transform: 'translateX(-50%)',
                                        background: 'white', color: '#000', padding: '6px 12px', borderRadius: '20px',
                                        fontSize: '13px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1000,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)', fontWeight: '600'
                                    }}>
                                        {getTranslated(n, 'name')}
                                        <div style={{
                                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                            width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                                            borderTop: '6px solid white'
                                        }} />
                                    </div>
                                )}

                                {n.type === 'connector' && calculatedPath.includes(id) && (() => {
                                    const idx = calculatedPath.indexOf(id);
                                    const nextId = calculatedPath[idx + 1];
                                    const nextNode = data.nodes.find((node: any) => node.qrId === nextId);
                                    if (nextNode && nextNode.floorId !== n.floorId) {
                                        const fromFloor = data.floors.find((f: any) => f.id === n.floorId);
                                        const toFloor = data.floors.find((f: any) => f.id === nextNode.floorId);
                                        return (
                                            <div style={{
                                                position: 'absolute', bottom: '160%', left: '50%', transform: 'translateX(-50%)',
                                                background: '#22c55e', color: '#fff', padding: '6px 10px', borderRadius: '20px',
                                                fontSize: '11px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 900,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontWeight: 'bold',
                                            }}>
                                                {getFloorName(fromFloor)} → {getFloorName(toFloor)}
                                                <div style={{
                                                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                                    width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                                                    borderTop: '5px solid #22c55e'
                                                }} />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {(n.type === 'room' || n.type === 'poi') && (
                                    <div style={{
                                        position: 'absolute', top: '160%', left: '50%', transform: 'translateX(-50%)',
                                        color: '#000', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap',
                                        textShadow: '0 0 3px #fff, 0 0 3px #fff', pointerEvents: 'none'
                                    }}>
                                        {getTranslated(n, 'shortName')}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floor picker */}
            {showFloorPicker && (
                <div
                    style={{
                        position: 'absolute', bottom: 170, left: '50%', transform: 'translateX(-50%)',
                        background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        padding: '8px 0', zIndex: 2000, minWidth: 200
                    }}
                    onMouseLeave={() => setShowFloorPicker(false)}
                >
                    {data.floors.sort((a, b) => a.level - b.level).map(f => (
                        <button key={f.id} onClick={() => { setCurrentFloorId(f.id); setShowFloorPicker(false); }} style={{
                            display: 'block', width: '100%', padding: '12px 20px',
                            border: 'none', background: currentFloorId === f.id ? '#f3f3f3' : 'transparent',
                            textAlign: 'left', cursor: 'pointer', fontSize: 15,
                            fontWeight: currentFloorId === f.id ? 700 : 400, color: '#000'
                        }}>
                            {getFloorName(f)}
                        </button>
                    ))}
                </div>
            )}

            {/* Search results */}
            {showResults && filteredNodes.length > 0 && (
                <div style={{
                    position: 'absolute', bottom: 158, left: 16, right: 16,
                    background: '#fff', borderRadius: 16,
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
                    zIndex: 1500, maxHeight: 240, overflowY: 'auto'
                }}>
                    {filteredNodes.map(n => {
                        const id = (n.qrId || (n as any).qr_id);
                        const floorObj = data.floors.find(f => f.id === n.floorId);
                        return (
                            <button key={id} onClick={() => handleSelectDestination(id)} style={{
                                display: 'block', width: '100%', padding: '12px 20px',
                                border: 'none', borderBottom: '1px solid #f3f3f3',
                                background: 'transparent', textAlign: 'left',
                                cursor: 'pointer', color: '#000'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{getTranslated(n, 'name') || id}</div>
                                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{getFloorName(floorObj)}</div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Bottom navigation panel */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#fff',
                borderRadius: '20px 20px 0 0',
                padding: '20px 20px 28px',
                boxShadow: '0 -4px 30px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#000' }}>Navigate</h2>
                    <button
                        onClick={() => setShowFloorPicker(!showFloorPicker)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#f0f0f0', border: 'none', borderRadius: 20,
                            padding: '8px 14px', fontSize: 14, fontWeight: 500,
                            cursor: 'pointer', color: '#000'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="6" rx="1" />
                            <rect x="2" y="11" width="20" height="6" rx="1" />
                            <rect x="2" y="19" width="20" height="3" rx="1" />
                        </svg>
                        {getFloorName(currentFloor)}
                    </button>
                </div>

                <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search room or facility..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
                        onFocus={() => setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 150)}
                        style={{
                            width: '100%', padding: '14px 16px 14px 44px',
                            borderRadius: 14, border: 'none', background: '#f3f3f3',
                            fontSize: 16, color: '#000', boxSizing: 'border-box', outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e293b', opacity: 0.7 }} />
                </div>
            </div>
        </div>
    );
}
