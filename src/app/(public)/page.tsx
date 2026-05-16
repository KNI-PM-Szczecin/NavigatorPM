import * as data from '@/lib/data';
import { HomePageClient } from '@/components/public/HomePageClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const allBuildings = data.getAllBuildings();
    const visibleBuildings = allBuildings.filter(b => b.isVisible);

        const buildingsData = visibleBuildings.map(b => {
        const floors = data.getFloors(b.id).filter(f => f.isVisible);
        
                const buildingTransRaw = db.prepare("SELECT locale, translation FROM translations WHERE entity_type = 'building' AND field_name = 'name' AND entity_id = ?").all(b.id) as any[];
        const buildingTranslations: Record<string, string> = {};
        buildingTransRaw.forEach(row => buildingTranslations[row.locale] = row.translation);

                const floorsWithTrans = floors.map(f => {
            const floorTransRaw = db.prepare("SELECT locale, translation FROM translations WHERE entity_type = 'floor' AND field_name = 'name' AND entity_id = ?").all(f.id) as any[];
            const floorTranslations: Record<string, string> = {};
            floorTransRaw.forEach(row => floorTranslations[row.locale] = row.translation);
            return { ...f, translations: floorTranslations };
        });

        return {
            ...b,
            translations: buildingTranslations,
            floors: floorsWithTrans
        };
    });

    return <HomePageClient buildings={buildingsData} />;
}
