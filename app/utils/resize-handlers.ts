import { useCallback } from "react"
import { NodeShape } from "@/src/stores/mind-map-store"

// 🚀 INSTANT RESIZE CSS: Inject styles for ultra-fast resizing
export const instantResizeStyles = `
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
export const injectInstantResizeStyles = () => {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("instant-resize-styles")
  ) {
    const styleSheet = document.createElement("style")
    styleSheet.id = "instant-resize-styles"
    styleSheet.textContent = instantResizeStyles
    document.head.appendChild(styleSheet)
  }
}

// 🔥 INSTANT: Ultra-fast resize handlers with minimal processing
export const useResizeHandlers = (nodeId: string) => {
  const handleResize = useCallback(
    (event: any, data: any) => {
      // Minimal logging for performance
      // console.log("🔄 RESIZE:", nodeId, data?.width, data?.height)
    },
    [nodeId]
  )

  const handleResizeStart = useCallback(
    (event: any) => {
      console.log("🎯 RESIZE START:", nodeId)
      return true // Return true to allow resize
    },
    [nodeId]
  )

  const handleResizeEnd = useCallback(
    (event: any, data: any) => {
      console.log("✅ RESIZE END:", nodeId)
      return true // Return true to complete resize
    },
    [nodeId]
  )

  return {
    handleResize,
    handleResizeStart,
    handleResizeEnd,
  }
}

// 🔥 INSTANT RESIZE: Ultra-responsive NodeResizer configuration
export const getResizerProps = (
  shape: NodeShape = "rectangle",
  selected: boolean,
  resizeHandlers: {
    handleResize: (event: any, data: any) => void
    handleResizeStart: (event: any) => boolean | void
    handleResizeEnd: (event: any, data: any) => boolean | void
  }
) => {
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
    onResize: resizeHandlers.handleResize,
    onResizeStart: resizeHandlers.handleResizeStart,
    onResizeEnd: resizeHandlers.handleResizeEnd,
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

// Calculate optimal dimensions for different shapes
export const getOptimalDimensions = (
  actualWidth: number,
  actualHeight: number,
  shape: NodeShape = "rectangle"
) => {
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

// 🔥 INSTANT: Shape styling with conditional transitions
export const getShapeStyles = (
  optimalWidth: number,
  optimalHeight: number,
  isResizing: boolean,
  color: string,
  shape: NodeShape = "rectangle"
) => {
  const baseStyle = {
    width: `${optimalWidth}px`,
    height: `${optimalHeight}px`,
    padding: "16px",
    boxSizing: "border-box" as const,
    backgroundColor: color,
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
export const getContentWrapperStyle = (
  optimalWidth: number,
  optimalHeight: number,
  isResizing: boolean,
  shape: NodeShape = "rectangle"
) => {
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
export const getShapeClasses = (
  isResizing: boolean,
  selected: boolean,
  isHovered: boolean,
  isEditing: boolean,
  shape: NodeShape = "rectangle"
) => {
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
export const getShapeEmoji = (shape: NodeShape = "rectangle") => {
  const emojis = {
    rectangle: "⬜",
    circle: "⭕",
    diamond: "💎",
    triangle: "🔺",
  }
  return emojis[shape] || emojis.rectangle
}
