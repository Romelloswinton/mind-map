// File: app/constants/drawing-tools.ts
// =====================================
// DRAWING TOOLS CONSTANTS - app/constants/drawing-tools.ts
// =====================================

import {
  Square,
  Circle,
  Diamond,
  Minus,
  Type,
  Image,
  Eraser, // ✅ Added Eraser icon
  LucideIcon,
} from "lucide-react"

import type {
  DrawingToolType,
  DrawingToolSettings,
  ColorSwatch,
  StrokeWidthOption,
  StrokeStyleOption,
  SloppinessLevel,
  EdgeStyle,
  ToolInfo,
} from "@/src/types/drawing-tools"

// =====================================
// TOOL INFORMATION
// =====================================

export const TOOL_INFO: Record<DrawingToolType, ToolInfo> = {
  rectangle: { icon: Square, name: "Rectangle" },
  diamond: { icon: Diamond, name: "Diamond" },
  circle: { icon: Circle, name: "Circle" },
  line: { icon: Minus, name: "Line" },
  text: { icon: Type, name: "Text" },
  eraser: { icon: Eraser, name: "Eraser" }, // ✅ Added eraser
}

// =====================================
// TOOL CAPABILITIES
// =====================================

export const TOOLS_WITH_FILL: DrawingToolType[] = [
  "rectangle",
  "diamond",
  "circle",
  "text",
]

export const TOOLS_WITH_EDGES: DrawingToolType[] = [
  "rectangle",
  "diamond",
  "circle",
  "line",
]

export const TOOLS_WITH_SLOPPINESS: DrawingToolType[] = [
  "rectangle",
  "diamond",
  "circle",
  "line",
]

// ✅ NEW: Eraser-specific capabilities
export const TOOLS_WITH_ERASING: DrawingToolType[] = ["eraser"]

// =====================================
// DEFAULT SETTINGS
// =====================================

export const DEFAULT_TOOL_SETTINGS: Record<
  DrawingToolType,
  DrawingToolSettings
> = {
  rectangle: {
    strokeColor: "#6b7280",
    fillColor: "#3b82f6",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 100,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
  },
  diamond: {
    strokeColor: "#6b7280",
    fillColor: "#10b981",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
  },
  circle: {
    strokeColor: "#6b7280",
    fillColor: "#f59e0b",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 100,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
  },
  line: {
    strokeColor: "#6b7280",
    fillColor: "transparent",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
  },
  text: {
    strokeColor: "#1f2937",
    fillColor: "transparent",
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
  },
  // ✅ NEW: Eraser default settings
  eraser: {
    strokeColor: "#ef4444", // Red for visibility
    fillColor: "#ef4444",
    strokeWidth: 20, // Eraser brush size
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 30, // Semi-transparent
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    // Eraser-specific properties
    eraserMode: "single" as any,
    eraserSize: 20,
    canDeleteNodes: true,
    canDeleteLines: true,
    canDeleteTexts: true,
    canDeleteEdges: true,
  },
}

// =====================================
// COLOR PALETTES
// =====================================

export const COLOR_SWATCHES: ColorSwatch[] = [
  // Grayscale
  { name: "Black", value: "#000000", bg: "bg-black" },
  { name: "Dark Gray", value: "#374151", bg: "bg-gray-700" },
  { name: "Gray", value: "#6b7280", bg: "bg-gray-500" },
  { name: "Light Gray", value: "#d1d5db", bg: "bg-gray-300" },
  { name: "White", value: "#ffffff", bg: "bg-white border border-gray-200" },

  // Primary Colors
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Purple", value: "#8b5cf6", bg: "bg-purple-500" },
  { name: "Green", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Yellow", value: "#f59e0b", bg: "bg-amber-500" },
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "Teal", value: "#14b8a6", bg: "bg-teal-500" },

  // Dark Variants
  { name: "Dark Blue", value: "#1e40af", bg: "bg-blue-700" },
  { name: "Dark Purple", value: "#7c3aed", bg: "bg-purple-700" },
  { name: "Dark Green", value: "#059669", bg: "bg-emerald-700" },
  { name: "Dark Red", value: "#dc2626", bg: "bg-red-600" },

  // Light Variants
  { name: "Light Blue", value: "#93c5fd", bg: "bg-blue-300" },
  { name: "Light Purple", value: "#c4b5fd", bg: "bg-purple-300" },
  { name: "Light Green", value: "#6ee7b7", bg: "bg-emerald-300" },
  { name: "Light Yellow", value: "#fcd34d", bg: "bg-yellow-300" },

  // Transparent
  {
    name: "Transparent",
    value: "transparent",
    bg: "bg-white",
    pattern: "checker",
  },
]

