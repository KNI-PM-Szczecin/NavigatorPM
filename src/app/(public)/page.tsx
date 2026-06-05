import * as data from '@/lib/data';
import { HomePageClient } from '@/components/public/HomePageClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const allBuildings = await data.getAllBuildings();
    const visibleBuildings = allBuildings.filter(b => b.isVisible);
    const buildingIds = visibleBuildings.map(b => b.id);

    const buildingTranslationsRaw = buildingIds.length > 0
        ? await db.buildingTranslation.findMany({
            where: {
                buildingId: { in: buildingIds }
            }
        })
        : [];

    const buildingTranslationsMap: Record<string, Record<string, string>> = {};
    buildingTranslationsRaw.forEach(row => {
        if (!buildingTranslationsMap[row.buildingId]) buildingTranslationsMap[row.buildingId] = {};
        buildingTranslationsMap[row.buildingId][row.language] = row.name;
    });

    const buildingsData = await Promise.all(visibleBuildings.map(async (b) => {
        const floors = (await data.getFloors(b.id)).filter(f => f.isVisible);
        const floorIds = floors.map(f => f.id);

        const floorTranslationsRaw = floorIds.length > 0
            ? await db.floorTranslation.findMany({
                where: {
                    floorId: { in: floorIds }
                }
            })
            : [];

        const floorTranslationsMap: Record<string, Record<string, string>> = {};
        floorTranslationsRaw.forEach(row => {
            if (!floorTranslationsMap[row.floorId]) floorTranslationsMap[row.floorId] = {};
            floorTranslationsMap[row.floorId][row.language] = row.name;
        });

        const floorsWithTrans = floors.map(f => ({
            ...f,
            translations: floorTranslationsMap[f.id] || {}
        }));

        return {
            ...b,
            translations: buildingTranslationsMap[b.id] || {},
            floors: floorsWithTrans
        };
    }));

    return <HomePageClient buildings={buildingsData} />;
}
