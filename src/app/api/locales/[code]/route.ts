import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const code = (await params).code;
    const filePath = path.join(process.cwd(), 'src/locales', `${code}.json`);
    
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Locale not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(content));
}
