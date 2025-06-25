// Save as: ./constants/drawing-tools.ts

import {
  Square,
  Circle,
  Diamond,
  ArrowRight,
  PenTool,
  Type,
  Image,
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
// COLOR CONFIGURATIONS
// =====================================

// Color swatches for stroke
export const STROKE_COLORS: ColorSwatch[] = [
  { name: "Gray", value: "#6b7280", bg: "bg-gray-500" },
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Green", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "White", value: "#ffffff", bg: "bg-white" },
] as const

// Background fill colors
export const FILL_COLORS: ColorSwatch[] = [
  {
    name: "Transparent",
    value: "transparent",
    bg: "bg-transparent",
    pattern: "checker",
  },
  { name: "Red", value: "#fef2f2", bg: "bg-red-50" },
  { name: "Green", value: "#f0fdf4", bg: "bg-green-50" },
  { name: "Blue", value: "#eff6ff", bg: "bg-blue-50" },
  { name: "Mustard", value: "#fef3c7", bg: "bg-amber-100" },
] as const

// =====================================
// STROKE CONFIGURATIONS
// =====================================

// Stroke width options
export const STROKE_WIDTHS: StrokeWidthOption[] = [
  { name: "Thin", value: 1, preview: "h-0.5" },
  { name: "Medium", value: 2, preview: "h-1" },
  { name: "Thick", value: 4, preview: "h-1.5" },
] as const

// Stroke styles
export const STROKE_STYLES: StrokeStyleOption[] = [
  { name: "Solid", value: "solid", pattern: "solid" },
  { name: "Dashed", value: "dashed", pattern: "dashed" },
  { name: "Dotted", value: "dotted", pattern: "dotted" },
] as const

// =====================================
// STYLE CONFIGURATIONS
// =====================================

// Sloppiness levels
export const SLOPPINESS_LEVELS: SloppinessLevel[] = [
  { name: "Clean", value: 0, icon: "📐" },
  { name: "Sketchy", value: 1, icon: "✏️" },
  { name: "Rough", value: 2, icon: "🖊️" },
] as const

// Edge styles
export const EDGE_STYLES: EdgeStyle[] = [
  { name: "Square", value: "square", icon: Square },
  { name: "Rounded", value: "rounded", icon: Circle },
] as const

// =====================================
// TOOL CONFIGURATIONS
// =====================================

// Tool information mapping
export const TOOL_INFO: Record<DrawingToolType, ToolInfo> = {
  rectangle: { icon: Square, name: "Rectangle" },
  diamond: { icon: Diamond, name: "Diamond" },
  circle: { icon: Circle, name: "Circle" },
  arrow: { icon: ArrowRight, name: "Arrow" },
  pencil: { icon: PenTool, name: "Pencil" },
  text: { icon: Type, name: "Text" },
  image: { icon: Image, name: "Image" },
} as const

// Default settings for each tool type
export const DEFAULT_TOOL_SETTINGS: Record<
  DrawingToolType,
  DrawingToolSettings
> = {
  rectangle: {
    strokeColor: "#3b82f6",
    fillColor: "transparent",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
  },
  circle: {
    strokeColor: "#10b981",
    fillColor: "transparent",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded", // Always rounded for circles
    opacity: 100,
  },
  diamond: {
    strokeColor: "#f59e0b",
    fillColor: "transparent",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
  },
  arrow: {
    strokeColor: "#6b7280",
    fillColor: "transparent", // Not applicable
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square", // Not applicable
    opacity: 100,
  },
  pencil: {
    strokeColor: "#ef4444",
    fillColor: "transparent", // Not applicable
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 1, // Default to sketchy
    edgeStyle: "rounded",
    opacity: 100,
  },
  text: {
    strokeColor: "#1f2937",
    fillColor: "#ffffff",
    strokeWidth: 0, // No stroke for text
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
  },
  image: {
    strokeColor: "#6b7280",
    fillColor: "transparent",
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 100,
  },
} as const

// =====================================
// FEATURE SUPPORT CONFIGURATIONS
// =====================================

// Tools that should show background fill section
export const TOOLS_WITH_FILL: readonly DrawingToolType[] = [
  "rectangle",
  "diamond",
  "circle",
  "text",
  "image",
] as const

// Tools that should show edge style section
export const TOOLS_WITH_EDGES: readonly DrawingToolType[] = [
  "rectangle",
  "diamond",
  "text",
  "image",
] as const

// Tools that support different sloppiness levels
export const TOOLS_WITH_SLOPPINESS: readonly DrawingToolType[] = [
  "rectangle",
  "diamond",
  "circle",
  "arrow",
  "pencil",
] as const

// =====================================
// UI CONFIGURATIONS
// =====================================

// Panel animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  PANEL_TOGGLE: 300,
  SECTION_EXPAND: 200,
  BUTTON_HOVER: 150,
  COLOR_TRANSITION: 200,
  OPACITY_CHANGE: 100,
} as const

