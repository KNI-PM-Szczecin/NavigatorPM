import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const floorId = (await params).id;
    const row = db.prepare('SELECT svg_content FROM floors WHERE id = ?').get(floorId) as any;

    if (!row?.svg_content) {
        return new NextResponse('Map not found', { status: 404 });
    }

    return new NextResponse(row.svg_content, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache'
        },
    });
}
