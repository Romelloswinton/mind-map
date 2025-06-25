import { create } from "zustand"
import { Node, Edge } from "@xyflow/react"

// 🔥 NEW: Import types from toolbar
export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"
export type ConnectionType = "straight" | "curved" | "step" | "bezier"

// 🎨 ENHANCED: Extended MindMapNodeData with drawing tool properties
export interface MindMapNodeData extends Record<string, unknown> {
  text: string
  color: string
  isEditing: boolean
  shape?: NodeShape

  // 🎨 NEW: Drawing tool customization properties
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  strokeStyle?: "solid" | "dashed" | "dotted"
  opacity?: number
  sloppiness?: number
  edgeStyle?: "square" | "rounded"
}

// 🎨 ENHANCED: Extended MindMapNode with drawing tool properties
export interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  color: string
  shape?: NodeShape
  parentId?: string

  // 🎨 NEW: Drawing tool properties for persistence
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  strokeStyle?: "solid" | "dashed" | "dotted"
  opacity?: number
  sloppiness?: number
  edgeStyle?: "square" | "rounded"
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

// 🎨 NEW: Drawing tool default settings interface
export interface DrawingToolDefaults {
  strokeColor: string
  fillColor: string
  strokeWidth: number
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  sloppiness: number
  edgeStyle: "square" | "rounded"
}

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

  // 🔥 NEW: Drawing tools state
  drawingToolsManuallyOpened: boolean

  // 🎨 NEW: Drawing tool defaults for new nodes
  drawingToolDefaults: DrawingToolDefaults

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

  // 🔥 NEW: Drawing tools actions
  setDrawingToolsManuallyOpened: (opened: boolean) => void

  // 🎨 NEW: Drawing tool defaults management
  setDrawingToolDefaults: (defaults: Partial<DrawingToolDefaults>) => void
  resetDrawingToolDefaults: () => void
  getDrawingToolDefaults: () => DrawingToolDefaults

  // 🎨 ENHANCED: Node styling actions
  applyDrawingToolsToNode: (
    nodeId: string,
    properties: Partial<MindMapNodeData>
  ) => void
  applyDrawingToolsToSelectedNodes: (
    properties: Partial<MindMapNodeData>
  ) => void
  resetNodeStyling: (nodeId: string) => void

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

