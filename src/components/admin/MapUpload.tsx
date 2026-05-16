"use client";

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function MapUpload() {
    const { t } = useLanguage();
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "image/svg+xml") {
                if (inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inputRef.current.files = dataTransfer.files;
                    setFileName(file.name);
                }
            } else {
                alert("Only SVG files are allowed.");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div 
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}
        >
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    width: '100%',
                    height: '150px',
                    border: `2px dashed ${dragActive ? 'var(--primary)' : '#ccc'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragActive ? 'rgba(0, 112, 243, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    padding: '1rem'
                }}
            >
                <input
                    ref={inputRef}
                    name="svgFile"
                    type="file"
                    accept=".svg"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                {fileName ? (
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                        Selected: {fileName}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
                        <div style={{ fontSize: '0.9rem' }}>
                            <strong>{t('ui.dragAndDrop')}</strong><br/>
                            <span style={{ color: '#999' }}>{t('ui.orClickToBrowse')}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
