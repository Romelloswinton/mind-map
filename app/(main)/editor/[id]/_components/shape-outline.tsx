import React from "react"
import { NodeShape } from "@/src/stores/mind-map-store"

interface ShapeOutlineProps {
  shape: NodeShape
  width: number
  height: number
  padding?: number
  strokeWidth?: number
  color?: string
  animate?: boolean
}

// 🔥 PERFECT FIT: Rectangle outline with exact positioning
const RectangleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
}> = ({ width, height, padding, strokeWidth, color }) => {
  return (
    <div
      className="absolute resize-outline pointer-events-none"
      style={{
        // 🎯 EXACT POSITIONING: Match the node container exactly
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${width + (strokeWidth + padding) * 2}px`,
        height: `${height + (strokeWidth + padding) * 2}px`,
        border: `${strokeWidth}px solid ${color}`,
        borderRadius: `${12 + padding}px`, // Match node's 12px radius + padding
        zIndex: 999, // Below resize handles but above everything else
        boxSizing: "border-box",
      }}
    />
  )
}

// 🔥 PERFECT CIRCLE: Outline that matches circular nodes exactly
const CircleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
}> = ({ width, height, padding, strokeWidth, color }) => {
  // For circles, we use the width (which should equal height in the fixed node)
  const circleSize = width

  return (
    <div
      className="absolute resize-outline pointer-events-none"
      style={{
        // 🎯 CENTERED POSITIONING: Perfect circle alignment
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${circleSize + (strokeWidth + padding) * 2}px`,
        height: `${circleSize + (strokeWidth + padding) * 2}px`,
        border: `${strokeWidth}px solid ${color}`,
        borderRadius: "50%",
        zIndex: 999,
        boxSizing: "border-box",
      }}
    />
  )
}

// 🔥 DIAMOND PRECISION: SVG-based outline that matches rotated diamond exactly
const DiamondOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
}> = ({ width, height, padding, strokeWidth, color }) => {
  // For diamonds, use the square dimensions (width should equal height)
  const size = width
  const totalSize = size + (strokeWidth + padding) * 2
  const center = totalSize / 2
  const halfDiagonal = (size + padding) / 2

  // 🎯 MATHEMATICAL PRECISION: Calculate exact diamond points
  const points = [
    [center, strokeWidth + padding / 2], // Top point
    [totalSize - strokeWidth - padding / 2, center], // Right point
    [center, totalSize - strokeWidth - padding / 2], // Bottom point
    [strokeWidth + padding / 2, center], // Left point
  ]

  const pathData = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} L ${points[3][0]} ${points[3][1]} Z`

  return (
    <svg
      className="absolute resize-outline pointer-events-none"
      style={{
        // 🎯 EXACT POSITIONING: Match the rotated node container
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${totalSize}px`,
        height: `${totalSize}px`,
        zIndex: 999,
      }}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 🔥 TRIANGLE PRECISION: SVG outline matching triangle clip-path exactly
const TriangleOutline: React.FC<{
  width: number
  height: number
  padding: number
  strokeWidth: number
  color: string
}> = ({ width, height, padding, strokeWidth, color }) => {
  const totalWidth = width + (strokeWidth + padding) * 2
  const totalHeight = height + (strokeWidth + padding) * 2

  // 🎯 EXACT TRIANGLE GEOMETRY: Match the clip-path polygon points
  const topX = totalWidth / 2
  const topY = strokeWidth + padding / 2
  const bottomLeftX = strokeWidth + padding / 2
  const bottomLeftY = totalHeight - strokeWidth - padding / 2
  const bottomRightX = totalWidth - strokeWidth - padding / 2
  const bottomRightY = totalHeight - strokeWidth - padding / 2

  const pathData = `M ${topX} ${topY} L ${bottomLeftX} ${bottomLeftY} L ${bottomRightX} ${bottomRightY} Z`

  return (
    <svg
      className="absolute resize-outline pointer-events-none"
      style={{
        // 🎯 PRECISE POSITIONING: Match triangle container exactly
        top: `-${strokeWidth + padding}px`,
        left: `-${strokeWidth + padding}px`,
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        zIndex: 999,
      }}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 🔥 MAIN COMPONENT: Shape-aware outline router with perfect positioning
export const ShapeOutline: React.FC<ShapeOutlineProps> = ({
  shape,
  width,
  height,
  padding = 2, // Minimal padding for tight fit
  strokeWidth = 2,
  color = "#3b82f6",
  animate = false, // 🚀 DEFAULT: No animations for instant feedback
}) => {
  const outlineProps = {
    width,
    height,
    padding,
    strokeWidth,
    color,
  }

  // 🎯 STRATEGY: Route to shape-specific outline with perfect positioning
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

// 🔥 BONUS: Advanced outline with gradient and glow effects
export const AdvancedShapeOutline: React.FC<
  ShapeOutlineProps & {
    gradientColors?: [string, string]
    dashArray?: string
    glowIntensity?: number
  }
> = ({
  shape,
  width,
  height,
  padding = 2,
  strokeWidth = 2,
  color = "#3b82f6",
  gradientColors,
  dashArray,
  glowIntensity = 0.2,
}) => {
  const gradientId = `outline-gradient-${Math.random()
    .toString(36)
    .substr(2, 9)}`
  const glowId = `outline-glow-${Math.random().toString(36).substr(2, 9)}`

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
    let svgStyle: React.CSSProperties = {}

    if (shape === "diamond") {
      const center = totalWidth / 2
      const halfDiagonal = (size + padding) / 2
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

    svgStyle = {
      top: `-${strokeWidth + padding}px`,
      left: `-${strokeWidth + padding}px`,
    }

    return (
      <svg
        className="absolute resize-outline pointer-events-none"
        style={{
          ...svgStyle,
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          zIndex: 999,
        }}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      >
        <defs>
          {gradientColors && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
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
          strokeDasharray={dashArray}
          filter={`url(#${glowId})`}
        />
      </svg>
    )
  }

  // For simple shapes (circle and rectangle), use the basic outline
  return (
    <ShapeOutline
      shape={shape}
      width={width}
      height={height}
      padding={padding}
      strokeWidth={strokeWidth}
      color={color}
    />
  )
}
