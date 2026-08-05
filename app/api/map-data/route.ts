import { mapData } from "@/data/mapStore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        nodes: mapData.nodes,
        edges: mapData.edges,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching map data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