// =====================================
// STROKE WIDTH OPTIONS
// =====================================

export const STROKE_WIDTH_OPTIONS: StrokeWidthOption[] = [
  { name: "Thin", value: 1, preview: "border-t" },
  { name: "Medium", value: 2, preview: "border-t-2" },
  { name: "Thick", value: 4, preview: "border-t-4" },
  { name: "Extra Thick", value: 6, preview: "border-t-8" },
  { name: "Bold", value: 8, preview: "border-t-8" },
]

// ✅ NEW: Eraser size options
export const ERASER_SIZE_OPTIONS: StrokeWidthOption[] = [
  { name: "Small", value: 10, preview: "w-2 h-2" },
  { name: "Medium", value: 20, preview: "w-4 h-4" },
  { name: "Large", value: 30, preview: "w-6 h-6" },
  { name: "Extra Large", value: 40, preview: "w-8 h-8" },
  { name: "Huge", value: 60, preview: "w-12 h-12" },
]

// =====================================
// STROKE STYLE OPTIONS
// =====================================

export const STROKE_STYLE_OPTIONS: StrokeStyleOption[] = [
  { name: "Solid", value: "solid", pattern: "solid" },
  { name: "Dashed", value: "dashed", pattern: "dashed" },
  { name: "Dotted", value: "dotted", pattern: "dotted" },
]

// =====================================
// SLOPPINESS LEVELS
// =====================================

export const SLOPPINESS_LEVELS: SloppinessLevel[] = [
  { name: "Clean", value: 0, icon: "✨" },
  { name: "Sketchy", value: 1, icon: "✏️" },
  { name: "Rough", value: 2, icon: "🖌️" },
]

// =====================================
// EDGE STYLES
// =====================================

export const EDGE_STYLE_OPTIONS: EdgeStyle[] = [
  { name: "Square", value: "square", icon: Square },
  { name: "Rounded", value: "rounded", icon: Circle },
]

// ✅ NEW: Eraser mode options
import type { EraserMode, EraserModeOption } from "@/src/types/drawing-tools"

export const ERASER_MODE_OPTIONS: EraserModeOption[] = [
  {
    name: "Single",
    value: "single",
    icon: Square,
    description: "Click to erase individual items",
  },
  {
    name: "Stroke",
    value: "stroke",
    icon: Minus,
    description: "Drag to erase along path",
  },
  {
    name: "Area",
    value: "area",
    icon: Square,
    description: "Draw area to erase everything inside",
  },
]

// =====================================
// VALIDATION RULES
// =====================================

export const VALIDATION_RULES = {
  COLOR_PATTERN: /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|transparent)$/,
  STROKE_WIDTH: { min: 0.5, max: 20 },
  OPACITY: { min: 0, max: 100 },
  SLOPPINESS: { min: 0, max: 2 },
  FONT_SIZE: { min: 8, max: 72 },
  ERASER_SIZE: { min: 5, max: 100 }, // ✅ Added eraser validation
} as const

// =====================================
// CONTRAST RATIOS (WCAG Standards)
// =====================================

export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const

// =====================================
// STORAGE KEYS
// =====================================

export const STORAGE_KEYS = {
  TOOL_SETTINGS: "mindmap-drawing-tools-settings",
  PANEL_STATE: "mindmap-drawing-tools-panel",
  USER_PREFERENCES: "mindmap-drawing-tools-preferences",
} as const

// =====================================
// ANIMATION DURATIONS
// =====================================

export const ANIMATION_DURATIONS = {
  PANEL_TOGGLE: 300,
  TOOL_SWITCH: 150,
  COLOR_TRANSITION: 200,
  HOVER_EFFECT: 100,
  ERASER_FEEDBACK: 100, // ✅ Added eraser animation
} as const

// =====================================
// FONT OPTIONS
// =====================================

export const FONT_FAMILIES = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Comic Sans MS", value: "Comic Sans MS, cursive" },
  { name: "Impact", value: "Impact, fantasy" },
] as const

export const FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
] as const

// =====================================
// KEYBOARD SHORTCUTS
// =====================================

export const KEYBOARD_SHORTCUTS = {
  TOOLS: {
    rectangle: "2",
    diamond: "3",
    circle: "4",
    line: "5",
    text: "8",
    eraser: "0", // ✅ Added eraser shortcut
  },
  ACTIONS: {
    togglePanel: "Escape",
    undo: "Meta+Z",
    redo: "Meta+Shift+Z",
    delete: ["Backspace", "Delete"],
    selectAll: "Meta+A",
  },
} as const

// =====================================
// PRESET CONFIGURATIONS
// =====================================

