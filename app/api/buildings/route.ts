import { mapData } from "@/data/mapStore";
import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["pl", "en", "uk"];
const DEFAULT_LANGUAGE = "pl";

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage =
      request.headers.get("accept-language") || DEFAULT_LANGUAGE;
    const lang =
      SUPPORTED_LANGUAGES.find((lang) =>
        acceptLanguage.toLowerCase().includes(lang)
      ) || DEFAULT_LANGUAGE;

    const result = mapData.buildings.map((building) => {
      const bTransList = mapData.buildingTranslations.filter(
        (t) => t.buildingId === building.id
      );
      const bTrans =
        bTransList.find((t) => t.language === lang) ||
        bTransList.find((t) => t.language === DEFAULT_LANGUAGE);

      const buildingFloors = mapData.floors.filter(
        (f) => f.buildingId === building.id
      );

      const formattedFloors = buildingFloors.map((floor) => {
        const fTransList = mapData.floorTranslations.filter(
          (t) => t.floorId === floor.id
        );
        const fTrans =
          fTransList.find((t) => t.language === lang) ||
          fTransList.find((t) => t.language === DEFAULT_LANGUAGE);

        return {
          id: floor.id,
          level: floor.level,
          mapImageUrl: floor.mapImageUrl,
          name: fTrans?.name || `Poziom ${floor.level}`,
        };
      });

      formattedFloors.sort((a, b) => a.level - b.level);

      return {
        id: building.id,
        address: building.address,
        name: bTrans?.name || "Brak nazwy",
        description: bTrans?.description || null,
        floors: formattedFloors,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
