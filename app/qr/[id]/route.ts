import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const qrId = params.id;

    const qrPOI = await prisma.pOI.findUnique({
      where: {
        nodeId: qrId,
      },
      include: {
        // Include node information for the POI floor and building details
        node: true,
      },
    });

    if (!qrPOI || qrPOI.category !== "QR_CODE") {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

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
