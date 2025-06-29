// =====================================
// MIND MAP TYPES - src/types/mindmap.ts
// =====================================

import { Node, Edge } from "@xyflow/react"
import type {
  LineToolData,
  TextToolData,
  DrawingToolType,
  MindMapNodeData,
  NodeShape,
} from "./drawing-tools"

// =====================================
// CORE MIND MAP TYPES
// =====================================

// ✅ Unified tool type that includes all tools
export type ToolType =
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "circle"
  | "line"
  | "text"
  | "image"
  | "eraser"

export type ConnectionType = "curved" | "straight" | "step" | "bezier"

// ✅ React Flow node with enhanced data
export interface ReactFlowNode extends Node {
  data: MindMapNodeData
  type: "mindMapNode"
}

// ✅ Unified tool context for all drawing tools
export interface ToolContext {
  type: "node" | "connector" | "drawing" | "line" | "text"
  shape?: string
  selectedNodeId?: string
  selectedLineId?: string
  selectedTextId?: string
}

// ✅ Enhanced canvas state with all tools
export interface EnhancedCanvasState {
  nodes: ReactFlowNode[]
  edges: Edge[]
  lines: LineToolData[]
  texts: TextToolData[]
  viewport: { x: number; y: number; zoom: number }
  selectedNodes: string[]
  selectedLines: string[]
  selectedTexts: string[]
  isLocked: boolean
  activeTool: ToolType
  activeDrawingTool?: DrawingToolType
  showDrawingTools: boolean
  toolContext?: ToolContext
}

// ✅ History state with all data types
export interface HistoryState {
  nodes: ReactFlowNode[]
  edges: Edge[]
  lines: LineToolData[]
  texts: TextToolData[]
  timestamp: number
}

// ✅ Serializable mind map with all data
export interface SerializableMindMap {
  id: string
  title: string
  description?: string
  nodes: ReactFlowNode[]
  edges: Edge[]
  lines: LineToolData[]
  texts: TextToolData[]
  viewport: { x: number; y: number; zoom: number }
  metadata: {
    version: string
    createdAt: string
    updatedAt: string
    author?: string
    tags?: string[]
  }
}

// =====================================
// MIND MAP STORE INTERFACE
// =====================================

export interface MindMapStore {
  // Core state
  mindMapId: string | null
  nodes: ReactFlowNode[]
  edges: Edge[]
  selectedNodeId: string | null
  viewport: { x: number; y: number; zoom: number }

  // ✅ Enhanced UI state with all tools
  selectedNodeShape: NodeShape
  connectionMode: ConnectionType | null
  isConnecting: boolean
  drawingToolsManuallyOpened: boolean

  // ✅ Drawing tool defaults
  drawingToolDefaults: {
    strokeColor: string
    fillColor: string
    strokeWidth: number
    strokeStyle: "solid" | "dashed" | "dotted"
    opacity: number
    sloppiness: number
    edgeStyle: "square" | "rounded"
  }

  // Basic actions
  setMindMapId: (id: string) => void
  setNodes: (nodes: ReactFlowNode[]) => void
  setEdges: (edges: Edge[]) => void
  updateNode: (nodeId: string, data: Partial<MindMapNodeData>) => void
  deleteNode: (nodeId: string) => void
  addNode: (node: ReactFlowNode) => void
  setSelectedNodeId: (id: string | null) => void

  // ✅ Drawing tools integration
  updateNodeFromPanel: (
    nodeId: string,
    updates: Partial<MindMapNodeData>
  ) => void
  getNodeForPanel: (nodeId: string) => ReactFlowNode | null
  applyDrawingToolsToNode: (
    nodeId: string,
    properties: Partial<MindMapNodeData>
  ) => void

  // Enhanced node operations
  addNodeAtPosition: (
    position: { x: number; y: number },
    parentId?: string,
    shape?: NodeShape
  ) => string
}

// =====================================
// COMPONENT PROPS
// =====================================

export interface MindMapCanvasProps {
  mindMapId: string
}

export interface IntegratedFloatingToolbarProps {
  activeTool?: ToolType
  onToolChange?: (tool: ToolType) => void
  isLocked?: boolean
  onToggleLock?: () => void
  className?: string
}

// =====================================
// EVENT TYPES
// =====================================

export interface CanvasClickEvent {
  point: { x: number; y: number }
  tool: ToolType
  modifiers: {
    ctrl: boolean
    shift: boolean
    alt: boolean
  }
}

export interface NodeOperationEvent {
  type: "create" | "update" | "delete" | "select"
  nodeId: string
  data?: Partial<MindMapNodeData>
  position?: { x: number; y: number }
}

export interface LineOperationEvent {
  type: "create" | "update" | "delete" | "select"
  lineId: string
  data?: Partial<LineToolData>
  startPoint?: { x: number; y: number }
  endPoint?: { x: number; y: number }
}

export interface TextOperationEvent {
  type: "create" | "update" | "delete" | "select"
  textId: string
  data?: Partial<TextToolData>
  position?: { x: number; y: number }
}

// =====================================
// VALIDATION AND PERSISTENCE
// =====================================

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: "node" | "edge" | "line" | "text" | "metadata"
  id?: string
  message: string
  severity: "error" | "warning"
}

export interface ValidationWarning {
  type: "node" | "edge" | "line" | "text" | "metadata"
  id?: string
  message: string
  suggestion?: string
}

