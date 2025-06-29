// Fixed ShapeOutline Component - Updated Type Consistency
// File: components/ShapeOutline.tsx

import React, { useEffect, useState } from "react"

// ✅ FIXED: Import from unified types
import type { NodeShape } from "@/src/types"

// ✅ ENHANCED: Interface with drawing tools integration
interface ShapeOutlineProps {
  shape: NodeShape
  width: number
  height: number
  padding?: number
  strokeWidth?: number
  color?: string
  animate?: boolean
  // ✅ Drawing tools integration properties
  strokeStyle?: "solid" | "dashed" | "dotted"
  opacity?: number
  glow?: boolean
  pulseOnUpdate?: boolean
  isSelected?: boolean
  isCustomized?: boolean
}

// ✅ ENHANCED: Rectangle outline with drawing tools styling
const RectangleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  glow: boolean
  isSelected: boolean
  isCustomized: boolean
}> = ({
  width,
  height,
  padding,
  strokeWidth,
  color,
  strokeStyle,
  opacity,
  glow,
  isSelected,
  isCustomized,
}) => {
  // Dynamic stroke dash array based on style
  const getStrokeDashArray = () => {
    switch (strokeStyle) {
      case "dashed":
        return "8,4"
      case "dotted":
        return "2,2"
      default:
        return "none"
    }
  }

  return (
    <div
      className={`absolute resize-outline pointer-events-none transition-all duration-200 ${
        isSelected ? "animate-pulse" : ""
      } ${isCustomized ? "ring-2 ring-purple-400 ring-opacity-50" : ""}`}
      style={{
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${width + (strokeWidth + padding) * 2}px`,
        height: `${height + (strokeWidth + padding) * 2}px`,
        border: `${strokeWidth}px ${strokeStyle} ${color}`,
        borderRadius: `${12 + padding}px`,
        zIndex: 999,
        boxSizing: "border-box",
        opacity: opacity,
        boxShadow: glow
          ? `0 0 ${strokeWidth * 2}px ${color}, 0 0 ${
              strokeWidth * 4
            }px ${color}40`
          : "none",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
      }}
    />
  )
}

// ✅ ENHANCED: Circle outline with drawing tools styling
const CircleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  glow: boolean
  isSelected: boolean
  isCustomized: boolean
}> = ({
  width,
  height,
  padding,
  strokeWidth,
  color,
  strokeStyle,
  opacity,
  glow,
  isSelected,
  isCustomized,
}) => {
  const circleSize = width

  return (
    <div
      className={`absolute resize-outline pointer-events-none transition-all duration-200 ${
        isSelected ? "animate-pulse" : ""
      } ${isCustomized ? "ring-2 ring-purple-400 ring-opacity-50" : ""}`}
      style={{
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${circleSize + (strokeWidth + padding) * 2}px`,
        height: `${circleSize + (strokeWidth + padding) * 2}px`,
        border: `${strokeWidth}px ${strokeStyle} ${color}`,
        borderRadius: "50%",
        zIndex: 999,
        boxSizing: "border-box",
        opacity: opacity,
        boxShadow: glow
          ? `0 0 ${strokeWidth * 2}px ${color}, 0 0 ${
              strokeWidth * 4
            }px ${color}40`
          : "none",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
      }}
    />
  )
}

