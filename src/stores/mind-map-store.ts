// =====================================
// COMPLETE FIXED MIND MAP STORE - src/stores/mind-map-store.ts
// =====================================

import { create } from "zustand"
import { Node, Edge } from "@xyflow/react"

// ✅ FIXED: Import from unified types
import type {
  NodeShape,
  LineToolData,
  TextToolData,
  MindMapNodeData,
} from "@/src/types/drawing-tools"

import type { ConnectionType, ReactFlowNode } from "@/src/types/mindmap"

// ✅ FIXED: Define types that are specific to this store
export interface ViewportState {
  x: number
  y: number
  zoom: number
}

// ✅ FIXED: Enhanced MindMap interface for persistence
export interface MindMap {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  nodes?: MindMapNode[]
  // ✅ Added support for drawing tools
  lines?: LineToolData[]
  texts?: TextToolData[]
  _count: {
    nodes: number
  }
}

// ✅ FIXED: Enhanced MindMapNode for persistence
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

  // ✅ Drawing tool properties for persistence
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  strokeStyle?: "solid" | "dashed" | "dotted"
  opacity?: number
  sloppiness?: number
  edgeStyle?: "square" | "rounded"

  // ✅ Consistent number timestamps
  createdAt?: number
  updatedAt?: number
}

// ✅ FIXED: Drawing tool defaults interface
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

  // ✅ UI interaction state
  selectedNodeShape: NodeShape
  connectionMode: ConnectionType | null
  isConnecting: boolean

  // ✅ Drawing tools state
  drawingToolsManuallyOpened: boolean

  // ✅ Drawing tool defaults for new nodes
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

  // ✅ Shape and connection actions
  setSelectedNodeShape: (shape: NodeShape) => void
  setConnectionMode: (mode: ConnectionType | null) => void
  setIsConnecting: (connecting: boolean) => void

  // ✅ Drawing tools actions
  setDrawingToolsManuallyOpened: (opened: boolean) => void

  // ✅ Drawing tool defaults management
  setDrawingToolDefaults: (defaults: Partial<DrawingToolDefaults>) => void
  resetDrawingToolDefaults: () => void
  getDrawingToolDefaults: () => DrawingToolDefaults

  // ✅ ENHANCED: Node styling actions with drawing tools integration
  applyDrawingToolsToNode: (
    nodeId: string,
    properties: Partial<MindMapNodeData>
  ) => void
  applyDrawingToolsToSelectedNodes: (
    properties: Partial<MindMapNodeData>
  ) => void
  resetNodeStyling: (nodeId: string) => void

  // ✅ Drawing tools panel integration methods
  updateNodeFromPanel: (
    nodeId: string,
    updates: Partial<MindMapNodeData>
  ) => void
  getNodeForPanel: (nodeId: string) => ReactFlowNode | null
  subscribeToNodeUpdates: (
    nodeId: string,
    callback: (node: ReactFlowNode) => void
  ) => () => void

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

// ✅ Default drawing tool settings
const defaultDrawingToolDefaults: DrawingToolDefaults = {
  strokeColor: "#6b7280",
  fillColor: "#3b82f6",
  strokeWidth: 2,
  strokeStyle: "solid",
  opacity: 1.0,
  sloppiness: 0,
  edgeStyle: "rounded",
}

// ✅ Node update callbacks registry
const nodeUpdateCallbacks = new Map<
  string,
  Set<(node: ReactFlowNode) => void>
