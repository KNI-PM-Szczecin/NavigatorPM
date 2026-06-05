import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const floorId = (await params).id;
    const [bId] = floorId.split('-F');
    const svgPath = path.join(process.cwd(), 'data', bId, floorId, 'map.svg');

    if (!fs.existsSync(svgPath)) {
        return new NextResponse('Map not found', { status: 404 });
    }

    const svg = fs.readFileSync(svgPath);
    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache'
        },
    });
}