// ✅ ENHANCED: Diamond outline with drawing tools styling
const DiamondOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  glow: boolean
  isSelected: boolean
  isCustomized: boolean
}> = ({
  width,
  height,
  padding,
  strokeWidth,
  color,
  strokeStyle,
  opacity,
  glow,
  isSelected,
  isCustomized,
}) => {
  const size = width
  const totalSize = size + (strokeWidth + padding) * 2
  const center = totalSize / 2

  const points = [
    [center, strokeWidth + padding / 2],
    [totalSize - strokeWidth - padding / 2, center],
    [center, totalSize - strokeWidth - padding / 2],
    [strokeWidth + padding / 2, center],
  ]

  const pathData = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} L ${points[3][0]} ${points[3][1]} Z`

  const getStrokeDashArray = () => {
    switch (strokeStyle) {
      case "dashed":
        return "8,4"
      case "dotted":
        return "2,2"
      default:
        return undefined
    }
  }

  return (
    <svg
      className={`absolute resize-outline pointer-events-none transition-all duration-200 ${
        isSelected ? "animate-pulse" : ""
      } ${isCustomized ? "drop-shadow-lg" : ""}`}
      style={{
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${totalSize}px`,
        height: `${totalSize}px`,
        zIndex: 999,
        opacity: opacity,
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        filter: glow
          ? `drop-shadow(0 0 ${strokeWidth * 2}px ${color}) drop-shadow(0 0 ${
              strokeWidth * 4
            }px ${color}40)`
          : isCustomized
          ? "drop-shadow(0 0 4px rgba(147, 51, 234, 0.5))"
          : "none",
      }}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
    >
      <defs>
        <linearGradient
          id={`diamond-gradient-${Math.random().toString(36).substr(2, 9)}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke={
          isCustomized
            ? `url(#diamond-gradient-${Math.random()
                .toString(36)
                .substr(2, 9)})`
            : color
        }
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={getStrokeDashArray()}
        className={isSelected ? "animate-pulse" : ""}
      />
    </svg>
  )
}

// ✅ ENHANCED: Triangle outline with drawing tools styling
const TriangleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
  strokeStyle: "solid" | "dashed" | "dotted"
  opacity: number
  glow: boolean
  isSelected: boolean
  isCustomized: boolean
}> = ({
  width,
  height,
  padding,
  strokeWidth,
  color,
  strokeStyle,
  opacity,
  glow,
  isSelected,
  isCustomized,
}) => {
  const totalWidth = width + (strokeWidth + padding) * 2
  const totalHeight = height + (strokeWidth + padding) * 2

  const topX = totalWidth / 2
  const topY = strokeWidth + padding / 2
  const bottomLeftX = strokeWidth + padding / 2
  const bottomLeftY = totalHeight - strokeWidth - padding / 2
  const bottomRightX = totalWidth - strokeWidth - padding / 2
  const bottomRightY = totalHeight - strokeWidth - padding / 2

  const pathData = `M ${topX} ${topY} L ${bottomLeftX} ${bottomLeftY} L ${bottomRightX} ${bottomRightY} Z`

  const getStrokeDashArray = () => {
    switch (strokeStyle) {
      case "dashed":
        return "8,4"
      case "dotted":
        return "2,2"
      default:
        return undefined
    }
  }

  return (
    <svg
      className={`absolute resize-outline pointer-events-none transition-all duration-200 ${
        isSelected ? "animate-pulse" : ""
      } ${isCustomized ? "drop-shadow-lg" : ""}`}
      style={{
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        zIndex: 999,
        opacity: opacity,
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        filter: glow
          ? `drop-shadow(0 0 ${strokeWidth * 2}px ${color}) drop-shadow(0 0 ${
              strokeWidth * 4
            }px ${color}40)`
          : isCustomized
          ? "drop-shadow(0 0 4px rgba(147, 51, 234, 0.5))"
          : "none",
      }}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
    >
      <defs>
        <linearGradient
          id={`triangle-gradient-${Math.random().toString(36).substr(2, 9)}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke={
          isCustomized
            ? `url(#triangle-gradient-${Math.random()
                .toString(36)
                .substr(2, 9)})`
            : color
        }
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={getStrokeDashArray()}
        className={isSelected ? "animate-pulse" : ""}
      />
    </svg>
  )
}

