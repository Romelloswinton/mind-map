// Fixed Mind Map Node Integration - Updated Type Consistency
// File: app/mind-map/[id]/_components/mind-map-node.tsx

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react"
import { Trash2, Plus, Edit3, Check, X, Move, Palette } from "lucide-react"

// ✅ FIXED: Import from unified types
import type { MindMapNodeData, NodeShape } from "@/src/types/drawing-tools"

// ✅ FIXED: Store integration with proper imports
import {
  useMindMapStore,
  useMindMapPanelIntegration,
} from "@/src/stores/mind-map-store"

// Utils and styles
import { ShapeOutline } from "../shape-tools/shape-outline"
import {
  injectInstantResizeStyles,
  useResizeHandlers,
  getResizerProps,
  getOptimalDimensions,
  getShapeStyles,
  getContentWrapperStyle,
  getShapeClasses,
  getShapeEmoji,
} from "@/app/utils/resize-handlers"

// Inject styles once
injectInstantResizeStyles()

interface MindMapNodeProps extends NodeProps {
  data: MindMapNodeData
}

// ✅ ENHANCED: Enhanced styling function with drawing tools integration
function getEnhancedShapeStyles(
  width: number,
  height: number,
  isResizing: boolean,
  data: MindMapNodeData,
  nodeShape: NodeShape
): React.CSSProperties {
  // Get base styles
  const baseStyles = getShapeStyles(
    width,
    height,
    isResizing,
    data.color,
    nodeShape
  )

  // Apply drawing tool customizations
  const customStyles: React.CSSProperties = {
    ...baseStyles,
  }

  // Override with drawing tool settings if they exist
  if (data.strokeColor) {
    customStyles.borderColor = data.strokeColor
    if (!customStyles.borderWidth) {
      customStyles.borderWidth = "2px"
      customStyles.borderStyle = "solid"
    }
  }

  if (data.fillColor) {
    customStyles.backgroundColor = data.fillColor
  }

  if (data.strokeWidth) {
    customStyles.borderWidth = `${data.strokeWidth}px`
    if (!customStyles.borderStyle) {
      customStyles.borderStyle = "solid"
    }
  }

  if (data.opacity !== undefined) {
    customStyles.opacity = data.opacity
  }

  if (data.strokeStyle) {
    customStyles.borderStyle = data.strokeStyle
  }

  if (data.edgeStyle && nodeShape === "rectangle") {
    customStyles.borderRadius = data.edgeStyle === "rounded" ? "16px" : "4px"
  }

  if (data.sloppiness && data.sloppiness > 0) {
    customStyles.filter = `contrast(${1 + data.sloppiness * 0.1}) sepia(${
      data.sloppiness * 0.05
    })`
  }

  return customStyles
}

// ✅ ENHANCED: Enhanced shape classes with store selection support
function getEnhancedShapeClasses(
  isResizing: boolean,
  selected: boolean,
  isHovered: boolean,
  isEditing: boolean,
  nodeShape: NodeShape,
  data: MindMapNodeData,
  isStoreSelected: boolean
): string {
  const baseClasses = getShapeClasses(
    isResizing,
    selected || isStoreSelected,
    isHovered,
    isEditing,
    nodeShape
  )

  const customClasses = []

  if (data.sloppiness && data.sloppiness > 0) {
    customClasses.push("node-sloppy")
  }

  if (data.strokeStyle === "dashed") {
    customClasses.push("node-dashed")
  } else if (data.strokeStyle === "dotted") {
    customClasses.push("node-dotted")
  }

  if (isStoreSelected) {
    customClasses.push("node-store-selected")
  }

  return [baseClasses, ...customClasses].filter(Boolean).join(" ")
}

