import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { deleteFloorAction, addFloorAction } from '@/lib/actions';
import { FloorsClient } from '@/components/admin/FloorsClient';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function FloorsPage({ params }: { params: { id: string } }) {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const buildingId = (await params).id;
    const building = data.getAllBuildings().find(b => b.id === buildingId);
    
    if (!building) redirect('/admin-portal-721/buildings');

    const floors = data.getFloors(buildingId);
    
    const locale = (await cookies()).get('locale')?.value || 'en-US';

        const buildingTransRaw = db.prepare("SELECT locale, translation FROM translations WHERE entity_type = 'building' AND field_name = 'name' AND entity_id = ?").all(buildingId) as any[];
    const buildingTranslations: Record<string, string> = {};
    buildingTransRaw.forEach(row => buildingTranslations[row.locale] = row.translation);

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
