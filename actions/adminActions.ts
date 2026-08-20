"use server";

import { MapData } from "@/types/map"; // Ensure the path to your types is correct
import fs from "fs/promises";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "mapData.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "maps");

export async function saveMapDataAction(newData: MapData) {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Only available in development environment",
    };
  }

  try {
    const jsonString = JSON.stringify(newData, null, 2);
    await fs.writeFile(DATA_FILE_PATH, jsonString, "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error saving JSON:", error);
    return { success: false, error: "Failed to save JSON file." };
  }
}

export async function uploadMapImageAction(formData: FormData) {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Only available in development environment",
    };
  }

  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name (remove spaces, special characters, etc.)
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = path.join(UPLOAD_DIR, safeName);

    // Physically save the file to the public/maps/ directory
    await fs.writeFile(filePath, buffer);

    return {
      success: true,
      // Return the public URL of the file (to be saved in the database/JSON)
      url: `/maps/${safeName}`,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload the file." };
  }
}
