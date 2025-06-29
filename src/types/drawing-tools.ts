// File: src/types/drawing-tools.ts
// =====================================
// DRAWING TOOLS TYPES - src/types/drawing-tools.ts
// =====================================

import { LucideIcon } from "lucide-react"
import { Node } from "@xyflow/react"

// =====================================
// CORE DRAWING TOOL TYPES
// =====================================

// ✅ Updated to include eraser as a drawing tool
export type DrawingToolType =
  | "rectangle"
  | "diamond"
  | "circle"
  | "line"
  | "text"
  | "eraser" // ✅ Added eraser

// ✅ Complete tool type including all tools
export type ToolType = "hand" | "select" | DrawingToolType

// ✅ Node shape type consistency
export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"

// ✅ Eraser modes for different deletion behaviors
export type EraserMode = "single" | "area" | "stroke"

// =====================================
// ERASER TYPES
// =====================================

export interface EraserSettings {
  mode: EraserMode
  size: number // Eraser brush size
  opacity: number
  // Different deletion behaviors
  canDeleteNodes: boolean
  canDeleteLines: boolean
  canDeleteTexts: boolean
  canDeleteEdges: boolean
}

export interface EraserState {
  isErasing: boolean
  mode: EraserMode
  brushPosition?: { x: number; y: number }
  eraserPath?: Array<{ x: number; y: number }>
  itemsToDelete: {
    nodes: string[]
    lines: string[]
    texts: string[]
    edges: string[]
  }
}

// =====================================
// MIND MAP NODE DATA (Enhanced)
// =====================================

export interface MindMapNodeData extends Record<string, unknown> {
  text: string
  color: string
  shape?: NodeShape
  isEditing?: boolean

  // ✅ Drawing tool properties matching LineToolData and TextToolData
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
  tags?: string[]
  priority?: "low" | "medium" | "high"
}

// ✅ FIXED: ReactFlow Node with proper type constraint to match mindmap.ts
export interface ReactFlowNode extends Node<MindMapNodeData> {
  type: "mindMapNode"
}

// =====================================
// DRAWING TOOL SETTINGS
// =====================================

export interface DrawingToolSettings {
  strokeColor: string
  fillColor: string
  strokeWidth: number
  strokeStyle: "solid" | "dashed" | "dotted"
  sloppiness: number
  edgeStyle: "square" | "rounded"
  opacity: number
  // Text-specific properties
  fontSize?: number
  fontFamily?: string
  // ✅ Eraser-specific properties
  eraserMode?: EraserMode
  eraserSize?: number
  canDeleteNodes?: boolean
  canDeleteLines?: boolean
  canDeleteTexts?: boolean
  canDeleteEdges?: boolean
}

// =====================================
// LINE TOOL TYPES
// =====================================

export interface LineToolData {
  id: string
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
  strokeColor: string
  strokeWidth: number
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  sloppiness?: number
  edgeStyle: "square" | "rounded"
  // Node connection metadata
  startNodeId?: string
  endNodeId?: string
  // ✅ Number timestamps for consistency
  createdAt: number
  updatedAt: number
}

export interface LineDrawingState {
  isDrawing: boolean
  startPoint?: { x: number; y: number }
  currentPoint?: { x: number; y: number }
  previewLine?: Omit<LineToolData, "id" | "createdAt" | "updatedAt">
}

// =====================================
// TEXT TOOL TYPES
// =====================================

export interface TextToolData {
  id: string
  position: { x: number; y: number }
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: "normal" | "bold" | "lighter"
  fontStyle: "normal" | "italic"
  textAlign: "left" | "center" | "right"
  color: string
  backgroundColor?: string
  padding: number
  maxWidth?: number
  lineHeight: number
  letterSpacing: number
  textDecoration: "none" | "underline" | "line-through"
  opacity: number
  rotation: number
  isEditing?: boolean
  // ✅ Number timestamps for consistency
  createdAt: number
  updatedAt: number
}

export interface TextDrawingState {
  isCreating: boolean
  position?: { x: number; y: number }
  previewText?: Partial<TextToolData>
}

// =====================================
// DRAWING TOOLS STORE INTERFACE
// =====================================

export interface DrawingToolsState {
  // Panel state
  isPanelVisible: boolean
  activeTool: ToolType | null
  isCollapsed: boolean
  toolSettings: Record<DrawingToolType, DrawingToolSettings>

  // ✅ Drawing data with consistent types
  lineDrawingState: LineDrawingState
  lines: LineToolData[]
  textDrawingState: TextDrawingState
  texts: TextToolData[]

  // ✅ Eraser state
  eraserState: EraserState

  // ✅ Unified selection tracking
  selectedLineId: string | null
  selectedTextId: string | null
  selectedNodeId: string | null
  updateCounter: number

