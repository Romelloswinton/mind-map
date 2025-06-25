// Save as: ./utils/drawing-tools.ts

import {
  TOOLS_WITH_FILL,
  TOOLS_WITH_EDGES,
  TOOLS_WITH_SLOPPINESS,
  TOOL_INFO,
  VALIDATION_RULES,
  CONTRAST_RATIOS,
} from "@/app/constants/drawing-tools"
import {
  RGBColor,
  DrawingToolType,
  DrawingToolSettings,
  StrokeStyles,
  FillStyles,
  SloppinessStyles,
  KeyboardModifiers,
  KeyboardShortcutHandler,
} from "@/src/types/drawing-tools"

// =====================================
// TOOL CAPABILITY UTILITIES
// =====================================

/**
 * Check if a tool supports background fill
 */
export const toolSupportsBackground = (tool: DrawingToolType): boolean => {
  return TOOLS_WITH_FILL.includes(tool)
}

/**
 * Check if a tool supports edge styling
 */
export const toolSupportsEdges = (tool: DrawingToolType): boolean => {
  return TOOLS_WITH_EDGES.includes(tool)
}

/**
 * Check if a tool supports sloppiness settings
 */
export const toolSupportsSloppiness = (tool: DrawingToolType): boolean => {
  return TOOLS_WITH_SLOPPINESS.includes(tool)
}

/**
 * Get tool information (icon and name)
 */
export const getToolInfo = (tool: DrawingToolType) => {
  return TOOL_INFO[tool] || { icon: null, name: "Unknown Tool" }
}

// =====================================
// COLOR UTILITIES
// =====================================

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): RGBColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Apply opacity to a color
 */
