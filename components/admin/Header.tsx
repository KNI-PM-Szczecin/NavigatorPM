"use client";
import { saveMapDataAction } from "@/actions/adminActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useEditorStore } from "@/hooks/useEditorStore";
import { Building, Floor } from "@/types/map";
import { Edit2, Loader2, Plus, Save, Trash2, UserSquare2 } from "lucide-react";
import { useState } from "react";
import CreateBuildingForm from "./CreateBuildingForm";
import CreateFloorForm from "./CreateFloorForm";

export default function EditorHeader() {
  const [isSaving, setIsSaving] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);

  const [editingBuilding, setEditingBuilding] = useState<Building | undefined>(
    undefined
  );
  const [editingFloor, setEditingFloor] = useState<Floor | undefined>(
    undefined
  );

  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<string | null>(null);

  const {
    buildings,
    floors,
    activeBuildingId,
    activeFloorId,
    setActiveBuilding,
    setActiveFloor,
    getExportData,
    nodes,
    deleteBuilding,
    deleteFloor,
  } = useEditorStore();

  const activeBuildingFloors = floors.filter(
    (f) => f.buildingId === activeBuildingId
  );
  const activeBuilding = buildings.find((b) => b.id === activeBuildingId);
  const activeFloor = floors.find((f) => f.id === activeFloorId);

  const handleSave = async () => {
    setIsSaving(true);
    const exportData = getExportData();
    const result = await saveMapDataAction(exportData);

    if (result.success) {
      toast.add({
        title: "Success",
        description: "The map data has been successfully saved to the file.",
        type: "success",
      });
    } else {
      toast.add({
        title: "Write error",
        description: "An error occurred while saving map data.",
        type: "error",
      });
    }

    setIsSaving(false);
  };
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* LOGO */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          <UserSquare2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide">NavigatorPM</h1>
          <p className="font-mono text-[10px] text-muted-foreground">v0.0.1</p>
        </div>
      </div>

      {/* Explorer */}
      <div className="flex items-center gap-2">
        {/* Building selection */}
        <div className="flex items-center gap-1">
          <Select
            value={activeBuildingId ?? ""}
            onValueChange={(val: string | null) => {
              if (val === "CREATE") {
                setEditingBuilding(undefined);
                setShowBuildingModal(true);
              } else if (val) {
                setActiveBuilding(val);
              }
            }}
          >
            <SelectTrigger className="w-45 border-border bg-transparent text-sm font-medium">
              <SelectValue placeholder="Select Building" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.translations?.pl?.name || b.id}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="CREATE" className="font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Create new...
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {activeBuildingId && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => {
                  setEditingBuilding(activeBuilding);
                  setShowBuildingModal(true);
                }}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Edit Building"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setBuildingToDelete(activeBuildingId)}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete Building"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <span className="text-muted-foreground">›</span>

        {/* Floor selection */}
        <div className="flex items-center gap-1">
          <Select
            value={activeFloorId ?? ""}
            disabled={!activeBuildingId}
            onValueChange={(val: string | null) => {
              if (val === "CREATE") {
                setEditingFloor(undefined);
                setShowFloorModal(true);
              } else if (val) {
                setActiveFloor(val);
              }
            }}
          >
            <SelectTrigger className="w-45 border-border bg-transparent text-sm font-medium disabled:opacity-50">
              <SelectValue placeholder="Select Floor" />
            </SelectTrigger>
            <SelectContent>
              {activeBuildingFloors.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.level} ({f.translations?.pl?.name || "Floor"})
                </SelectItem>
              ))}
              {activeBuildingId && (
                <>
                  <SelectSeparator />
                  <SelectItem
                    value="CREATE"
                    className="font-semibold text-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Create new...
                    </span>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {activeFloorId && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => {
                  setEditingFloor(activeFloor);
                  setShowFloorModal(true);
                }}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Edit Floor"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setFloorToDelete(activeFloorId)}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete Floor"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save button section */}
      <div className="flex items-center gap-4">
        <div className="font-mono text-xs text-muted-foreground">
          {nodes.length} nodes
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Export JSON
        </button>
      </div>

      {/* MODALE FORMULARZY */}
      {showBuildingModal && (
        <CreateBuildingForm
          existingBuilding={editingBuilding}
          onClose={() => setShowBuildingModal(false)}
        />
      )}
      {showFloorModal && activeBuildingId && (
        <CreateFloorForm
          buildingId={activeBuildingId}
          existingFloor={editingFloor}
          onClose={() => setShowFloorModal(false)}
        />
      )}

      {/* SHADCN ALERT DIALOG: delete building */}
      <AlertDialog
        open={!!buildingToDelete}
        onOpenChange={() => setBuildingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the building and all associated
              floors and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (buildingToDelete) deleteBuilding(buildingToDelete);
                setBuildingToDelete(null);
              }}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SHADCN ALERT DIALOG: Delete Floor */}
      <AlertDialog
        open={!!floorToDelete}
        onOpenChange={() => setFloorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this floor and its map configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (floorToDelete) deleteFloor(floorToDelete);
                setFloorToDelete(null);
              }}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
