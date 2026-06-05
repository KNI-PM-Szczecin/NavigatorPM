import { AdminHeaderClient } from "@/components/admin/AdminHeaderClient";
import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="admin-container container">
      <AdminHeaderClient />
      <main className="admin-main">{children}</main>
    </div>
  );
}
