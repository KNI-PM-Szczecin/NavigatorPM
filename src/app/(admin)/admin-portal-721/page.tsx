import { isAuthenticated, login } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { AdminLoginClient } from '@/components/admin/AdminLoginClient';

export const dynamic = 'force-dynamic';

export default async function AdminPortalPage() {
    const auth = await isAuthenticated();

    async function handleLogin(formData: FormData) {
        "use server";
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const success = await login(username, password);
        if (success) {
            redirect('/admin-portal-721');
        }
    }

    if (!auth) {
        return <AdminLoginClient handleLoginAction={handleLogin} />;
    }

    return <AdminDashboardClient />;
}
