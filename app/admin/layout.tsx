import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // npm run dev (only)
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      {children}
    </div>
  );
}