export const applyOpacity = (color: string, opacity: number): string => {
  if (color === "transparent") return color

  const rgb = hexToRgb(color)
  if (!rgb) return color

  const alpha = Math.max(0, Math.min(1, opacity / 100))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Check if a color is light or dark (for contrast)
 */
export const isLightColor = (color: string): boolean => {
  if (color === "transparent") return true

  const rgb = hexToRgb(color)
  if (!rgb) return true

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

/**
 * Get contrast color (black or white) for a given background
 */
export const getContrastColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? "#000000" : "#ffffff"
}

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 1

  const luminance1 = getRelativeLuminance(rgb1)
  const luminance2 = getRelativeLuminance(rgb2)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate relative luminance for contrast calculations
 */
const getRelativeLuminance = (rgb: RGBColor): number => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// =====================================
// STYLE GENERATION UTILITIES
// =====================================

/**
 * Get CSS styles for stroke
 */
export const getStrokeStyles = (
  settings: DrawingToolSettings
): StrokeStyles => {
  const { strokeColor, strokeWidth, strokeStyle, opacity } = settings

  return {
    stroke: applyOpacity(strokeColor, opacity),
    strokeWidth: `${strokeWidth}px`,
    strokeDasharray:
      strokeStyle === "dashed"
        ? "5,5"
        : strokeStyle === "dotted"
        ? "2,2"
        : "none",
  }
}

/**
 * Get CSS styles for fill
 */
export const getFillStyles = (settings: DrawingToolSettings): FillStyles => {
  const { fillColor, opacity } = settings

  return {
    fill:
      fillColor === "transparent" ? "none" : applyOpacity(fillColor, opacity),
  }
}

/**
 * Get border radius based on edge style
 */
export const getBorderRadius = (
  edgeStyle: "square" | "rounded",
  size: number = 8
): string => {
  return edgeStyle === "rounded" ? `${size}px` : "0px"
}

/**
 * Get sloppiness effect CSS
 */
export const getSloppinessStyles = (sloppiness: number): SloppinessStyles => {
  const effects = {
    0: {
      // Clean
      filter: "none",
      transform: "none",
    },
    1: {
      // Sketchy
      filter: "url(#roughPaper)",
      transform: "rotate(0.5deg)",
    },
    2: {
      // Rough
      filter: "url(#roughPaper) url(#turbulence)",
      transform: "rotate(1deg) scale(1.01)",
    },
  }

  return effects[sloppiness as keyof typeof effects] || effects[0]
}

/**
 * Generate CSS class names based on tool settings
 */
export const generateToolClasses = (
  tool: DrawingToolType,
  settings: DrawingToolSettings
): string => {
  const classes: string[] = [`tool-${tool}`]

  // Add stroke style classes
  classes.push(`stroke-${settings.strokeStyle}`)
  classes.push(`stroke-width-${settings.strokeWidth}`)

  // Add edge style classes
  if (toolSupportsEdges(tool)) {
    classes.push(`edges-${settings.edgeStyle}`)
  }

  // Add sloppiness classes
  if (toolSupportsSloppiness(tool)) {
    classes.push(`sloppiness-${settings.sloppiness}`)
  }

  // Add opacity classes
  if (settings.opacity < 100) {
    classes.push("has-opacity")
  }

  return classes.join(" ")
}

/**
 * Convert settings to CSS custom properties
 */
export const settingsToCSSVars = (
  settings: DrawingToolSettings,
  prefix: string = "--tool"
): Record<string, string> => {
  return {
    [`${prefix}-stroke-color`]: settings.strokeColor,
    [`${prefix}-fill-color`]: settings.fillColor,
    [`${prefix}-stroke-width`]: `${settings.strokeWidth}px`,
    [`${prefix}-opacity`]: `${settings.opacity}%`,
    [`${prefix}-border-radius`]: getBorderRadius(settings.edgeStyle),
  }
}

// =====================================
// VALIDATION UTILITIES
// =====================================

/**
 * Validate tool settings
 */
export const validateToolSettings = (
  settings: Partial<DrawingToolSettings>
): boolean => {
  const validations = [
    // Stroke color should be a valid hex or transparent
    !settings.strokeColor ||
      VALIDATION_RULES.COLOR_PATTERN.test(settings.strokeColor),
    // Fill color should be a valid hex or transparent
    !settings.fillColor ||
      VALIDATION_RULES.COLOR_PATTERN.test(settings.fillColor),
    // Stroke width should be within valid range
    !settings.strokeWidth ||
      (typeof settings.strokeWidth === "number" &&
        settings.strokeWidth >= VALIDATION_RULES.STROKE_WIDTH.min &&
        settings.strokeWidth <= VALIDATION_RULES.STROKE_WIDTH.max),
    // Opacity should be between 0 and 100
    !settings.opacity ||
      (typeof settings.opacity === "number" &&
        settings.opacity >= VALIDATION_RULES.OPACITY.min &&
        settings.opacity <= VALIDATION_RULES.OPACITY.max),
    // Sloppiness should be within valid range
    !settings.sloppiness ||
      (Number.isInteger(settings.sloppiness) &&
        settings.sloppiness >= VALIDATION_RULES.SLOPPINESS.min &&
        settings.sloppiness <= VALIDATION_RULES.SLOPPINESS.max),
  ]

  return validations.every(Boolean)
}

/**
 * Sanitize and normalize tool settings
 */
export const normalizeToolSettings = (
  settings: Partial<DrawingToolSettings>
): Partial<DrawingToolSettings> => {
  const normalized: Partial<DrawingToolSettings> = {}

  if (settings.strokeColor) {
    normalized.strokeColor = settings.strokeColor.toLowerCase()
  }

  if (settings.fillColor) {
    normalized.fillColor = settings.fillColor.toLowerCase()
  }

  if (typeof settings.strokeWidth === "number") {
    normalized.strokeWidth = Math.max(
      VALIDATION_RULES.STROKE_WIDTH.min,
      Math.min(VALIDATION_RULES.STROKE_WIDTH.max, settings.strokeWidth)
    )
  }

  if (typeof settings.opacity === "number") {
    normalized.opacity = Math.max(
      VALIDATION_RULES.OPACITY.min,
      Math.min(VALIDATION_RULES.OPACITY.max, Math.round(settings.opacity))
    )
  }

  if (typeof settings.sloppiness === "number") {
    normalized.sloppiness = Math.max(
      VALIDATION_RULES.SLOPPINESS.min,
      Math.min(VALIDATION_RULES.SLOPPINESS.max, Math.round(settings.sloppiness))
    )
  }

  if (settings.strokeStyle) {
    normalized.strokeStyle = settings.strokeStyle
  }

  if (settings.edgeStyle) {
    normalized.edgeStyle = settings.edgeStyle
  }

  return normalized
}

// =====================================
// PERFORMANCE UTILITIES
// =====================================

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep merge two objects
 */
/**
 * Deep merge two objects
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        // Both are objects, merge recursively
        result[key] = deepMerge(
          targetValue as Record<string, any>,
          sourceValue as Record<string, any>
        ) as T[Extract<keyof T, string>]
      } else if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        (targetValue === undefined || targetValue === null)
      ) {
        // Source is object but target is undefined/null, merge with empty object
        result[key] = deepMerge(
          {} as Record<string, any>,
          sourceValue as Record<string, any>
        ) as T[Extract<keyof T, string>]
      } else {
        // Direct assignment for non-objects
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

/**
 * Create a unique ID for elements
 */
export const createId = (prefix: string = "tool"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): string => {
  return (start + (end - start) * factor).toString()
}

/**
 * Check if two objects are deeply equal
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 == null ||
    obj2 == null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

// =====================================
// KEYBOARD UTILITIES
// =====================================

/**
 * Keyboard shortcut helper
 */
export const createKeyboardShortcut = (
  key: string,
  callback: () => void,
  modifiers: KeyboardModifiers = {}
): KeyboardShortcutHandler => {
  return (event: KeyboardEvent) => {
    const matchesModifiers =
      (!modifiers.ctrl || event.ctrlKey) &&
      (!modifiers.shift || event.shiftKey) &&
      (!modifiers.alt || event.altKey)

    if (event.key.toLowerCase() === key.toLowerCase() && matchesModifiers) {
      event.preventDefault()
      callback()
    }
  }
}

/**
 * Check if event target is an input element
 */
export const isInputElement = (target: EventTarget | null): boolean => {
  if (!target) return false

  const element = target as HTMLElement
  const tagName = element.tagName.toLowerCase()

  return (
    ["input", "textarea", "select"].includes(tagName) ||
    element.contentEditable === "true"
  )
}

/**
 * Get modifier key string for display
 */
export const getModifierString = (modifiers: KeyboardModifiers): string => {
  const parts: string[] = []

  if (modifiers.ctrl) parts.push("Ctrl")
  if (modifiers.alt) parts.push("Alt")
  if (modifiers.shift) parts.push("Shift")

  return parts.join("+")
}

// =====================================
// ACCESSIBILITY UTILITIES
// =====================================

/**
 * Check if color combination meets WCAG contrast requirements
 */
export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean => {
  const ratio = getContrastRatio(foreground, background)

  const requirements = {
    AA: { normal: CONTRAST_RATIOS.AA_NORMAL, large: CONTRAST_RATIOS.AA_LARGE },
    AAA: {
      normal: CONTRAST_RATIOS.AAA_NORMAL,
      large: CONTRAST_RATIOS.AAA_LARGE,
    },
  }

  return ratio >= requirements[level][size]
}

/**
 * Generate accessible color alternative
 */
export const getAccessibleColor = (
  targetColor: string,
  backgroundColor: string,
  level: "AA" | "AAA" = "AA"
): string => {
  if (meetsContrastRequirement(targetColor, backgroundColor, level)) {
    return targetColor
  }

  // Return high contrast alternative
  return isLightColor(backgroundColor) ? "#000000" : "#ffffff"
}

/**
 * Create ARIA description for color
 */
export const getColorDescription = (color: string): string => {
  if (color === "transparent") return "Transparent"

  const colorNames: Record<string, string> = {
    "#000000": "Black",
    "#ffffff": "White",
    "#ff0000": "Red",
    "#00ff00": "Green",
    "#0000ff": "Blue",
    "#ffff00": "Yellow",
    "#ff00ff": "Magenta",
    "#00ffff": "Cyan",
    "#808080": "Gray",
  }

  return colorNames[color.toLowerCase()] || `Color ${color}`
}

// =====================================
// STORAGE UTILITIES
// =====================================

/**
 * Safe localStorage getter
 */
export const getStorageItem = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to get storage item ${key}:`, error)
    return defaultValue
  }
}

/**
 * Safe localStorage setter
 */
export const setStorageItem = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to set storage item ${key}:`, error)
    return false
  }
}

