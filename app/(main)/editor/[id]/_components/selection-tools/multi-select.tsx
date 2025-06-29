// File: app/mind-map/[id]/_components/selection/box-multi-select.tsx

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Viewport } from "@xyflow/react"
import { SelectionBox } from "./selection-box"

interface BoxMultiSelectProps {
  viewport: Viewport
  isEnabled: boolean
  onSelectionStart: (startX: number, startY: number) => void
  onSelectionUpdate: (currentX: number, currentY: number) => void
  onSelectionEnd: () => void
  onSelectionCancel: () => void
  className?: string
  children: React.ReactNode
}

interface SelectionState {
  isSelecting: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

export function BoxMultiSelect({
  viewport,
  isEnabled,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionEnd,
  onSelectionCancel,
  className = "",
  children,
}: BoxMultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectionState, setSelectionState] = useState<SelectionState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
  })

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

  // Handle mouse down - start selection
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!isEnabled) return

      // Only start selection on left mouse button
      if (event.button !== 0) return

      // Don't start selection if clicking on interactive elements
      const target = event.target as HTMLElement
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest(".react-flow__node") ||
        target.closest(".react-flow__edge") ||
        target.closest(".react-flow__controls") ||
        target.closest(".react-flow__minimap") ||
        target.closest("[data-no-select]")
      ) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const canvasPoint = screenToCanvas(event.clientX, event.clientY)

      setSelectionState({
        isSelecting: true,
        startX: canvasPoint.x,
        startY: canvasPoint.y,
        currentX: canvasPoint.x,
        currentY: canvasPoint.y,
        isDragging: false,
      })

      onSelectionStart(canvasPoint.x, canvasPoint.y)

      // Capture mouse events globally
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
      document.addEventListener("contextmenu", handleContextMenu)
    },
    [isEnabled, screenToCanvas, onSelectionStart]
  )

  // Handle global mouse move - update selection
  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!selectionState.isSelecting) return

      event.preventDefault()

      const canvasPoint = screenToCanvas(event.clientX, event.clientY)

      setSelectionState((prev) => ({
        ...prev,
        currentX: canvasPoint.x,
        currentY: canvasPoint.y,
        isDragging: true,
      }))

      onSelectionUpdate(canvasPoint.x, canvasPoint.y)
    },
    [selectionState.isSelecting, screenToCanvas, onSelectionUpdate]
  )

  // Handle global mouse up - end selection
  const handleGlobalMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!selectionState.isSelecting) return

      event.preventDefault()

      // Clean up global listeners
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("contextmenu", handleContextMenu)

      // Only trigger selection end if we actually dragged
      if (selectionState.isDragging) {
        onSelectionEnd()
      }

      setSelectionState({
        isSelecting: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        isDragging: false,
      })
    },
    [selectionState.isSelecting, selectionState.isDragging, onSelectionEnd]
  )

  // Handle right-click - cancel selection
  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      if (selectionState.isSelecting) {
        event.preventDefault()

        // Clean up global listeners
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.removeEventListener("contextmenu", handleContextMenu)

        onSelectionCancel()

        setSelectionState({
          isSelecting: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          isDragging: false,
        })
      }
    },
    [selectionState.isSelecting, onSelectionCancel]
  )

  // Handle escape key - cancel selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectionState.isSelecting) {
        event.preventDefault()

        // Clean up global listeners
        document.removeEventListener("mousemove", handleGlobalMouseMove)
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.removeEventListener("contextmenu", handleContextMenu)

        onSelectionCancel()

        setSelectionState({
          isSelecting: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          isDragging: false,
        })
      }
    }

    if (selectionState.isSelecting) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectionState.isSelecting, onSelectionCancel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  // Handle drag selection behavior
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      // Prevent default drag behavior when selecting
      if (selectionState.isSelecting) {
        event.preventDefault()
      }
    },
    [selectionState.isSelecting]
  )

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      style={{
        cursor:
          isEnabled && !selectionState.isSelecting
            ? "crosshair"
            : selectionState.isSelecting
            ? "grabbing"
            : "default",
        userSelect: selectionState.isSelecting ? "none" : "auto",
      }}
    >
      {children}

      {/* Selection Box Overlay */}
      {selectionState.isSelecting && selectionState.isDragging && (
        <SelectionBox
          startX={selectionState.startX}
          startY={selectionState.startY}
          endX={selectionState.currentX}
          endY={selectionState.currentY}
          viewport={viewport}
          isVisible={true}
          className="animate-in fade-in duration-100"
        />
      )}

      {/* Visual feedback for selection mode */}
      {isEnabled && !selectionState.isSelecting && (
        <div className="absolute top-2 left-2 pointer-events-none z-50">
          <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
            <span className="inline-flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Multi-select mode
            </span>
          </div>
        </div>
      )}

      {/* Selection info during active selection */}
      {selectionState.isSelecting && selectionState.isDragging && (
        <div className="absolute bottom-4 left-4 pointer-events-none z-50">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
            Selection:{" "}
            {Math.round(
              Math.abs(selectionState.currentX - selectionState.startX)
            )}
            ×
            {Math.round(
              Math.abs(selectionState.currentY - selectionState.startY)
            )}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {isEnabled && (
        <div className="absolute top-2 right-2 pointer-events-none z-50">
          <div className="bg-gray-800 bg-opacity-80 text-white text-xs px-2 py-1 rounded-md space-y-1">
            <div>Drag: Multi-select</div>
            <div>Esc: Cancel</div>
            <div>Ctrl+A: Select all</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for managing multi-select state
export function useBoxMultiSelect({
  isEnabled = true,
  onSelectionChange,
}: {
  isEnabled?: boolean
  onSelectionChange?: (selection: {
    nodes: string[]
    edges: string[]
    texts: string[]
    lines: string[]
  }) => void
} = {}) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)

  const startSelection = useCallback((startX: number, startY: number) => {
    setIsSelecting(true)
    setSelectionBox({
      startX,
      startY,
      endX: startX,
      endY: startY,
    })
  }, [])

  const updateSelection = useCallback((currentX: number, currentY: number) => {
    setSelectionBox((prev) => {
      if (!prev) return null
      return {
        ...prev,
        endX: currentX,
        endY: currentY,
      }
    })
  }, [])

  const endSelection = useCallback(() => {
    setIsSelecting(false)
    setSelectionBox(null)
  }, [])

  const cancelSelection = useCallback(() => {
    setIsSelecting(false)
    setSelectionBox(null)
    onSelectionChange?.({
      nodes: [],
      edges: [],
      texts: [],
      lines: [],
    })
  }, [onSelectionChange])

  return {
    isSelecting,
    selectionBox,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    isEnabled,
  }
}

// Utility functions for selection calculations
export const selectionUtils = {
  // Check if a rectangle intersects with selection box
  isRectInSelection: (
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    selectionBox: {
      startX: number
      startY: number
      endX: number
      endY: number
    }
  ): boolean => {
    const selectionLeft = Math.min(selectionBox.startX, selectionBox.endX)
    const selectionRight = Math.max(selectionBox.startX, selectionBox.endX)
    const selectionTop = Math.min(selectionBox.startY, selectionBox.endY)
    const selectionBottom = Math.max(selectionBox.startY, selectionBox.endY)

    const rectLeft = rectX
    const rectRight = rectX + rectWidth
    const rectTop = rectY
    const rectBottom = rectY + rectHeight

    // Check for intersection
    return !(
      rectRight < selectionLeft ||
      rectLeft > selectionRight ||
      rectBottom < selectionTop ||
      rectTop > selectionBottom
    )
  },

  // Check if a point is within selection box
  isPointInSelection: (
    pointX: number,
    pointY: number,
    selectionBox: {
      startX: number
      startY: number
      endX: number
      endY: number
    }
  ): boolean => {
    const selectionLeft = Math.min(selectionBox.startX, selectionBox.endX)
    const selectionRight = Math.max(selectionBox.startX, selectionBox.endX)
    const selectionTop = Math.min(selectionBox.startY, selectionBox.endY)
    const selectionBottom = Math.max(selectionBox.startY, selectionBox.endY)

    return (
      pointX >= selectionLeft &&
      pointX <= selectionRight &&
      pointY >= selectionTop &&
      pointY <= selectionBottom
    )
  },

  // Check if a line intersects with selection box
  isLineInSelection: (
    points: Array<{ x: number; y: number }>,
    selectionBox: {
      startX: number
      startY: number
      endX: number
      endY: number
    }
  ): boolean => {
    // Check if any point of the line is within the selection box
    return points.some((point) =>
      selectionUtils.isPointInSelection(point.x, point.y, selectionBox)
    )
  },

  // Get selection bounds
  getSelectionBounds: (selectionBox: {
    startX: number
    startY: number
    endX: number
    endY: number
  }) => {
    return {
      left: Math.min(selectionBox.startX, selectionBox.endX),
      right: Math.max(selectionBox.startX, selectionBox.endX),
      top: Math.min(selectionBox.startY, selectionBox.endY),
      bottom: Math.max(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
    }
  },
}
