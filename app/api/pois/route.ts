import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGUAGES = ["pl", "en", "uk"];
const DEFAULT_LANGUAGE = "pl";

export async function GET(request: NextRequest) {
  try {
    const acceptLanguage =
      request.headers.get("accept-language") || DEFAULT_LANGUAGE;

    let lang = DEFAULT_LANGUAGE;

    for (const supported of SUPPORTED_LANGUAGES) {
      if (acceptLanguage.toLowerCase().includes(supported)) {
        lang = supported;
        break;
      }
    }

    const pois = await prisma.pOI.findMany({
      where: {
        category: {
          not: "QR_CODE",
        },
      },
      include: {
        translations: {
          where: {
            language: lang,
          },
        },
      },
    });

    const formattedPois = pois.map((poi) => {
      const translation = poi.translations[0];

      return {
        id: poi.id,
        nodeId: poi.nodeId,
        category: poi.category,
        subCategory: poi.subCategory,
        name: translation?.name || null,
        description: translation?.description || null,
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
