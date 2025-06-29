// DrawingToolsSections Component
// File: app/mind-map/[id]/_components/drawing-tools-sections.tsx

import React, { useCallback } from "react"
import {
  Palette,
  Brush,
  Circle,
  Square,
  Triangle,
  Minus,
  Type,
  Layers,
  Zap,
  RotateCcw,
} from "lucide-react"

// ✅ Import from unified types
import type {
  DrawingToolType,
  DrawingToolSettings,
  ColorSwatch,
  StrokeWidthOption,
  StrokeStyleOption,
  SloppinessLevel,
  EdgeStyle,
} from "@/src/types/drawing-tools"

// ✅ Props interface
interface DrawingToolsSectionsProps {
  activeTool: DrawingToolType
  settings: DrawingToolSettings
  onSettingChange: (key: keyof DrawingToolSettings, value: any) => void
  activeSection: string
  targetType: "node" | "line" | "text" | "default"
  targetData?: any
}

// ✅ Color swatches for quick selection
const COLOR_SWATCHES: ColorSwatch[] = [
  { name: "Black", value: "#000000", bg: "bg-gray-900" },
  { name: "Dark Gray", value: "#374151", bg: "bg-gray-700" },
  { name: "Gray", value: "#6b7280", bg: "bg-gray-500" },
  { name: "Light Gray", value: "#d1d5db", bg: "bg-gray-300" },
  { name: "White", value: "#ffffff", bg: "bg-white", pattern: "checker" },
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "Yellow", value: "#eab308", bg: "bg-yellow-500" },
  { name: "Green", value: "#22c55e", bg: "bg-green-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
  { name: "Purple", value: "#a855f7", bg: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Cyan", value: "#06b6d4", bg: "bg-cyan-500" },
  { name: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
]

// ✅ Stroke width options
const STROKE_WIDTH_OPTIONS: StrokeWidthOption[] = [
  { name: "Thin", value: 1, preview: "h-0.5" },
  { name: "Normal", value: 2, preview: "h-0.5" },
  { name: "Medium", value: 3, preview: "h-1" },
  { name: "Thick", value: 4, preview: "h-1" },
  { name: "Heavy", value: 6, preview: "h-1.5" },
  { name: "Bold", value: 8, preview: "h-2" },
]

// ✅ Stroke style options
const STROKE_STYLE_OPTIONS: StrokeStyleOption[] = [
  { name: "Solid", value: "solid", pattern: "solid" },
  { name: "Dashed", value: "dashed", pattern: "dashed" },
  { name: "Dotted", value: "dotted", pattern: "dotted" },
]

// ✅ Sloppiness levels
const SLOPPINESS_LEVELS: SloppinessLevel[] = [
  { name: "Perfect", value: 0, icon: "⚪" },
  { name: "Slight", value: 1, icon: "🔘" },
  { name: "Loose", value: 2, icon: "⭕" },
  { name: "Rough", value: 3, icon: "🌀" },
  { name: "Sketchy", value: 4, icon: "💫" },
]

// ✅ Edge style options
const EDGE_STYLE_OPTIONS: EdgeStyle[] = [
  { name: "Square", value: "square", icon: Square },
  { name: "Rounded", value: "rounded", icon: Circle },
]

// ✅ Font family options
const FONT_FAMILIES = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Times", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Courier", value: "Courier New, monospace" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Comic Sans", value: "Comic Sans MS, cursive" },
]

// ✅ Individual section components
const ColorSection: React.FC<{
  title: string
  selectedColor: string
  onColorChange: (color: string) => void
  showCustomInput?: boolean
}> = ({ title, selectedColor, onColorChange, showCustomInput = true }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">{title}</label>
      </div>

      {/* Color swatches grid */}
      <div className="grid grid-cols-8 gap-1">
        {COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.value}
            onClick={() => onColorChange(swatch.value)}
            className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
              selectedColor === swatch.value
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300 hover:border-gray-400"
            } ${swatch.bg}`}
            title={swatch.name}
            style={{
              backgroundColor: swatch.value,
              backgroundImage:
                swatch.pattern === "checker"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                  : undefined,
              backgroundSize:
                swatch.pattern === "checker" ? "8px 8px" : undefined,
              backgroundPosition:
                swatch.pattern === "checker"
                  ? "0 0, 0 4px, 4px -4px, -4px 0px"
                  : undefined,
            }}
          />
        ))}
      </div>

      {/* Custom color input */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  )
}

const StrokeWidthSection: React.FC<{
  selectedWidth: number
  onWidthChange: (width: number) => void
}> = ({ selectedWidth, onWidthChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brush className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">
          Stroke Width
        </label>
      </div>

      {/* Width options */}
      <div className="grid grid-cols-3 gap-2">
        {STROKE_WIDTH_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onWidthChange(option.value)}
            className={`p-2 border rounded text-xs transition-colors ${
              selectedWidth === option.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="text-center">
              <div className={`w-full ${option.preview} bg-gray-600 mb-1`} />
              <span>{option.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Slider for precise control */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="20"
          value={selectedWidth}
          onChange={(e) => onWidthChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 w-8">
          {selectedWidth}
        </span>
      </div>
    </div>
  )
}

const StrokeStyleSection: React.FC<{
  selectedStyle: "solid" | "dashed" | "dotted"
  onStyleChange: (style: "solid" | "dashed" | "dotted") => void
}> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Minus className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">
          Stroke Style
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STROKE_STYLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onStyleChange(option.value)}
            className={`p-3 border rounded text-xs transition-colors ${
              selectedStyle === option.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="text-center">
              <div
                className="w-full h-0.5 bg-gray-600 mb-2"
                style={{
                  borderTop:
                    option.value === "solid"
                      ? "2px solid #374151"
                      : option.value === "dashed"
                      ? "2px dashed #374151"
                      : "2px dotted #374151",
                }}
              />
              <span>{option.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const SloppinessSection: React.FC<{
  selectedSloppiness: number
  onSloppinessChange: (sloppiness: number) => void
}> = ({ selectedSloppiness, onSloppinessChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Sloppiness</label>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {SLOPPINESS_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onSloppinessChange(level.value)}
            className={`p-2 border rounded text-xs transition-colors ${
              selectedSloppiness === level.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 hover:border-gray-400"
            }`}
            title={level.name}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{level.icon}</div>
              <span className="text-xs">{level.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="4"
          value={selectedSloppiness}
          onChange={(e) => onSloppinessChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 w-8">
          {selectedSloppiness}
        </span>
      </div>
    </div>
  )
}

const EdgeStyleSection: React.FC<{
  selectedEdgeStyle: "square" | "rounded"
  onEdgeStyleChange: (style: "square" | "rounded") => void
}> = ({ selectedEdgeStyle, onEdgeStyleChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Edge Style</label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {EDGE_STYLE_OPTIONS.map((option) => {
          const IconComponent = option.icon
          return (
            <button
              key={option.value}
              onClick={() => onEdgeStyleChange(option.value)}
              className={`p-3 border rounded text-xs transition-colors ${
                selectedEdgeStyle === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-center">
                <IconComponent className="w-6 h-6 mx-auto mb-1" />
                <span>{option.name}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const OpacitySection: React.FC<{
  opacity: number
  onOpacityChange: (opacity: number) => void
}> = ({ opacity, onOpacityChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Opacity</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 w-12">
          {Math.round(opacity * 100)}%
        </span>
      </div>

      {/* Visual preview */}
      <div className="flex gap-1">
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((value) => (
          <button
            key={value}
            onClick={() => onOpacityChange(value)}
            className={`flex-1 h-8 border rounded ${
              Math.abs(opacity - value) < 0.05
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300"
            }`}
            style={{
              backgroundColor: "#3b82f6",
              opacity: value,
            }}
            title={`${Math.round(value * 100)}%`}
          />
        ))}
      </div>
    </div>
  )
}

const FontSection: React.FC<{
  fontSize: number
  fontFamily: string
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
}> = ({ fontSize, fontFamily, onFontSizeChange, onFontFamilyChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Typography</label>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 w-8">
            {fontSize}
          </span>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ✅ Main component
export const DrawingToolsSections: React.FC<DrawingToolsSectionsProps> = ({
  activeTool,
  settings,
  onSettingChange,
  activeSection,
  targetType,
  targetData,
}) => {
  // ✅ Determine which sections to show based on tool and target
  const showStrokeColor = true
  const showFillColor =
    ["rectangle", "circle", "diamond", "text"].includes(activeTool) ||
    targetType === "node" ||
    targetType === "text"
  const showStrokeWidth =
    ["line", "rectangle", "circle", "diamond"].includes(activeTool) ||
    targetType === "line" ||
    targetType === "node"
  const showStrokeStyle = showStrokeWidth
  const showSloppiness =
    ["line", "rectangle", "circle", "diamond"].includes(activeTool) ||
    targetType === "line" ||
    targetType === "node"
  const showEdgeStyle = showStrokeWidth
  const showOpacity = true
  const showFont = activeTool === "text" || targetType === "text"

  // ✅ Section content based on activeSection
  const renderSectionContent = () => {
    switch (activeSection) {
      case "appearance":
        return (
          <div className="space-y-6">
            <ColorSection
              title="Stroke Color"
              selectedColor={settings.strokeColor}
              onColorChange={(color) => onSettingChange("strokeColor", color)}
            />

            {showFillColor && (
              <ColorSection
                title="Fill Color"
                selectedColor={settings.fillColor}
                onColorChange={(color) => onSettingChange("fillColor", color)}
              />
            )}

            {showFont && (
              <FontSection
                fontSize={settings.fontSize || 16}
                fontFamily={settings.fontFamily || "Arial, sans-serif"}
                onFontSizeChange={(size) => onSettingChange("fontSize", size)}
                onFontFamilyChange={(family) =>
                  onSettingChange("fontFamily", family)
                }
              />
            )}
          </div>
        )

      case "stroke":
        return (
          <div className="space-y-6">
            {showStrokeWidth && (
              <StrokeWidthSection
                selectedWidth={settings.strokeWidth}
                onWidthChange={(width) => onSettingChange("strokeWidth", width)}
              />
            )}

            {showStrokeStyle && (
              <StrokeStyleSection
                selectedStyle={settings.strokeStyle}
                onStyleChange={(style) => onSettingChange("strokeStyle", style)}
              />
            )}

            {showEdgeStyle && (
              <EdgeStyleSection
                selectedEdgeStyle={settings.edgeStyle}
                onEdgeStyleChange={(style) =>
                  onSettingChange("edgeStyle", style)
                }
              />
            )}
          </div>
        )

      case "fill":
        return (
          <div className="space-y-6">
            {showFillColor && (
              <ColorSection
                title="Fill Color"
                selectedColor={settings.fillColor}
                onColorChange={(color) => onSettingChange("fillColor", color)}
              />
            )}

            <OpacitySection
              opacity={settings.opacity}
              onOpacityChange={(opacity) => onSettingChange("opacity", opacity)}
            />
          </div>
        )

      case "effects":
        return (
          <div className="space-y-6">
            {showSloppiness && (
              <SloppinessSection
                selectedSloppiness={settings.sloppiness}
                onSloppinessChange={(sloppiness) =>
                  onSettingChange("sloppiness", sloppiness)
                }
              />
            )}

            <OpacitySection
              opacity={settings.opacity}
              onOpacityChange={(opacity) => onSettingChange("opacity", opacity)}
            />

            {/* Reset button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Reset to defaults
                  onSettingChange("strokeColor", "#6b7280")
                  onSettingChange("fillColor", "#3b82f6")
                  onSettingChange("strokeWidth", 2)
                  onSettingChange("strokeStyle", "solid")
                  onSettingChange("opacity", 1)
                  onSettingChange("sloppiness", 0)
                  onSettingChange("edgeStyle", "rounded")
                  if (showFont) {
                    onSettingChange("fontSize", 16)
                    onSettingChange("fontFamily", "Arial, sans-serif")
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm">Select a section to customize</div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Tool-specific notice */}
      {targetType !== "default" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-blue-800 text-sm">
            <div className="font-medium">
              Editing {targetType}: {activeTool}
            </div>
            <div className="text-blue-600 text-xs mt-1">
              Changes will apply to the selected {targetType}
            </div>
          </div>
        </div>
      )}

      {/* Section content */}
      {renderSectionContent()}
    </div>
  )
}

export default DrawingToolsSections