// ✅ ENHANCED: Main component with drawing tools integration
export const ShapeOutline: React.FC<ShapeOutlineProps> = ({
  shape,
  width,
  height,
  padding = 2,
  strokeWidth = 2,
  color = "#3b82f6",
  animate = false,
  strokeStyle = "solid",
  opacity = 1,
  glow = false,
  pulseOnUpdate = false,
  isSelected = false,
  isCustomized = false,
}) => {
  const [justUpdated, setJustUpdated] = useState(false)

  // Trigger update animation when properties change
  useEffect(() => {
    if (pulseOnUpdate) {
      setJustUpdated(true)
      const timer = setTimeout(() => setJustUpdated(false), 600)
      return () => clearTimeout(timer)
    }
  }, [color, strokeWidth, strokeStyle, opacity, pulseOnUpdate])

  const outlineProps = {
    width,
    height,
    padding,
    strokeWidth,
    color,
    strokeStyle,
    opacity,
    glow: glow || justUpdated,
    isSelected: isSelected || justUpdated,
    isCustomized,
  }

  // Route to shape-specific outline with perfect positioning
  switch (shape) {
    case "circle":
      return <CircleOutline {...outlineProps} />

    case "diamond":
      return <DiamondOutline {...outlineProps} />

    case "triangle":
      return <TriangleOutline {...outlineProps} />

    case "rectangle":
    default:
      return <RectangleOutline {...outlineProps} />
  }
}

// ✅ ENHANCED: Advanced outline with more drawing tools features
export const AdvancedShapeOutline: React.FC<
  ShapeOutlineProps & {
    gradientColors?: [string, string]
    dashArray?: string
    glowIntensity?: number
    showCornerMarkers?: boolean
    showCenterPoint?: boolean
    animationType?: "pulse" | "rotate" | "scale" | "glow"
  }
