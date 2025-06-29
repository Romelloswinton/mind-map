// File: app/mind-map/[id]/_components/eraser-tool/eraser-tool-integration.tsx

"use client"

import { useCallback, useEffect, useRef } from "react"
import { Viewport } from "@xyflow/react"
import type { EraserState, EraserMode } from "@/src/types/drawing-tools"

interface EraserToolIntegrationProps {
  activeTool: string | null
  viewport: Viewport
  eraserState: EraserState
  onEraseStart: (position: { x: number; y: number }) => void
  onEraseUpdate: (position: { x: number; y: number }) => void
  onEraseEnd: () => void
  eraserSize?: number
  className?: string
}

export function EraserToolIntegration({
  activeTool,
  viewport,
  eraserState,
  onEraseStart,
  onEraseUpdate,
  onEraseEnd,
  eraserSize = 20,
  className = "",
}: EraserToolIntegrationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: screenX, y: screenY }

      const rect = containerRef.current.getBoundingClientRect()
      const relativeX = screenX - rect.left
      const relativeY = screenY - rect.top

      return {
        x: (relativeX - viewport.x) / viewport.zoom,
        y: (relativeY - viewport.y) / viewport.zoom,
      }
    },
    [viewport]
  )

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number) => {
      return {
        x: canvasX * viewport.zoom + viewport.x,
        y: canvasY * viewport.zoom + viewport.y,
      }
    },
    [viewport]
  )

  // Handle mouse down
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "eraser") return

      event.preventDefault()
      event.stopPropagation()

      const canvasPoint = screenToCanvas(event.clientX, event.clientY)
      onEraseStart(canvasPoint)

      console.log("🧹 Eraser mouse down at:", canvasPoint)
    },
    [activeTool, screenToCanvas, onEraseStart]
  )

  // Handle mouse move
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "eraser" || !eraserState.isErasing) return

      const canvasPoint = screenToCanvas(event.clientX, event.clientY)
      onEraseUpdate(canvasPoint)
    },
    [activeTool, eraserState.isErasing, screenToCanvas, onEraseUpdate]
  )

  // Handle mouse up
  const handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "eraser" || !eraserState.isErasing) return

      event.preventDefault()
      onEraseEnd()

      console.log("🧹 Eraser mouse up")
    },
    [activeTool, eraserState.isErasing, onEraseEnd]
  )

  // Global mouse event handlers for when dragging outside component
  useEffect(() => {
    if (activeTool !== "eraser" || !eraserState.isErasing) return

    const handleGlobalMouseMove = (event: MouseEvent) => {
      const canvasPoint = screenToCanvas(event.clientX, event.clientY)
      onEraseUpdate(canvasPoint)
    }

    const handleGlobalMouseUp = (event: MouseEvent) => {
      event.preventDefault()
      onEraseEnd()
    }

    document.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [
    activeTool,
    eraserState.isErasing,
    screenToCanvas,
    onEraseUpdate,
    onEraseEnd,
  ])

  // Render eraser cursor
  const renderEraserCursor = () => {
    if (activeTool !== "eraser" || !eraserState.brushPosition) return null

    const screenPos = canvasToScreen(
      eraserState.brushPosition.x,
      eraserState.brushPosition.y
    )
    const scaledSize = eraserSize * viewport.zoom

    return (
      <div
        className="absolute pointer-events-none border-2 border-red-500 border-dashed rounded-full bg-red-100 bg-opacity-30"
        style={{
          left: screenPos.x - scaledSize / 2,
          top: screenPos.y - scaledSize / 2,
          width: scaledSize,
          height: scaledSize,
          transform: "translate(0, 0)", // Prevent transform issues
        }}
      />
    )
  }

  // Render eraser path for area mode
  const renderEraserPath = () => {
    if (
      activeTool !== "eraser" ||
      !eraserState.isErasing ||
      eraserState.mode !== "area" ||
      !eraserState.eraserPath ||
      eraserState.eraserPath.length < 2
    ) {
      return null
    }

    const pathPoints = eraserState.eraserPath.map((point) =>
      canvasToScreen(point.x, point.y)
    )
    const pathString = pathPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
      >
        <path
          d={pathString}
          stroke="rgba(239, 68, 68, 0.8)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="rgba(239, 68, 68, 0.1)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Render stroke path for stroke mode
  const renderStrokePath = () => {
    if (
      activeTool !== "eraser" ||
      !eraserState.isErasing ||
      eraserState.mode !== "stroke" ||
      !eraserState.eraserPath ||
      eraserState.eraserPath.length < 2
    ) {
      return null
    }

    const pathPoints = eraserState.eraserPath.map((point) =>
      canvasToScreen(point.x, point.y)
    )
    const pathString = pathPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
      >
        <path
          d={pathString}
          stroke="rgba(239, 68, 68, 0.6)"
          strokeWidth={eraserSize * viewport.zoom}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    )
  }

  if (activeTool !== "eraser") {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        cursor: activeTool === "eraser" ? "none" : "default",
        zIndex: 20,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Eraser cursor */}
      {renderEraserCursor()}

      {/* Eraser path visualization */}
      {renderEraserPath()}
      {renderStrokePath()}

      {/* Eraser mode indicator */}
      {eraserState.isErasing && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>
              Erasing (
              {eraserState.mode === "single"
                ? "Single"
                : eraserState.mode === "stroke"
                ? "Stroke"
                : "Area"}
              )
            </span>
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && eraserState.isErasing && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded font-mono pointer-events-none">
          <div className="text-red-400 mb-1">🧹 Eraser Debug:</div>
          <div>Mode: {eraserState.mode}</div>
          <div>Size: {eraserSize}px</div>
          <div>Path points: {eraserState.eraserPath?.length || 0}</div>
          <div>Items to delete:</div>
          <div className="ml-2">
            <div>Lines: {eraserState.itemsToDelete.lines.length}</div>
            <div>Texts: {eraserState.itemsToDelete.texts.length}</div>
            <div>Nodes: {eraserState.itemsToDelete.nodes.length}</div>
            <div>Edges: {eraserState.itemsToDelete.edges.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ✅ Hook for easier eraser tool integration
export function useEraserToolHandlers(
  activeTool: string | null,
  viewport: Viewport
) {
  const handleEraseStart = useCallback(
    (position: { x: number; y: number }) => {
      if (activeTool !== "eraser") return
      console.log("🧹 Starting erase at:", position)
      // This will be connected to the store in the parent component
    },
    [activeTool]
  )

  const handleEraseUpdate = useCallback(
    (position: { x: number; y: number }) => {
      if (activeTool !== "eraser") return
      // This will be connected to the store in the parent component
    },
    [activeTool]
  )

  const handleEraseEnd = useCallback(() => {
    if (activeTool !== "eraser") return
    console.log("🧹 Ending erase")
    // This will be connected to the store in the parent component
  }, [activeTool])

  return {
    handleEraseStart,
    handleEraseUpdate,
    handleEraseEnd,
  }
}
