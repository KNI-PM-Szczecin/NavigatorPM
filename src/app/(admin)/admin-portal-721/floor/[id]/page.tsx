import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { updateFloorAction, cloneFloorData } from '@/lib/actions';
import { FloorSettingsClient } from '@/components/admin/FloorSettingsClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function FloorSettingsPage({ params }: { params: { id: string } }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const floorId = (await params).id;
    const floor = data.getFloor(floorId);
    
    if (!floor) redirect('/admin-portal-721/buildings');

        const translationsRaw = db.prepare(`
        SELECT locale, translation 
        FROM translations 
        WHERE entity_type = 'floor' AND field_name = 'name' AND entity_id = ?
    `).all(floorId) as any[];
    
    const translations: Record<string, string> = {};
    translationsRaw.forEach(row => {
        translations[row.locale] = row.translation;
    });

    return (
        <FloorSettingsClient 
            floor={floor}
            updateFloorAction={updateFloorAction.bind(null, floorId)}
            translations={translations}
        />
    );
}
