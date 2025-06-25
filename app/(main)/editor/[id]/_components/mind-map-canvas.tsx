"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  OnConnect,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  Viewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import {
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  GripVertical,
} from "lucide-react"

import { MindMapNode } from "./mind-map-node"
import { cn } from "@/lib/utils"
import {
  ConnectionType,
  NodeShape,
  ReactFlowNode,
} from "@/src/stores/mind-map-store"

// Drawing tools imports
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"
import {
  getToolInfo,
  toolSupportsBackground,
  toolSupportsEdges,
} from "@/app/utils/drawing-tools"
import type {
  DrawingToolType,
  DrawingToolSettings,
} from "@/src/types/drawing-tools"

// Section components for drawing tools
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
import IntegratedFloatingToolbar, {
  ToolType,
} from "./integrated-floating-toolbar"

// Simple toast implementation
const toast = {
  success: (message: string) => console.log("✅", message),
  error: (message: string) => console.error("❌", message),
}

const nodeTypes = {
  mindMapNode: MindMapNode,
}

// Helper function to check if a tool is a drawing/customization tool
const isCustomizationTool = (tool: string): boolean => {
  return ["rectangle", "circle", "diamond", "text", "image", "eraser"].includes(
    tool
  )
}

// Map ToolType to DrawingToolType for the panel
const mapToolToDrawingTool = (tool: ToolType): DrawingToolType | null => {
  const toolMap: Record<string, DrawingToolType> = {
    rectangle: "pencil", // Use pencil tool for shape customization
    circle: "pencil",
    diamond: "pencil",
    text: "text",
    image: "image",
    eraser: "pencil", // Map eraser to pencil for drawing tools
  }
  return toolMap[tool] || null
}

interface MindMapCanvasProps {
  mindMapId: string
}

// Enhanced Drawing Tools Panel Component with Drag Functionality
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
    shape?: NodeShape
    selectedNodeId?: string
  }
  // 🎨 NEW: Add updateNodeData as a prop
  updateNodeData?: (
    nodeId: string,
    data: Partial<ReactFlowNode["data"]>
  ) => void
}

