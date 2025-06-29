// File: app/mind-map/[id]/_components/selection/selection-manager.tsx

"use client"

import { useCallback, useEffect, useState } from "react"
import { Node, Edge, Viewport } from "@xyflow/react"
import type { ReactFlowNode } from "@/src/types/drawing-tools"

interface SelectionState {
  selectedNodes: string[]
  selectedEdges: string[]
  selectedTexts: string[]
  selectedLines: string[]
  isSelecting: boolean
  selectionBox: {
    startX: number
    startY: number
    endX: number
    endY: number
  } | null
}

interface SelectionManagerProps {
  nodes: ReactFlowNode[]
  edges: Edge[]
  texts: Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
  }>
  lines: Array<{ id: string; points: Array<{ x: number; y: number }> }>
  viewport: Viewport
  onSelectionChange: (selection: {
    nodes: string[]
    edges: string[]
    texts: string[]
    lines: string[]
  }) => void
  children: React.ReactNode
}

export function SelectionManager({
  nodes,
  edges,
  texts,
  lines,
  viewport,
  onSelectionChange,
  children,
}: SelectionManagerProps) {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedNodes: [],
    selectedEdges: [],
    selectedTexts: [],
    selectedLines: [],
    isSelecting: false,
    selectionBox: null,
  })

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - viewport.x) / viewport.zoom,
        y: (screenY - viewport.y) / viewport.zoom,
      }
    },
    [viewport]
  )

  // Check if a point is inside a rectangle
  const isPointInRect = useCallback(
    (
      pointX: number,
      pointY: number,
      rectX: number,
      rectY: number,
      rectWidth: number,
      rectHeight: number
    ) => {
      return (
        pointX >= rectX &&
        pointX <= rectX + rectWidth &&
        pointY >= rectY &&
        pointY <= rectY + rectHeight
      )
    },
    []
  )

  // Check if a rectangle intersects with selection box
  const isRectInSelection = useCallback(
    (
      rectX: number,
      rectY: number,
      rectWidth: number,
      rectHeight: number,
      selectionBox: NonNullable<SelectionState["selectionBox"]>
    ) => {
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
    []
  )

  // Check if a line intersects with selection box
  const isLineInSelection = useCallback(
    (
      points: Array<{ x: number; y: number }>,
      selectionBox: NonNullable<SelectionState["selectionBox"]>
    ) => {
      const selectionLeft = Math.min(selectionBox.startX, selectionBox.endX)
      const selectionRight = Math.max(selectionBox.startX, selectionBox.endX)
      const selectionTop = Math.min(selectionBox.startY, selectionBox.endY)
      const selectionBottom = Math.max(selectionBox.startY, selectionBox.endY)

      // Check if any point of the line is within the selection box
      return points.some((point) =>
        isPointInRect(
          point.x,
          point.y,
          selectionLeft,
          selectionTop,
          selectionRight - selectionLeft,
          selectionBottom - selectionTop
        )
      )
    },
    [isPointInRect]
  )

  // Start selection
  const startSelection = useCallback(
    (screenX: number, screenY: number) => {
      const canvasPoint = screenToCanvas(screenX, screenY)

      setSelectionState((prev) => ({
        ...prev,
        isSelecting: true,
        selectionBox: {
          startX: canvasPoint.x,
          startY: canvasPoint.y,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        },
      }))
    },
    [screenToCanvas]
  )

  // Update selection
  const updateSelection = useCallback(
    (screenX: number, screenY: number) => {
      const canvasPoint = screenToCanvas(screenX, screenY)

      setSelectionState((prev) => {
        if (!prev.isSelecting || !prev.selectionBox) return prev

        const newSelectionBox = {
          ...prev.selectionBox,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        }

        // Calculate what's selected
        const selectedNodes: string[] = []
        const selectedEdges: string[] = []
        const selectedTexts: string[] = []
        const selectedLines: string[] = []

        // Check nodes
        nodes.forEach((node) => {
          // Assuming node dimensions (can be customized based on node type)
          const nodeWidth = (node.width as number) || 150
          const nodeHeight = (node.height as number) || 80

          if (
            isRectInSelection(
              node.position.x,
              node.position.y,
              nodeWidth,
              nodeHeight,
              newSelectionBox
            )
          ) {
            selectedNodes.push(node.id)
          }
        })

        // Check texts
        texts.forEach((text) => {
          if (
            isRectInSelection(
              text.x,
              text.y,
              text.width,
              text.height,
              newSelectionBox
            )
          ) {
            selectedTexts.push(text.id)
          }
        })

        // Check lines
        lines.forEach((line) => {
          if (isLineInSelection(line.points, newSelectionBox)) {
            selectedLines.push(line.id)
          }
        })

        return {
          ...prev,
          selectionBox: newSelectionBox,
          selectedNodes,
          selectedEdges,
          selectedTexts,
          selectedLines,
        }
      })
    },
    [screenToCanvas, nodes, texts, lines, isRectInSelection, isLineInSelection]
  )

  // End selection
  const endSelection = useCallback(() => {
    setSelectionState((prev) => {
      const finalSelection = {
        nodes: prev.selectedNodes,
        edges: prev.selectedEdges,
        texts: prev.selectedTexts,
        lines: prev.selectedLines,
      }

      // Notify parent of selection change
      onSelectionChange(finalSelection)

      return {
        ...prev,
        isSelecting: false,
        selectionBox: null,
      }
    })
  }, [onSelectionChange])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedNodes: [],
      selectedEdges: [],
      selectedTexts: [],
      selectedLines: [],
      isSelecting: false,
      selectionBox: null,
    })

    onSelectionChange({
      nodes: [],
      edges: [],
      texts: [],
      lines: [],
    })
  }, [onSelectionChange])

  // Add to selection (for Ctrl+click)
  const addToSelection = useCallback(
    (type: "node" | "edge" | "text" | "line", id: string) => {
      setSelectionState((prev) => {
        const newState = { ...prev }

        switch (type) {
          case "node":
            if (!newState.selectedNodes.includes(id)) {
              newState.selectedNodes = [...newState.selectedNodes, id]
            }
            break
          case "edge":
            if (!newState.selectedEdges.includes(id)) {
              newState.selectedEdges = [...newState.selectedEdges, id]
            }
            break
          case "text":
            if (!newState.selectedTexts.includes(id)) {
              newState.selectedTexts = [...newState.selectedTexts, id]
            }
            break
          case "line":
            if (!newState.selectedLines.includes(id)) {
              newState.selectedLines = [...newState.selectedLines, id]
            }
            break
        }

        onSelectionChange({
          nodes: newState.selectedNodes,
          edges: newState.selectedEdges,
          texts: newState.selectedTexts,
          lines: newState.selectedLines,
        })

        return newState
      })
    },
    [onSelectionChange]
  )

  // Remove from selection
  const removeFromSelection = useCallback(
    (type: "node" | "edge" | "text" | "line", id: string) => {
      setSelectionState((prev) => {
        const newState = { ...prev }

        switch (type) {
          case "node":
            newState.selectedNodes = newState.selectedNodes.filter(
              (nodeId) => nodeId !== id
            )
            break
          case "edge":
            newState.selectedEdges = newState.selectedEdges.filter(
              (edgeId) => edgeId !== id
            )
            break
          case "text":
            newState.selectedTexts = newState.selectedTexts.filter(
              (textId) => textId !== id
            )
            break
          case "line":
            newState.selectedLines = newState.selectedLines.filter(
              (lineId) => lineId !== id
            )
            break
        }

        onSelectionChange({
          nodes: newState.selectedNodes,
          edges: newState.selectedEdges,
          texts: newState.selectedTexts,
          lines: newState.selectedLines,
        })

        return newState
      })
    },
    [onSelectionChange]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Ctrl+A - Select all
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault()
        const allSelection = {
          nodes: nodes.map((node) => node.id),
          edges: edges.map((edge) => edge.id),
          texts: texts.map((text) => text.id),
          lines: lines.map((line) => line.id),
        }

        setSelectionState({
          selectedNodes: allSelection.nodes,
          selectedEdges: allSelection.edges,
          selectedTexts: allSelection.texts,
          selectedLines: allSelection.lines,
          isSelecting: false,
          selectionBox: null,
        })

        onSelectionChange(allSelection)
      }

      // Escape - Clear selection
      if (event.key === "Escape") {
        clearSelection()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nodes, edges, texts, lines, onSelectionChange, clearSelection])

  return (
    <div className="relative w-full h-full">
      {children}

      {/* Export selection methods for use by parent components */}
      <div
        style={{ display: "none" }}
        ref={(ref) => {
          if (ref) {
            // Attach methods to ref for parent access
            ;(ref as any).selectionManager = {
              startSelection,
              updateSelection,
              endSelection,
              clearSelection,
              addToSelection,
              removeFromSelection,
              selectionState,
            }
          }
        }}
      />
    </div>
  )
}
