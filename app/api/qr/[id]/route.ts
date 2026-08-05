import { nodesById, poisById } from "@/data/mapStore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const qrPoi = poisById[(await params).id];

    if (!qrPoi || qrPoi.category !== "QR_CODE") {
      return NextResponse.json(
        { error: "Nie znaleziono kodu QR" },
        { status: 404 }
      );
    }

    const node = nodesById[qrPoi.nodeId];

    // TODO: Get the floor and building information from the node and include it in the response to get data for loading the map and floor plan for the QR code location. This will help in rendering the map and floor plan for the QR code location.
    const formattedQR = {
      poiId: qrPoi.id,
      nodeId: qrPoi.nodeId,
      floorId: node.floorId,
    };

    return NextResponse.json(formattedQR, { status: 200 });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
