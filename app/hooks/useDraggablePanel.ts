// Optional: Custom hook for draggable panel functionality
// Save as: hooks/useDraggablePanel.ts

import { useState, useRef, useCallback, useEffect } from "react"

interface UseDraggablePanelOptions {
  initialPosition?: { x: number; y: number }
  constrainToViewport?: boolean
  onPositionChange?: (position: { x: number; y: number }) => void
}

interface UseDraggablePanelReturn {
  isDragging: boolean
  position: { x: number; y: number }
  panelRef: React.RefObject<HTMLDivElement | null> // Fixed: Allow null
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void
    style: { cursor: string }
  }
  panelStyle: React.CSSProperties
  resetPosition: () => void
}

export function useDraggablePanel({
  initialPosition = { x: 0, y: 0 },
  constrainToViewport = true,
  onPositionChange,
}: UseDraggablePanelOptions = {}): UseDraggablePanelReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(initialPosition)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return

    const rect = panelRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)

    // Prevent text selection during drag
    document.body.style.userSelect = "none"
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return

      let newX = e.clientX - dragOffset.x
      let newY = e.clientY - dragOffset.y

      if (constrainToViewport) {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const panelRect = panelRef.current.getBoundingClientRect()

        // Constrain to viewport bounds
        newX = Math.max(0, Math.min(newX, viewportWidth - panelRect.width))
        newY = Math.max(0, Math.min(newY, viewportHeight - panelRect.height))
      }

      const newPosition = { x: newX, y: newY }
      setPosition(newPosition)
      onPositionChange?.(newPosition)
    },
    [isDragging, dragOffset, constrainToViewport, onPositionChange]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const resetPosition = useCallback(() => {
    setPosition(initialPosition)
    onPositionChange?.(initialPosition)
  }, [initialPosition, onPositionChange])

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: isDragging ? 9999 : undefined,
    transition: isDragging ? "none" : "all 0.2s ease",
  }

  const dragHandleProps = {
    onMouseDown: handleMouseDown,
    style: {
      cursor: isDragging ? "grabbing" : "grab",
    },
  }

  return {
    isDragging,
    position,
    panelRef,
    dragHandleProps,
    panelStyle,
    resetPosition,
  }
}