> = ({
  shape,
  width,
  height,
  padding = 2,
  strokeWidth = 2,
  color = "#3b82f6",
  strokeStyle = "solid",
  opacity = 1,
  gradientColors,
  dashArray,
  glowIntensity = 0.2,
  showCornerMarkers = false,
  showCenterPoint = false,
  animationType = "pulse",
  isSelected = false,
  isCustomized = false,
}) => {
  const gradientId = `outline-gradient-${Math.random()
    .toString(36)
    .substr(2, 9)}`
  const glowId = `outline-glow-${Math.random().toString(36).substr(2, 9)}`

  const getAnimationClass = () => {
    if (!isSelected) return ""
    switch (animationType) {
      case "rotate":
        return "animate-spin"
      case "scale":
        return "animate-bounce"
      case "glow":
        return "animate-pulse"
      default:
        return "animate-pulse"
    }
  }

  // For SVG-based shapes (diamond and triangle), add advanced effects
  if (shape === "diamond" || shape === "triangle") {
    const size = shape === "diamond" ? width : width
    const totalWidth =
      shape === "diamond"
        ? size + (strokeWidth + padding) * 2
        : width + (strokeWidth + padding) * 2
    const totalHeight =
      shape === "diamond"
        ? size + (strokeWidth + padding) * 2
        : height + (strokeWidth + padding) * 2

    let pathData = ""

    if (shape === "diamond") {
      const center = totalWidth / 2
      const points = [
        [center, strokeWidth + padding / 2],
        [totalWidth - strokeWidth - padding / 2, center],
        [center, totalWidth - strokeWidth - padding / 2],
        [strokeWidth + padding / 2, center],
      ]
      pathData = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} L ${points[3][0]} ${points[3][1]} Z`
    } else {
      const topX = totalWidth / 2
      const topY = strokeWidth + padding / 2
      const bottomLeftX = strokeWidth + padding / 2
      const bottomLeftY = totalHeight - strokeWidth - padding / 2
      const bottomRightX = totalWidth - strokeWidth - padding / 2
      const bottomRightY = totalHeight - strokeWidth - padding / 2
      pathData = `M ${topX} ${topY} L ${bottomLeftX} ${bottomLeftY} L ${bottomRightX} ${bottomRightY} Z`
    }

    return (
      <div className="relative">
        <svg
          className={`absolute resize-outline pointer-events-none transition-all duration-200 ${getAnimationClass()}`}
          style={{
            top: `-${strokeWidth + padding}px`,
            left: `-${strokeWidth + padding}px`,
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            zIndex: 999,
            opacity: opacity,
            transform: isSelected ? "scale(1.02)" : "scale(1)",
            filter: `drop-shadow(0 0 ${glowIntensity * 10}px ${color}40)`,
          }}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        >
          <defs>
            {gradientColors && (
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={gradientColors[0]} />
                <stop offset="100%" stopColor={gradientColors[1]} />
              </linearGradient>
            )}
            <filter id={glowId}>
              <feGaussianBlur
                stdDeviation={glowIntensity * 3}
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={pathData}
            fill="none"
            stroke={gradientColors ? `url(#${gradientId})` : color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={
              dashArray ||
              (strokeStyle === "dashed"
                ? "8,4"
                : strokeStyle === "dotted"
                ? "2,2"
                : undefined)
            }
            filter={`url(#${glowId})`}
          />

          {/* Corner markers */}
          {showCornerMarkers && shape === "diamond" && (
            <>
              <circle
                cx={totalWidth / 2}
                cy={strokeWidth + padding / 2}
                r="3"
                fill={color}
                opacity="0.7"
              />
              <circle
                cx={totalWidth - strokeWidth - padding / 2}
                cy={totalWidth / 2}
                r="3"
                fill={color}
                opacity="0.7"
              />
              <circle
                cx={totalWidth / 2}
                cy={totalWidth - strokeWidth - padding / 2}
                r="3"
                fill={color}
                opacity="0.7"
              />
              <circle
                cx={strokeWidth + padding / 2}
                cy={totalWidth / 2}
                r="3"
                fill={color}
                opacity="0.7"
              />
            </>
          )}

          {/* Center point marker */}
          {showCenterPoint && (
            <circle
              cx={totalWidth / 2}
              cy={totalHeight / 2}
              r="2"
              fill={color}
              opacity="0.8"
            />
          )}
        </svg>

        {/* Customization indicator */}
        {isCustomized && (
          <div
            className="absolute -top-6 -right-6 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce"
            style={{ zIndex: 1000 }}
          >
            ✨
          </div>
        )}
      </div>
    )
  }

  // For simple shapes (circle and rectangle), use the enhanced basic outline
  return (
    <div className="relative">
      <ShapeOutline
        shape={shape}
        width={width}
        height={height}
        padding={padding}
        strokeWidth={strokeWidth}
        color={gradientColors ? gradientColors[0] : color}
        strokeStyle={strokeStyle}
        opacity={opacity}
        glow={glowIntensity > 0}
        isSelected={isSelected}
        isCustomized={isCustomized}
        pulseOnUpdate={true}
      />

      {/* Customization indicator for simple shapes */}
      {isCustomized && (
        <div
          className="absolute -top-6 -right-6 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce"
          style={{ zIndex: 1000 }}
        >
          ✨
        </div>
      )}

      {/* Corner markers for rectangles and circles */}
      {showCornerMarkers && shape === "rectangle" && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </>
      )}
    </div>
  )
}

// ✅ ENHANCED: Preset configurations for common use cases
export const PresetShapeOutlines = {
  selection: (
    props: Omit<
      ShapeOutlineProps,
      "color" | "strokeWidth" | "glow" | "isSelected"
    >
  ) => (
    <ShapeOutline
      {...props}
      color="#3b82f6"
      strokeWidth={2}
      glow={true}
      isSelected={true}
    />
  ),

  customization: (
    props: Omit<
      ShapeOutlineProps,
      "color" | "strokeWidth" | "glow" | "isCustomized"
    >
  ) => (
    <ShapeOutline
      {...props}
      color="#9333ea"
      strokeWidth={3}
      glow={true}
      isCustomized={true}
    />
  ),

  resize: (
    props: Omit<ShapeOutlineProps, "color" | "strokeWidth" | "animate">
  ) => (
    <ShapeOutline {...props} color="#f59e0b" strokeWidth={2} animate={true} />
  ),

  error: (props: Omit<ShapeOutlineProps, "color" | "strokeWidth" | "glow">) => (
    <ShapeOutline {...props} color="#ef4444" strokeWidth={2} glow={true} />
  ),
}
