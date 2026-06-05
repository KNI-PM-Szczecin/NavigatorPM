import * as data from '@/lib/data';
import ViewerClient from '@/components/public/ViewerClient';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ViewerPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ from?: string, to?: string }>
}) {
    const floorId = (await params).id;
    const { from, to } = await searchParams;
    const floor = await data.getFloor(floorId);
    
    if (!floor) redirect('/');

    const isAdmin = await isAuthenticated();

    return (
        <ViewerClient 
            buildingId={floor.buildingId} 
            initialFloorId={floorId} 
            isAdmin={isAdmin}
            initialFrom={from}
            initialTo={to}
        />
    );
}
