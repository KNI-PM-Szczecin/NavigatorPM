import * as data from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { addBuildingAction, deleteBuildingAction } from '@/lib/actions';
import { BuildingsClient } from '@/components/admin/BuildingsClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function BuildingsPage() {
    const auth = await isAuthenticated();
    if (!auth) redirect('/admin-portal-721');

    const buildings = data.getAllBuildings();
    
        const translationsRaw = db.prepare("SELECT entity_id, locale, translation FROM translations WHERE entity_type = 'building' AND field_name = 'name'").all() as any[];
    const translations: Record<string, Record<string, string>> = {};
    translationsRaw.forEach(row => {
        if (!translations[row.entity_id]) translations[row.entity_id] = {};
        translations[row.entity_id][row.locale] = row.translation;
    });

    return (
        <BuildingsClient 
            buildings={buildings} 
            addBuildingAction={addBuildingAction} 
            deleteBuildingAction={deleteBuildingAction}
            translations={translations}
        />
    );
}