  // Actions
  showPanel: (tool: DrawingToolType) => void
  hidePanel: () => void
  toggleCollapsed: () => void
  setActiveTool: (tool: ToolType | null) => void

  // Settings
  updateToolSetting: (
    tool: DrawingToolType,
    key: keyof DrawingToolSettings,
    value: any
  ) => void
  updateToolSettings: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  resetToolSettings: (tool?: DrawingToolType) => void

  // Line operations
  startLineDrawing: (startPoint: { x: number; y: number }) => void
  updateLineDrawing: (currentPoint: { x: number; y: number }) => void
  finishLineDrawing: () => LineToolData | null
  cancelLineDrawing: () => void
  addLine: (line: LineToolData) => void
  updateLine: (lineId: string, updates: Partial<LineToolData>) => void
  deleteLine: (lineId: string) => void

  // Text operations
  startTextCreation: (position: { x: number; y: number }) => void
  finishTextCreation: (content?: string) => TextToolData | null
  cancelTextCreation: () => void
  addText: (text: TextToolData) => void
  updateText: (textId: string, updates: Partial<TextToolData>) => void
  deleteText: (textId: string) => void

  // ✅ Eraser operations
  startErasing: (position: { x: number; y: number }) => void
  updateErasing: (position: { x: number; y: number }) => void
  finishErasing: () => void
  cancelErasing: () => void
  eraseAtPosition: (position: { x: number; y: number }) => void
  eraseInArea: (
    startPos: { x: number; y: number },
    endPos: { x: number; y: number }
  ) => void
  setEraserMode: (mode: EraserMode) => void
  setEraserSize: (size: number) => void

  // Selection
  setSelectedLine: (lineId: string | null) => void
  setSelectedText: (textId: string | null) => void
  setSelectedNode: (nodeId: string | null) => void
  clearSelection: () => void
  forceUpdate: () => void
}

// =====================================
// COMPONENT PROPS
// =====================================

export interface DrawingToolsPanelProps {
  activeTool?: DrawingToolType
  isVisible: boolean
  onClose?: () => void
  onSettingsChange?: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  className?: string
}

export interface LineToolHandlersProps {
  activeTool: string // Keep flexible for tool compatibility
  viewport: { x: number; y: number; zoom: number }
}

export interface TextToolHandlersProps {
  activeTool: string
  viewport: { x: number; y: number; zoom: number }
  addText: (text: TextToolData) => void
  startTextCreation: (position: { x: number; y: number }) => void
  finishTextCreation: (content?: string) => TextToolData | null
  setEditingTextId: (id: string | undefined) => void
}

// ✅ Eraser tool handlers props
export interface EraserToolHandlersProps {
  activeTool: string
  viewport: { x: number; y: number; zoom: number }
  eraserState: EraserState
  onEraseStart: (position: { x: number; y: number }) => void
  onEraseUpdate: (position: { x: number; y: number }) => void
  onEraseEnd: () => void
}

// =====================================
// UI COMPONENT TYPES
// =====================================

export interface ColorSwatch {
  name: string
  value: string
  bg: string
  pattern?: "checker"
}

export interface StrokeWidthOption {
  name: string
  value: number
  preview: string
}

export interface StrokeStyleOption {
  name: string
  value: "solid" | "dashed" | "dotted"
  pattern: string
}

export interface SloppinessLevel {
  name: string
  value: number
  icon: string
}

export interface EdgeStyle {
  name: string
  value: "square" | "rounded"
  icon: LucideIcon
}

export interface ToolInfo {
  icon: LucideIcon
  name: string
}

// ✅ Eraser UI options
export interface EraserModeOption {
  name: string
  value: EraserMode
  icon: LucideIcon
  description: string
}

