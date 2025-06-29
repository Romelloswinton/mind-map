// File: app/mind-map/[id]/_components/selection/selection-box.tsx

"use client"

import { useMemo } from "react"
import { Viewport } from "@xyflow/react"

interface SelectionBoxProps {
  startX: number
  startY: number
  endX: number
  endY: number
  viewport: Viewport
  isVisible: boolean
  className?: string
}

export function SelectionBox({
  startX,
  startY,
  endX,
  endY,
  viewport,
  isVisible,
  className = "",
}: SelectionBoxProps) {
  // Calculate screen coordinates from canvas coordinates
  const screenCoords = useMemo(() => {
    const screenStartX = startX * viewport.zoom + viewport.x
    const screenStartY = startY * viewport.zoom + viewport.y
    const screenEndX = endX * viewport.zoom + viewport.x
    const screenEndY = endY * viewport.zoom + viewport.y

    return {
      left: Math.min(screenStartX, screenEndX),
      top: Math.min(screenStartY, screenEndY),
      width: Math.abs(screenEndX - screenStartX),
      height: Math.abs(screenEndY - screenStartY),
    }
  }, [startX, startY, endX, endY, viewport])

  if (!isVisible || screenCoords.width === 0 || screenCoords.height === 0) {
    return null
  }

  return (
    <div
      className={`
        absolute 
        pointer-events-none 
        border-2 
        border-blue-500 
        bg-blue-100 
        bg-opacity-20 
        rounded-sm
        transition-opacity
        duration-150
        z-40
        ${className}
      `}
      style={{
        left: screenCoords.left,
        top: screenCoords.top,
        width: screenCoords.width,
        height: screenCoords.height,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        borderStyle: "dashed",
        borderWidth: "1px",
      }}
    >
      {/* Optional selection info overlay */}
      {screenCoords.width > 50 && screenCoords.height > 30 && (
        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded opacity-80">
          {Math.round(screenCoords.width)}×{Math.round(screenCoords.height)}
        </div>
      )}

      {/* Corner handles for visual feedback */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
    </div>
  )
}

// Alternative selection box with different styling options
export function SelectionBoxMinimal({
  startX,
  startY,
  endX,
  endY,
  viewport,
  isVisible,
  color = "#3b82f6",
  fillOpacity = 0.1,
  strokeWidth = 1,
  strokeStyle = "dashed",
}: SelectionBoxProps & {
  color?: string
  fillOpacity?: number
  strokeWidth?: number
  strokeStyle?: "solid" | "dashed" | "dotted"
}) {
  const screenCoords = useMemo(() => {
    const screenStartX = startX * viewport.zoom + viewport.x
    const screenStartY = startY * viewport.zoom + viewport.y
    const screenEndX = endX * viewport.zoom + viewport.x
    const screenEndY = endY * viewport.zoom + viewport.y

    return {
      left: Math.min(screenStartX, screenEndX),
      top: Math.min(screenStartY, screenEndY),
      width: Math.abs(screenEndX - screenStartX),
      height: Math.abs(screenEndY - screenStartY),
    }
  }, [startX, startY, endX, endY, viewport])

  if (!isVisible || screenCoords.width === 0 || screenCoords.height === 0) {
    return null
  }

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: screenCoords.left,
        top: screenCoords.top,
        width: screenCoords.width,
        height: screenCoords.height,
        border: `${strokeWidth}px ${strokeStyle} ${color}`,
        backgroundColor: `${color}${Math.round(fillOpacity * 255)
          .toString(16)
          .padStart(2, "0")}`,
      }}
    />
  )
}

// Animated selection box for more dynamic feedback
export function SelectionBoxAnimated({
  startX,
  startY,
  endX,
  endY,
  viewport,
  isVisible,
  className = "",
}: SelectionBoxProps) {
  const screenCoords = useMemo(() => {
    const screenStartX = startX * viewport.zoom + viewport.x
    const screenStartY = startY * viewport.zoom + viewport.y
    const screenEndX = endX * viewport.zoom + viewport.x
    const screenEndY = endY * viewport.zoom + viewport.y

    return {
      left: Math.min(screenStartX, screenEndX),
      top: Math.min(screenStartY, screenEndY),
      width: Math.abs(screenEndX - screenStartX),
      height: Math.abs(screenEndY - screenStartY),
    }
  }, [startX, startY, endX, endY, viewport])

  if (!isVisible || screenCoords.width === 0 || screenCoords.height === 0) {
    return null
  }

  return (
    <div
      className={`
        absolute 
        pointer-events-none 
        border-2 
        border-blue-500 
        bg-blue-50 
        bg-opacity-30
        rounded-sm
        animate-pulse
        z-40
        ${className}
      `}
      style={{
        left: screenCoords.left,
        top: screenCoords.top,
        width: screenCoords.width,
        height: screenCoords.height,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        borderStyle: "solid",
        borderWidth: "2px",
        boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
      }}
    >
      {/* Animated border effect */}
      <div
        className="absolute inset-0 border-2 border-blue-400 rounded-sm opacity-60"
        style={{
          animation: "selection-border 1.5s ease-in-out infinite",
        }}
      />

      <style jsx>{`
        @keyframes selection-border {
          0%,
          100% {
            border-color: rgba(59, 130, 246, 0.6);
            transform: scale(1);
          }
          50% {
            border-color: rgba(59, 130, 246, 0.9);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}