export const TOOL_PRESETS = {
  // Node presets
  MODERN_NODE: {
    strokeColor: "#e5e7eb",
    fillColor: "#ffffff",
    strokeWidth: 1,
    strokeStyle: "solid" as const,
    edgeStyle: "rounded" as const,
    sloppiness: 0,
    opacity: 100,
  },

  BOLD_NODE: {
    strokeColor: "#1f2937",
    fillColor: "#3b82f6",
    strokeWidth: 3,
    strokeStyle: "solid" as const,
    edgeStyle: "square" as const,
    sloppiness: 0,
    opacity: 100,
  },

  SKETCH_NODE: {
    strokeColor: "#4b5563",
    fillColor: "#f9fafb",
    strokeWidth: 2,
    strokeStyle: "dashed" as const,
    edgeStyle: "rounded" as const,
    sloppiness: 1,
    opacity: 90,
  },

  // Line presets
  THIN_LINE: {
    strokeColor: "#6b7280",
    strokeWidth: 1,
    strokeStyle: "solid" as const,
    edgeStyle: "square" as const,
    sloppiness: 0,
    opacity: 100,
  },

  THICK_LINE: {
    strokeColor: "#1f2937",
    strokeWidth: 4,
    strokeStyle: "solid" as const,
    edgeStyle: "rounded" as const,
    sloppiness: 0,
    opacity: 100,
  },

  DASHED_LINE: {
    strokeColor: "#6b7280",
    strokeWidth: 2,
    strokeStyle: "dashed" as const,
    edgeStyle: "square" as const,
    sloppiness: 0,
    opacity: 80,
  },

  // Text presets
  HEADING_TEXT: {
    strokeColor: "#1f2937",
    fontSize: 24,
    fontFamily: "Arial, sans-serif",
    opacity: 100,
  },

  BODY_TEXT: {
    strokeColor: "#374151",
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    opacity: 100,
  },

  CAPTION_TEXT: {
    strokeColor: "#6b7280",
    fontSize: 12,
    fontFamily: "Arial, sans-serif",
    opacity: 80,
  },

  // ✅ NEW: Eraser presets
  PRECISE_ERASER: {
    eraserSize: 10,
    eraserMode: "single" as any,
    canDeleteNodes: true,
    canDeleteLines: true,
    canDeleteTexts: true,
    canDeleteEdges: false, // Keep connections
  },

  BROAD_ERASER: {
    eraserSize: 40,
    eraserMode: "stroke" as any,
    canDeleteNodes: true,
    canDeleteLines: true,
    canDeleteTexts: true,
    canDeleteEdges: true,
  },

  AREA_ERASER: {
    eraserSize: 20,
    eraserMode: "area" as any,
    canDeleteNodes: true,
    canDeleteLines: true,
    canDeleteTexts: true,
    canDeleteEdges: true,
  },
} as const

// =====================================
// PERFORMANCE SETTINGS
// =====================================

export const PERFORMANCE_SETTINGS = {
  DEBOUNCE_DELAY: 150,
  THROTTLE_DELAY: 16, // ~60fps
  MAX_HISTORY_SIZE: 50,
  BATCH_UPDATE_SIZE: 10,
  RENDER_BUFFER_SIZE: 100,
  ERASER_UPDATE_THROTTLE: 8, // ✅ Faster updates for eraser
} as const

// =====================================
// ERROR MESSAGES
// =====================================

export const ERROR_MESSAGES = {
  INVALID_COLOR:
    "Invalid color format. Please use hex colors (#000000) or 'transparent'.",
  INVALID_STROKE_WIDTH: `Stroke width must be between ${VALIDATION_RULES.STROKE_WIDTH.min} and ${VALIDATION_RULES.STROKE_WIDTH.max}.`,
  INVALID_OPACITY: `Opacity must be between ${VALIDATION_RULES.OPACITY.min} and ${VALIDATION_RULES.OPACITY.max}.`,
  INVALID_FONT_SIZE: `Font size must be between ${VALIDATION_RULES.FONT_SIZE.min} and ${VALIDATION_RULES.FONT_SIZE.max}.`,
  INVALID_ERASER_SIZE: `Eraser size must be between ${VALIDATION_RULES.ERASER_SIZE.min} and ${VALIDATION_RULES.ERASER_SIZE.max}.`, // ✅ Added
  TOOL_NOT_FOUND: "Tool not found in available tools list.",
  SETTING_UPDATE_FAILED: "Failed to update tool setting. Please try again.",
  STORAGE_NOT_AVAILABLE:
    "Local storage is not available. Settings will not be saved.",
  ERASER_OPERATION_FAILED:
    "Failed to complete eraser operation. Please try again.", // ✅ Added
} as const
