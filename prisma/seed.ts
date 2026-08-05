import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "❌ Seeding is only allowed in development mode. Aborting seeding process."
    );
    process.exit(1);
  }

  console.log("🌱 Seeding database...");

  const seedFilePath = path.join(__dirname, "seed.json");
  const data = JSON.parse(fs.readFileSync(seedFilePath, "utf-8"));

  console.log("🧹 Clearing database...");

  await prisma.pOITranslation.deleteMany();
  await prisma.pOI.deleteMany();
  await prisma.edge.deleteMany();
  await prisma.node.deleteMany();
  await prisma.floorTranslation.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.buildingTranslation.deleteMany();
  await prisma.building.deleteMany();

  console.log("🏗️ Loading buildings...");

  await prisma.building.createMany({ data: data.buildings });
  await prisma.buildingTranslation.createMany({
    data: data.buildingTranslations,
  });

  console.log("🏢 Loading floors...");
  await prisma.floor.createMany({ data: data.floors });
  await prisma.floorTranslation.createMany({ data: data.floorTranslations });

  console.log("📍 Loading nodes...");
  await prisma.node.createMany({ data: data.nodes });

  console.log("🔗 Loading edges...");
  await prisma.edge.createMany({ data: data.edges });

  console.log("🗺️ Loading POIs...");
  await prisma.pOI.createMany({ data: data.pois });
  await prisma.pOITranslation.createMany({ data: data.poiTranslations });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