// Panel dimensions
export const PANEL_DIMENSIONS = {
  COLLAPSED_WIDTH: 48, // 12 * 4px (w-12)
  EXPANDED_WIDTH: 320, // 80 * 4px (w-80)
  MAX_HEIGHT: "calc(100vh - 200px)",
  HEADER_HEIGHT: 64,
  SECTION_SPACING: 24,
} as const

// Z-index layers
export const Z_INDEX = {
  PANEL: 40,
  HEADER: 41,
  TOOLTIP: 42,
  DROPDOWN: 43,
} as const

// =====================================
// KEYBOARD SHORTCUTS
// =====================================

// Keyboard shortcuts for tools
export const TOOL_SHORTCUTS: Record<DrawingToolType, string> = {
  rectangle: "2",
  diamond: "3",
  circle: "4",
  arrow: "5",
  pencil: "6",
  text: "8",
  image: "9",
} as const

// Panel control shortcuts
export const PANEL_SHORTCUTS = {
  TOGGLE_PANEL: "p",
  CLOSE_PANEL: "Escape",
  TOGGLE_COLLAPSE: "c",
  RESET_SETTINGS: "r",
} as const

// =====================================
// STORAGE CONFIGURATIONS
// =====================================

// LocalStorage keys
export const STORAGE_KEYS = {
  TOOL_SETTINGS: "drawing-tools-settings",
  PANEL_STATE: "drawing-tools-panel-state",
  USER_PREFERENCES: "drawing-tools-preferences",
} as const

// Settings validation rules
export const VALIDATION_RULES = {
  STROKE_WIDTH: { min: 0.5, max: 20 },
  OPACITY: { min: 0, max: 100 },
  SLOPPINESS: { min: 0, max: 2 },
  COLOR_PATTERN: /^(#[0-9A-Fa-f]{6}|transparent)$/,
} as const

// =====================================
// PERFORMANCE CONFIGURATIONS
// =====================================

// Debounce and throttle timings (in milliseconds)
export const PERFORMANCE_TIMINGS = {
  SETTINGS_SAVE_DEBOUNCE: 300,
  OPACITY_SLIDER_THROTTLE: 16, // ~60fps
  COLOR_PICKER_DEBOUNCE: 150,
  SEARCH_DEBOUNCE: 300,
} as const

// =====================================
// ACCESSIBILITY CONFIGURATIONS
// =====================================

// ARIA labels and descriptions
export const ACCESSIBILITY_LABELS = {
  PANEL_TITLE: "Drawing Tools Panel",
  PANEL_DESCRIPTION: "Customize appearance settings for drawing tools",
  STROKE_COLOR: "Select stroke color",
  FILL_COLOR: "Select fill color",
  STROKE_WIDTH: "Adjust stroke width",
  OPACITY_SLIDER: "Adjust opacity",
  CLOSE_PANEL: "Close drawing tools panel",
  COLLAPSE_PANEL: "Collapse panel",
  EXPAND_PANEL: "Expand panel",
} as const

// Color contrast ratios for accessibility
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const