// 🎨 NEW: Default drawing tool settings
const defaultDrawingToolDefaults: DrawingToolDefaults = {
  strokeColor: "#6b7280",
  fillColor: "#3b82f6",
  strokeWidth: 2,
  strokeStyle: "solid",
  opacity: 1.0,
  sloppiness: 0,
  edgeStyle: "rounded",
}

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

  // 🔥 NEW: Drawing tools state
  drawingToolsManuallyOpened: false,

  // 🎨 NEW: Drawing tool defaults
  drawingToolDefaults: { ...defaultDrawingToolDefaults },

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

    console.log(`📝 Updated node ${nodeId}:`, data)
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

  // 🔥 NEW: Drawing tools setter
  setDrawingToolsManuallyOpened: (opened) =>
    set({ drawingToolsManuallyOpened: opened }),

  // 🎨 NEW: Drawing tool defaults management
  setDrawingToolDefaults: (defaults) => {
    const currentDefaults = get().drawingToolDefaults
    set({
      drawingToolDefaults: { ...currentDefaults, ...defaults },
      hasUnsavedChanges: true,
    })
    console.log("🎨 Updated drawing tool defaults:", defaults)
  },

  resetDrawingToolDefaults: () => {
    set({ drawingToolDefaults: { ...defaultDrawingToolDefaults } })
    console.log("🔄 Reset drawing tool defaults")
  },

  getDrawingToolDefaults: () => get().drawingToolDefaults,

  // 🎨 NEW: Node styling actions
  applyDrawingToolsToNode: (nodeId, properties) => {
    const { nodes } = get()

    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...properties } }
        : node
    )

    set({ nodes: updatedNodes, hasUnsavedChanges: true })
    console.log(`🎨 Applied styling to node ${nodeId}:`, properties)
  },

  applyDrawingToolsToSelectedNodes: (properties) => {
    const { nodes, selectedNodeId } = get()

    if (!selectedNodeId) {
      console.warn("⚠️ No node selected for styling")
      return
    }

    get().applyDrawingToolsToNode(selectedNodeId, properties)
  },

  resetNodeStyling: (nodeId) => {
    const { nodes } = get()

    const resetProperties: Partial<MindMapNodeData> = {
      strokeColor: undefined,
      fillColor: undefined,
      strokeWidth: undefined,
      strokeStyle: undefined,
      opacity: undefined,
      sloppiness: undefined,
      edgeStyle: undefined,
    }

    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              ...resetProperties,
              color: get().drawingToolDefaults.fillColor, // Reset to default color
            },
          }
        : node
    )

    set({ nodes: updatedNodes, hasUnsavedChanges: true })
    console.log(`🔄 Reset styling for node ${nodeId}`)
  },

  // 🔥 UPDATED: Canvas specific actions with shape and drawing tool support
  addNodeAtPosition: (position, parentId, shape) => {
    const { nodes, edges, selectedNodeShape, drawingToolDefaults } = get()
    const nodeId = `node-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    get().pushToHistory()

    // 🎨 NEW: Apply current drawing tool defaults to new nodes
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
        color: drawingToolDefaults.fillColor,
        isEditing: true,
        shape: shape || selectedNodeShape,

        // 🎨 Apply current drawing tool defaults
        strokeColor: drawingToolDefaults.strokeColor,
        fillColor: drawingToolDefaults.fillColor,
        strokeWidth: drawingToolDefaults.strokeWidth,
        strokeStyle: drawingToolDefaults.strokeStyle,
        opacity: drawingToolDefaults.opacity,
        sloppiness: drawingToolDefaults.sloppiness,
        edgeStyle: drawingToolDefaults.edgeStyle,
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

    console.log(`🎨 Created node with drawing tool defaults:`, newNode.data)
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

  // 🎨 ENHANCED: Duplicate node with all styling properties
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
        ...nodeToDuplicate.data, // This now includes all drawing tool properties
        text: `${nodeToDuplicate.data.text} (Copy)`,
      },
    }

    set({
      nodes: [...nodes, duplicatedNode],
      selectedNodeId: duplicatedNode.id,
      hasUnsavedChanges: true,
    })

    console.log(`📋 Duplicated node with all styling:`, duplicatedNode.data)
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
      console.log("↩️ Undo applied")
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
      console.log("↪️ Redo applied")
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
      drawingToolsManuallyOpened: false,
      drawingToolDefaults: { ...defaultDrawingToolDefaults }, // 🎨 Reset drawing tool defaults
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
    console.log("📥 Data imported successfully")
  },
}))

// 🎨 NEW: Helper selectors for drawing tools integration
export const useMindMapDrawingTools = () => {
  const store = useMindMapStore()

  return {
    // Drawing tool defaults
    drawingToolDefaults: store.drawingToolDefaults,
    setDrawingToolDefaults: store.setDrawingToolDefaults,
    resetDrawingToolDefaults: store.resetDrawingToolDefaults,
    getDrawingToolDefaults: store.getDrawingToolDefaults,

    // Node styling actions
    applyDrawingToolsToNode: store.applyDrawingToolsToNode,
    applyDrawingToolsToSelectedNodes: store.applyDrawingToolsToSelectedNodes,
    resetNodeStyling: store.resetNodeStyling,

    // Selected node info
    selectedNodeId: store.selectedNodeId,
    selectedNode: store.nodes.find((node) => node.id === store.selectedNodeId),

    // Utility functions
    getNodeById: (nodeId: string) =>
      store.nodes.find((node) => node.id === nodeId),
    getSelectedNodeStyling: () => {
      const selectedNode = store.nodes.find(
        (node) => node.id === store.selectedNodeId
      )
      if (!selectedNode) return null

      return {
        strokeColor: selectedNode.data.strokeColor,
        fillColor: selectedNode.data.fillColor,
        strokeWidth: selectedNode.data.strokeWidth,
        strokeStyle: selectedNode.data.strokeStyle,
        opacity: selectedNode.data.opacity,
        sloppiness: selectedNode.data.sloppiness,
        edgeStyle: selectedNode.data.edgeStyle,
      }
    },
  }
}
