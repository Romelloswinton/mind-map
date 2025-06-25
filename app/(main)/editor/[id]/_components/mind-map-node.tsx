import React, { useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react"
import { Trash2, Plus, Edit3, Check, X, Move } from "lucide-react"
import { MindMapNodeData, NodeShape } from "@/src/stores/mind-map-store"
import { ShapeOutline } from "./shape-outline"
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

// 🎨 Helper function to determine text color based on background
function getContrastColor(backgroundColor: string): string {
  if (!backgroundColor || backgroundColor === "transparent") return "#ffffff"

  // Remove # if present
  const hex = backgroundColor.replace("#", "")

  // Handle 3-digit hex codes
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex

  if (fullHex.length !== 6) return "#ffffff"

  const r = parseInt(fullHex.substr(0, 2), 16)
  const g = parseInt(fullHex.substr(2, 2), 16)
  const b = parseInt(fullHex.substr(4, 2), 16)

  // Calculate luminance
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 155 ? "#000000" : "#ffffff"
}

// 🎨 Enhanced styling function with drawing tools integration
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
    // Ensure border exists
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
    // Ensure border style exists
    if (!customStyles.borderStyle) {
      customStyles.borderStyle = "solid"
    }
  }

  if (data.opacity !== undefined) {
    customStyles.opacity = data.opacity
  }

  // Handle stroke styles
  if (data.strokeStyle) {
    customStyles.borderStyle = data.strokeStyle
  }

  // Handle edge styles (border radius) for rectangles
  if (data.edgeStyle && nodeShape === "rectangle") {
    customStyles.borderRadius = data.edgeStyle === "rounded" ? "16px" : "4px"
  }

  // Apply sloppiness effect if needed
  if (data.sloppiness && data.sloppiness > 0) {
    // Add CSS filter for hand-drawn effect
    customStyles.filter = `contrast(${1 + data.sloppiness * 0.1}) sepia(${
      data.sloppiness * 0.05
    })`
  }

  return customStyles
}

// 🎨 Enhanced shape classes
function getEnhancedShapeClasses(
  isResizing: boolean,
  selected: boolean,
  isHovered: boolean,
  isEditing: boolean,
  nodeShape: NodeShape,
  data: MindMapNodeData
): string {
  const baseClasses = getShapeClasses(
    isResizing,
    selected,
    isHovered,
    isEditing,
    nodeShape
  )

  const customClasses = []

  // Add sloppiness class
  if (data.sloppiness && data.sloppiness > 0) {
    customClasses.push("node-sloppy")
  }

  // Add stroke style classes
  if (data.strokeStyle === "dashed") {
    customClasses.push("node-dashed")
  } else if (data.strokeStyle === "dotted") {
    customClasses.push("node-dotted")
  }

  return [baseClasses, ...customClasses].filter(Boolean).join(" ")
}