function DrawingToolsPanel({
  activeTool,
  isVisible,
  onClose,
  onSettingsChange,
  initialSettings,
  className = "",
  toolContext,
  updateNodeData, // 🎨 NEW: Receive updateNodeData as prop
}: DrawingToolsPanelProps) {
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
      // Default position (top-right, higher up)
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

  // Enhanced drawing tools section handlers that trigger node updates
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

function MindMapCanvasInner({ mindMapId }: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })

  // Extended state for floating toolbar integration
  const [selectedNodeShape, setSelectedNodeShape] =
    useState<NodeShape>("rectangle")
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(
    null
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>("select")
  const [isLocked, setIsLocked] = useState(false)
  const [panMode, setPanMode] = useState(false)

  // Enhanced Drawing tools state
  const [showDrawingTools, setShowDrawingTools] = useState(false)
  const [activeDrawingTool, setActiveDrawingTool] =
    useState<DrawingToolType | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [toolContext, setToolContext] = useState<
    | {
        type: "node" | "connector" | "drawing"
        shape?: NodeShape
        selectedNodeId?: string
      }
    | undefined
  >(undefined)

  // Simple history for undo/redo
  const [history, setHistory] = useState<
    Array<{ nodes: ReactFlowNode[]; edges: Edge[] }>
  >([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const {
    screenToFlowPosition,
    zoomIn,
    zoomOut,
    fitView,
    getViewport,
    setViewport: setReactFlowViewport,
  } = useReactFlow()

  // Auto-save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Enhanced tool change handler with drawing tools integration
  const handleToolChange = useCallback(
    (tool: ToolType) => {
      setActiveTool(tool)

      // Check if this is a customization tool (tools 2-4, 7-0)
      const isCustomTool = [
        "rectangle",
        "circle",
        "diamond",
        "text",
        "image",
        "eraser",
      ].includes(tool)

      if (isCustomTool) {
        const mappedTool = mapToolToDrawingTool(tool)
        if (mappedTool) {
          setActiveDrawingTool(mappedTool)
          setShowDrawingTools(true)

          // Set appropriate context
          if (["rectangle", "circle", "diamond"].includes(tool)) {
            setToolContext({
              type: "node",
              shape: tool as NodeShape,
              selectedNodeId: selectedNodes[0] || undefined,
            })
          } else {
            setToolContext({
              type: "drawing",
            })
          }
        }
      } else {
        // For non-customization tools, hide the panel
        setShowDrawingTools(false)
        setActiveDrawingTool(null)
        setToolContext(undefined)
      }

      // Handle specific tool behaviors
      switch (tool) {
        case "hand":
          setPanMode(true)
          setIsConnecting(false)
          break
        case "select":
          setPanMode(false)
          setIsConnecting(false)
          break
        case "rectangle":
        case "circle":
        case "diamond":
          setSelectedNodeShape(tool as NodeShape)
          setPanMode(false)
          setIsConnecting(false)
          break
        default:
          setPanMode(false)
          setIsConnecting(false)
          break
      }

      console.log(
        `🔧 Tool changed to: ${tool}${
          isCustomTool ? " (customization panel opened)" : ""
        }`
      )
    },
    [selectedNodes]
  )

  const handleShapeChange = useCallback(
    (shape: NodeShape) => {
      setSelectedNodeShape(shape)

      // If drawing tools are open and we're in node mode, update the context
      if (showDrawingTools && toolContext?.type === "node") {
        setToolContext((prev) => (prev ? { ...prev, shape } : undefined))
      }

      console.log(`🔷 Shape changed to: ${shape}`)
    },
    [showDrawingTools, toolContext]
  )

  // Simplified approach - use useEffect to update tool context when selection changes
  useEffect(() => {
    if (
      showDrawingTools &&
      toolContext?.type === "node" &&
      selectedNodes.length > 0
    ) {
      const selectedNodeId = selectedNodes[0]
      const selectedNode = nodes.find((n) => n.id === selectedNodeId)

      if (selectedNode && toolContext.selectedNodeId !== selectedNodeId) {
        setToolContext((prev) =>
          prev
            ? {
                ...prev,
                selectedNodeId: selectedNodeId,
                shape: selectedNode.data.shape || "rectangle",
              }
            : undefined
        )

        console.log(
          `🎯 Updated tool context via useEffect: selectedNodeId = ${selectedNodeId}`
        )
      }
    } else if (
      showDrawingTools &&
      toolContext?.type === "node" &&
      selectedNodes.length === 0
    ) {
      // Clear selected node if no nodes are selected
      if (toolContext.selectedNodeId) {
        setToolContext((prev) =>
          prev ? { ...prev, selectedNodeId: undefined } : undefined
        )
        console.log(`🔍 Cleared selectedNodeId via useEffect`)
      }
    }
  }, [
    selectedNodes,
    showDrawingTools,
    toolContext?.type,
    toolContext?.selectedNodeId,
    nodes,
  ])

  // Simplified node selection handler
  const handleNodeSelectionChange = useCallback(
    (params: { nodes: ReactFlowNode[]; edges: Edge[] }) => {
      const nodeIds = params.nodes.map((node) => node.id)
      setSelectedNodes(nodeIds)
      console.log(`🔍 Selection changed - Node IDs: [${nodeIds.join(", ")}]`)
    },
    []
  )

  const handleToggleLock = useCallback(() => {
    setIsLocked(!isLocked)
    console.log(`🔒 Canvas ${!isLocked ? "locked" : "unlocked"}`)
  }, [isLocked])

  const handleShare = useCallback(() => {
    console.log("📤 Share button clicked")
    toast.success("Share functionality triggered!")
  }, [])

  const handleLibrary = useCallback(() => {
    console.log("📚 Library button clicked")
    toast.success("Library functionality triggered!")
  }, [])

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<ReactFlowNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      )
      hasUnsavedChanges.current = true
    },
    [setNodes]
  )

  // Drawing tools handlers - Enhanced with node styling
  const handleDrawingToolSettings = useCallback(
    (tool: DrawingToolType, settings: Partial<DrawingToolSettings>) => {
      console.log(`🎨 Drawing tool settings changed for ${tool}:`, settings)

      // Helper function to apply settings to a node
      const applyToNode = (nodeId: string) => {
        const nodeData: Partial<ReactFlowNode["data"]> = {}

        // Map drawing tool settings to node data
        if (settings.strokeColor) {
          nodeData.strokeColor = settings.strokeColor
        }

        if (settings.fillColor) {
          nodeData.fillColor = settings.fillColor
          nodeData.color = settings.fillColor // Update main color too
        }

        if (settings.strokeWidth) {
          nodeData.strokeWidth = settings.strokeWidth
        }

        if (settings.strokeStyle) {
          nodeData.strokeStyle = settings.strokeStyle
        }

        if (settings.opacity) {
          nodeData.opacity = settings.opacity
        }

        if (settings.sloppiness) {
          nodeData.sloppiness = settings.sloppiness
        }

        if (settings.edgeStyle) {
          nodeData.edgeStyle = settings.edgeStyle
        }

        // Update the node
        updateNodeData(nodeId, nodeData)

        console.log(`🎨 Applied ${tool} settings to node ${nodeId}:`, nodeData)
      }

      // Apply settings based on context
      if (toolContext?.type === "node" && toolContext.selectedNodeId) {
        // Apply to specifically selected node
        applyToNode(toolContext.selectedNodeId)
      } else if (toolContext?.type === "node" && selectedNodes.length > 0) {
        // Apply to all selected nodes
        selectedNodes.forEach((nodeId) => {
          applyToNode(nodeId)
        })
      } else if (toolContext?.type === "connector") {
        // Apply to connector styling
        console.log("Applying connector styles:", settings)
        // TODO: Apply to selected edges in future
      } else {
        // Store as defaults for new nodes
        console.log(
          `Setting default styling for future ${
            toolContext?.shape || "nodes"
          }:`,
          settings
        )
      }
    },
    [toolContext, selectedNodes, updateNodeData]
  )

  const handleCloseDrawingTools = useCallback(() => {
    setShowDrawingTools(false)
    setActiveDrawingTool(null)
    setToolContext(undefined)
    setActiveTool("select")
  }, [])

  // Update viewport when React Flow viewport changes
  const onViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport)
  }, [])

  // Simple history management
  const pushToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: [...nodes], edges: [...edges] })

    if (newHistory.length > 20) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
      setHistoryIndex(historyIndex - 1)
      hasUnsavedChanges.current = true
    }
  }, [history, historyIndex, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
      hasUnsavedChanges.current = true
    }
  }, [history, historyIndex, setNodes, setEdges])

  // Enhanced edge creation with different styles
  const createEdgeWithStyle = useCallback(
    (connection: Connection, type: ConnectionType = "curved"): Edge => {
      const baseEdge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      }

      switch (type) {
        case "straight":
          return { ...baseEdge, type: "straight" }
        case "step":
          return { ...baseEdge, type: "step" }
        case "bezier":
          return { ...baseEdge, type: "default" }
        case "curved":
        default:
          return { ...baseEdge, type: "smoothstep" }
      }
    },
    []
  )

  // Load mind map data
  useEffect(() => {
    const loadMindMap = async () => {
      try {
        setIsLoading(true)

        if (mindMapId === "new") {
          const initialNode: ReactFlowNode = {
            id: "root",
            type: "mindMapNode",
            position: { x: 400, y: 300 },
            style: { width: 200, height: 120 },
            data: {
              text: "Main Idea",
              color: "#3b82f6",
              isEditing: false,
              shape: "rectangle" as NodeShape,
            },
            resizing: false,
            selected: false,
            dragging: false,
          }
          setNodes([initialNode])
          setHistory([{ nodes: [initialNode], edges: [] }])
          setHistoryIndex(0)
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/mindmaps/${mindMapId}`)
        if (!response.ok) throw new Error("Failed to load mind map")

        const data = await response.json()

        const flowNodes: ReactFlowNode[] =
          data.nodes?.map(
            (node: any): ReactFlowNode => ({
              id: node.id,
              type: "mindMapNode",
              position: { x: node.x, y: node.y },
              style: {
                width: node.width || 200,
                height: node.height || 120,
              },
              data: {
                text: node.text,
                color: node.color || "#3b82f6",
                isEditing: false,
                shape: (node.shape as NodeShape) || "rectangle",
                // Load any drawing tool properties from database
                ...(node.strokeColor && { strokeColor: node.strokeColor }),
                ...(node.fillColor && { fillColor: node.fillColor }),
                ...(node.strokeWidth && { strokeWidth: node.strokeWidth }),
                ...(node.strokeStyle && { strokeStyle: node.strokeStyle }),
                ...(node.opacity !== undefined && { opacity: node.opacity }),
                ...(node.sloppiness && { sloppiness: node.sloppiness }),
                ...(node.edgeStyle && { edgeStyle: node.edgeStyle }),
              },
              resizing: false,
              selected: false,
              dragging: false,
            })
          ) || []

        const flowEdges: Edge[] =
          data.nodes
            ?.filter((node: any) => node.parentId)
            .map(
              (node: any): Edge => ({
                id: `e${node.parentId}-${node.id}`,
                source: node.parentId,
                target: node.id,
                type: "smoothstep",
                style: { stroke: "#94a3b8", strokeWidth: 2 },
              })
            ) || []

        setNodes(flowNodes)
        setEdges(flowEdges)
        setLastSaved(new Date(data.updatedAt))
        setHistory([{ nodes: flowNodes, edges: flowEdges }])
        setHistoryIndex(0)
      } catch (error) {
        console.error("Error loading mind map:", error)
        toast.error("Failed to load mind map")
      } finally {
        setIsLoading(false)
      }
    }

    loadMindMap()
  }, [mindMapId, setNodes, setEdges])

  // Auto-save functionality
  const saveMindMap = useCallback(async () => {
    if (!hasUnsavedChanges.current || isSaving || mindMapId === "new") return

    try {
      setIsSaving(true)

      const dbNodes = nodes.map((node) => ({
        id: node.id,
        text: node.data.text,
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width || node.style?.width || 200,
        height: node.measured?.height || node.style?.height || 120,
        color: node.data.color,
        shape: node.data.shape || "rectangle",
        parentId:
          edges.find((edge: Edge) => edge.target === node.id)?.source || null,
        // Save drawing tool properties
        ...(node.data.strokeColor && { strokeColor: node.data.strokeColor }),
        ...(node.data.fillColor && { fillColor: node.data.fillColor }),
        ...(node.data.strokeWidth && { strokeWidth: node.data.strokeWidth }),
        ...(node.data.strokeStyle && { strokeStyle: node.data.strokeStyle }),
        ...(node.data.opacity !== undefined && { opacity: node.data.opacity }),
        ...(node.data.sloppiness && { sloppiness: node.data.sloppiness }),
        ...(node.data.edgeStyle && { edgeStyle: node.data.edgeStyle }),
      }))

      const response = await fetch(`/api/mindmaps/${mindMapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: dbNodes }),
      })

      if (!response.ok) throw new Error("Failed to save mind map")

      hasUnsavedChanges.current = false
      setLastSaved(new Date())
      toast.success("Mind map saved!")
    } catch (error) {
      console.error("Error saving mind map:", error)
      toast.error("Failed to save mind map")
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges, mindMapId, isSaving])

  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges.current) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => saveMindMap(), 3000)
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [nodes, edges, saveMindMap])

  // Handle nodes change with NaN protection and dimension tracking
  const handleNodesChange = useCallback(
    (changes: NodeChange<ReactFlowNode>[]) => {
      console.log("Node changes detected:", changes)

      hasUnsavedChanges.current = true

      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds)

        const validatedNodes = updatedNodes.map((node) => {
          const x = isNaN(node.position.x) ? 0 : node.position.x
          const y = isNaN(node.position.y) ? 0 : node.position.y

          if (isNaN(node.position.x) || isNaN(node.position.y)) {
            console.warn(
              `🚨 Fixed NaN position for node ${node.id}:`,
              `${node.position.x} -> ${x}, ${node.position.y} -> ${y}`
            )
          }

          return { ...node, position: { x, y } }
        })

        return validatedNodes
      })

      onNodesChange(changes)
    },
    [setNodes, onNodesChange]
  )

  // Node event handlers - Fixed to prevent infinite loops
  const onNodeDrag = useCallback((event: any, node: ReactFlowNode) => {
    console.log("🔄 Node dragging:", node.id, node.position)
  }, [])

  const onNodeDragStop = useCallback((event: any, node: ReactFlowNode) => {
    console.log(
      "🛑 Node drag stopped:",
      node.id,
      "Final position:",
      node.position
    )
    hasUnsavedChanges.current = true
  }, [])

  const onNodeClick = useCallback((event: any, node: ReactFlowNode) => {
    console.log("👆 Node clicked:", node.id, "Selected:", node.selected)
    // Remove state updates from here to prevent infinite loops
    // Selection will be handled by onSelectionChange
  }, [])

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      hasUnsavedChanges.current = true
      setEdges((eds) => applyEdgeChanges(changes, eds))
      onEdgesChange(changes)
    },
    [setEdges, onEdgesChange]
  )

  // Enhanced onConnect handler
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      hasUnsavedChanges.current = true
      pushToHistory()

      const edge = createEdgeWithStyle(connection, connectionMode || "curved")
      setEdges((eds) => addEdge(edge, eds))

      if (connectionMode) {
        console.log(`✅ Connected nodes with ${connectionMode} style`)
      }
    },
    [setEdges, pushToHistory, connectionMode, createEdgeWithStyle]
  )

  // Add new node - Enhanced with drawing tool defaults
  const addNode = useCallback(
    (
      position?: { x: number; y: number },
      shape: NodeShape = selectedNodeShape
    ) => {
      const defaultPosition = {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150,
      }

      const newNodePosition = position
        ? {
            x: isNaN(position.x) ? defaultPosition.x : position.x,
            y: isNaN(position.y) ? defaultPosition.y : position.y,
          }
        : defaultPosition

      pushToHistory()

      // Get current drawing tool settings to apply as defaults
      const currentTool = activeDrawingTool
      const { toolSettings } = useDrawingToolsStore.getState()
      const defaultSettings = currentTool ? toolSettings[currentTool] : null

      const newNode: ReactFlowNode = {
        id: `node-${Date.now()}`,
        type: "mindMapNode",
        position: newNodePosition,
        style: { width: 200, height: 120 },
        data: {
          text: "New Idea",
          color: defaultSettings?.fillColor || "#3b82f6",
          isEditing: true,
          shape: shape,
          // Apply current drawing tool settings as defaults for new nodes
          ...(defaultSettings?.strokeColor && {
            strokeColor: defaultSettings.strokeColor,
          }),
          ...(defaultSettings?.fillColor && {
            fillColor: defaultSettings.fillColor,
          }),
          ...(defaultSettings?.strokeWidth && {
            strokeWidth: defaultSettings.strokeWidth,
          }),
          ...(defaultSettings?.strokeStyle && {
            strokeStyle: defaultSettings.strokeStyle,
          }),
          ...(defaultSettings?.opacity && { opacity: defaultSettings.opacity }),
          ...(defaultSettings?.sloppiness && {
            sloppiness: defaultSettings.sloppiness,
          }),
          ...(defaultSettings?.edgeStyle && {
            edgeStyle: defaultSettings.edgeStyle,
          }),
        },
        resizing: false,
        selected: false,
        dragging: false,
      }

      setNodes((nds) => [...nds, newNode])
      setSelectedNodeShape(shape)
      hasUnsavedChanges.current = true

      console.log(`🎨 Created node with drawing tool defaults:`, newNode.data)
    },
    [setNodes, pushToHistory, selectedNodeShape, activeDrawingTool]
  )

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      pushToHistory()
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      )
      hasUnsavedChanges.current = true
    },
    [setNodes, setEdges, pushToHistory]
  )

  // Handle canvas double-click
  const onCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowWrapper.current || isLocked) return

      const rect = reactFlowWrapper.current.getBoundingClientRect()
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })

      addNode(position)
    },
    [addNode, screenToFlowPosition, isLocked]
  )

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Node shortcuts
      if (event.key === " " && !event.repeat) {
        event.preventDefault()
        addNode()
      }

      if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        saveMindMap()
      }

      // Tool shortcuts - now with drawing tools integration
      if (event.key === "1" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToggleLock()
      } else if (event.key === "2" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("rectangle")
      } else if (event.key === "3" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("diamond")
      } else if (event.key === "4" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("circle")
      } else if (event.key === "5" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 5 reserved for future tool
      } else if (event.key === "6" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 6 reserved for future tool
      } else if (event.key === "7" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 7 reserved for future tool
      } else if (event.key === "8" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("text")
      } else if (event.key === "9" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("image")
      } else if (event.key === "0" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("eraser")
      }

      // Tool mode shortcuts
      if (event.key === "h" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("hand")
      } else if (event.key === "v" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("select")
      }

      // History shortcuts
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey
      ) {
        event.preventDefault()
        handleUndo()
      } else if (
        (event.key === "y" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "z" &&
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey)
      ) {
        event.preventDefault()
        handleRedo()
      }

      // Escape to close drawing tools panel
      if (event.key === "Escape" && showDrawingTools) {
        event.preventDefault()
        handleCloseDrawingTools()
      }
    }

    // Handle custom events from nodes
    const handleNodeUpdate = (event: CustomEvent) => {
      const { nodeId, data } = event.detail
      updateNodeData(nodeId, data)
    }

    const handleNodeDelete = (event: CustomEvent) => {
      const { nodeId } = event.detail
      deleteNode(nodeId)
    }

    const handleNodeAddChild = (event: CustomEvent) => {
      const { parentId, position } = event.detail
      addNode(position)
    }

    window.addEventListener("keydown", handleKeyPress)
    window.addEventListener("nodeUpdate", handleNodeUpdate as EventListener)
    window.addEventListener("nodeDelete", handleNodeDelete as EventListener)
    window.addEventListener("nodeAddChild", handleNodeAddChild as EventListener)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      window.removeEventListener(
        "nodeUpdate",
        handleNodeUpdate as EventListener
      )
      window.removeEventListener(
        "nodeDelete",
        handleNodeDelete as EventListener
      )
      window.removeEventListener(
        "nodeAddChild",
        handleNodeAddChild as EventListener
      )
    }
  }, [
    addNode,
    saveMindMap,
    updateNodeData,
    deleteNode,
    handleUndo,
    handleRedo,
    handleToolChange,
    handleToggleLock,
    showDrawingTools,
    handleCloseDrawingTools,
  ])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your mind map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      <div
        className={cn(
          "h-full relative",
          isConnecting && "connecting-mode",
          panMode && "cursor-grab",
          isLocked && "pointer-events-none"
        )}
        ref={reactFlowWrapper}
      >
        {/* Compact Floating Toolbar */}
        <IntegratedFloatingToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onToggleLock={handleToggleLock}
          isLocked={isLocked}
        />

        {/* Enhanced Drawing Tools Panel with Compact Design - Shows for tools 2-0 */}
        {showDrawingTools && activeDrawingTool && (
          <DrawingToolsPanel
            activeTool={activeDrawingTool}
            isVisible={showDrawingTools}
            onClose={handleCloseDrawingTools}
            onSettingsChange={handleDrawingToolSettings}
            toolContext={toolContext}
            updateNodeData={updateNodeData} // 🎨 Pass updateNodeData function
            className="mt-16" // Add margin to avoid overlap with floating toolbar
          />
        )}

        {/* Compact Debug Panel for Development */}
        {process.env.NODE_ENV === "development" && showDrawingTools && (
          <div className="fixed bottom-20 left-4 bg-black/80 text-white p-2 rounded-lg text-xs font-mono z-50 max-w-xs">
            <div className="text-green-400 mb-1">🔧 Debug:</div>
            <div>
              Tool: <span className="text-blue-300">{activeDrawingTool}</span>
            </div>
            <div>
              Context:{" "}
              <span className="text-blue-300">{toolContext?.type}</span>
            </div>
            <div>
              Node:{" "}
              <span className="text-yellow-300">
                {toolContext?.selectedNodeId || "None"}
              </span>
            </div>
            <div>
              Selected:{" "}
              <span className="text-yellow-300">
                [{selectedNodes.join(", ") || "None"}]
              </span>
            </div>
            <div className="mt-1 text-gray-400 text-xs">
              💡 Select tool (2-4) → click node
            </div>
          </div>
        )}

        <ReactFlow<ReactFlowNode, Edge>
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onDoubleClick={onCanvasDoubleClick}
          onViewportChange={onViewportChange}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onSelectionChange={handleNodeSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-white"
          nodesDraggable={!isLocked && activeTool !== "hand"}
          nodesConnectable={!isLocked && isConnecting}
          elementsSelectable={
            !isLocked && (activeTool === "select" || showDrawingTools)
          }
          nodesFocusable={!isLocked}
          edgesFocusable={!isLocked}
          panOnScroll={true}
          zoomOnScroll={!isLocked}
          zoomOnPinch={!isLocked}
          selectNodesOnDrag={false}
          panOnDrag={panMode || activeTool === "hand"}
          selectionOnDrag={activeTool === "select" && !isLocked}
          multiSelectionKeyCode={["Meta", "Shift"]}
          deleteKeyCode={!isLocked ? ["Backspace", "Delete"] : []}
          snapToGrid={false}
          snapGrid={[15, 15]}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls
            className="bg-white shadow-lg border border-gray-200"
            showInteractive={false}
          />
          <MiniMap
            className="bg-white border border-gray-200"
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-red-400/50 z-30">
            <span className="text-sm font-medium">🔒 Canvas Locked</span>
          </div>
        )}

        {/* Enhanced Drawing Tool Indicator - More Compact */}
        {showDrawingTools && activeDrawingTool && toolContext && (
          <div className="absolute top-20 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
            <span className="text-sm font-medium">
              🎨{" "}
              {toolContext.type === "node"
                ? `${toolContext.shape} Customization`
                : toolContext.type === "connector"
                ? "Connector Styling"
                : `${
                    activeDrawingTool.charAt(0).toUpperCase() +
                    activeDrawingTool.slice(1)
                  } Tool`}{" "}
              Active
            </span>
          </div>
        )}

        {/* Compact Save Status */}
        {(isSaving || lastSaved) && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 z-30">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                <span className="text-xs text-gray-600">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="w-3 h-3 text-green-600" />
                <span className="text-xs text-gray-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>
        )}

        {/* Compact Shape Selection Indicator */}
        {selectedNodeShape !== "rectangle" &&
          !isLocked &&
          !showDrawingTools && (
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 z-30">
              <span className="text-xs text-gray-600">
                Next shape:{" "}
                <strong className="capitalize">{selectedNodeShape}</strong>
              </span>
            </div>
          )}

        {/* Compact Keyboard Shortcuts Helper */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 z-30">
          <span>
            2-4: Shapes | 8: Text | 9: Image | 0: Eraser | H: Hand | V: Select |
            Esc: Close Panel
          </span>
        </div>
      </div>
    </div>
  )
}

// Export both the inner component and the main component
export function SimpleMindMapCanvas({ mindMapId }: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner mindMapId={mindMapId} />
    </ReactFlowProvider>
  )
}

// Main export for compatibility
export function MindMapCanvas({ mindMapId }: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner mindMapId={mindMapId} />
    </ReactFlowProvider>
  )
}