>()

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  // Initial state
  mindMapId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: initialViewport,

  // ✅ UI interaction state
  selectedNodeShape: "rectangle",
  connectionMode: null,
  isConnecting: false,

  // ✅ Drawing tools state
  drawingToolsManuallyOpened: false,

  // ✅ Drawing tool defaults
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

    // ✅ Notify all node update callbacks
    nodes.forEach((node) => {
      const callbacks = nodeUpdateCallbacks.get(node.id)
      if (callbacks) {
        callbacks.forEach((callback) => callback(node))
      }
    })
  },

  setEdges: (edges) => {
    get().pushToHistory()
    set({ edges, hasUnsavedChanges: true })
  },

  updateNode: (nodeId, data) => {
    const { nodes } = get()
    get().pushToHistory()

    // ✅ FIXED: Enhanced update with timestamp
    const enhancedData = {
      ...data,
      updatedAt: Date.now(),
    }

    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...enhancedData } }
        : node
    )

    set({ nodes: updatedNodes, hasUnsavedChanges: true })

    // ✅ Notify callbacks for this specific node
    const updatedNode = updatedNodes.find((n) => n.id === nodeId)
    if (updatedNode) {
      const callbacks = nodeUpdateCallbacks.get(nodeId)
      if (callbacks) {
        callbacks.forEach((callback) => callback(updatedNode))
      }
    }

    console.log(`📝 Updated node ${nodeId}:`, enhancedData)
  },

  // ✅ ENHANCED: Drawing tools panel integration method
  updateNodeFromPanel: (nodeId, updates) => {
    console.log(`🎨 Panel updating node ${nodeId}:`, updates)

    const { nodes } = get()
    const currentNode = nodes.find((n) => n.id === nodeId)

    if (!currentNode) {
      console.error(`❌ Node ${nodeId} not found for panel update`)
      return
    }

    // Enhanced updates with timestamp and validation
    const enhancedUpdates = {
      ...updates,
      // Ensure we maintain node integrity
      text: updates.text ?? currentNode.data.text,
      color: updates.fillColor ?? updates.color ?? currentNode.data.color,
      updatedAt: Date.now(),
    }

    // Use the standard updateNode method to maintain consistency
    get().updateNode(nodeId, enhancedUpdates)

    console.log(`✅ Panel: Node ${nodeId} updated successfully`)
  },

  // ✅ Get node for panel
  getNodeForPanel: (nodeId) => {
    const { nodes } = get()
    return nodes.find((n) => n.id === nodeId) || null
  },

  // ✅ Subscribe to node updates
  subscribeToNodeUpdates: (nodeId, callback) => {
    if (!nodeUpdateCallbacks.has(nodeId)) {
      nodeUpdateCallbacks.set(nodeId, new Set())
    }

    const callbacks = nodeUpdateCallbacks.get(nodeId)!
    callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        nodeUpdateCallbacks.delete(nodeId)
      }
    }
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get()
    get().pushToHistory()

    // Remove node and all connected edges
    const updatedNodes = nodes.filter((node) => node.id !== nodeId)
    const updatedEdges = edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )

    // ✅ Clean up callbacks for deleted node
    nodeUpdateCallbacks.delete(nodeId)

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
    const newNodes = [...nodes, node]
    set({ nodes: newNodes, hasUnsavedChanges: true })

    // ✅ Notify callbacks for new node
    const callbacks = nodeUpdateCallbacks.get(node.id)
    if (callbacks) {
      callbacks.forEach((callback) => callback(node))
    }
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setViewport: (viewport) => set({ viewport }),

  // ✅ Shape and connection setters
  setSelectedNodeShape: (shape) => set({ selectedNodeShape: shape }),
  setConnectionMode: (mode) =>
    set({ connectionMode: mode, isConnecting: !!mode }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),

  // ✅ Drawing tools setter
  setDrawingToolsManuallyOpened: (opened) =>
    set({ drawingToolsManuallyOpened: opened }),

  // ✅ Drawing tool defaults management
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

  // ✅ ENHANCED: Node styling actions with proper integration
  applyDrawingToolsToNode: (nodeId, properties) => {
    console.log(`🎨 Applying drawing tools to node ${nodeId}:`, properties)
    get().updateNodeFromPanel(nodeId, properties)
  },

  applyDrawingToolsToSelectedNodes: (properties) => {
    const { selectedNodeId } = get()

    if (!selectedNodeId) {
      console.warn("⚠️ No node selected for styling")
      return
    }

    get().applyDrawingToolsToNode(selectedNodeId, properties)
  },

  resetNodeStyling: (nodeId) => {
    const { drawingToolDefaults } = get()

    const resetProperties: Partial<MindMapNodeData> = {
      strokeColor: undefined,
      fillColor: undefined,
      strokeWidth: undefined,
      strokeStyle: undefined,
      opacity: undefined,
      sloppiness: undefined,
      edgeStyle: undefined,
      color: drawingToolDefaults.fillColor, // Reset to default color
    }

    get().updateNodeFromPanel(nodeId, resetProperties)
    console.log(`🔄 Reset styling for node ${nodeId}`)
  },

  // ✅ UPDATED: Canvas specific actions with shape and drawing tool support
  addNodeAtPosition: (position, parentId, shape) => {
    const { nodes, edges, selectedNodeShape, drawingToolDefaults } = get()
    const nodeId = `node-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    get().pushToHistory()

    // ✅ Apply current drawing tool defaults to new nodes
    const timestamp = Date.now()
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

        // ✅ Apply current drawing tool defaults
        strokeColor: drawingToolDefaults.strokeColor,
        fillColor: drawingToolDefaults.fillColor,
        strokeWidth: drawingToolDefaults.strokeWidth,
        strokeStyle: drawingToolDefaults.strokeStyle,
        opacity: drawingToolDefaults.opacity,
        sloppiness: drawingToolDefaults.sloppiness,
        edgeStyle: drawingToolDefaults.edgeStyle,

        // ✅ Consistent timestamps
        createdAt: timestamp,
        updatedAt: timestamp,
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

    const newNodes = [...nodes, newNode]
    set({
      nodes: newNodes,
      edges: newEdges,
      selectedNodeId: nodeId,
      hasUnsavedChanges: true,
    })

    // ✅ Notify callbacks for new node
    const callbacks = nodeUpdateCallbacks.get(nodeId)
    if (callbacks) {
      callbacks.forEach((callback) => callback(newNode))
    }

    console.log(`🎨 Created node with drawing tool defaults:`, newNode.data)
    return nodeId
  },

  // ✅ UPDATED: Connection with type support
  connectNodes: (sourceId, targetId, connectionType) => {
    const { edges, connectionMode } = get()
    get().pushToHistory()

    const edgeId = `e${sourceId}-${targetId}`

    // Check if edge already exists
    if (edges.find((edge) => edge.id === edgeId)) {
      return
    }

    // ✅ Determine edge type based on connection mode or parameter
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

  // ✅ ENHANCED: Duplicate node with all styling properties
  duplicateNode: (nodeId) => {
    const { nodes } = get()
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId)

    if (!nodeToDuplicate) return

    get().pushToHistory()

    const timestamp = Date.now()
    const duplicatedNode: ReactFlowNode = {
      ...nodeToDuplicate,
      id: `node-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
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
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    }

    const newNodes = [...nodes, duplicatedNode]
    set({
      nodes: newNodes,
      selectedNodeId: duplicatedNode.id,
      hasUnsavedChanges: true,
    })

    // ✅ Notify callbacks for duplicated node
    const callbacks = nodeUpdateCallbacks.get(duplicatedNode.id)
    if (callbacks) {
      callbacks.forEach((callback) => callback(duplicatedNode))
    }

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
      const newNodes = [...previousState.nodes]
      const newEdges = [...previousState.edges]

      set({
        nodes: newNodes,
        edges: newEdges,
        historyIndex: historyIndex - 1,
        hasUnsavedChanges: true,
      })

      // ✅ Notify all callbacks after undo
      newNodes.forEach((node) => {
        const callbacks = nodeUpdateCallbacks.get(node.id)
        if (callbacks) {
          callbacks.forEach((callback) => callback(node))
        }
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
      const newNodes = [...nextState.nodes]
      const newEdges = [...nextState.edges]

      set({
        nodes: newNodes,
        edges: newEdges,
        historyIndex: historyIndex + 1,
        hasUnsavedChanges: true,
      })

      // ✅ Notify all callbacks after redo
      newNodes.forEach((node) => {
        const callbacks = nodeUpdateCallbacks.get(node.id)
        if (callbacks) {
          callbacks.forEach((callback) => callback(node))
        }
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
  reset: () => {
    // ✅ Clear all node callbacks on reset
    nodeUpdateCallbacks.clear()

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
      drawingToolDefaults: { ...defaultDrawingToolDefaults },
      isLoading: false,
      isSaving: false,
      hasUnsavedChanges: false,
      lastSaved: null,
      history: [],
      historyIndex: -1,
    })
  },

  exportData: () => {
    const { nodes, edges, viewport } = get()
    return { nodes, edges, viewport }
  },

  importData: (data) => {
    const newNodes = data.nodes || []
    const newEdges = data.edges || []

    set({
      nodes: newNodes,
      edges: newEdges,
      viewport: data.viewport || initialViewport,
      hasUnsavedChanges: true,
    })

    // ✅ Notify callbacks for imported nodes
    newNodes.forEach((node) => {
      const callbacks = nodeUpdateCallbacks.get(node.id)
      if (callbacks) {
        callbacks.forEach((callback) => callback(node))
      }
    })

    get().pushToHistory()
    console.log("📥 Data imported successfully")
  },
}))

