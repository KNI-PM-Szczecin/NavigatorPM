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

    const visiblePois = mapData.pois.filter((p) => p.category !== "QR_CODE");

    const formattedPois = visiblePois.map((poi) => {
      const poiTranslation = mapData.poiTranslations.filter(
        (t) => t.poiId === poi.id && t.language === lang
      )[0];

      return {
        id: poi.id,
        nodeId: poi.nodeId,
        category: poi.category,
        subCategory: poi.subCategory,
        name: poiTranslation?.name || null,
        description: poiTranslation?.description || null,
      };
    });

    return NextResponse.json(formattedPois, { status: 200 });
  } catch (error) {
    console.error("Error fetching POIs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
