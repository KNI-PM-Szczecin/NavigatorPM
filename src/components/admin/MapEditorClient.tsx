"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { NavigationNode, FloorManifest } from '@/types/manifest';
import { saveNodesAction } from '@/lib/actions';
import { LocalizationEditor } from './LocalizationEditor';

interface MapEditorClientProps {
    floor: FloorManifest;
    initialNodes: NavigationNode[];
    crossFloorTargets: Record<string, { floorName: string, connectors: NavigationNode[] }>;
    allFloors: FloorManifest[];
}

type EditorMode = 'select' | 'connect';

const TYPE_COLORS = {
    invisible: '#888888',
    poi: '#0070f3',
    room: '#2ecc71',
    location: '#f1c40f',
    connector: '#9b59b6'
};

export function MapEditorClient({ floor, initialNodes, crossFloorTargets, allFloors }: MapEditorClientProps) {
    const { t } = useLanguage();
    const [nodes, setNodes] = useState<NavigationNode[]>(initialNodes);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>('select');
    const [isSaving, setIsSaving] = useState(false);
    
    const [scale, setScale] = useState(1);
    const [isMagnetEnabled, setIsMagnetEnabled] = useState(true);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [snapGuides, setSnapGuides] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const mapSurfaceRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const clickStartPos = useRef({ x: 0, y: 0 });

    const selectedNode = nodes.find(n => n.qrId === selectedNodeId);

        useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
            
            if (e.key === 'v') setEditorMode('select');
            if (e.key === 'c') setEditorMode('connect');
            if (e.key === 'Escape') { setSelectedNodeId(null); setEditorMode('select'); }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') { e.preventDefault(); handleSave(); }
            }
            if (selectedNodeId && !draggingNodeId) {
                if (e.key === 'Delete' || e.key === 'Backspace') deleteNode(selectedNodeId);
                if (e.key === '1') updateNode(selectedNodeId, { type: 'invisible' });
                if (e.key === '2') updateNode(selectedNodeId, { type: 'poi' });
                if (e.key === '3') updateNode(selectedNodeId, { type: 'room' });
                if (e.key === '4') updateNode(selectedNodeId, { type: 'location' });
                if (e.key === '5') updateNode(selectedNodeId, { type: 'connector' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, nodes, draggingNodeId]);

    const handleMapMouseDown = (e: React.MouseEvent) => {
        clickStartPos.current = { x: e.clientX, y: e.clientY };
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            isPanning.current = true;
            e.preventDefault();
        }
    };

    const handleMapClick = (e: React.MouseEvent) => {
        const moveDist = Math.hypot(e.clientX - clickStartPos.current.x, e.clientY - clickStartPos.current.y);
        if (moveDist > 5) return;
        if (e.button !== 0 || isPanning.current || draggingNodeId) return;
        
                if (editorMode === 'connect') {
            setSelectedNodeId(null);
            return;
        }

        if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('map-img')) return;
        
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newNodeNumber = nodes.length > 0 
            ? Math.max(...nodes.map(n => parseInt(n.qrId.split('-').pop() || '0'))) + 1 
            : 1;
        
        const newNode: NavigationNode = {
            qrId: `${floor.id}-${newNodeNumber}`,
            floorId: floor.id,
            x, y,
            type: 'invisible',
            connections: []
        };

        setNodes([...nodes, newNode]);
        setSelectedNodeId(newNode.qrId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning.current && containerRef.current) {
            containerRef.current.scrollLeft -= e.movementX;
            containerRef.current.scrollTop -= e.movementY;
        }

        if (draggingNodeId && mapSurfaceRef.current && editorMode === 'select') {
            const rect = mapSurfaceRef.current.getBoundingClientRect();
            let newX = ((e.clientX - rect.left) / rect.width) * 100;
            let newY = ((e.clientY - rect.top) / rect.height) * 100;

            let snappedX: number | null = null;
            let snappedY: number | null = null;

            if (isMagnetEnabled) {
                const threshold = 0.5;
                for (const node of nodes) {
                    if (node.qrId === draggingNodeId) continue;
                    if (Math.abs(node.x - newX) < threshold) { newX = node.x; snappedX = node.x; }
                    if (Math.abs(node.y - newY) < threshold) { newY = node.y; snappedY = node.y; }
                }
            }

            setSnapGuides({ x: snappedX, y: snappedY });
            updateNode(draggingNodeId, { x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        isPanning.current = false;
        setDraggingNodeId(null);
        setSnapGuides({ x: null, y: null });
    };

    const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.button !== 0) return;

        if (editorMode === 'connect') {
            if (selectedNodeId && selectedNodeId !== id) {
                toggleConnection(id);
                                setSelectedNodeId(id);
            } else {
                setSelectedNodeId(id);
            }
        } else {
                        if (e.shiftKey && selectedNodeId && selectedNodeId !== id) {
                toggleConnection(id);
            } else {
                setSelectedNodeId(id);
                setDraggingNodeId(id);
            }
        }
    };

    const updateNode = (id: string, updates: Partial<NavigationNode>) => {
        setNodes(prev => prev.map(n => n.qrId === id ? { ...n, ...updates } : n));
    };

    const deleteNode = (id: string) => {
        setNodes(prev => prev
            .filter(n => n.qrId !== id)
            .map(n => ({
                ...n,
                connections: n.connections.filter(c => c !== id)
            }))
        );
        if (selectedNodeId === id) setSelectedNodeId(null);
    };

    const toggleConnection = (targetId: string) => {
        if (!selectedNodeId || selectedNodeId === targetId) return;
        
        const isConnected = selectedNode?.connections.includes(targetId);
        
        setNodes(prev => prev.map(n => {
                        if (n.qrId === selectedNodeId) {
                const newConnections = isConnected 
                    ? n.connections.filter(c => c !== targetId)
                    : [...n.connections, targetId];
                return { ...n, connections: newConnections };
            }
                        if (n.qrId === targetId) {
                const newConnections = isConnected 
                    ? n.connections.filter(c => c !== selectedNodeId)
                    : [...n.connections, selectedNodeId];
                return { ...n, connections: newConnections };
            }
            return n;
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveNodesAction(floor.id, nodes);
            alert(t('ui.nodesSaved'));
        } catch (e) {
            alert("Error saving nodes");
        } finally {
            setIsSaving(false);
        }
    };

    const controlButtonStyle: React.CSSProperties = {
        background: '#ffffff', border: '2px solid #333', color: '#333',
        padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 'bold',
        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
    };

    const activeButtonStyle: React.CSSProperties = {
        ...controlButtonStyle,
        background: '#333',
        color: '#fff'
    };

    return (
        <div 
            style={{ display: 'flex', height: '100vh', width: '100vw', background: '#f0f0f0', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            
            <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 1000, background: '#fff', padding: '0.5rem', borderRadius: '8px', border: '2px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <button 
                    onClick={() => setEditorMode('select')} 
                    style={editorMode === 'select' ? activeButtonStyle : controlButtonStyle}
                    title="Select & Create (V)"
                >
                    🖱️ {t('ui.addNewBuilding').split(' ')[0]} 
                    Create / Select
                </button>
                <button 
                    onClick={() => setEditorMode('connect')} 
                    style={editorMode === 'connect' ? activeButtonStyle : controlButtonStyle}
                    title="Path Connection Tool (C)"
                >
                    🔗 Connect Nodes
                </button>
            </div>

            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
                <button onClick={() => window.history.back()} style={controlButtonStyle}>← {t('ui.back')}</button>
            </div>

            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', gap: '1rem', zIndex: 1000, alignItems: 'center' }}>
                <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '2px solid #333', background: '#fff' }}>
                    <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} style={{ ...controlButtonStyle, border: 'none', borderRadius: 0 }}>+</button>
                    <div style={{ padding: '0 1rem', background: '#333', color: '#fff', fontSize: '0.9rem', minWidth: '80px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {Math.round(scale * 100)}%
                    </div>
                    <button onClick={() => setScale(s => Math.max(s / 1.2, 0.5))} style={{ ...controlButtonStyle, border: 'none', borderRadius: 0 }}>-</button>
                </div>
                <label style={{ ...controlButtonStyle, fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={isMagnetEnabled} onChange={(e) => setIsMagnetEnabled(e.target.checked)} style={{ marginRight: '0.5rem' }} />
                    Alignment
                </label>
            </div>

            <div ref={containerRef} onMouseDown={handleMapMouseDown} style={{ flex: 1, overflow: 'auto', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div 
                    ref={mapSurfaceRef}
                    className="map-surface"
                    onClick={handleMapClick}
                    style={{ 
                        position: 'relative', width: `${scale * 90}%`, height: 'auto',
                        maxWidth: scale > 1 ? 'none' : '90%', background: 'white',
                        boxShadow: '0 0 50px rgba(0,0,0,0.1)', lineHeight: 0, flexShrink: 0,
                        cursor: editorMode === 'connect' ? 'alias' : 'crosshair'
                    }}
                >
                    <img src={floor.svgMapUrl} className="map-img" alt="Map" style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }} />
                    
                    {snapGuides.x !== null && <div style={{ position: 'absolute', left: `${snapGuides.x}%`, top: 0, bottom: 0, width: '1px', borderLeft: '1px dashed #ff4444', zIndex: 5 }} />}
                    {snapGuides.y !== null && <div style={{ position: 'absolute', top: `${snapGuides.y}%`, left: 0, right: 0, height: '1px', borderTop: '1px dashed #ff4444', zIndex: 5 }} />}

                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                        {nodes.map(node => node.connections.map(connId => {
                            const target = nodes.find(n => n.qrId === connId);
                            if (!target || node.qrId > connId) return null;
                            return <line key={`${node.qrId}-${connId}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${target.x}%`} y2={`${target.y}%`} stroke={selectedNodeId === node.qrId || selectedNodeId === connId ? 'var(--primary)' : '#ff4444'} strokeWidth={3 / scale} />;
                        }))}
                        
                        {editorMode === 'connect' && selectedNode && (
                            <circle cx={`${selectedNode.x}%`} cy={`${selectedNode.y}%`} r="3" fill="var(--primary)" />
                        )}
                    </svg>

                    {nodes.map(node => (
                        <div key={node.qrId} onMouseDown={(e) => handleNodeMouseDown(node.qrId, e)} style={{
                            position: 'absolute', left: `${node.x}%`, top: `${node.y}%`,
                            transform: `translate(-50%, -50%) scale(${1/scale})`,
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: TYPE_COLORS[node.type as keyof typeof TYPE_COLORS] || '#333',
                            border: selectedNodeId === node.qrId ? '3px solid #fff' : '2px solid #fff',
                            cursor: 'pointer',
                            zIndex: 10, boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                        }} />
                    ))}
                </div>
            </div>

            
            <div style={{ width: '320px', background: '#fff', borderLeft: '3px solid #333', display: 'flex', flexDirection: 'column', zIndex: 2000, color: '#333' }}>
                <div style={{ padding: '1rem', borderBottom: '3px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9' }}>
                    <h3 style={{ margin: 0 }}>Map Editor</h3>
                    <button onClick={handleSave} disabled={isSaving} style={{ ...controlButtonStyle, padding: '0.4rem 0.8rem' }}>{t('ui.save')}</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '1.2rem', borderBottom: '2px solid #eee' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Selected Node</h4>
                        {selectedNode ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '0.85rem' }}><strong>ID:</strong> {selectedNode.qrId}</div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', display: 'block' }}>Type (1-5)</label>
                                    <select style={{ width: '100%', padding: '0.5rem', border: '2px solid #333', borderRadius: '4px' }} value={selectedNode.type} onChange={(e) => updateNode(selectedNode.qrId, { type: e.target.value as any })}>
                                        <option value="invisible">1: Path</option>
                                        <option value="poi">2: POI</option>
                                        <option value="room">3: Room</option>
                                        <option value="location">4: Location</option>
                                        <option value="connector">5: Connector</option>
                                    </select>
                                </div>
                                
                                {selectedNode.type === 'connector' && (
                                    <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Cross-floor Connections</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {Object.keys(crossFloorTargets).map(fId => (
                                                <div key={fId} style={{ fontSize: '0.75rem' }}>
                                                    <strong>{crossFloorTargets[fId].floorName}:</strong>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.2rem' }}>
                                                        {crossFloorTargets[fId].connectors.map(targetNode => {
                                                            const isLinked = selectedNode.connections.includes(targetNode.qrId);
                                                            return (
                                                                <button key={targetNode.qrId} onClick={() => toggleConnection(targetNode.qrId)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: isLinked ? 'var(--primary)' : '#fff', color: isLinked ? '#fff' : '#333', border: '1px solid #333', borderRadius: '3px' }}>
                                                                    {targetNode.qrId.split('-').pop()} {targetNode.name ? `(${targetNode.name})` : ''}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.75rem' }}>Name</label>
                                        <LocalizationEditor 
                                            entityType="node" 
                                            entityId={selectedNode.qrId} 
                                            fieldName="name" 
                                            initialValues={(() => {
                                                const trans: Record<string, string> = {};
                                                if (selectedNode.translations) {
                                                    Object.keys(selectedNode.translations).forEach(l => {
                                                        if (selectedNode.translations![l].name) trans[l] = selectedNode.translations![l].name;
                                                    });
                                                }
                                                return trans;
                                            })()}
                                        />
                                    </div>
                                    <input style={{ width: '100%', padding: '0.5rem', border: '2px solid #333', borderRadius: '4px' }} placeholder="e.g. Room 178" value={selectedNode.name || ''} onChange={(e) => updateNode(selectedNode.qrId, { name: e.target.value })} />
                                </div>
                                {selectedNode.type !== 'invisible' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.75rem' }}>Short Name (Displayed on map)</label>
                                            <LocalizationEditor 
                                                entityType="node" 
                                                entityId={selectedNode.qrId} 
                                                fieldName="shortName" 
                                                initialValues={(() => {
                                                    const trans: Record<string, string> = {};
                                                    if (selectedNode.translations) {
                                                        Object.keys(selectedNode.translations).forEach(l => {
                                                            if (selectedNode.translations![l].shortName) trans[l] = selectedNode.translations![l].shortName;
                                                        });
                                                    }
                                                    return trans;
                                                })()}
                                            />
                                        </div>
                                        <input style={{ width: '100%', padding: '0.5rem', border: '2px solid #333', borderRadius: '4px' }} placeholder="e.g. 178" value={selectedNode.shortName || ''} onChange={(e) => updateNode(selectedNode.qrId, { shortName: e.target.value })} />
                                    </div>
                                )}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.75rem' }}>Description</label>
                                        <LocalizationEditor 
                                            entityType="node" 
                                            entityId={selectedNode.qrId} 
                                            fieldName="description" 
                                            initialValues={(() => {
                                                const trans: Record<string, string> = {};
                                                if (selectedNode.translations) {
                                                    Object.keys(selectedNode.translations).forEach(l => {
                                                        if (selectedNode.translations![l].description) trans[l] = selectedNode.translations![l].description;
                                                    });
                                                }
                                                return trans;
                                            })()}
                                        />
                                    </div>
                                    <textarea style={{ width: '100%', padding: '0.5rem', border: '2px solid #333', borderRadius: '4px', resize: 'vertical', minHeight: '60px' }} placeholder="Office description..." value={selectedNode.description || ''} onChange={(e) => updateNode(selectedNode.qrId, { description: e.target.value })} />
                                </div>
                                {selectedNode.type === 'poi' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '0.75rem', display: 'block' }}>Icon Name</label>
                                            <input style={{ width: '100%', padding: '0.5rem', border: '2px solid #333', borderRadius: '4px' }} placeholder="e.g. info" value={selectedNode.iconName || ''} onChange={(e) => updateNode(selectedNode.qrId, { iconName: e.target.value })} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.75rem', display: 'block' }}>Color</label>
                                            <input type="color" style={{ width: '100%', height: '38px', padding: '2px', border: '2px solid #333', borderRadius: '4px', cursor: 'pointer' }} value={selectedNode.iconColor || '#0070f3'} onChange={(e) => updateNode(selectedNode.qrId, { iconColor: e.target.value })} />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={selectedNode.isNavigable !== false} onChange={(e) => updateNode(selectedNode.qrId, { isNavigable: e.target.checked })} style={{ marginRight: '0.5rem' }} />
                                        Allow navigation to this point
                                    </label>
                                </div>
                                <button className="danger" onClick={() => deleteNode(selectedNode.qrId)} style={{ padding: '0.5rem', border: '2px solid #333' }}>Delete (Del)</button>
                            </div>
                        ) : <div style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>Click node to edit</div>}
                    </div>

                    <div style={{ padding: '0' }}>
                        <h4 style={{ padding: '1rem', margin: 0, fontSize: '0.8rem', color: '#666', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>LAYERS</h4>
                        {[...nodes].reverse().map(n => (
                            <div key={n.qrId} onClick={() => setSelectedNodeId(n.qrId)} style={{ padding: '0.8rem 1.2rem', fontSize: '0.8rem', background: selectedNodeId === n.qrId ? 'var(--primary)' : '#fff', color: selectedNodeId === n.qrId ? '#fff' : '#333', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <strong>#{n.qrId.split('-').pop()}</strong>
                                <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{n.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '1rem', fontSize: '0.7rem', color: '#888', borderTop: '1px solid #eee' }}>
                    [V] Select/Create | [C] Connect | [S] Save | [Del] Delete
                </div>
            </div>
        </div>
    );
}
