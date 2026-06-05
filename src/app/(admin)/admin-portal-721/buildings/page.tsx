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

    const buildings = await data.getAllBuildings();
    
    const translationsRaw = await db.buildingTranslation.findMany();
    const translations: Record<string, Record<string, string>> = {};
    translationsRaw.forEach(row => {
        if (!translations[row.buildingId]) translations[row.buildingId] = {};
        translations[row.buildingId][row.language] = row.name;
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
