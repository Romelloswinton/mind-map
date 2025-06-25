import React from "react"
import {
  Palette,
  Layers,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Constants imports
import {
  STROKE_COLORS,
  FILL_COLORS,
  STROKE_WIDTHS,
  STROKE_STYLES,
  SLOPPINESS_LEVELS,
  EDGE_STYLES,
} from "@/app/constants/drawing-tools"

// Types imports
import type {
  StrokeColorSectionProps,
  BackgroundSectionProps,
  StrokeWidthSectionProps,
  StrokeStyleSectionProps,
  SloppinessSectionProps,
  EdgeStyleSectionProps,
  OpacitySectionProps,
  LayersSectionProps,
} from "@/src/types/drawing-tools"

// Save as: /app/components/drawing-tools/sections.tsx

// Checker pattern component for transparent backgrounds
const CheckerPattern: React.FC = () => (
  <div
    className="absolute inset-0 opacity-30"
    style={{
      backgroundImage: `
        linear-gradient(45deg, #9ca3af 25%, transparent 25%), 
        linear-gradient(-45deg, #9ca3af 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #9ca3af 75%), 
        linear-gradient(-45deg, transparent 75%, #9ca3af 75%)
      `,
      backgroundSize: "8px 8px",
      backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
    }}
  />
)

// Stroke Color Section
export const StrokeColorSection: React.FC<StrokeColorSectionProps> = ({
  selectedColor,
  onColorChange,
}) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2">
      <Palette className="w-4 h-4 text-gray-400" />
      <label className="text-sm font-medium text-white">Stroke</label>
    </div>
    <div className="grid grid-cols-6 gap-2">
      {STROKE_COLORS.map((color) => (
        <button
          key={color.value}
          onClick={() => onColorChange(color.value)}
          className={`w-8 h-8 rounded-lg border-2 transition-all relative ${
            selectedColor === color.value
              ? "border-purple-500 ring-2 ring-purple-500/30 scale-110"
              : "border-gray-600 hover:border-gray-500"
          } ${color.bg}`}
          title={color.name}
        >
          {color.name === "White" && (
            <div className="absolute inset-0.5 border border-gray-300 rounded-md" />
          )}
        </button>
      ))}
    </div>
  </div>
)

// Background Fill Section
export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  selectedColor,
  onColorChange,
  showSection,
}) => {
  if (!showSection) return null

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">Background</label>
      <div className="grid grid-cols-5 gap-2">
        {FILL_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={`w-8 h-8 rounded-lg border-2 transition-all relative overflow-hidden ${
              selectedColor === color.value
                ? "border-purple-500 ring-2 ring-purple-500/30 scale-110"
                : "border-gray-600 hover:border-gray-500"
            } ${color.bg}`}
            title={color.name}
          >
            {color.pattern === "checker" && <CheckerPattern />}
          </button>
        ))}
      </div>
    </div>
  )
}

// Stroke Width Section
export const StrokeWidthSection: React.FC<StrokeWidthSectionProps> = ({
  selectedWidth,
  onWidthChange,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-white">Stroke Width</label>
    <div className="grid grid-cols-3 gap-2">
      {STROKE_WIDTHS.map((width) => (
        <button
          key={width.value}
          onClick={() => onWidthChange(width.value)}
          className={`p-3 rounded-lg border transition-all ${
            selectedWidth === width.value
              ? "border-purple-500 bg-purple-600/20"
              : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
          }`}
          title={width.name}
        >
          <div className={`w-full ${width.preview} bg-gray-300 rounded-full`} />
        </button>
      ))}
    </div>
  </div>
)

// Stroke Style Section
export const StrokeStyleSection: React.FC<StrokeStyleSectionProps> = ({
  selectedStyle,
  onStyleChange,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-white">Stroke Style</label>
    <div className="grid grid-cols-3 gap-2">
      {STROKE_STYLES.map((style) => (
        <button
          key={style.value}
          onClick={() => onStyleChange(style.value)}
          className={`p-3 rounded-lg border transition-all ${
            selectedStyle === style.value
              ? "border-purple-500 bg-purple-600/20"
              : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
          }`}
          title={style.name}
        >
          <div
            className={`w-full h-0.5 bg-gray-300 ${
              style.pattern === "dashed"
                ? "border-dashed border-t-2 border-gray-300 bg-transparent"
                : style.pattern === "dotted"
                ? "border-dotted border-t-2 border-gray-300 bg-transparent"
                : ""
            }`}
          />
        </button>
      ))}
    </div>
  </div>
)

// Sloppiness Section
export const SloppinessSection: React.FC<SloppinessSectionProps> = ({
  selectedLevel,
  onLevelChange,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-white">Sloppiness</label>
    <div className="grid grid-cols-3 gap-2">
      {SLOPPINESS_LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => onLevelChange(level.value)}
          className={`p-3 rounded-lg border transition-all text-center ${
            selectedLevel === level.value
              ? "border-purple-500 bg-purple-600/20"
              : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
          }`}
          title={level.name}
        >
          <div className="text-lg">{level.icon}</div>
          <div className="text-xs text-gray-400 mt-1">{level.name}</div>
        </button>
      ))}
    </div>
  </div>
)

// Edge Style Section
export const EdgeStyleSection: React.FC<EdgeStyleSectionProps> = ({
  selectedStyle,
  onStyleChange,
  showSection,
}) => {
  if (!showSection) return null

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">Edges</label>
      <div className="grid grid-cols-2 gap-2">
        {EDGE_STYLES.map((edge) => {
          const EdgeIcon = edge.icon
          return (
            <button
              key={edge.value}
              onClick={() => onStyleChange(edge.value)}
              className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                selectedStyle === edge.value
                  ? "border-purple-500 bg-purple-600/20"
                  : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
              }`}
              title={edge.name}
            >
              <EdgeIcon className="w-5 h-5 text-gray-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Opacity Section
export const OpacitySection: React.FC<OpacitySectionProps> = ({
  opacity,
  onOpacityChange,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-white">Opacity</label>
      <span className="text-xs text-gray-400">{opacity}%</span>
    </div>
    <div className="relative">
      <input
        type="range"
        min="0"
        max="100"
        value={opacity}
        onChange={(e) => onOpacityChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${opacity}%, #374151 ${opacity}%, #374151 100%)`,
        }}
      />
      <div
        className="absolute top-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 pointer-events-none"
        style={{ left: `calc(${opacity}% - 8px)` }}
      />
    </div>
  </div>
)

// Layers Section
export const LayersSection: React.FC<LayersSectionProps> = ({
  onLayerAction,
}) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2">
      <Layers className="w-4 h-4 text-gray-400" />
      <label className="text-sm font-medium text-white">Layers</label>
    </div>
    <div className="grid grid-cols-4 gap-2">
      <button
        onClick={() => onLayerAction("back")}
        className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 bg-gray-800/50 transition-all flex flex-col items-center gap-1"
        title="Move to back"
      >
        <SkipBack className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Back</span>
      </button>
      <button
        onClick={() => onLayerAction("down")}
        className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 bg-gray-800/50 transition-all flex flex-col items-center gap-1"
        title="Move down"
      >
        <ChevronLeft className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Down</span>
      </button>
      <button
        onClick={() => onLayerAction("up")}
        className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 bg-gray-800/50 transition-all flex flex-col items-center gap-1"
        title="Move up"
      >
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Up</span>
      </button>
      <button
        onClick={() => onLayerAction("front")}
        className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 bg-gray-800/50 transition-all flex flex-col items-center gap-1"
        title="Bring to front"
      >
        <SkipForward className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Front</span>
      </button>
    </div>
  </div>
)
