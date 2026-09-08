"use server";

import { MapData } from "@/types/map";
import fs from "fs/promises";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "map.json");

export async function saveMapDataAction(newData: MapData) {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Only available in development environment",
    };
  }

  try {
    const dirPath = path.dirname(DATA_FILE_PATH);

    await fs.mkdir(dirPath, { recursive: true });

    const jsonString = JSON.stringify(newData, null, 2);
    await fs.writeFile(DATA_FILE_PATH, jsonString, "utf-8");

    return { success: true };
  } catch (error) {
    console.error("Error saving JSON:", error);
    return { success: false, error: "Failed to save JSON file." };
  }
}

export async function getMapDataAction() {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    if (err.code === "ENOENT") {
      return { success: false, error: "Brak pliku na serwerze - pusta mapa." };
    }
    console.error("Error reading JSON:", error);
    return { success: false, error: "Błąd podczas odczytu danych z serwera." };
  }
}
