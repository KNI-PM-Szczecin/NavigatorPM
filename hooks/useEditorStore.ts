import { Building, Edge, Floor, MapData, Node, POI } from "@/types/map"; // Dopasuj ścieżkę do swoich typów
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ToolType = "SELECT" | "ADD_NODE" | "DRAW_EDGE";

interface EditorState extends MapData {
  // Ui States
  activeBuildingId: string | null;
  activeFloorId: string | null;
  selectedNodeId: string | null;
  activeTool: ToolType;
  drawingEdgeFromId: string | null;

  // Actions
  initData: (data: MapData) => void;
  setActiveBuilding: (id: string) => void;
  setActiveFloor: (id: string) => void;
  getExportData: () => MapData;

  addNode: (node: Node) => void;
  addBuilding: (building: Building) => void;
  updateBuilding: (building: Building) => void;
  deleteBuilding: (id: string) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floor: Floor) => void;
  deleteFloor: (id: string) => void;
  addPoi: (poi: POI) => void;
  updatePoi: (poi: POI) => void;
  deletePoi: (nodeId: string) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  updateNodeCoordinates: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;
  handleNodeClickForEdge: (nodeId: string) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      buildings: [],
      floors: [],
      nodes: [],
      edges: [],
      pois: [],

      activeBuildingId: null,
      activeFloorId: null,
      selectedNodeId: null,
      activeTool: "SELECT",
      drawingEdgeFromId: null,

      initData: (data) => {
        const firstBuilding = data.buildings[0]?.id || null;
        const firstFloor =
          data.floors.find((f) => f.buildingId === firstBuilding)?.id || null;
        set({
          ...data,
          activeBuildingId: firstBuilding,
          activeFloorId: firstFloor,
        });
      },

      setActiveBuilding: (id) => {
        const { floors } = get();
        const firstFloor = floors.find((f) => f.buildingId === id)?.id || null;
        set({
          activeBuildingId: id,
          activeFloorId: firstFloor,
          selectedNodeId: null,
          drawingEdgeFromId: null,
        });
      },

      setActiveFloor: (id) =>
        set({
          activeFloorId: id,
          selectedNodeId: null,
          drawingEdgeFromId: null,
        }),

      getExportData: () => {
        const { buildings, floors, nodes, edges, pois } = get();
        return { buildings, floors, nodes, edges, pois }; // Zwracamy czysty obiekt MapData
      },

      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

      addBuilding: (building) =>
        set((state) => ({
          buildings: [...state.buildings, building],
          activeBuildingId: building.id,
        })),

      updateBuilding: (building) =>
        set((state) => ({
          buildings: state.buildings.map((b) =>
            b.id === building.id ? building : b
          ),
        })),

      deleteBuilding: (id: string) =>
        set((state) => ({
          buildings: state.buildings.filter((b) => b.id !== id),
          floors: state.floors.filter((f) => f.buildingId !== id), // Usuwamy też piętra tego budynku
          activeBuildingId: null,
          activeFloorId: null,
        })),

      addFloor: (floor) =>
        set((state) => ({
          floors: [...state.floors, floor],
          activeFloorId: floor.id,
        })),

      updateFloor: (floor) =>
        set((state) => ({
          floors: state.floors.map((f) => (f.id === floor.id ? floor : f)),
        })),

      deleteFloor: (id: string) =>
        set((state) => ({
          floors: state.floors.filter((f) => f.id !== id),
          activeFloorId: null,
        })),

      addPoi: (poi) =>
        set((state) => ({
          pois: [...state.pois, poi],
        })),

      updatePoi: (poi: POI) =>
        set((state) => ({
          pois: state.pois.map((p) => (p.id === poi.id ? poi : p)),
        })),

      deletePoi: (nodeId: string) =>
        set((state) => ({
          pois: state.pois.filter((p) => p.nodeId !== nodeId),
        })),

      updateNode: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
        })),

      updateNodeCoordinates: (id: string, x: number, y: number) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, xCoordinate: x, yCoordinate: y } : n
          ),
        })),

      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter(
            (e) => e.nodeAId !== id && e.nodeBId !== id
          ),
          pois: state.pois.map((p) =>
            p.nodeId === id ? { ...p, nodeId: "" } : p
          ),
          selectedNodeId:
            state.selectedNodeId === id ? null : state.selectedNodeId,
        })),

      deleteEdge: (id) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
        })),

      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setActiveTool: (tool) =>
        set({ activeTool: tool, drawingEdgeFromId: null }),

      handleNodeClickForEdge: (targetNodeId) => {
        const { drawingEdgeFromId, nodes, edges } = get();
        if (!drawingEdgeFromId) return set({ drawingEdgeFromId: targetNodeId });
        if (drawingEdgeFromId === targetNodeId)
          return set({ drawingEdgeFromId: null });

        const nodeA = nodes.find((n) => n.id === drawingEdgeFromId);
        const nodeB = nodes.find((n) => n.id === targetNodeId);

        if (nodeA && nodeB) {
          const edgeExists = edges.some(
            (e) =>
              (e.nodeAId === nodeA.id && e.nodeBId === nodeB.id) ||
              (e.nodeAId === nodeB.id && e.nodeBId === nodeA.id)
          );

          if (edgeExists) {
            return set({ drawingEdgeFromId: null });
          }

          const weight = Math.round(
            Math.sqrt(
              Math.pow(nodeB.xCoordinate - nodeA.xCoordinate, 2) +
                Math.pow(nodeB.yCoordinate - nodeA.yCoordinate, 2)
            )
          );

          const newEdge: Edge = {
            id: `e_${Date.now()}`,
            nodeAId: nodeA.id,
            nodeBId: nodeB.id,
            weight,
            isAccessible: true,
          };

          set({ edges: [...edges, newEdge], drawingEdgeFromId: null });
        }
      },
    }),
    {
      name: "navigator-editor-storage",
      partialize: (state) => ({
        buildings: state.buildings,
        floors: state.floors,
        nodes: state.nodes,
        edges: state.edges,
        pois: state.pois,
        activeBuildingId: state.activeBuildingId,
        activeFloorId: state.activeFloorId,
      }),
    }
  )
);
