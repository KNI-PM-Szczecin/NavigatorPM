"use client";

import { toast } from "@/components/ui/toast";
import { useEditorStore } from "@/hooks/useEditorStore";
import { AppLanguage } from "@/types/map";
import { ArrowDownToLine, Info, MapPin, Settings2 } from "lucide-react";
import { useState } from "react";

export default function EditorSidebar() {
  const {
    selectedNodeId,
    nodes,
    pois,
    updateNode,
    updatePoi,
    deletePoi,
    connectToFloorBelow,
  } = useEditorStore();

  const [activeLang, setActiveLang] = useState<AppLanguage>("pl");

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedPOI = pois.find((p) => p.nodeId === selectedNodeId);

  const handleConnectToFloorBelow = () => {
    if (!selectedNode) return;
    const result = connectToFloorBelow(selectedNode.id);
    if (result.success) {
      toast.add({
        title: "Sukces",
        description: result.message,
        type: "success",
      });
    } else {
      toast.add({ title: "Błąd", description: result.message, type: "error" });
    }
  };

  const handleTranslationChange = (
    field: "name" | "description",
    value: string
  ) => {
    if (!selectedNode) return;

    const currentTranslations = selectedPOI?.translations || {};
    const currentLangData = currentTranslations[activeLang] || {
      name: "",
      description: "",
    };

    updatePoi(selectedNode.id, {
      translations: {
        ...currentTranslations,
        [activeLang]: {
          ...currentLangData,
          [field]: value,
        },
      },
    });
  };

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-l border-border bg-background p-6 text-center text-muted-foreground">
        <MapPin className="mb-4 h-12 w-12 opacity-20" />
        <p>Select Node to show its properties.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col overflow-y-auto border-l border-border bg-background p-4">
      <div className="mb-6 flex items-center gap-2 border-b pb-4">
        <Settings2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Node Properties</h2>
      </div>

      {/* SEKCJA 1: WŁAŚCIWOŚCI WĘZŁA (NODE) */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Node type
          </label>
          <select
            value={selectedNode.type}
            onChange={(e) =>
              updateNode(selectedNode.id, { type: e.target.value })
            }
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="CORRIDOR">Corridor (Default)</option>
            <option value="STAIRS">Stairs</option>
            <option value="ELEVATOR">Elevator</option>
            <option value="ROOM_ENTRANCE">Entrance</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              X
            </label>
            <input
              type="number"
              value={Math.round(selectedNode.xCoordinate)}
              onChange={(e) =>
                updateNode(selectedNode.id, {
                  xCoordinate: Number(e.target.value),
                })
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Y
            </label>
            <input
              type="number"
              value={Math.round(selectedNode.yCoordinate)}
              onChange={(e) =>
                updateNode(selectedNode.id, {
                  yCoordinate: Number(e.target.value),
                })
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleConnectToFloorBelow}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Connect with the floor below
        </button>
      </div>

      <hr className="my-2 border-border" />

      {/* SEKCJA 2: PUNKT INFORMACYJNY (POI) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Punkt POI</h3>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={!!selectedPOI}
            onChange={(e) => {
              if (e.target.checked) {
                updatePoi(selectedNode.id, { category: "ROOM" });
              } else {
                deletePoi(selectedNode.id);
              }
            }}
          />
          {/* Prosty przełącznik (Switch) w czystym Tailwindzie */}
          <div className="peer h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>

      {selectedPOI && (
        <div className="mt-4 flex flex-col gap-4 rounded-md border border-border bg-muted/30 p-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Category
            </label>
            <select
              value={selectedPOI.category}
              onChange={(e) =>
                updatePoi(selectedNode.id, { category: e.target.value })
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="ROOM">Room</option>
              <option value="TOILET">Toilet</option>
              <option value="SHOP">Shop</option>
              <option value="GASTRONOMY">Gastronomy</option>
              <option value="INFO">Information Point</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Subcategory (optional)
            </label>
            <input
              type="text"
              placeholder="np. Woman, Men..."
              value={selectedPOI.subCategory || ""}
              onChange={(e) =>
                updatePoi(selectedNode.id, { subCategory: e.target.value })
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* ZAKŁADKI JĘZYKOWE */}
          <div className="mt-2">
            <div className="flex rounded-md border border-border bg-muted p-1">
              {(["pl", "en", "uk"] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`flex-1 rounded-sm py-1 text-xs font-medium uppercase transition-colors ${
                    activeLang === lang
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Name ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={selectedPOI.translations?.[activeLang]?.name || ""}
                  onChange={(e) =>
                    handleTranslationChange("name", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Description ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={
                    selectedPOI.translations?.[activeLang]?.description || ""
                  }
                  onChange={(e) =>
                    handleTranslationChange("description", e.target.value)
                  }
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
