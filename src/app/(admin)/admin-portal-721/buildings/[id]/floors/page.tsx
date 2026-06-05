import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { deleteFloorAction, addFloorAction } from '@/lib/actions';
import { FloorsClient } from '@/components/admin/FloorsClient';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function FloorsPage({ params }: { params: Promise<{ id: string }> }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const buildingId = (await params).id;
    const building = (await data.getAllBuildings()).find(b => b.id === buildingId);
    
    if (!building) redirect('/admin-portal-721/buildings');

    const floors = await data.getFloors(buildingId);
    
    const locale = (await cookies()).get('locale')?.value || 'en-US';

    const buildingTransRaw = await db.buildingTranslation.findMany({
        where: {
            buildingId
        }
    });
    const buildingTranslations: Record<string, string> = {};
    buildingTransRaw.forEach(row => buildingTranslations[row.language] = row.name);

    return (
        <FloorsClient 
            building={building}
            buildingTranslations={buildingTranslations}
            floors={floors}
            addFloorAction={addFloorAction.bind(null, buildingId)}
            deleteFloorAction={deleteFloorAction}
        />
    );
}