export interface EraserSizeOption {
  name: string
  value: number
  preview: string
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

// =====================================
// TYPE GUARDS AND UTILITIES
// =====================================

export const isLineToolData = (obj: any): obj is LineToolData => {
  return (
    obj &&
    typeof obj.id === "string" &&
    obj.startPoint &&
    obj.endPoint &&
    typeof obj.strokeColor === "string" &&
    typeof obj.strokeWidth === "number" &&
    typeof obj.createdAt === "number" &&
    typeof obj.updatedAt === "number"
  )
}

export const isTextToolData = (obj: any): obj is TextToolData => {
  return (
    obj &&
    typeof obj.id === "string" &&
    obj.position &&
    typeof obj.content === "string" &&
    typeof obj.fontSize === "number" &&
    typeof obj.createdAt === "number" &&
    typeof obj.updatedAt === "number"
  )
}

export const isValidDrawingTool = (tool: string): tool is DrawingToolType => {
  return ["rectangle", "diamond", "circle", "line", "text", "eraser"].includes(
    tool
  ) // ✅ Added eraser
}

export const isValidTool = (tool: string): tool is ToolType => {
  return [
    "hand",
    "select",
    "rectangle",
    "diamond",
    "circle",
    "line",
    "text",
    "eraser",
  ].includes(tool) // ✅ Added eraser
}

export const isReactFlowNode = (obj: any): obj is ReactFlowNode => {
  return (
    obj &&
    typeof obj.id === "string" &&
    obj.data &&
    typeof obj.data.text === "string" &&
    obj.type === "mindMapNode"
  )
}

// ✅ NEW: Utility to convert generic Node to ReactFlowNode
export const toReactFlowNode = (node: Node): ReactFlowNode => {
  const nodeData = node.data as any

  return {
    ...node,
    type: "mindMapNode" as const,
    data: {
      text: nodeData?.text || "Untitled",
      color: nodeData?.color || "#3b82f6",
      shape: nodeData?.shape || "rectangle",
      isEditing: nodeData?.isEditing || false,
      strokeColor: nodeData?.strokeColor,
      fillColor: nodeData?.fillColor,
      strokeWidth: nodeData?.strokeWidth,
      strokeStyle: nodeData?.strokeStyle,
      opacity: nodeData?.opacity,
      sloppiness: nodeData?.sloppiness,
      edgeStyle: nodeData?.edgeStyle,
      createdAt: nodeData?.createdAt || Date.now(),
      updatedAt: nodeData?.updatedAt || Date.now(),
      tags: nodeData?.tags,
      priority: nodeData?.priority,
      ...nodeData, // Preserve any additional properties
    } as MindMapNodeData,
  }
}

// ✅ NEW: Utility to convert array of generic Nodes to ReactFlowNodes
export const toReactFlowNodes = (nodes: Node[]): ReactFlowNode[] => {
  return nodes.map(toReactFlowNode)
}

// ✅ NEW: Utility to check if point is inside bounds
export const isPointInBounds = (point: Point, bounds: BoundingBox): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

// ✅ NEW: Utility to check if point is near line
export const isPointNearLine = (
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  tolerance: number = 5
): boolean => {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1
  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  const dx = point.x - xx
  const dy = point.y - yy
  return Math.sqrt(dx * dx + dy * dy) <= tolerance
}

// =====================================
// TOOL CAPABILITIES
// =====================================

export interface ToolFeatureSupport {
  supportsFill: boolean
  supportsEdges: boolean
  supportsSloppiness: boolean
  supportsText: boolean
  supportsResize: boolean
  supportsRotation: boolean
  supportsFontSettings: boolean
  supportsErasing: boolean // ✅ Added erasing support
}

export const LINE_TOOL_FEATURES: ToolFeatureSupport = {
  supportsFill: false,
  supportsEdges: true,
  supportsSloppiness: true,
  supportsText: false,
  supportsResize: false,
  supportsRotation: false,
  supportsFontSettings: false,
  supportsErasing: false,
}

export const TEXT_TOOL_FEATURES: ToolFeatureSupport = {
  supportsFill: true,
  supportsEdges: false,
  supportsSloppiness: false,
  supportsText: true,
  supportsResize: true,
  supportsRotation: true,
  supportsFontSettings: true,
  supportsErasing: false,
}

export const NODE_TOOL_FEATURES: ToolFeatureSupport = {
  supportsFill: true,
  supportsEdges: true,
  supportsSloppiness: true,
  supportsText: false,
  supportsResize: true,
  supportsRotation: false,
  supportsFontSettings: false,
  supportsErasing: false,
}

// ✅ NEW: Eraser tool features
export const ERASER_TOOL_FEATURES: ToolFeatureSupport = {
  supportsFill: false,
  supportsEdges: false,
  supportsSloppiness: false,
  supportsText: false,
  supportsResize: false,
  supportsRotation: false,
  supportsFontSettings: false,
  supportsErasing: true,
}

export const TOOL_FEATURE_MAP: Record<DrawingToolType, ToolFeatureSupport> = {
  rectangle: NODE_TOOL_FEATURES,
  diamond: NODE_TOOL_FEATURES,
  circle: NODE_TOOL_FEATURES,
  line: LINE_TOOL_FEATURES,
  text: TEXT_TOOL_FEATURES,
  eraser: ERASER_TOOL_FEATURES, // ✅ Added eraser
}

// =====================================
// HELPER FUNCTIONS
// =====================================

export const getToolFeatures = (tool: DrawingToolType): ToolFeatureSupport => {
  return TOOL_FEATURE_MAP[tool] || NODE_TOOL_FEATURES
}

export const toolSupportsFeature = (
  tool: DrawingToolType,
  feature: keyof ToolFeatureSupport
): boolean => {
  return getToolFeatures(tool)[feature]
}