// ✅ ENHANCED: Enhanced styles injection with improved animations
function injectEnhancedNodeStyles() {
  if (typeof document === "undefined") return

  const styleId = "enhanced-node-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    .node-sloppy {
      position: relative;
    }
    
    .node-sloppy::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: inherit;
      filter: blur(0.5px) hue-rotate(1deg);
      opacity: 0.3;
      border-radius: inherit;
      z-index: -1;
    }
    
    .node-dashed {
      border-style: dashed !important;
    }
    
    .node-dotted {
      border-style: dotted !important;
    }
    
    .node-store-selected {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
      transform: scale(1.02);
    }
    
    .node-store-selected::after {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid #3b82f6;
      border-radius: inherit;
      z-index: -1;
      animation: store-selection-pulse 2s infinite;
    }
    
    @keyframes store-selection-pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.02); }
    }
    
    .mind-map-node {
      transition: all 0.2s ease;
    }
    
    .mind-map-node.resizing {
      transition: none !important;
    }
    
    .mind-map-node:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .mind-map-node.resizing:hover,
    .mind-map-node.node-store-selected:hover {
      transform: none;
    }
  `
  document.head.appendChild(style)
}

export function MindMapNode(props: MindMapNodeProps) {
  const { id, data, selected } = props

  // Extract dimension props with proper type safety
  const width = (props as any).width || 200
  const height = (props as any).height || 120
  const style = (props as any).style
  const measured = (props as any).measured

  // ✅ FIXED: Store integration with correct imports
  const mindMapStore = useMindMapStore()
  const { updateSelectedNode } = useMindMapPanelIntegration()

  // ✅ FIXED: Check if this node is selected in the store
  const isStoreSelected = mindMapStore.selectedNodeId === id

  // ✅ FIXED: Simple force update mechanism
  const [updateCounter, setUpdateCounter] = useState(0)
  const forceUpdate = useCallback(() => {
    setUpdateCounter((prev) => prev + 1)
  }, [])

  const [isEditing, setIsEditing] = useState(data.isEditing || false)
  const [text, setText] = useState(data.text)
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Inject enhanced styles on mount
  useEffect(() => {
    injectEnhancedNodeStyles()
  }, [])

  // ✅ ENHANCED: Node click handler for store selection with better event handling
  const handleNodeClick = useCallback(
    (event: React.MouseEvent) => {
      // Don't handle if clicking on buttons or during editing
      if (
        (event.target as HTMLElement).closest("button") ||
        (event.target as HTMLElement).closest("textarea") ||
        isEditing ||
        isResizing
      ) {
        return
      }

      console.log("🎯 Node clicked for store selection:", id)

      // Set this node as selected in the store
      mindMapStore.setSelectedNodeId(id)

      // Force update for reactivity
      setTimeout(() => forceUpdate(), 10)
    },
    [id, mindMapStore.setSelectedNodeId, forceUpdate, isEditing, isResizing]
  )

  // ✅ ENHANCED: Monitor store selection changes with logging
  useEffect(() => {
    if (isStoreSelected) {
      console.log("🎯 Node is now store-selected:", id)
    }
  }, [isStoreSelected, id])

  // ✅ ENHANCED: Resize handlers with proper store integration
  const baseResizeHandlers = useResizeHandlers(id)

  const resizeHandlers = {
    handleResize: baseResizeHandlers.handleResize,
    handleResizeStart: useCallback(
      (event: any) => {
        const result = baseResizeHandlers.handleResizeStart(event)
        setIsResizing(true)

        // Select this node when starting to resize
        mindMapStore.setSelectedNodeId(id)

        return result
      },
      [baseResizeHandlers.handleResizeStart, id, mindMapStore.setSelectedNodeId]
    ),
    handleResizeEnd: useCallback(
      (event: any, data: any) => {
        const result = baseResizeHandlers.handleResizeEnd(event, data)
        setIsResizing(false)
        return result
      },
      [baseResizeHandlers.handleResizeEnd]
    ),
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setIsEditing(data.isEditing || false)
  }, [data.isEditing])

  // ✅ ENHANCED: Event handlers with proper error handling
  const handleSaveEdit = useCallback(() => {
    if (text.trim()) {
      window.dispatchEvent(
        new CustomEvent("nodeUpdate", {
          detail: { nodeId: id, data: { text: text.trim(), isEditing: false } },
        })
      )
      setIsEditing(false)
    }
  }, [id, text])

  const handleCancelEdit = useCallback(() => {
    setText(data.text)
    setIsEditing(false)
    window.dispatchEvent(
      new CustomEvent("nodeUpdate", {
        detail: { nodeId: id, data: { isEditing: false } },
      })
    )
  }, [id, data.text])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      // Clear store selection if deleting selected node
      if (isStoreSelected) {
        mindMapStore.setSelectedNodeId(null)
      }

      window.dispatchEvent(
        new CustomEvent("nodeDelete", {
          detail: { nodeId: id },
        })
      )
    },
    [id, isStoreSelected, mindMapStore.setSelectedNodeId]
  )

  const handleAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      window.dispatchEvent(
        new CustomEvent("nodeAddChild", {
          detail: {
            parentId: id,
            position: { x: 200, y: 100 },
          },
        })
      )
    },
    [id]
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSaveEdit()
      } else if (e.key === "Escape") {
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isEditing) {
        setIsEditing(true)
        setText(data.text)
      }
    },
    [isEditing, data.text]
  )

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  // ✅ ENHANCED: Customize button click handler with better feedback
  const handleCustomizeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      console.log("🎨 Customize button clicked for node:", id)

      // Ensure this node is selected in the store
      mindMapStore.setSelectedNodeId(id)

      // Force update to ensure reactivity
      setTimeout(() => forceUpdate(), 10)
    },
    [id, mindMapStore.setSelectedNodeId, forceUpdate]
  )

  // Calculate dimensions with better defaults
  const actualWidth = measured?.width || style?.width || width || 200
  const actualHeight = measured?.height || style?.height || height || 120

  const nodeShape = data.shape || "rectangle"
  const { width: optimalWidth, height: optimalHeight } = getOptimalDimensions(
    actualWidth,
    actualHeight,
    nodeShape
  )

  // Apply enhanced styles
  const enhancedStyles = getEnhancedShapeStyles(
    optimalWidth,
    optimalHeight,
    isResizing,
    data,
    nodeShape
  )

  const enhancedClasses = getEnhancedShapeClasses(
    isResizing,
    selected,
    isHovered,
    isEditing,
    nodeShape,
    data,
    isStoreSelected
  )

  // ✅ ENHANCED: Calculate text color based on background with better contrast
  const getContrastColor = useCallback((backgroundColor: string): string => {
    if (!backgroundColor || backgroundColor === "transparent") return "#000000"

    const hex = backgroundColor.replace("#", "")
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex

    if (fullHex.length !== 6) return "#000000"

    const r = parseInt(fullHex.substr(0, 2), 16)
    const g = parseInt(fullHex.substr(2, 2), 16)
    const b = parseInt(fullHex.substr(4, 2), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155 ? "#000000" : "#ffffff"
  }, [])

  const textColor = getContrastColor(data.fillColor || data.color)

  // Check if node has custom styling applied
  const hasCustomStyling = Boolean(
    data.strokeColor ||
      data.fillColor ||
      data.strokeWidth ||
      data.opacity !== undefined ||
      data.sloppiness ||
      data.edgeStyle
  )

  return (
    <div className="relative">
      {/* NodeResizer */}
      <NodeResizer
        {...getResizerProps(
          nodeShape,
          selected || isStoreSelected,
          resizeHandlers
        )}
      />

      {/* Shape outline during resize */}
      {isResizing && (
        <ShapeOutline
          shape={nodeShape}
          width={optimalWidth}
          height={optimalHeight}
          padding={1}
          strokeWidth={2}
          color="#3b82f6"
          animate={false}
        />
      )}

      {/* ✅ ENHANCED: Shape container with proper click handler and styling */}
      <div
        className={`${enhancedClasses} mind-map-node ${
          isResizing ? "resizing" : ""
        }`}
        style={enhancedStyles}
        data-shape={nodeShape}
        data-resizing={isResizing}
        data-store-selected={isStoreSelected}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
        onClick={handleNodeClick}
      >
        {/* ✅ ENHANCED: SVG filters for sloppiness effect */}
        {data.sloppiness && data.sloppiness > 0 && (
          <svg
            width="0"
            height="0"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <defs>
              <filter
                id={`sloppy-${id}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  baseFrequency={0.02 + data.sloppiness * 0.01}
                  numOctaves="2"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={data.sloppiness * 1.5}
                />
              </filter>
            </defs>
          </svg>
        )}

        {/* Apply sloppiness filter to content */}
        <div
          style={{
            filter:
              data.sloppiness && data.sloppiness > 0
                ? `url(#sloppy-${id})`
                : undefined,
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* ✅ ENHANCED: Connection handles with better visibility */}
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100"
            style={{
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              transition: isResizing ? "none" : "opacity 0.2s ease",
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100"
            style={{
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              transition: isResizing ? "none" : "opacity 0.2s ease",
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100"
            style={{
              left: -6,
              top: "50%",
              transform: "translateY(-50%)",
              transition: isResizing ? "none" : "opacity 0.2s ease",
            }}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100"
            style={{
              right: -6,
              top: "50%",
              transform: "translateY(-50%)",
              transition: isResizing ? "none" : "opacity 0.2s ease",
            }}
          />

          {/* ✅ ENHANCED: Shape-aware drag indicator with better positioning */}
          {(selected || isHovered || isStoreSelected) &&
            !isEditing &&
            !isResizing && (
              <div
                className={`absolute z-10 transition-all duration-200 ${
                  nodeShape === "diamond"
                    ? "top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 -rotate-45"
                    : nodeShape === "circle"
                    ? "-top-4 left-1/2 transform -translate-x-1/2"
                    : nodeShape === "triangle"
                    ? "-top-4 left-1/2 transform -translate-x-1/2"
                    : "-top-4 left-1/2 transform -translate-x-1/2"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full cursor-move shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-gray-600">
                  <Move className="w-2.5 h-2.5 text-white drop-shadow-sm" />
                  <div className="absolute -top-0.5 left-1/2 w-0.5 h-0.5 bg-gray-400 rounded-full transform -translate-x-1/2 animate-pulse"></div>
                </div>
              </div>
            )}

          {/* ✅ ENHANCED: Content wrapper with better text handling */}
          <div
            className="relative z-10"
            style={getContentWrapperStyle(
              optimalWidth,
              optimalHeight,
              isResizing,
              nodeShape
            )}
          >
            {isEditing ? (
              <div
                className="flex flex-col w-full h-full"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-1 w-full px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="Enter your idea..."
                  style={{
                    minHeight: "40px",
                    transition: "none",
                  }}
                />
                <div className="flex justify-center gap-1 mt-2 flex-shrink-0">
                  <button
                    onClick={handleSaveEdit}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                    title="Save (Enter)"
                  >
                    <Check size={10} />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                    title="Cancel (Esc)"
                  >
                    <X size={10} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm font-medium break-words text-center overflow-hidden"
                style={{
                  color: textColor,
                  opacity:
                    data.opacity !== undefined
                      ? Math.max(data.opacity, 0.7)
                      : 1,
                }}
              >
                {data.text}
              </div>
            )}
          </div>

          {/* ✅ ENHANCED: Action buttons with better animations and positioning */}
          {(isHovered || selected || isStoreSelected) &&
            !isEditing &&
            !isResizing && (
              <div
                className={`absolute flex gap-0.5 z-20 transition-all duration-200 ${
                  nodeShape === "diamond"
                    ? "top-0 right-0 transform translate-x-6 -translate-y-6 -rotate-45"
                    : nodeShape === "circle"
                    ? "-top-1 -right-1"
                    : nodeShape === "triangle"
                    ? "-top-1 -right-1"
                    : "-top-1 -right-1"
                }`}
              >
                {/* Customize button */}
                <button
                  onClick={handleCustomizeClick}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="group relative p-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:ring-offset-1"
                  title="Customize Appearance"
                >
                  <Palette
                    size={10}
                    className="transition-transform group-hover:rotate-12"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Style
                  </div>
                </button>

                <button
                  onClick={handleAddChild}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="group relative p-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-1"
                  title="Add Child Node"
                >
                  <Plus
                    size={10}
                    className="transition-transform group-hover:rotate-90"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Add
                  </div>
                </button>

                <button
                  onClick={handleEditClick}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="group relative p-1 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:ring-offset-1"
                  title="Edit Text"
                >
                  <Edit3
                    size={10}
                    className="transition-transform group-hover:scale-110"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Edit
                  </div>
                </button>

                <button
                  onClick={handleDelete}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="group relative p-1 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-red-400 focus:ring-offset-1"
                  title="Delete Node"
                >
                  <Trash2
                    size={10}
                    className="transition-transform group-hover:scale-110"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Delete
                  </div>
                </button>
              </div>
            )}
        </div>

        {/* ✅ ENHANCED: Selection indicator with store integration and better styling */}
        {(selected || isStoreSelected) && !isResizing && (
          <div
            className={`absolute z-10 transition-all duration-200 ${
              nodeShape === "diamond"
                ? "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 -rotate-45"
                : nodeShape === "circle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2"
                : nodeShape === "triangle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2"
                : "-bottom-4 left-1/2 transform -translate-x-1/2"
            }`}
          >
            <div
              className={`px-2 py-1 text-white text-xs font-medium rounded-full shadow-lg border ${
                isStoreSelected
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400"
              }`}
            >
              <span className="flex items-center gap-1">
                <span>
                  {Math.round(optimalWidth)}×{Math.round(optimalHeight)}
                </span>
                <span
                  className={
                    isStoreSelected ? "text-purple-100" : "text-blue-100"
                  }
                >
                  {getShapeEmoji(nodeShape)}
                </span>
                {hasCustomStyling && (
                  <span
                    className={
                      isStoreSelected ? "text-purple-200" : "text-blue-200"
                    }
                    title="Custom styling applied"
                  >
                    🎨
                  </span>
                )}
                {isStoreSelected && (
                  <span
                    className="text-purple-200"
                    title="Selected for customization"
                  >
                    ✨
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* ✅ ENHANCED: Resize indicator with better animations */}
        {isResizing && (
          <div
            className={`absolute z-10 ${
              nodeShape === "diamond"
                ? "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 -rotate-45"
                : nodeShape === "circle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2"
                : nodeShape === "triangle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2"
                : "-bottom-4 left-1/2 transform -translate-x-1/2"
            }`}
          >
            <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-full shadow-lg border border-orange-400">
              <span className="flex items-center gap-1">
                <span className="animate-pulse">Resizing...</span>
                <span className="font-bold">
                  {Math.round(optimalWidth)}×{Math.round(optimalHeight)}
                </span>
                <span className="text-orange-100">
                  {getShapeEmoji(nodeShape)}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* ✅ ENHANCED: Store selection status indicator */}
        {isStoreSelected && !isResizing && (
          <div
            className={`absolute z-5 transition-all duration-200 ${
              nodeShape === "diamond"
                ? "top-0 left-0 transform -translate-x-8 -translate-y-4 -rotate-45"
                : nodeShape === "circle"
                ? "-top-2 -left-2"
                : nodeShape === "triangle"
                ? "-top-2 -left-2"
                : "-top-2 -left-2"
            }`}
          >
            <div className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded shadow-lg border border-purple-400 animate-pulse">
              <span className="flex items-center gap-1">
                <span>✨</span>
                <span>CUSTOMIZING</span>
              </span>
            </div>
          </div>
        )}

        {/* ✅ ENHANCED: Development debug info */}
        {process.env.NODE_ENV === "development" && isStoreSelected && (
          <div
            className={`absolute z-5 transition-all duration-200 ${
              nodeShape === "diamond"
                ? "top-0 right-0 transform translate-x-8 -translate-y-4 -rotate-45"
                : nodeShape === "circle"
                ? "-top-8 -right-2"
                : nodeShape === "triangle"
                ? "-top-8 -right-2"
                : "-top-8 -right-2"
            }`}
          >
            <div className="px-1 py-0.5 bg-black text-white text-xs rounded opacity-75 pointer-events-none">
              Store: {id.slice(-6)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
