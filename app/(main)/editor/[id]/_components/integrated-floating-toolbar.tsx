import React, { useState } from "react"
import {
  Lock,
  Hand,
  MousePointer,
  Square,
  Circle,
  Diamond,
  Type,
  Image,
  Eraser,
  Share,
  Library,
} from "lucide-react"

// Define NodeShape type locally if not available from your store
export type NodeShape = "rectangle" | "circle" | "diamond" | "triangle"

// Fixed ToolType to match your canvas - REMOVED problematic tools
export type ToolType =
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "circle"
  | "text"
  | "image"
  | "eraser"

export interface IntegratedFloatingToolbarProps {
  // Mind map specific props from your existing implementation
  activeTool?: ToolType
  onToolChange?: (tool: ToolType) => void

  // Lock state handling
  isLocked?: boolean
  onToggleLock?: () => void
  className?: string
}

interface ToolButton {
  id: ToolType | "lock" // Allow lock as special case
  icon: React.ComponentType<{ className?: string }>
  label: string
  subscript?: string
  shortcut?: string
}

// Fixed tools array - removed problematic tools
const tools: ToolButton[] = [
  { id: "select", icon: MousePointer, label: "Selection Tool", shortcut: "V" },
  { id: "hand", icon: Hand, label: "Hand Tool", shortcut: "H" },
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
  onToolChange,
  isLocked = false,
  onToggleLock,
  className = "",
}: IntegratedFloatingToolbarProps) {
  const [showTooltip, setShowTooltip] = useState(false) // Default false to reduce clutter

  const handleToolClick = (toolId: ToolType | "lock") => {
    if (toolId === "lock") {
      onToggleLock?.()
    } else {
      // For all other tools, just call onToolChange
      // Let the canvas handle the specific logic for each tool
      onToolChange?.(toolId as ToolType)
    }
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
    >
      {/* Main Toolbar - More Compact */}
      <div className="flex items-center bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-xl px-1.5 py-1">
        {/* Tool Buttons - Smaller */}
        <div className="flex items-center space-x-0.5">
          {tools.map((tool) => {
            // Only check activeTool for non-lock tools
            const isActive = tool.id === activeTool
            const Icon = tool.icon

            return (
              <div key={tool.id} className="relative">
                <button
                  onClick={() => handleToolClick(tool.id)}
                  className={`
                    relative p-1.5 rounded-md transition-all duration-150 group
                    ${
                      isActive
                        ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-500/50"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }
                  `}
                  title={`${tool.label} ${
                    tool.shortcut ? `(${tool.shortcut})` : ""
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />

                  {/* Smaller Subscript Number */}
                  {tool.subscript && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-600 text-white text-xs font-medium rounded-full flex items-center justify-center text-[10px]">
                      {tool.subscript}
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Separator - Shorter */}
        <div className="w-px bg-gray-600 h-5 mx-1.5" />

        {/* Lock Button - Smaller */}
        <button
          onClick={onToggleLock}
          className={`
            p-1.5 rounded-md transition-all duration-150
            ${
              isLocked
                ? "bg-red-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }
          `}
          title={isLocked ? "Unlock Canvas (1)" : "Lock Canvas (1)"}
        >
          <Lock className="w-3.5 h-3.5" />
        </button>

        {/* Separator - Shorter */}
        <div className="w-px bg-gray-600 h-5 mx-1.5" />

        {/* Share Button - More Compact */}
        <div className="relative">
          <button className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-150 shadow-sm text-xs font-medium">
            <Share className="w-3 h-3" />
            <span>Share</span>
          </button>

          {/* Notification Badge - Smaller */}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
        </div>

        {/* Templates Button - More Compact */}
        <button
          className="ml-1 p-1.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-150"
          title="Templates"
        >
          <Library className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tooltip - Only show when enabled */}
      {showTooltip && (
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-800/95 backdrop-blur-sm text-gray-200 text-sm px-4 py-2 rounded-lg border border-gray-600/50 shadow-xl relative">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800/95 border-l border-t border-gray-600/50 rotate-45" />
            <div className="flex items-center space-x-2">
              <span>
                Select tools with keyboard shortcuts or click to activate
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
    </div>
  )
}
