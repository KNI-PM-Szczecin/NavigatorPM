import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { updateFloorAction, cloneFloorData } from '@/lib/actions';
import { FloorSettingsClient } from '@/components/admin/FloorSettingsClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function FloorSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const floorId = (await params).id;
    const floor = await data.getFloor(floorId);
    
    if (!floor) redirect('/admin-portal-721/buildings');

    const translationsRaw = await db.floorTranslation.findMany({
        where: {
            floorId
        }
    });
    
    const translations: Record<string, string> = {};
    translationsRaw.forEach(row => {
        translations[row.language] = row.name;
    });

    return (
        <FloorSettingsClient 
            floor={floor}
            updateFloorAction={updateFloorAction.bind(null, floorId)}
            translations={translations}
        />
    );
}
