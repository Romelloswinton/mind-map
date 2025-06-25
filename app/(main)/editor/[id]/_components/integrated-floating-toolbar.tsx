import React, { useState } from "react"
import {
  Lock,
  Hand,
  MousePointer,
  Square,
  Circle,
  Diamond,
  PenTool,
  Type,
  Image,
  Eraser,
  Palette,
  Share,
  Library,
  ArrowRight,
  Triangle,
} from "lucide-react"

// Define NodeShape type locally if not available from your store
export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"

// Tool types for the floating toolbar
export type ToolType =
  | "lock"
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "circle"
  | "arrow"
  | "pencil"
  | "text"
  | "image"
  | "eraser"

export interface IntegratedFloatingToolbarProps {
  // Mind map specific props from your existing implementation
  activeTool?: ToolType
  selectedNodeShape?: NodeShape
  onToolChange?: (tool: ToolType) => void
  onShapeChange?: (shape: NodeShape) => void
  onShare?: () => void
  onLibrary?: () => void

  // Integration with your existing mind map functions
  onAddNode?: (position?: { x: number; y: number }, shape?: NodeShape) => void
  isLocked?: boolean
  onToggleLock?: () => void
  className?: string
}

interface ToolButton {
  id: ToolType
  icon: React.ComponentType<{ className?: string }>
  label: string
  subscript?: string
  shortcut?: string
}

const tools: ToolButton[] = [
  { id: "lock", icon: Lock, label: "Lock/Unlock", shortcut: "1" },
  { id: "hand", icon: Hand, label: "Hand Tool", shortcut: "H" },
  { id: "select", icon: MousePointer, label: "Selection Tool", shortcut: "V" },
  {
    id: "rectangle",
    icon: Square,
    label: "Rectangle",
    subscript: "2",
    shortcut: "2",
  },
  {
    id: "diamond",
    icon: Diamond,
    label: "Diamond",
    subscript: "3",
    shortcut: "3",
  },
  {
    id: "circle",
    icon: Circle,
    label: "Circle",
    subscript: "4",
    shortcut: "4",
  },
  {
    id: "arrow",
    icon: ArrowRight,
    label: "Arrow/Connector",
    subscript: "5",
    shortcut: "5",
  },
  {
    id: "pencil",
    icon: PenTool,
    label: "Free Draw",
    subscript: "6",
    shortcut: "6",
  },
  { id: "text", icon: Type, label: "Text", subscript: "8", shortcut: "8" },
  { id: "image", icon: Image, label: "Image", subscript: "9", shortcut: "9" },
  {
    id: "eraser",
    icon: Eraser,
    label: "Eraser",
    subscript: "0",
    shortcut: "0",
  },
]

export default function IntegratedFloatingToolbar({
  activeTool = "select",
  selectedNodeShape = "rectangle",
  onToolChange,
  onShapeChange,
  onShare,
  onLibrary,
  onAddNode,
  isLocked = false,
  onToggleLock,
  className = "",
}: IntegratedFloatingToolbarProps) {
  const [showTooltip, setShowTooltip] = useState(true)

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === "lock") {
      onToggleLock?.()
    } else if (["rectangle", "circle", "diamond"].includes(toolId)) {
      // Handle shape tools - both set as active tool and trigger node creation
      const shape = toolId as NodeShape
      onShapeChange?.(shape)
      // Call with undefined position to use default, and pass shape
      onAddNode?.(undefined, shape)
      onToolChange?.(toolId)
    } else if (toolId === "arrow") {
      // Handle connection mode - integrate with your existing connection logic
      onToolChange?.(toolId)
    } else {
      // Handle other tools
      onToolChange?.(toolId)
    }
  }

  // Map your existing NodeShape to subscripts for visual consistency
  const getShapeSubscript = (shape: NodeShape): string => {
    switch (shape) {
      case "rectangle":
        return "2"
      case "diamond":
        return "3"
      case "circle":
        return "4"
      case "triangle":
        return "4" // Using circle's subscript as fallback
      default:
        return "2"
    }
  }

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
    >
      {/* Main Toolbar */}
      <div className="flex items-center bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl px-2 py-1.5">
        {/* Tool Buttons */}
        <div className="flex items-center space-x-0.5">
          {tools.map((tool) => {
            let isActive = false

            // Determine if tool is active based on different states
            if (tool.id === "lock") {
              isActive = isLocked
            } else if (["rectangle", "circle", "diamond"].includes(tool.id)) {
              // Shape tools are active if they match the selected shape
              isActive = tool.id === selectedNodeShape
            } else {
              // Other tools use the activeTool prop
              isActive = tool.id === activeTool
            }

            const Icon = tool.icon

            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`relative p-2 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
                title={`${tool.label} ${
                  tool.shortcut ? `(${tool.shortcut})` : ""
                }`}
              >
                <Icon className="w-4 h-4" />

                {/* Dynamic Subscript Badge - use shape-specific subscripts for shape tools */}
                {tool.subscript && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-gray-700 text-gray-300 text-xs font-mono rounded-full w-3.5 h-3.5 flex items-center justify-center border border-gray-600">
                    {["rectangle", "circle", "diamond"].includes(tool.id)
                      ? getShapeSubscript(tool.id as NodeShape)
                      : tool.subscript}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-purple-400/50 ring-offset-1 ring-offset-gray-900/90" />
                )}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600/50 mx-2" />

        {/* Style/Theme Button */}
        <button
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-150"
          title="Styles & Themes"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600/50 mx-2" />

        {/* Library Button */}
        <button
          onClick={onLibrary}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-150"
          title="Library"
        >
          <Library className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="relative ml-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-150 flex items-center space-x-1.5 font-medium shadow-md text-sm"
          title="Share Mind Map"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Share</span>

          {/* Badge Indicator */}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-gray-900/90 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-800/95 backdrop-blur-sm text-gray-200 text-sm px-4 py-2 rounded-lg border border-gray-600/50 shadow-xl relative">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800/95 border-l border-t border-gray-600/50 rotate-45" />
            <div className="flex items-center space-x-2">
              <span>
                To move canvas, hold mouse wheel or spacebar while dragging, or
                use the hand tool
              </span>
              <button
                onClick={() => setShowTooltip(false)}
                className="ml-3 text-gray-400 hover:text-gray-200 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shape Selection Indicator - integrates with your existing shape indicator */}
      {selectedNodeShape !== "rectangle" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-gray-800/95 backdrop-blur-sm text-gray-200 px-3 py-2 rounded-lg border border-gray-600/50 shadow-xl">
          <span className="text-sm">
            Next shape:{" "}
            <strong className="capitalize">{selectedNodeShape}</strong>
          </span>
        </div>
      )}

      {/* Enhanced Keyboard Shortcuts Overlay */}
      <div className="absolute top-full left-0 right-0 mt-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:opacity-100">
        <div className="bg-gray-800/95 backdrop-blur-sm text-gray-300 text-xs rounded-lg border border-gray-600/50 shadow-xl p-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="font-semibold text-gray-200 mb-1">Navigation</div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">H</kbd> Hand
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">V</kbd> Select
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">Space</kbd> Pan
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-200 mb-1">Shapes</div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">2</kbd> Rectangle
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">3</kbd> Diamond
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">4</kbd> Circle
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-200 mb-1">Tools</div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">5</kbd> Arrow
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">6</kbd> Draw
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">8</kbd> Text
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-200 mb-1">Actions</div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">⌘Z</kbd> Undo
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">Del</kbd> Delete
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">1</kbd> Lock
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