export type ExportFormat = "json" | "png" | "svg" | "pdf" | "markdown"

export interface ExportOptions {
  format: ExportFormat
  quality?: number
  includeBackground?: boolean
  includeLines?: boolean
  includeTexts?: boolean
  includeMetadata?: boolean
  customStyles?: Record<string, any>
}

export interface ImportResult {
  success: boolean
  mindMap?: SerializableMindMap
  errors?: string[]
  warnings?: string[]
}

// =====================================
// COLLABORATION TYPES
// =====================================

export interface CollaborationEvent {
  type:
    | "node-update"
    | "edge-update"
    | "line-update"
    | "text-update"
    | "cursor-move"
    | "selection-change"
  userId: string
  timestamp: number
  data: any
}

export interface UserPresence {
  userId: string
  userName: string
  cursor?: { x: number; y: number }
  selectedNodes?: string[]
  selectedLines?: string[]
  selectedTexts?: string[]
  color: string
  lastSeen: number
}

// =====================================
// UTILITY TYPES
// =====================================

export interface Point {
  x: number
  y: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Theme {
  name: string
  colors: {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
    muted: string
    border: string
  }
  fonts: {
    sans: string
    mono: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export interface PerformanceMetrics {
  renderTime: number
  nodeCount: number
  edgeCount: number
  lineCount: number
  textCount: number
  memoryUsage: number
  fps: number
}

// =====================================
// CONSTANTS
// =====================================

export const DEFAULT_NODE_SIZE = { width: 200, height: 120 }
export const DEFAULT_LINE_STYLE = { strokeWidth: 2, strokeColor: "#8b5cf6" }
export const DEFAULT_TEXT_STYLE = { fontSize: 16, color: "#000000" }
export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 }
export const MAX_HISTORY_SIZE = 50
export const AUTO_SAVE_INTERVAL = 3000

// ✅ Tool capabilities with consistent line and text support
export const TOOL_CAPABILITIES: Record<
  ToolType,
  {
    canCreateNodes: boolean
    canCreateLines: boolean
    canCreateTexts: boolean
    canSelect: boolean
    canEdit: boolean
  }
> = {
  hand: {
    canCreateNodes: false,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  select: {
    canCreateNodes: false,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: true,
    canEdit: true,
  },
  rectangle: {
    canCreateNodes: true,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  diamond: {
    canCreateNodes: true,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  circle: {
    canCreateNodes: true,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  line: {
    canCreateNodes: false,
    canCreateLines: true,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  text: {
    canCreateNodes: false,
    canCreateLines: false,
    canCreateTexts: true,
    canSelect: false,
    canEdit: false,
  },
  image: {
    canCreateNodes: true,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: false,
    canEdit: false,
  },
  eraser: {
    canCreateNodes: false,
    canCreateLines: false,
    canCreateTexts: false,
    canSelect: true,
    canEdit: false,
  },
}

// =====================================
// TYPE GUARDS AND UTILITIES
// =====================================

export const isReactFlowNode = (obj: any): obj is ReactFlowNode => {
  return (
    obj &&
    typeof obj.id === "string" &&
    obj.data &&
    typeof obj.data.text === "string" &&
    obj.type === "mindMapNode"
  )
}

export const isCanvasState = (obj: any): obj is EnhancedCanvasState => {
  return (
    obj &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges) &&
    Array.isArray(obj.lines) &&
    Array.isArray(obj.texts) &&
    obj.viewport &&
    typeof obj.activeTool === "string"
  )
}

// ✅ Type guard for checking if tool is a drawing tool
export const isDrawingTool = (tool: ToolType): tool is DrawingToolType => {
  return ["rectangle", "diamond", "circle", "line", "text"].includes(tool)
}

export const canCreateLines = (tool: ToolType): boolean => {
  return TOOL_CAPABILITIES[tool]?.canCreateLines ?? false
}

export const canCreateTexts = (tool: ToolType): boolean => {
  return TOOL_CAPABILITIES[tool]?.canCreateTexts ?? false
}

export const canCreateNodes = (tool: ToolType): boolean => {
  return TOOL_CAPABILITIES[tool]?.canCreateNodes ?? false
}

// =====================================
// PLUGIN INTEGRATION TYPES
// =====================================

export interface MindMapPlugin {
  id: string
  name: string
  version: string

  // Lifecycle hooks
  onLoad?: (canvas: EnhancedCanvasState) => void
  onUnload?: () => void

  // Event handlers with consistent data types
  onNodeCreate?: (node: ReactFlowNode) => void
  onNodeUpdate?: (node: ReactFlowNode) => void
  onLineCreate?: (line: LineToolData) => void
  onLineUpdate?: (line: LineToolData) => void
  onTextCreate?: (text: TextToolData) => void
  onTextUpdate?: (text: TextToolData) => void

  // UI extensions
  toolbarItems?: ToolbarItem[]
  contextMenuItems?: ContextMenuItem[]
}

export interface ToolbarItem {
  id: string
  icon: React.ComponentType
  label: string
  onClick: () => void
  disabled?: boolean
}

export interface ContextMenuItem {
  id: string
  label: string
  onClick: (context: any) => void
  separator?: boolean
  disabled?: boolean
}

// =====================================
// CONVENIENCE TYPE ALIASES
// =====================================

// Type aliases for backward compatibility
export type LineData = LineToolData
export type TextData = TextToolData