// ✅ ENHANCED: Helper selectors for drawing tools integration with proper panel methods
export const useMindMapDrawingTools = () => {
  const store = useMindMapStore()

  return {
    // Drawing tool defaults
    drawingToolDefaults: store.drawingToolDefaults,
    setDrawingToolDefaults: store.setDrawingToolDefaults,
    resetDrawingToolDefaults: store.resetDrawingToolDefaults,
    getDrawingToolDefaults: store.getDrawingToolDefaults,

    // ✅ ENHANCED: Node styling actions with panel integration
    applyDrawingToolsToNode: store.applyDrawingToolsToNode,
    applyDrawingToolsToSelectedNodes: store.applyDrawingToolsToSelectedNodes,
    resetNodeStyling: store.resetNodeStyling,

    // ✅ Panel integration methods
    updateNodeFromPanel: store.updateNodeFromPanel,
    getNodeForPanel: store.getNodeForPanel,
    subscribeToNodeUpdates: store.subscribeToNodeUpdates,

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

// ✅ Hook for drawing tools panel to properly integrate with mind map store
export const useMindMapPanelIntegration = () => {
  const updateNodeFromPanel = useMindMapStore(
    (state) => state.updateNodeFromPanel
  )
  const getNodeForPanel = useMindMapStore((state) => state.getNodeForPanel)
  const subscribeToNodeUpdates = useMindMapStore(
    (state) => state.subscribeToNodeUpdates
  )
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId)

  return {
    updateNodeFromPanel,
    getNodeForPanel,
    subscribeToNodeUpdates,
    selectedNodeId,
    // ✅ Convenience method for panel updates
    updateSelectedNode: (updates: Partial<MindMapNodeData>) => {
      if (selectedNodeId) {
        updateNodeFromPanel(selectedNodeId, updates)
      }
    },
  }
}

// ✅ Enhanced selectors for performance
export const useMindMapSelectors = () => {
  const store = useMindMapStore()

  return {
    // Core data
    nodes: store.nodes,
    edges: store.edges,
    selectedNodeId: store.selectedNodeId,
    viewport: store.viewport,

    // UI state
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    hasUnsavedChanges: store.hasUnsavedChanges,
    lastSaved: store.lastSaved,

    // Drawing tools
    selectedNodeShape: store.selectedNodeShape,
    drawingToolDefaults: store.drawingToolDefaults,
    drawingToolsManuallyOpened: store.drawingToolsManuallyOpened,

    // History
    canUndo: store.canUndo(),
    canRedo: store.canRedo(),

    // Computed values
    selectedNode: store.selectedNodeId
      ? store.nodes.find((n) => n.id === store.selectedNodeId)
      : null,
    nodeCount: store.nodes.length,
    edgeCount: store.edges.length,

    // Actions
    setSelectedNodeId: store.setSelectedNodeId,
    setViewport: store.setViewport,
    setSelectedNodeShape: store.setSelectedNodeShape,
    undo: store.undo,
    redo: store.redo,
    reset: store.reset,
  }
}
