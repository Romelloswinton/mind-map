import React, { useEffect, useCallback, useState, useRef } from "react"
import { ChevronLeft, ChevronRight, X, GripVertical } from "lucide-react"

// Store imports
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"

// Utils imports
import {
  getToolInfo,
  toolSupportsBackground,
  toolSupportsEdges,
} from "@/app/utils/drawing-tools"

// Type imports
import type { DrawingToolsPanelProps } from "@/src/types/drawing-tools"
import {
  StrokeColorSection,
  BackgroundSection,
  StrokeWidthSection,
  StrokeStyleSection,
  SloppinessSection,
  EdgeStyleSection,
  OpacitySection,
  LayersSection,
} from "./sections"

// Save as: /app/components/drawing-tools/DrawingToolsPanel.tsx

export default function DrawingToolsPanel({
  activeTool,
  isVisible,
  onClose,
  onSettingsChange,
  initialSettings,
  className = "",
}: DrawingToolsPanelProps) {
  // Store state with proper selectors
  const {
    isCollapsed,
    toolSettings,
    toggleCollapsed,
    updateToolSetting,
    updateToolSettings,
  } = useDrawingToolsStore()

  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 }) // Will be calculated from right/top
  const panelRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Initialize settings if provided
  useEffect(() => {
    if (initialSettings) {
      Object.entries(initialSettings).forEach(([tool, settings]) => {
        updateToolSettings(tool as any, settings)
      })
    }
  }, [initialSettings, updateToolSettings])

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return

    const rect = panelRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)

    // Add cursor style to body
    document.body.style.cursor = "grabbing"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const panelRect = panelRef.current.getBoundingClientRect()

      // Constrain to viewport bounds
      const constrainedX = Math.max(
        0,
        Math.min(newX, viewportWidth - panelRect.width)
      )
      const constrainedY = Math.max(
        0,
        Math.min(newY, viewportHeight - panelRect.height)
      )

      setPosition({ x: constrainedX, y: constrainedY })
    },
    [isDragging, dragOffset]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Don't render if not visible or no active tool
  if (!isVisible || !activeTool) return null

  const toolInfo = getToolInfo(activeTool)
  const ToolIcon = toolInfo.icon
  const currentSettings = toolSettings[activeTool]

  // Calculate positioning styles
  const getPositionStyles = () => {
    if (position.x === 0 && position.y === 0) {
      // Default position (top-right)
      return {
        position: "fixed" as const,
        top: "6rem",
        right: "1.5rem",
        left: "auto",
        transform: "none",
      }
    } else {
      // Dragged position
      return {
        position: "fixed" as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: "auto",
        transform: "none",
      }
    }
  }

  // Callback handlers with store integration
  const handleStrokeColorChange = useCallback(
    (color: string) => {
      updateToolSetting(activeTool, "strokeColor", color)
      onSettingsChange?.(activeTool, { strokeColor: color })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleFillColorChange = useCallback(
    (color: string) => {
      updateToolSetting(activeTool, "fillColor", color)
      onSettingsChange?.(activeTool, { fillColor: color })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      updateToolSetting(activeTool, "strokeWidth", width)
      onSettingsChange?.(activeTool, { strokeWidth: width })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleStrokeStyleChange = useCallback(
    (style: "solid" | "dashed" | "dotted") => {
      updateToolSetting(activeTool, "strokeStyle", style)
      onSettingsChange?.(activeTool, { strokeStyle: style })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleSloppinessChange = useCallback(
    (level: number) => {
      updateToolSetting(activeTool, "sloppiness", level)
      onSettingsChange?.(activeTool, { sloppiness: level })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleEdgeStyleChange = useCallback(
    (style: "square" | "rounded") => {
      updateToolSetting(activeTool, "edgeStyle", style)
      onSettingsChange?.(activeTool, { edgeStyle: style })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      updateToolSetting(activeTool, "opacity", opacity)
      onSettingsChange?.(activeTool, { opacity })
    },
    [activeTool, updateToolSetting, onSettingsChange]
  )

  const handleLayerAction = useCallback(
    (action: "back" | "down" | "up" | "front") => {
      console.log(`🔄 Layer action: ${action} for ${activeTool}`)
      // Layer actions would be handled by the parent component
      // This is just a placeholder for the interface
    },
    [activeTool]
  )

  return (
    <div
      ref={panelRef}
      style={getPositionStyles()}
      className={`z-40 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80"
      } ${className} ${isDragging ? "select-none" : ""}`}
    >
      <div
        className={`bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden ${
          isDragging ? "shadow-3xl ring-2 ring-purple-400/30" : ""
        }`}
      >
        {/* Enhanced Header with Drag Handle */}
        <div
          ref={dragHandleRef}
          className={`flex items-center justify-between p-4 border-b border-gray-700/50 ${
            !isCollapsed ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          onMouseDown={!isCollapsed ? handleMouseDown : undefined}
        >
          <div className="flex items-center space-x-3">
            {/* Drag Handle Icon */}
            {!isCollapsed && (
              <div className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                <GripVertical className="w-4 h-4" />
              </div>
            )}

            <div className="p-2 bg-purple-600 rounded-lg">
              <ToolIcon className="w-4 h-4 text-white" />
            </div>

            {!isCollapsed && (
              <div>
                <h3 className="text-white font-medium">{toolInfo.name} Tool</h3>
                <p className="text-gray-400 text-xs">Customize appearance</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCollapsed}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
            {/* Drag Hint */}
            <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-2 mb-4">
              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <GripVertical className="w-3 h-3" />
                <span>Drag the header to move this panel</span>
              </div>
            </div>

            {/* Stroke Color */}
            <StrokeColorSection
              selectedColor={currentSettings.strokeColor}
              onColorChange={handleStrokeColorChange}
            />

            {/* Background Fill */}
            <BackgroundSection
              selectedColor={currentSettings.fillColor}
              onColorChange={handleFillColorChange}
              showSection={toolSupportsBackground(activeTool)}
            />

            {/* Stroke Width */}
            <StrokeWidthSection
              selectedWidth={currentSettings.strokeWidth}
              onWidthChange={handleStrokeWidthChange}
            />

            {/* Stroke Style */}
            <StrokeStyleSection
              selectedStyle={currentSettings.strokeStyle}
              onStyleChange={handleStrokeStyleChange}
            />

            {/* Sloppiness */}
            <SloppinessSection
              selectedLevel={currentSettings.sloppiness}
              onLevelChange={handleSloppinessChange}
            />

            {/* Edges */}
            <EdgeStyleSection
              selectedStyle={currentSettings.edgeStyle}
              onStyleChange={handleEdgeStyleChange}
              showSection={toolSupportsEdges(activeTool)}
            />

            {/* Opacity */}
            <OpacitySection
              opacity={currentSettings.opacity}
              onOpacityChange={handleOpacityChange}
            />

            {/* Layers */}
            <LayersSection onLayerAction={handleLayerAction} />
          </div>
        )}
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.6);
          border-radius: 2px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(139, 92, 246, 0.1);
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          border: none;
        }

        .slider::-moz-range-track {
          height: 8px;
          background: #374151;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
