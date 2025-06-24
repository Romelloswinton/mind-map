import React, { useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react"
import { Trash2, Plus, Edit3, Check, X, Move } from "lucide-react"
import { MindMapNodeData, NodeShape } from "@/src/stores/mind-map-store"
import { ShapeOutline } from "./shape-outline"

// 🚀 INSTANT RESIZE CSS: Inject styles for ultra-fast resizing
const instantResizeStyles = `
  /* 🔥 CRITICAL: Remove ALL transitions during resize */
  .react-flow__node[data-resizing="true"] {
    transition: none !important;
  }
  
  .react-flow__node[data-resizing="true"] * {
    transition: none !important;
    animation: none !important;
  }
  
  /* 🚀 Optimize resize handles for instant feedback */
  .react-flow__resize-control {
    transition: none !important;
  }
  
  /* 🔥 Disable outline animations during resize */
  .react-flow__node[data-resizing="true"] .resize-outline {
    animation: none !important;
    transition: none !important;
  }
`

// Inject styles once
if (
  typeof document !== "undefined" &&
  !document.getElementById("instant-resize-styles")
) {
  const styleSheet = document.createElement("style")
  styleSheet.id = "instant-resize-styles"
  styleSheet.textContent = instantResizeStyles
  document.head.appendChild(styleSheet)
}

interface MindMapNodeProps extends NodeProps {
  data: MindMapNodeData
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

  // 🔥 INSTANT: Ultra-fast resize handlers with minimal processing
  const handleResize = useCallback(
    (event: any, data: any) => {
      // Minimal logging for performance
      // console.log("🔄 RESIZE:", id, data?.width, data?.height)
    },
    [id]
  )

  const handleResizeStart = useCallback(
    (event: any) => {
      console.log("🎯 RESIZE START:", id)
      setIsResizing(true)
    },
    [id]
  )

  const handleResizeEnd = useCallback(
    (event: any, data: any) => {
      console.log("✅ RESIZE END:", id)
      setIsResizing(false)
    },
    [id]
  )

  // Calculate actual dimensions with proper fallbacks
  const actualWidth = measured?.width || style?.width || width || 200
  const actualHeight = measured?.height || style?.height || height || 120

  // 🔥 OPTIMIZED: Get dimensions with minimal computation
  const getOptimalDimensions = (shape: NodeShape = "rectangle") => {
    switch (shape) {
      case "circle":
      case "diamond":
        const size = Math.max(actualWidth, actualHeight)
        return { width: size, height: size }
      case "triangle":
      case "rectangle":
      default:
        return { width: actualWidth, height: actualHeight }
    }
  }

  const nodeShape = data.shape || "rectangle"
  const { width: optimalWidth, height: optimalHeight } =
    getOptimalDimensions(nodeShape)

  // 🔥 INSTANT RESIZE: Ultra-responsive NodeResizer configuration
  const getResizerProps = (shape: NodeShape = "rectangle") => {
    const baseProps = {
      // 🚀 PERFORMANCE: Completely hidden resize lines for max speed
      color: "transparent",
      lineStyle: {
        display: "none",
        opacity: 0,
        border: "none",
        outline: "none",
        visibility: "hidden",
        background: "transparent",
        transition: "none", // 🔥 KEY: Remove all transitions
      } as React.CSSProperties,
      isVisible: selected,
      onResize: handleResize,
      onResizeStart: handleResizeStart,
      onResizeEnd: handleResizeEnd,
      // 🚀 INSTANT: Ultra-responsive handles with enhanced visibility
      handleStyle: {
        background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
        border: "3px solid #fff",
        borderRadius: "50%",
        width: "12px",
        height: "12px",
        boxShadow: `
          0 2px 8px rgba(255, 107, 107, 0.4),
          0 1px 3px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
        zIndex: 1000,
        transform: "translate(-50%, -50%)",
        transition: "none", // 🔥 CRITICAL: No animation delays
        willChange: "auto", // 🚀 Optimize for frequent changes
        cursor: "grab",
      } as React.CSSProperties,
    }

    // Shape-specific optimized configurations
    switch (shape) {
      case "circle":
        return {
          ...baseProps,
          keepAspectRatio: true,
          minWidth: 80,
          minHeight: 80,
          maxWidth: 400,
          maxHeight: 400,
        }

      case "diamond":
        return {
          ...baseProps,
          keepAspectRatio: true,
          minWidth: 80,
          minHeight: 80,
          maxWidth: 400,
          maxHeight: 400,
        }

      case "triangle":
        return {
          ...baseProps,
          keepAspectRatio: false,
          minWidth: 100,
          minHeight: 80,
          maxWidth: 500,
          maxHeight: 300,
        }

      case "rectangle":
      default:
        return {
          ...baseProps,
          keepAspectRatio: false,
          minWidth: 120,
          minHeight: 80,
          maxWidth: 500,
          maxHeight: 400,
        }
    }
  }

  // 🔥 INSTANT: Shape styling with conditional transitions
  const getShapeStyles = (shape: NodeShape = "rectangle") => {
    const baseStyle = {
      width: `${optimalWidth}px`,
      height: `${optimalHeight}px`,
      padding: "16px",
      boxSizing: "border-box" as const,
      backgroundColor: data.color,
      position: "relative" as const,
      // 🚀 CONDITIONAL TRANSITIONS: Only animate when NOT resizing
      transition: isResizing ? "none" : "all 0.2s ease",
      willChange: isResizing ? "width, height" : "auto", // 🔥 Optimize for resize
    }

    const shapeStyles = {
      rectangle: {
        ...baseStyle,
        borderRadius: "12px",
      },
      circle: {
        ...baseStyle,
        borderRadius: "50%",
        width: `${optimalWidth}px`,
        height: `${optimalWidth}px`,
      },
      diamond: {
        ...baseStyle,
        borderRadius: "4px",
        transform: "rotate(45deg)",
        transformOrigin: "center",
        width: `${optimalWidth}px`,
        height: `${optimalWidth}px`,
      },
      triangle: {
        ...baseStyle,
        borderRadius: "0",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
      },
    }

    return shapeStyles[shape] || shapeStyles.rectangle
  }

  // 🔥 INSTANT: Content wrapper with no resize transitions
  const getContentWrapperStyle = (shape: NodeShape = "rectangle") => {
    const contentPadding = 32

    const baseStyle = {
      width: `${optimalWidth - contentPadding}px`,
      height: `${optimalHeight - contentPadding}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // 🚀 NO TRANSITIONS during resize
      transition: isResizing ? "none" : "all 0.2s ease",
    }

    if (shape === "diamond") {
      return {
        ...baseStyle,
        transform: "rotate(-45deg)",
        transformOrigin: "center",
        width: `${optimalWidth - contentPadding}px`,
        height: `${optimalWidth - contentPadding}px`,
      }
    }

    if (shape === "circle") {
      return {
        ...baseStyle,
        width: `${optimalWidth - contentPadding}px`,
        height: `${optimalWidth - contentPadding}px`,
      }
    }

    if (shape === "triangle") {
      return {
        ...baseStyle,
        paddingTop: "20px",
        height: `${optimalHeight - contentPadding - 20}px`,
      }
    }

    return baseStyle
  }

  // 🔥 INSTANT: Classes with conditional animations
  const getShapeClasses = (shape: NodeShape = "rectangle") => {
    const baseClasses = `
      relative border-2 shadow-lg select-none
      ${
        // 🚀 CONDITIONAL TRANSITIONS: Instant during resize
        isResizing
          ? "transition-none border-transparent shadow-none !ring-0 !outline-none"
          : "transition-all duration-200"
      }
      ${
        isResizing
          ? ""
          : selected
          ? "border-blue-500 shadow-blue-200 shadow-xl ring-2 ring-blue-200"
          : "border-gray-300 hover:border-gray-400"
      }
      ${isHovered && !isResizing ? "shadow-xl" : ""}
      ${isEditing ? "border-purple-400 shadow-purple-200" : "cursor-move"}
    `

    const shapeClasses = {
      rectangle: `${baseClasses} rounded-xl`,
      circle: `${baseClasses}`,
      diamond: `${baseClasses} overflow-visible`,
      triangle: `${baseClasses}`,
    }

    return shapeClasses[shape] || shapeClasses.rectangle
  }

  // Shape emoji for indicator
  const getShapeEmoji = (shape: NodeShape = "rectangle") => {
    const emojis = {
      rectangle: "⬜",
      circle: "⭕",
      diamond: "💎",
      triangle: "🔺",
    }
    return emojis[shape] || emojis.rectangle
  }

  return (
    <div className="relative">
      {/* 🚀 INSTANT: Ultra-responsive NodeResizer */}
      <NodeResizer {...getResizerProps(nodeShape)} />

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

      {/* 🚀 INSTANT: Shape container with conditional transitions */}
      <div
        className={getShapeClasses(nodeShape)}
        style={getShapeStyles(nodeShape)}
        data-shape={nodeShape}
        data-resizing={isResizing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
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
            <div className="flex items-center justify-center w-10 h-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full cursor-move shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-gray-600">
              <Move className="w-3 h-3 text-white drop-shadow-sm" />
              {/* 🎯 Subtle drag hint */}
              <div className="absolute -top-1 left-1/2 w-1 h-1 bg-gray-400 rounded-full transform -translate-x-1/2 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* 🚀 INSTANT: Content wrapper with conditional transitions */}
        <div
          className="relative z-10"
          style={getContentWrapperStyle(nodeShape)}
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
              <div className="flex justify-center gap-2 mt-2 flex-shrink-0">
                <button
                  onClick={handleSaveEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                  title="Save (Enter)"
                >
                  <Check size={12} />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                  title="Cancel (Esc)"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-white break-words text-center overflow-hidden">
              {data.text}
            </div>
          )}
        </div>

        {/* 🎯 ENHANCED: Shape-aware action buttons with perfect positioning */}
        {(isHovered || selected) && !isEditing && !isResizing && (
          <div
            className={`absolute flex gap-1.5 z-20 transition-all duration-200 ${
              nodeShape === "diamond"
                ? "top-0 right-0 transform translate-x-6 -translate-y-6 -rotate-45" // Diamond: counter-rotate and position outside diamond bounds
                : nodeShape === "circle"
                ? "-top-2 -right-2" // Circle: standard positioning
                : nodeShape === "triangle"
                ? "-top-2 -right-2" // Triangle: standard positioning
                : "-top-2 -right-2" // Rectangle: standard positioning
            }`}
          >
            <button
              onClick={handleAddChild}
              onMouseDown={(e) => e.stopPropagation()}
              className="group relative p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              title="Add Child Node"
            >
              <Plus
                size={14}
                className="transition-transform group-hover:rotate-90"
              />
              {/* 🎯 Enhanced tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Add Child
              </div>
            </button>

            <button
              onClick={handleEditClick}
              onMouseDown={(e) => e.stopPropagation()}
              className="group relative p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              title="Edit Text"
            >
              <Edit3
                size={14}
                className="transition-transform group-hover:scale-110"
              />
              {/* 🎯 Enhanced tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Edit Text
              </div>
            </button>

            <button
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()}
              className="group relative p-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              title="Delete Node"
            >
              <Trash2
                size={14}
                className="transition-transform group-hover:scale-110"
              />
              {/* 🎯 Enhanced tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Delete Node
              </div>
            </button>
          </div>
        )}

        {/* 🎯 ENHANCED: Shape-aware selection indicator with perfect positioning */}
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
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-lg border border-blue-400">
              <span className="flex items-center gap-2">
                <span>
                  {Math.round(optimalWidth)}×{Math.round(optimalHeight)}
                </span>
                <span className="text-blue-100">
                  {getShapeEmoji(nodeShape)}
                </span>
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
            <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg border border-purple-400">
              <span className="flex items-center gap-2">
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
