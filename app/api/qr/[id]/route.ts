import { mapData, nodesById, poisById } from "@/data/mapStore";
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

    const floor = mapData.floors.find((f) => f.id === node?.floorId);

    const formattedQR = {
      nodeId: qrPoi.nodeId,
      floorId: node.floorId,
      buildingId: floor?.buildingId,
      mapImageUrl: floor?.mapImageUrl,
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
