import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const poiId = (await params).id;

    const qrPOI = await prisma.pOI.findUnique({
      where: {
        id: poiId,
        category: "QR_CODE",
      },
      include: {
        // Include node information for the POI floor and building details
        node: true,
      },
    });

    if (!qrPOI || qrPOI.category !== "QR_CODE") {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // TODO: Get the floor and building information from the node and include it in the response to get data for loading the map and floor plan for the QR code location. This will help in rendering the map and floor plan for the QR code location.
    const formattedQR = {
      poiId: qrPOI.id,
      nodeId: qrPOI.nodeId,
      floorId: qrPOI.node.floorId,
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