// 🎨 Inject enhanced node styles
function injectEnhancedNodeStyles() {
  if (typeof document === "undefined") return

  const styleId = "enhanced-node-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `
    /* Enhanced node styling */
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
    
    /* Smooth transitions for property changes */
    .mind-map-node {
      transition: all 0.2s ease;
    }
    
    .mind-map-node.resizing {
      transition: none !important;
    }
  `
  document.head.appendChild(style)
}

export function MindMapNode(props: MindMapNodeProps) {
  const { id, data, selected } = props

  // Extract dimension props with proper typing
  const width = (props as any).width
  const height = (props as any).height
  const style = (props as any).style
  const measured = (props as any).measured

  const [isEditing, setIsEditing] = useState(data.isEditing || false)
  const [text, setText] = useState(data.text)
  const [isHovered, setIsHovered] = useState(false)
  // 🔥 CRITICAL: Track resize state for instant feedback
  const [isResizing, setIsResizing] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 🎨 Inject enhanced styles on mount
  useEffect(() => {
    injectEnhancedNodeStyles()
  }, [])

  // 🔥 Use extracted resize handlers
  const baseResizeHandlers = useResizeHandlers(id)

  // Enhanced resize handlers with state management
  const resizeHandlers = {
    handleResize: baseResizeHandlers.handleResize,
    handleResizeStart: useCallback(
      (event: any) => {
        const result = baseResizeHandlers.handleResizeStart(event)
        setIsResizing(true)
        return result
      },
      [baseResizeHandlers.handleResizeStart]
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

  // Handle editing state changes
  useEffect(() => {
    setIsEditing(data.isEditing || false)
  }, [data.isEditing])

  const handleSaveEdit = () => {
    if (text.trim()) {
      window.dispatchEvent(
        new CustomEvent("nodeUpdate", {
          detail: { nodeId: id, data: { text: text.trim(), isEditing: false } },
        })
      )
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setText(data.text)
    setIsEditing(false)
    window.dispatchEvent(
      new CustomEvent("nodeUpdate", {
        detail: { nodeId: id, data: { isEditing: false } },
      })
    )
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent("nodeDelete", {
        detail: { nodeId: id },
      })
    )
  }

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent("nodeAddChild", {
        detail: {
          parentId: id,
          position: { x: 200, y: 100 },
        },
      })
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing) {
      setIsEditing(true)
      setText(data.text)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  // Calculate actual dimensions with proper fallbacks
  const actualWidth = measured?.width || style?.width || width || 200
  const actualHeight = measured?.height || style?.height || height || 120

  const nodeShape = data.shape || "rectangle"
  const { width: optimalWidth, height: optimalHeight } = getOptimalDimensions(
    actualWidth,
    actualHeight,
    nodeShape
  )

  // 🎨 Calculate enhanced styles with drawing tool integration
  const enhancedStyles = getEnhancedShapeStyles(
    optimalWidth,
    optimalHeight,
    isResizing,
    data, // Pass the full data object now
    nodeShape
  )

  const enhancedClasses = getEnhancedShapeClasses(
    isResizing,
    selected,
    isHovered,
    isEditing,
    nodeShape,
    data // Pass the full data object
  )

  // 🎨 Calculate text color based on background
  const textColor = getContrastColor(data.fillColor || data.color)

  // 🎨 Check if node has custom styling applied
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
      {/* 🚀 INSTANT: Ultra-responsive NodeResizer */}
      <NodeResizer {...getResizerProps(nodeShape, selected, resizeHandlers)} />

      {/* 🚀 INSTANT: Fast outline with no animation delays */}
      {isResizing && (
        <ShapeOutline
          shape={nodeShape}
          width={optimalWidth}
          height={optimalHeight}
          padding={1} // Minimal padding for instant feedback
          strokeWidth={2}
          color="#3b82f6"
          animate={false} // 🔥 CRITICAL: Disable animations completely
        />
      )}

      {/* 🎨 ENHANCED: Shape container with drawing tools styling */}
      <div
        className={`${enhancedClasses} mind-map-node ${
          isResizing ? "resizing" : ""
        }`}
        style={enhancedStyles} // Use enhanced styles instead of basic ones
        data-shape={nodeShape}
        data-resizing={isResizing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      >
        {/* 🎨 Add SVG filters for sloppiness effect */}
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

        {/* Apply sloppiness filter to the content if enabled */}
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
          {/* 🚀 INSTANT: Connection handles with no delays */}
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100"
            style={{
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              transition: isResizing ? "none" : "opacity 0.2s ease", // 🔥 Conditional transition
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

          {/* 🎯 ENHANCED: Shape-aware drag indicator with perfect positioning */}
          {(selected || isHovered) && !isEditing && !isResizing && (
            <div
              className={`absolute z-10 transition-all duration-200 ${
                nodeShape === "diamond"
                  ? "top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 -rotate-45" // Diamond: counter-rotate and position outside diamond bounds
                  : nodeShape === "circle"
                  ? "-top-4 left-1/2 transform -translate-x-1/2" // Circle: standard positioning
                  : nodeShape === "triangle"
                  ? "-top-4 left-1/2 transform -translate-x-1/2" // Triangle: standard positioning
                  : "-top-4 left-1/2 transform -translate-x-1/2" // Rectangle: standard positioning
              }`}
            >
              <div className="flex items-center justify-center w-8 h-5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full cursor-move shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-gray-600">
                <Move className="w-2.5 h-2.5 text-white drop-shadow-sm" />
                {/* 🎯 Subtle drag hint */}
                <div className="absolute -top-0.5 left-1/2 w-0.5 h-0.5 bg-gray-400 rounded-full transform -translate-x-1/2 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* 🎨 ENHANCED: Content wrapper with smart text styling */}
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
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-1 w-full px-3 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="Enter your idea..."
                  style={{
                    minHeight: "40px",
                    transition: "none", // 🔥 No transitions on textarea
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
                  // 🎨 Apply smart text color based on background contrast
                  color: textColor,
                  // Apply opacity from drawing tools but keep text readable
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

          {/* 🎯 COMPACT: Action buttons with smaller size */}
          {(isHovered || selected) && !isEditing && !isResizing && (
            <div
              className={`absolute flex gap-0.5 z-20 transition-all duration-200 ${
                nodeShape === "diamond"
                  ? "top-0 right-0 transform translate-x-5 -translate-y-5 -rotate-45" // Diamond: counter-rotate and position outside diamond bounds
                  : nodeShape === "circle"
                  ? "-top-1 -right-1" // Circle: standard positioning
                  : nodeShape === "triangle"
                  ? "-top-1 -right-1" // Triangle: standard positioning
                  : "-top-1 -right-1" // Rectangle: standard positioning
              }`}
            >
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
                {/* 🎯 Compact tooltip */}
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
                {/* 🎯 Compact tooltip */}
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
                {/* 🎯 Compact tooltip */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-1 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Delete
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 🎨 ENHANCED: Selection indicator with drawing tool info */}
        {selected && !isResizing && (
          <div
            className={`absolute z-10 transition-all duration-200 ${
              nodeShape === "diamond"
                ? "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 -rotate-45" // Diamond: counter-rotate and position outside diamond bounds
                : nodeShape === "circle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2" // Circle: standard positioning
                : nodeShape === "triangle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2" // Triangle: standard positioning
                : "-bottom-4 left-1/2 transform -translate-x-1/2" // Rectangle: standard positioning
            }`}
          >
            <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-lg border border-blue-400">
              <span className="flex items-center gap-1">
                <span>
                  {Math.round(optimalWidth)}×{Math.round(optimalHeight)}
                </span>
                <span className="text-blue-100">
                  {getShapeEmoji(nodeShape)}
                </span>
                {/* 🎨 Show custom styling indicator */}
                {hasCustomStyling && (
                  <span
                    className="text-blue-200"
                    title="Custom styling applied"
                  >
                    🎨
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* 🚀 ENHANCED: Shape-aware resize indicator with better visibility */}
        {isResizing && (
          <div
            className={`absolute z-10 ${
              nodeShape === "diamond"
                ? "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 -rotate-45" // Diamond: counter-rotate and position outside diamond bounds
                : nodeShape === "circle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2" // Circle: standard positioning
                : nodeShape === "triangle"
                ? "-bottom-4 left-1/2 transform -translate-x-1/2" // Triangle: standard positioning
                : "-bottom-4 left-1/2 transform -translate-x-1/2" // Rectangle: standard positioning
            }`}
          >
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg border border-purple-400">
              <span className="flex items-center gap-1">
                <span className="animate-pulse">Resizing...</span>
                <span className="font-bold">
                  {Math.round(optimalWidth)}×{Math.round(optimalHeight)}
                </span>
                <span className="text-purple-100">
                  {getShapeEmoji(nodeShape)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
