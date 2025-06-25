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
import type {
  DrawingToolType,
  DrawingToolSettings,
} from "@/src/types/drawing-tools"

// Component imports
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

// Updated interface to match modular structure
interface DrawingToolsPanelProps {
  activeTool?: DrawingToolType
  isVisible: boolean
  onClose?: () => void
  onSettingsChange?: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  initialSettings?: Partial<
    Record<DrawingToolType, Partial<DrawingToolSettings>>
  >
  className?: string
  toolContext?: {
    type: "node" | "connector" | "drawing"
    shape?: string
    selectedNodeId?: string
  }
  updateNodeData?: (nodeId: string, data: any) => void
}

export default function DrawingToolsPanel({
  activeTool,
  isVisible,
  onClose,
  onSettingsChange,
  initialSettings,
  className = "",
  toolContext,
  updateNodeData,
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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  // Initialize settings if provided
  useEffect(() => {
    if (initialSettings) {
      Object.entries(initialSettings).forEach(([tool, settings]) => {
        updateToolSettings(tool as DrawingToolType, settings)
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

  // Get contextual title based on tool context
  const getContextualTitle = () => {
    if (toolContext?.type === "node") {
      return `${toolContext.shape || "Node"} Customization`
    } else if (toolContext?.type === "connector") {
      return "Connector Styling"
    } else {
      return `${toolInfo.name} Tool`
    }
  }

  // Calculate positioning styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: isDragging ? 9999 : 40,
      transition: isDragging ? "none" : "all 0.2s ease",
    }

    if (position.x === 0 && position.y === 0) {
      // Default position (top-right, higher up for better toolbar clearance)
      return {
        ...baseStyles,
        top: "2rem", // Changed from 6rem to 2rem for higher positioning
        right: "1.5rem",
        left: "auto",
        transform: "none",
      }
    } else {
      // Dragged position
      return {
        ...baseStyles,
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: "auto",
        transform: "none",
      }
    }
  }

  // Enhanced callback handlers with node data integration
  const handleStrokeColorChange = useCallback(
    (color: string) => {
      updateToolSetting(activeTool, "strokeColor", color)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { strokeColor: color })
        console.log(
          `🎨 Applied stroke color ${color} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { strokeColor: color })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleFillColorChange = useCallback(
    (color: string) => {
      updateToolSetting(activeTool, "fillColor", color)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, {
          fillColor: color,
          color: color, // Update main color too
        })
        console.log(
          `🎨 Applied fill color ${color} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { fillColor: color })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      updateToolSetting(activeTool, "strokeWidth", width)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { strokeWidth: width })
        console.log(
          `🎨 Applied stroke width ${width} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { strokeWidth: width })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleStrokeStyleChange = useCallback(
    (style: "solid" | "dashed" | "dotted") => {
      updateToolSetting(activeTool, "strokeStyle", style)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { strokeStyle: style })
        console.log(
          `🎨 Applied stroke style ${style} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { strokeStyle: style })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleSloppinessChange = useCallback(
    (level: number) => {
      updateToolSetting(activeTool, "sloppiness", level)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { sloppiness: level })
        console.log(
          `🎨 Applied sloppiness ${level} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { sloppiness: level })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleEdgeStyleChange = useCallback(
    (style: "square" | "rounded") => {
      updateToolSetting(activeTool, "edgeStyle", style)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { edgeStyle: style })
        console.log(
          `🎨 Applied edge style ${style} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { edgeStyle: style })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      updateToolSetting(activeTool, "opacity", opacity)

      // Immediately apply to selected nodes
      if (toolContext?.selectedNodeId && updateNodeData) {
        updateNodeData(toolContext.selectedNodeId, { opacity: opacity })
        console.log(
          `🎨 Applied opacity ${opacity} to node ${toolContext.selectedNodeId}`
        )
      }

      onSettingsChange?.(activeTool, { opacity })
    },
    [
      activeTool,
      updateToolSetting,
      onSettingsChange,
      toolContext,
      updateNodeData,
    ]
  )

  const handleLayerAction = useCallback(
    (action: "back" | "down" | "up" | "front") => {
      console.log(`🔄 Layer action: ${action} for ${activeTool}`)
      // Apply layer actions based on context
      if (toolContext?.selectedNodeId) {
        console.log(`Applying ${action} to node ${toolContext.selectedNodeId}`)
      }
    },
    [activeTool, toolContext]
  )

  return (
    <div
      ref={panelRef}
      style={getPositionStyles()}
      className={`z-40 ${isDragging ? "" : "transition-all duration-300"} ${
        isCollapsed ? "w-16" : "w-80"
      } ${className} ${isDragging ? "select-none" : ""}`}
    >
      <div
        className={`bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden ${
          isDragging ? "shadow-3xl ring-2 ring-purple-400/30" : ""
        }`}
      >
        {/* Enhanced Header with Drag Handle - More Compact */}
        <div
          ref={dragHandleRef}
          className={`flex items-center justify-between p-3 border-b border-gray-700/50 ${
            !isCollapsed
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-pointer"
          }`}
          onMouseDown={!isCollapsed ? handleMouseDown : undefined}
          onClick={isCollapsed ? toggleCollapsed : undefined}
        >
          <div className="flex items-center space-x-2">
            {/* Drag Handle Icon - More Compact */}
            <div
              className={`p-0.5 text-gray-500 hover:text-gray-300 transition-colors ${
                isCollapsed ? "hidden" : ""
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            <div
              className={`p-1.5 bg-purple-600 rounded-lg ${
                isCollapsed ? "mx-auto" : ""
              }`}
            >
              <ToolIcon
                className={`text-white ${isCollapsed ? "w-4 h-4" : "w-3 h-3"}`}
              />
            </div>

            {!isCollapsed && (
              <div>
                <h3 className="text-white font-medium text-sm">
                  {getContextualTitle()}
                </h3>
                <p className="text-gray-400 text-xs">
                  {toolContext?.type === "node"
                    ? "Customize node appearance"
                    : toolContext?.type === "connector"
                    ? "Style connection lines"
                    : "Customize tool settings"}
                </p>
              </div>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex items-center space-x-1">
            {!isCollapsed && (
              <button
                onClick={toggleCollapsed}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                title="Collapse panel"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {!isCollapsed && onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                title="Close panel"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
            {/* Compact Drag Hint */}
            <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-2">
              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <GripVertical className="w-2.5 h-2.5" />
                <span>Drag the header to move this panel</span>
              </div>
            </div>

            {/* Context-specific styling options */}
            {toolContext?.type === "node" && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                <div className="flex items-center space-x-2 text-purple-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  <span>Styling {toolContext.shape} node</span>
                </div>
              </div>
            )}

            {toolContext?.type === "connector" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                <div className="flex items-center space-x-2 text-blue-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Styling connector lines</span>
                </div>
              </div>
            )}

            {/* Stroke Color - Always show for customization */}
            <StrokeColorSection
              selectedColor={currentSettings.strokeColor}
              onColorChange={handleStrokeColorChange}
            />

            {/* Background Fill - Show for nodes and supported tools */}
            <BackgroundSection
              selectedColor={currentSettings.fillColor}
              onColorChange={handleFillColorChange}
              showSection={
                toolContext?.type === "node" ||
                toolSupportsBackground(activeTool)
              }
            />

            {/* Stroke Width - Always show */}
            <StrokeWidthSection
              selectedWidth={currentSettings.strokeWidth}
              onWidthChange={handleStrokeWidthChange}
            />

            {/* Stroke Style - Always show */}
            <StrokeStyleSection
              selectedStyle={currentSettings.strokeStyle}
              onStyleChange={handleStrokeStyleChange}
            />

            {/* Sloppiness - Show for drawing tools */}
            <SloppinessSection
              selectedLevel={currentSettings.sloppiness}
              onLevelChange={handleSloppinessChange}
            />

            {/* Edges - Show for nodes and supported tools */}
            <EdgeStyleSection
              selectedStyle={currentSettings.edgeStyle}
              onStyleChange={handleEdgeStyleChange}
              showSection={
                toolContext?.type === "node" || toolSupportsEdges(activeTool)
              }
            />

            {/* Opacity - Always show */}
            <OpacitySection
              opacity={currentSettings.opacity}
              onOpacityChange={handleOpacityChange}
            />

            {/* Layers - Show for nodes */}
            {toolContext?.type === "node" && (
              <LayersSection onLayerAction={handleLayerAction} />
            )}
          </div>
        )}
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 3px;
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
      `}</style>
    </div>
  )
}
