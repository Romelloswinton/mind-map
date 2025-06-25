// types/mindmap.ts
import { Edge, Node, Viewport } from "@xyflow/react"

export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"

export type ConnectionType = "curved" | "straight" | "step" | "bezier"

export type ToolType =
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "circle"
  | "text"
  | "image"
  | "eraser"

export interface ReactFlowNode extends Node {
  data: {
    text: string
    color: string
    isEditing: boolean
    shape: NodeShape // Made required instead of optional
    // Drawing tool properties
    strokeColor?: string
    fillColor?: string
    strokeWidth?: number
    strokeStyle?: "solid" | "dashed" | "dotted"
    opacity?: number
    sloppiness?: number
    edgeStyle?: "square" | "rounded"
  }
}

export interface MindMapCanvasProps {
  mindMapId: string
}

export interface ToolContext {
  type: "node" | "connector" | "drawing"
  shape?: NodeShape
  selectedNodeId?: string
}

export interface MindMapState {
  nodes: ReactFlowNode[]
  edges: Edge[]
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  viewport: Viewport
  selectedNodeShape: NodeShape
  connectionMode: ConnectionType | null
  isConnecting: boolean
  activeTool: ToolType
  isLocked: boolean
  panMode: boolean
  showDrawingTools: boolean
  activeDrawingTool: string | null
  selectedNodes: string[]
  toolContext?: ToolContext
  history: Array<{ nodes: ReactFlowNode[]; edges: Edge[] }>
  historyIndex: number
}

export interface NodeEventHandlers {
  onNodeDrag: (event: any, node: ReactFlowNode) => void
  onNodeDragStop: (event: any, node: ReactFlowNode) => void
  onNodeClick: (event: any, node: ReactFlowNode) => void
  onNodeSelectionChange: (params: {
    nodes: ReactFlowNode[]
    edges: Edge[]
  }) => void
}

export interface CanvasEventHandlers {
  onCanvasClick: (event: React.MouseEvent) => void
  onCanvasDoubleClick: (event: React.MouseEvent) => void
  onConnect: (connection: any) => void
}

export interface ToolHandlers {
  handleToolChange: (tool: ToolType) => void
  handleToggleLock: () => void
  handleShare: () => void
  handleLibrary: () => void
}

export interface NodeOperations {
  addNode: (position?: { x: number; y: number }, shape?: NodeShape) => void
  deleteNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: Partial<ReactFlowNode["data"]>) => void
}

export interface HistoryOperations {
  pushToHistory: () => void
  handleUndo: () => void
  handleRedo: () => void
}

export interface DrawingToolsState {
  showDrawingTools: boolean
  activeDrawingTool: string | null
  toolContext?: ToolContext
  handleDrawingToolSettings: (tool: string, settings: any) => void
  handleCloseDrawingTools: () => void
}