/**
 * Safe localStorage remover
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Failed to remove storage item ${key}:`, error)
    return false
  }
}

// =====================================
// CANVAS/SVG UTILITIES
// =====================================

/**
 * Create SVG filter for sloppiness effects
 */
export const createSloppinessFilter = (
  id: string,
  intensity: number
): string => {
  const turbulenceBaseFreq = 0.01 + intensity * 0.02
  const displacementScale = intensity * 2

  return `
      <filter id="${id}">
        <feTurbulence baseFrequency="${turbulenceBaseFreq}" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${displacementScale}"/>
      </filter>
    `
}

/**
 * Calculate path for different shapes
 */
export const getShapePath = (
  type: "rectangle" | "circle" | "diamond" | "triangle",
  width: number,
  height: number,
  x: number = 0,
  y: number = 0
): string => {
  switch (type) {
    case "rectangle":
      return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${
        y + height
      } L ${x} ${y + height} Z`

    case "circle":
      const radius = Math.min(width, height) / 2
      const cx = x + width / 2
      const cy = y + height / 2
      return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${
        cx + radius
      } ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`

    case "diamond":
      const centerX = x + width / 2
      const centerY = y + height / 2
      return `M ${centerX} ${y} L ${x + width} ${centerY} L ${centerX} ${
        y + height
      } L ${x} ${centerY} Z`

    case "triangle":
      return `M ${x + width / 2} ${y} L ${x + width} ${y + height} L ${x} ${
        y + height
      } Z`

    default:
      return ""
  }
}

/**
 * Convert degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI)
}

// =====================================
// FORMAT UTILITIES
// =====================================

/**
 * Format opacity value for display
 */
export const formatOpacity = (opacity: number): string => {
  return `${Math.round(opacity)}%`
}

/**
 * Format stroke width for display
 */
export const formatStrokeWidth = (width: number): string => {
  return width === 1 ? `${width} pixel` : `${width} pixels`
}

/**
 * Format color for display
 */
export const formatColor = (color: string): string => {
  if (color === "transparent") return "Transparent"
  return color.toUpperCase()
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
