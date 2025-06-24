import { create } from "zustand"
import { Node, Edge } from "@xyflow/react"

// 🔥 NEW: Import types from toolbar
export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"
export type ConnectionType = "straight" | "curved" | "step" | "bezier"

export interface MindMapNodeData extends Record<string, unknown> {
  text: string
  color: string
  isEditing: boolean
  shape?: NodeShape // 🔥 NEW: Add shape property
}

export interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  color: string
  shape?: NodeShape // 🔥 NEW: Add shape property
  parentId?: string
}

export interface MindMap {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  nodes?: MindMapNode[]
  _count: {
    nodes: number
  }
}

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

// Type alias for our specific node type
export type ReactFlowNode = Node<MindMapNodeData>

interface MindMapStore {
  // Current mind map state
  mindMapId: string | null
  nodes: ReactFlowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  viewport: ViewportState

  // 🔥 NEW: UI interaction state
  selectedNodeShape: NodeShape
  connectionMode: ConnectionType | null
  isConnecting: boolean

  // UI state
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null

  // History for undo/redo
  history: Array<{ nodes: ReactFlowNode[]; edges: Edge[] }>
  historyIndex: number

  // Actions
  setMindMapId: (id: string) => void
  setNodes: (nodes: ReactFlowNode[]) => void
  setEdges: (edges: Edge[]) => void
  updateNode: (nodeId: string, data: Partial<MindMapNodeData>) => void
  deleteNode: (nodeId: string) => void
  addNode: (node: ReactFlowNode) => void
  setSelectedNodeId: (id: string | null) => void
  setViewport: (viewport: ViewportState) => void

  // 🔥 NEW: Shape and connection actions
  setSelectedNodeShape: (shape: NodeShape) => void
  setConnectionMode: (mode: ConnectionType | null) => void
  setIsConnecting: (connecting: boolean) => void

  // Canvas specific actions
  addNodeAtPosition: (
    position: { x: number; y: number },
    parentId?: string,
    shape?: NodeShape
  ) => string
  connectNodes: (
    sourceId: string,
    targetId: string,
    connectionType?: ConnectionType
  ) => void
  duplicateNode: (nodeId: string) => void

  // Save/Load actions
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
  markUnsavedChanges: () => void
  clearUnsavedChanges: () => void

  // History actions
  pushToHistory: () => void
  undo: () => boolean
  redo: () => boolean
  canUndo: () => boolean
  canRedo: () => boolean

  // Utility actions
  reset: () => void
  exportData: () => {
    nodes: ReactFlowNode[]
    edges: Edge[]
    viewport: ViewportState
  }
  importData: (data: {
    nodes: ReactFlowNode[]
    edges: Edge[]
    viewport?: ViewportState
  }) => void
}

