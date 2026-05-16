import { AdminHeaderClient } from "@/components/admin/AdminHeaderClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container container">
      <AdminHeaderClient />
      <main className="admin-main">{children}</main>
    </div>
  );
}
