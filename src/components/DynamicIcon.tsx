"use client";

interface DynamicIconProps {
    iconName: string;
    color: string;
    size?: number;
}

export function DynamicIcon({ iconName, color, size = 24 }: DynamicIconProps) {
    return (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                WebkitMaskImage: `url(/icons/${iconName}.svg)`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(/icons/${iconName}.svg)`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
            }}
        />
    );
}
