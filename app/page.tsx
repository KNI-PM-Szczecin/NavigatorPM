import BottomBar from "@/components/bottom-bar";
import BuildingMap from "@/components/building-map";
import SafeArea from "@/components/safe-area";

type Param = string | string[] | undefined;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { from } = await searchParams;
  let initialLocation: string | null = "";

  if (Array.isArray(from)) {
    initialLocation = from[0];
  } else if (typeof from == "string") {
    initialLocation = from;
  } else {
    initialLocation = null;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BuildingMap />
      <SafeArea className="pointer-events-none relative h-screen w-screen">
        <BottomBar initialLocation={initialLocation} />
      </SafeArea>
    </div>
  );
}