const initialViewport: ViewportState = { x: 0, y: 0, zoom: 1 }

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  // Initial state
  mindMapId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: initialViewport,

  // 🔥 NEW: UI interaction state
  selectedNodeShape: "rectangle",
  connectionMode: null,
  isConnecting: false,

  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  lastSaved: null,

  history: [],
  historyIndex: -1,

  // Basic setters
  setMindMapId: (id) => set({ mindMapId: id }),

  setNodes: (nodes) => {
    get().pushToHistory()
    set({ nodes, hasUnsavedChanges: true })
  },

  setEdges: (edges) => {
    get().pushToHistory()
    set({ edges, hasUnsavedChanges: true })
  },

  updateNode: (nodeId, data) => {
    const { nodes } = get()
    get().pushToHistory()

    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    )

    set({ nodes: updatedNodes, hasUnsavedChanges: true })
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get()
    get().pushToHistory()

    // Remove node and all connected edges
    const updatedNodes = nodes.filter((node) => node.id !== nodeId)
    const updatedEdges = edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
      selectedNodeId: null,
      hasUnsavedChanges: true,
    })
  },

  addNode: (node) => {
    const { nodes } = get()
    get().pushToHistory()
    set({ nodes: [...nodes, node], hasUnsavedChanges: true })
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setViewport: (viewport) => set({ viewport }),

  // 🔥 NEW: Shape and connection setters
  setSelectedNodeShape: (shape) => set({ selectedNodeShape: shape }),
  setConnectionMode: (mode) =>
    set({ connectionMode: mode, isConnecting: !!mode }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),

  // 🔥 UPDATED: Canvas specific actions with shape support
  addNodeAtPosition: (position, parentId, shape) => {
    const { nodes, edges, selectedNodeShape } = get()
    const nodeId = `node-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    get().pushToHistory()

    const newNode: ReactFlowNode = {
      id: nodeId,
      type: "mindMapNode",
      position,
      style: {
        width: 200,
        height: 120,
      },
      data: {
        text: "New Idea",
        color: "#3b82f6",
        isEditing: true,
        shape: shape || selectedNodeShape, // 🔥 NEW: Use provided shape or selected shape
      },
    }

    let newEdges = edges

    // If parentId is provided, create an edge to connect to parent
    if (parentId) {
      const edge: Edge = {
        id: `e${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      }
      newEdges = [...edges, edge]
    }

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      selectedNodeId: nodeId,
      hasUnsavedChanges: true,
    })

    return nodeId
  },

  // 🔥 UPDATED: Connection with type support
  connectNodes: (sourceId, targetId, connectionType) => {
    const { edges, connectionMode } = get()
    get().pushToHistory()

    const edgeId = `e${sourceId}-${targetId}`

    // Check if edge already exists
    if (edges.find((edge) => edge.id === edgeId)) {
      return
    }

    // 🔥 NEW: Determine edge type based on connection mode or parameter
    const edgeType = connectionType || connectionMode || "curved"

    // Create properly typed edge based on connection type
    let newEdge: Edge

    switch (edgeType) {
      case "straight":
        newEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: "straight",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }
        break
      case "step":
        newEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: "step",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }
        break
      case "bezier":
        newEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: "default",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }
        break
      case "curved":
      default:
        newEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }
        break
    }

    set({ edges: [...edges, newEdge], hasUnsavedChanges: true })
  },

  duplicateNode: (nodeId) => {
    const { nodes } = get()
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId)

    if (!nodeToDuplicate) return

    get().pushToHistory()

    const duplicatedNode: ReactFlowNode = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: nodeToDuplicate.position.x + 150,
        y: nodeToDuplicate.position.y + 50,
      },
      style: {
        width: nodeToDuplicate.style?.width || 200,
        height: nodeToDuplicate.style?.height || 120,
      },
      data: {
        ...nodeToDuplicate.data,
        text: `${nodeToDuplicate.data.text} (Copy)`,
      },
    }

    set({
      nodes: [...nodes, duplicatedNode],
      selectedNodeId: duplicatedNode.id,
      hasUnsavedChanges: true,
    })
  },

  // Save/Load state management
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
  clearUnsavedChanges: () => set({ hasUnsavedChanges: false }),

  // History management
  pushToHistory: () => {
    const { nodes, edges, history, historyIndex } = get()

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)

    // Add current state to history
    newHistory.push({ nodes: [...nodes], edges: [...edges] })

    // Limit history size to prevent memory issues
    const maxHistorySize = 50
    if (newHistory.length > maxHistorySize) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  undo: () => {
    const { history, historyIndex } = get()

    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      set({
        nodes: [...previousState.nodes],
        edges: [...previousState.edges],
        historyIndex: historyIndex - 1,
        hasUnsavedChanges: true,
      })
      return true
    }
    return false
  },

  redo: () => {
    const { history, historyIndex } = get()

    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      set({
        nodes: [...nextState.nodes],
        edges: [...nextState.edges],
        historyIndex: historyIndex + 1,
        hasUnsavedChanges: true,
      })
      return true
    }
    return false
  },

  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },

  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  // Utility functions
  reset: () =>
    set({
      mindMapId: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      viewport: initialViewport,
      selectedNodeShape: "rectangle",
      connectionMode: null,
      isConnecting: false,
      isLoading: false,
      isSaving: false,
      hasUnsavedChanges: false,
      lastSaved: null,
      history: [],
      historyIndex: -1,
    }),

  exportData: () => {
    const { nodes, edges, viewport } = get()
    return { nodes, edges, viewport }
  },

  importData: (data) => {
    set({
      nodes: data.nodes || [],
      edges: data.edges || [],
      viewport: data.viewport || initialViewport,
      hasUnsavedChanges: true,
    })
    get().pushToHistory()
  },
}))
