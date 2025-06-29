// =====================================
// CORE TYPES - src/types/index.ts
// =====================================

// Import related types from other files
import type { LineToolData, TextToolData, NodeShape } from "./drawing-tools"

// =====================================
// CORE MIND MAP TYPES
// =====================================

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
  children?: MindMapNode[]

  // ✅ Drawing tool properties with consistent types
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

export interface MindMap {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  nodes: MindMapNode[]
  // ✅ Added lines and texts for full drawing tool support
  lines?: LineToolData[]
  texts?: TextToolData[]
  // ✅ Date types for persistence layer
  createdAt: Date
  updatedAt: Date
  _count?: {
    nodes: number
  }
}

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

// ✅ Enhanced canvas state with all drawing tools
export interface CanvasState {
  isDragging: boolean
  dragOffset: { x: number; y: number }
  selectedTool: string // Keep as string for backward compatibility
  // ✅ Added comprehensive selection tracking
  selectedNodes: string[]
  selectedLines: string[]
  selectedTexts: string[]
  // ✅ Added drawing tool state
  isDrawingLine: boolean
  isCreatingText: boolean
  activeTool: string
  showDrawingTools: boolean
}

export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// =====================================
// RE-EXPORT DRAWING TOOL TYPES
// =====================================

export type {
  DrawingToolType,
  DrawingToolSettings,
  LineToolData,
  LineDrawingState,
  TextToolData,
  TextDrawingState,
  MindMapNodeData,
  NodeShape,
} from "./drawing-tools"

export type {
  ToolType,
  ConnectionType,
  ReactFlowNode,
  ToolContext,
  EnhancedCanvasState,
  HistoryState,
  SerializableMindMap,
} from "./mindmap"

// =====================================
// CONSTANTS
// =====================================

export const DEFAULT_NODE_SIZE = { width: 200, height: 120 }
export const DEFAULT_LINE_STYLE = { strokeWidth: 2, strokeColor: "#8b5cf6" }
export const DEFAULT_TEXT_STYLE = { fontSize: 16, color: "#000000" }
export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 }
