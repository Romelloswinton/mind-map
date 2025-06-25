// Save as: ./types/drawing-tools.ts

import { LucideIcon } from "lucide-react"

// =====================================
// CORE DRAWING TOOL TYPES
// =====================================

// Tool types that trigger the panel
export type DrawingToolType =
  | "rectangle"
  | "diamond"
  | "circle"
  | "arrow"
  | "pencil"
  | "text"
  | "image"

// Drawing tool settings interface
export interface DrawingToolSettings {
  strokeColor: string
  fillColor: string
  strokeWidth: number
  strokeStyle: "solid" | "dashed" | "dotted"
  sloppiness: number
  edgeStyle: "square" | "rounded"
  opacity: number
}

// =====================================
// UI COMPONENT TYPES
// =====================================

// Color swatch interface
export interface ColorSwatch {
  name: string
  value: string
  bg: string
  pattern?: "checker"
}

// Stroke width option interface
export interface StrokeWidthOption {
  name: string
  value: number
  preview: string
}

// Stroke style option interface
export interface StrokeStyleOption {
  name: string
  value: "solid" | "dashed" | "dotted"
  pattern: string
}

// Sloppiness level interface
export interface SloppinessLevel {
  name: string
  value: number
  icon: string
}

// Edge style interface
export interface EdgeStyle {
  name: string
  value: "square" | "rounded"
  icon: LucideIcon
}

// Tool info interface
export interface ToolInfo {
  icon: LucideIcon
  name: string
}

// =====================================
// COMPONENT PROPS TYPES
// =====================================

// Main panel props interface
export interface DrawingToolsPanelProps {
  activeTool: DrawingToolType | null
  isVisible: boolean
  onClose?: () => void
  onSettingsChange?: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  initialSettings?: Partial<Record<DrawingToolType, DrawingToolSettings>>
  className?: string
}

// Individual section props
export interface StrokeColorSectionProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export interface BackgroundSectionProps {
  selectedColor: string
  onColorChange: (color: string) => void
  showSection: boolean
}

export interface StrokeWidthSectionProps {
  selectedWidth: number
  onWidthChange: (width: number) => void
}

export interface StrokeStyleSectionProps {
  selectedStyle: "solid" | "dashed" | "dotted"
  onStyleChange: (style: "solid" | "dashed" | "dotted") => void
}

export interface SloppinessSectionProps {
  selectedLevel: number
  onLevelChange: (level: number) => void
}

export interface EdgeStyleSectionProps {
  selectedStyle: "square" | "rounded"
  onStyleChange: (style: "square" | "rounded") => void
  showSection: boolean
}

export interface OpacitySectionProps {
  opacity: number
  onOpacityChange: (opacity: number) => void
}

export interface LayersSectionProps {
  onLayerAction: (action: "back" | "down" | "up" | "front") => void
}

// =====================================
// STORE TYPES
// =====================================

// Store state interface
export interface DrawingToolsState {
  // Current panel state
  isPanelVisible: boolean
  activeTool: DrawingToolType | null
  isCollapsed: boolean

  // Tool settings for each tool type
  toolSettings: Record<DrawingToolType, DrawingToolSettings>

  // Actions
  showPanel: (tool: DrawingToolType) => void
  hidePanel: () => void
  toggleCollapsed: () => void
  setActiveTool: (tool: DrawingToolType | null) => void

  // Settings actions
  updateToolSetting: <K extends keyof DrawingToolSettings>(
    tool: DrawingToolType,
    key: K,
    value: DrawingToolSettings[K]
  ) => void
  updateToolSettings: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  resetToolSettings: (tool?: DrawingToolType) => void
  getToolSettings: (tool: DrawingToolType) => DrawingToolSettings

  // Bulk operations
  exportSettings: () => Record<DrawingToolType, DrawingToolSettings>
  importSettings: (
    settings: Record<DrawingToolType, DrawingToolSettings>
  ) => void
}

// Store selectors return type
export interface DrawingToolsSelectors {
  // Panel state selectors
  isPanelVisible: () => boolean
  activeTool: () => DrawingToolType | null
  isCollapsed: () => boolean

  // Settings selectors
  getStrokeColor: (tool: DrawingToolType) => string | undefined
  getFillColor: (tool: DrawingToolType) => string | undefined
  getStrokeWidth: (tool: DrawingToolType) => number | undefined
  getStrokeStyle: (
    tool: DrawingToolType
  ) => "solid" | "dashed" | "dotted" | undefined
  getSloppiness: (tool: DrawingToolType) => number | undefined
  getEdgeStyle: (tool: DrawingToolType) => "square" | "rounded" | undefined
  getOpacity: (tool: DrawingToolType) => number | undefined

  // Computed properties
  currentToolSettings: () => DrawingToolSettings | null

  // Validation helpers
  hasValidSettings: (tool: DrawingToolType) => boolean
}

// =====================================
// UTILITY TYPES
// =====================================

// Color utility types
export interface RGBColor {
  r: number
  g: number
  b: number
}

// CSS style types
export interface StrokeStyles {
  stroke: string
  strokeWidth: string
  strokeDasharray: string
}

export interface FillStyles {
  fill: string
}

export interface SloppinessStyles {
  filter: string
  transform: string
}

// Keyboard shortcut types
export interface KeyboardModifiers {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

export type KeyboardShortcutHandler = (event: KeyboardEvent) => void

// Integration types
export interface ToolbarIntegrationProps {
  activeTool?: any // Will use your existing ToolType
  selectedNodeShape?: any // Will use your existing NodeShape
  onToolChange?: (tool: any) => void
  onShapeChange?: (shape: any) => void
  onShare?: () => void
  onLibrary?: () => void
  onAddNode?: (position?: { x: number; y: number }, shape?: any) => void
  isLocked?: boolean
  onToggleLock?: () => void
  className?: string
}
