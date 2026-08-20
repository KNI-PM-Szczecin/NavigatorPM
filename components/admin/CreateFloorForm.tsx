"use client";

import { useEditorStore } from "@/hooks/useEditorStore";
import { Floor } from "@/types/map";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  onClose: () => void;
  buildingId: string;
  existingFloor?: Floor;
}

export default function CreateFloorForm({
  onClose,
  buildingId,
  existingFloor,
}: Props) {
  const addFloor = useEditorStore((state) => state.addFloor);

  const [name, setName] = useState(existingFloor?.translations.pl?.name || "");
  const [level, setLevel] = useState(existingFloor?.level || 0);
  const [imageUrl, setImageUrl] = useState(existingFloor?.mapImageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFloor: Floor = {
      id: `f_${Date.now()}`,
      buildingId: buildingId,
      level: level || 0,
      mapImageUrl: imageUrl.trim() || "/maps/default.svg",
      translations: {
        pl: { name: name.trim() },
      },
    };

    addFloor(newFloor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {existingFloor ? "Update" : "Create"} New Floor
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Floor Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ground Floor"
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Level (Integer)
              </label>
              <input
                type="number"
                required
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Map Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/maps/floor1.svg"
                className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {existingFloor ? "Update" : "Create"} Floor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
