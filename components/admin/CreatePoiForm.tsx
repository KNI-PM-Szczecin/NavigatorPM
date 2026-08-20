"use client";

import { useEditorStore } from "@/hooks/useEditorStore";
import { AppLanguage, POI } from "@/types/map";
import { useState } from "react";

const SUPPORTED_LANGUAGES: AppLanguage[] = ["pl", "en", "uk"];

interface Props {
  onClose: () => void;
  nodeId: string;
  existingPoi?: POI;
}

export default function CreatePoiForm({ onClose, nodeId, existingPoi }: Props) {
  const { addPoi, updatePoi } = useEditorStore();

  // Stan przechowujący tłumaczenia
  const [translations, setTranslations] = useState(
    existingPoi?.translations || {}
  );
  const [category, setCategory] = useState(existingPoi?.category || "Room");
  const [subCategory, setSubCategory] = useState(
    existingPoi?.subCategory || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const poiData: POI = {
      id: existingPoi?.id || `poi_${Date.now()}`,
      nodeId,
      category,
      subCategory: subCategory || null,
      translations: translations as POI["translations"],
    };

    if (existingPoi) updatePoi(poiData);
    else addPoi(poiData);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-semibold">
          {existingPoi ? "Edit POI" : "Create POI"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
            />
            <input
              placeholder="Sub-category"
              value={subCategory || ""}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang}
                className="space-y-2 rounded-lg border border-border p-3"
              >
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  {lang}
                </label>
                <input
                  placeholder={`Name (${lang})`}
                  value={translations[lang]?.name || ""}
                  onChange={(e) =>
                    setTranslations({
                      ...translations,
                      [lang]: { ...translations[lang], name: e.target.value },
                    })
                  }
                  className="w-full rounded-md border border-border px-3 py-1.5 text-sm"
                />
                <input
                  placeholder={`Description (${lang})`}
                  value={translations[lang]?.description || ""}
                  onChange={(e) =>
                    setTranslations({
                      ...translations,
                      [lang]: {
                        ...translations[lang],
                        description: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-md border border-border px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
