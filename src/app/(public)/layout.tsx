export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-container container">
      <main>{children}</main>
    </div>
  );
}
