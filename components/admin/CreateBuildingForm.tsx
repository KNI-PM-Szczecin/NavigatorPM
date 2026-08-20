"use client";

import { useEditorStore } from "@/hooks/useEditorStore";
import { Building } from "@/types/map";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  onClose: () => void;
  existingBuilding?: Building;
}

export default function CreateBuildingForm({
  onClose,
  existingBuilding,
}: Props) {
  const addBuilding = useEditorStore((state) => state.addBuilding);

  const [name, setName] = useState(
    existingBuilding?.translations.pl?.name || ""
  );

  const [address, setAddress] = useState(existingBuilding?.address || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBuilding: Building = {
      id: `b_${Date.now()}`,
      address: address.trim(),
      isVisible: true,
      translations: {
        pl: { name: name.trim() },
        en: { name: name.trim() },
        uk: { name: name.trim() },
      },
    };

    addBuilding(newBuilding);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {existingBuilding ? "Update" : "Create"} New Building
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
              Building Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Campus"
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 University Ave"
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-primary"
            />
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
              {existingBuilding ? "Update" : "Create"} Building
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
