import { Building, Edge, Floor, MapData, Node, POI } from "@/types/map"; // Dopasuj ścieżkę do swoich typów
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ToolType = "SELECT" | "ADD_NODE" | "DRAW_EDGE" | "DRAW_PATH";

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
  loadMapData: (data: MapData) => void;

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
  cancelEdgeDrawing: () => void;
  addNodeAndEdge: (node: Node, edge: Edge) => void;

  isGridSnapEnabled: boolean;
  toggleGridSnap: () => void;

  setSelectedNode: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;
  connectNodesInPath: (targetNodeId: string) => void;
  handleNodeClickForEdge: (nodeId: string) => void;
  connectToFloorBelow: (nodeId: string) => {
    success: boolean;
    message: string;
  };
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
        return { buildings, floors, nodes, edges, pois };
      },

      loadMapData: (data) =>
        set((state) => ({
          ...state,
          buildings: data.buildings || [],
          floors: data.floors || [],
          nodes: data.nodes || [],
          edges: data.edges || [],
          pois: data.pois || [],
          activeBuildingId: null,
          activeFloorId: null,
          selectedNodeId: null,
          activeTool: "SELECT",
        })),

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
          drawingEdgeFromId:
            state.drawingEdgeFromId === id
              ? undefined
              : state.drawingEdgeFromId,
        })),

      deleteEdge: (id) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
        })),

      cancelEdgeDrawing: () => set({ drawingEdgeFromId: undefined }),

      addNodeAndEdge: (newNode, newEdge) =>
        set((state) => ({
          nodes: [...state.nodes, newNode],
          edges: [...state.edges, newEdge],
          selectedNodeId: newNode.id,
        })),

      isGridSnapEnabled: false,

      toggleGridSnap: () =>
        set((state) => ({ isGridSnapEnabled: !state.isGridSnapEnabled })),

      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setActiveTool: (tool) =>
        set({ activeTool: tool, drawingEdgeFromId: null }),

      connectNodesInPath: (targetNodeId: string) => {
        const { selectedNodeId, nodes, edges } = get();

        if (!selectedNodeId || selectedNodeId === targetNodeId) {
          return set({ selectedNodeId: targetNodeId });
        }

        const nodeA = nodes.find((n) => n.id === selectedNodeId);
        const nodeB = nodes.find((n) => n.id === targetNodeId);

        if (nodeA && nodeB) {
          const edgeExists = edges.some(
            (e) =>
              (e.nodeAId === nodeA.id && e.nodeBId === nodeB.id) ||
              (e.nodeAId === nodeB.id && e.nodeBId === nodeA.id)
          );

          if (!edgeExists) {
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

            set({ edges: [...edges, newEdge] });
          }

          set({ selectedNodeId: targetNodeId });
        }
      },

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

      connectToFloorBelow: (nodeId: string) => {
        let result = { success: false, message: "Nieznany błąd." };

        set((state) => {
          const nodeA = state.nodes.find((n) => n.id === nodeId);
          if (!nodeA) return state;

          const currentFloor = state.floors.find((f) => f.id === nodeA.floorId);
          if (!currentFloor) return state;

          const floorBelow = state.floors.find(
            (f) =>
              f.buildingId === currentFloor.buildingId &&
              f.level === currentFloor.level - 1
          );

          if (!floorBelow) {
            result = {
              success: false,
              message: "To jest już najniższy poziom w tym budynku.",
            };
            return state;
          }

          const targetNode = state.nodes.find(
            (n) =>
              n.floorId === floorBelow.id &&
              Math.abs(n.xCoordinate - nodeA.xCoordinate) < 2 &&
              Math.abs(n.yCoordinate - nodeA.yCoordinate) < 2
          );

          if (!targetNode) {
            result = {
              success: false,
              message:
                "Nie znaleziono węzła na piętrze poniżej w tym samym miejscu (X, Y)!",
            };
            return state;
          }

          const edgeExists = state.edges.some(
            (e) =>
              (e.nodeAId === nodeA.id && e.nodeBId === targetNode.id) ||
              (e.nodeAId === targetNode.id && e.nodeBId === nodeA.id)
          );

          if (edgeExists) {
            result = {
              success: false,
              message: "To połączenie z niższym piętrem już istnieje!",
            };
            return state;
          }

          const newEdge: Edge = {
            id: `e_${Date.now()}`,
            nodeAId: nodeA.id,
            nodeBId: targetNode.id,
            weight: 150,
            isAccessible: true,
          };

          result = {
            success: true,
            message: "Pomyślnie połączono z piętrem niżej!",
          };
          return { edges: [...state.edges, newEdge] };
        });

        return result; // Zwracamy obiekt z wynikiem!
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
