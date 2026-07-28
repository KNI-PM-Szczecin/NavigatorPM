import BottomBar from "@/components/bottom-bar";
import BuildingMap from "@/components/building-map";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { from } = await searchParams;
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BuildingMap />
      <div className="pointer-events-none absolute inset-0 z-10">
        <BottomBar />
      </div>
    </div>
  );
}
