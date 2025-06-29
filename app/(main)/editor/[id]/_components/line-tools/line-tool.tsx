// Fixed Line Tool Integration - Clean Production Version
// File: app/mind-map/[id]/_components/line-tool-integration.tsx

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useReactFlow } from "@xyflow/react"

// ✅ FIXED: Import from unified types
import type {
  LineToolData,
  LineDrawingState,
  DrawingToolType,
} from "@/src/types/drawing-tools"
import type { ReactFlowNode, ToolType } from "@/src/types/mindmap"

// ✅ FIXED: Import drawing tools store
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"

// ✅ FIXED: Import separate PreviewLineRenderer component
import { PreviewLineRenderer } from "./preview-line-renderer"

interface LineToolIntegrationProps {
  activeTool: string | null
  viewport: { x: number; y: number; zoom: number }
  isDrawing: boolean
  lines: LineToolData[]
  previewLine?: Omit<LineToolData, "id" | "createdAt" | "updatedAt">
}

// ✅ ENHANCED: Clean line renderer component
const LineRenderer: React.FC<{
  lines: LineToolData[]
  selectedLineId?: string | null
  onLineSelect?: (lineId: string) => void
  onLineDelete?: (lineId: string) => void
  viewport: { x: number; y: number; zoom: number }
}> = ({ lines, selectedLineId, onLineSelect, onLineDelete, viewport }) => {
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null)

  const handleLineClick = useCallback(
    (lineId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      onLineSelect?.(lineId)
    },
    [onLineSelect]
  )

  const handleLineDoubleClick = useCallback(
    (lineId: string, event: React.MouseEvent) => {
      event.stopPropagation()
      onLineDelete?.(lineId)
    },
    [onLineDelete]
  )

  const handleLineMouseEnter = useCallback((lineId: string) => {
    setHoveredLineId(lineId)
  }, [])

  const handleLineMouseLeave = useCallback(() => {
    setHoveredLineId(null)
  }, [])

  // Don't render if no lines
  if (!lines || lines.length === 0) {
    return null
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1000]">
      <svg
        width="100%"
        height="100%"
        className="absolute top-0 left-0 pointer-events-none"
      >
        <defs>
          {/* Selection gradient */}
          <linearGradient
            id="selectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>

          {/* Hover gradient */}
          <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>

          {/* Sloppiness filters */}
          {lines.map(
            (line) =>
              line.sloppiness &&
              line.sloppiness > 0 && (
                <filter
                  key={`sloppy-${line.id}`}
                  id={`sloppy-${line.id}`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence
                    baseFrequency={0.02 + (line.sloppiness || 0) * 0.01}
                    numOctaves="2"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale={(line.sloppiness || 0) * 2}
                  />
                </filter>
              )
          )}
        </defs>

        {lines.map((line) => {
          const isSelected = selectedLineId === line.id
          const isHovered = hoveredLineId === line.id

          // Handle stroke styles
          const getStrokeDasharray = () => {
            switch (line.strokeStyle) {
              case "dashed":
                return "8,4"
              case "dotted":
                return "2,2"
              case "solid":
              default:
                return undefined
            }
          }

          // Transform coordinates
          const x1 = line.startPoint.x * viewport.zoom + viewport.x
          const y1 = line.startPoint.y * viewport.zoom + viewport.y
          const x2 = line.endPoint.x * viewport.zoom + viewport.x
          const y2 = line.endPoint.y * viewport.zoom + viewport.y

          // Line properties
          const strokeWidth = (line.strokeWidth || 2) * viewport.zoom
          const opacity = line.opacity || 1
          const strokeColor = line.strokeColor || "#000000"
          const strokeDasharray = getStrokeDasharray()

          return (
            <g key={line.id}>
              {/* Background hover/selection indicator */}
              {(isSelected || isHovered) && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isSelected
                      ? "url(#selectionGradient)"
                      : "url(#hoverGradient)"
                  }
                  strokeWidth={strokeWidth + 8}
                  opacity={0.4}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Main line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap={
                  line.edgeStyle === "rounded" ? "round" : "square"
                }
                opacity={opacity}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  filter:
                    line.sloppiness && line.sloppiness > 0
                      ? `url(#sloppy-${line.id})`
                      : undefined,
                }}
                onClick={(e) => handleLineClick(line.id, e as any)}
                onDoubleClick={(e) => handleLineDoubleClick(line.id, e as any)}
                onMouseEnter={() => handleLineMouseEnter(line.id)}
                onMouseLeave={handleLineMouseLeave}
              />

              {/* Click detection area */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={Math.max(strokeWidth + 10, 15)}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                }}
                onClick={(e) => handleLineClick(line.id, e as any)}
                onDoubleClick={(e) => handleLineDoubleClick(line.id, e as any)}
                onMouseEnter={() => handleLineMouseEnter(line.id)}
                onMouseLeave={handleLineMouseLeave}
              />

              {/* Selection indicators */}
              {isSelected && (
                <>
                  {/* Selection outline */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth + 4}
                    opacity={0.5}
                    style={{ pointerEvents: "none" }}
                    strokeDasharray="4,2"
                    className="animate-pulse"
                  />

                  {/* Connection points */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r={6 * viewport.zoom}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={2 * viewport.zoom}
                    style={{
                      pointerEvents: "auto",
                      cursor: "move",
                    }}
                    className="animate-pulse"
                  />
                  <circle
                    cx={x2}
                    cy={y2}
                    r={6 * viewport.zoom}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={2 * viewport.zoom}
                    style={{
                      pointerEvents: "auto",
                      cursor: "move",
                    }}
                    className="animate-pulse"
                  />

                  {/* Line info */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 10}
                    fill="#3b82f6"
                    fontSize={12 * viewport.zoom}
                    textAnchor="middle"
                    style={{ pointerEvents: "none" }}
                    className="font-medium"
                  >
                    Line: {line.id.slice(-6)}
                  </text>
                </>
              )}

              {/* Hover indicator */}
              {isHovered && !isSelected && (
                <circle
                  cx={(x1 + x2) / 2}
                  cy={(y1 + y2) / 2}
                  r={4 * viewport.zoom}
                  fill="#10b981"
                  opacity={0.7}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ✅ ENHANCED: Node connection utilities
export const useNodeConnection = () => {
  const { getNodes } = useReactFlow()

  const findNodeAtPoint = useCallback(
    (point: { x: number; y: number }): ReactFlowNode | null => {
      const nodes = getNodes() as ReactFlowNode[]

      for (const node of nodes) {
        const nodeWidth = node.measured?.width || node.width || 200
        const nodeHeight = node.measured?.height || node.height || 120

        const nodeLeft = node.position.x
        const nodeTop = node.position.y
        const nodeRight = nodeLeft + nodeWidth
        const nodeBottom = nodeTop + nodeHeight

        const padding = 10
        if (
          point.x >= nodeLeft - padding &&
          point.x <= nodeRight + padding &&
          point.y >= nodeTop - padding &&
          point.y <= nodeBottom + padding
        ) {
          return node
        }
      }

      return null
    },
    [getNodes]
  )

  const getNodeConnectionPoint = useCallback(
    (
      node: ReactFlowNode,
      targetPoint: { x: number; y: number }
    ): { x: number; y: number } => {
      const nodeWidth = node.measured?.width || node.width || 200
      const nodeHeight = node.measured?.height || node.height || 120

      const centerX = node.position.x + nodeWidth / 2
      const centerY = node.position.y + nodeHeight / 2

      const dx = targetPoint.x - centerX
      const dy = targetPoint.y - centerY

      const nodeLeft = node.position.x
      const nodeTop = node.position.y
      const nodeRight = nodeLeft + nodeWidth
      const nodeBottom = nodeTop + nodeHeight

      const aspectRatio = nodeWidth / nodeHeight
      const normalizedDx = dx / nodeWidth
      const normalizedDy = dy / nodeHeight

      let connectionPoint: { x: number; y: number }

      if (Math.abs(normalizedDx) > Math.abs(normalizedDy) * aspectRatio) {
        // Connect to left or right edge
        if (dx > 0) {
          connectionPoint = { x: nodeRight, y: centerY + dy * 0.3 }
        } else {
          connectionPoint = { x: nodeLeft, y: centerY + dy * 0.3 }
        }
      } else {
        // Connect to top or bottom edge
        if (dy > 0) {
          connectionPoint = { x: centerX + dx * 0.3, y: nodeBottom }
        } else {
          connectionPoint = { x: centerX + dx * 0.3, y: nodeTop }
        }
      }

      return connectionPoint
    },
    []
  )

  return { findNodeAtPoint, getNodeConnectionPoint }
}

// ✅ ENHANCED: Clean line tool handlers
export const useLineToolHandlers = (
  activeTool: ToolType | DrawingToolType | string,
  viewport: { x: number; y: number; zoom: number }
) => {
  const drawingToolsStore = useDrawingToolsStore()
  const {
    lineDrawingState,
    startLineDrawing,
    updateLineDrawing,
    finishLineDrawing,
    cancelLineDrawing,
    addLine,
    setSelectedLine,
  } = drawingToolsStore

  const { findNodeAtPoint, getNodeConnectionPoint } = useNodeConnection()

  const startNodeRef = useRef<ReactFlowNode | null>(null)
  const endNodeRef = useRef<ReactFlowNode | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const screenToCanvas = useCallback(
    (screenPoint: { x: number; y: number }) => {
      return {
        x: (screenPoint.x - viewport.x) / viewport.zoom,
        y: (screenPoint.y - viewport.y) / viewport.zoom,
      }
    },
    [viewport]
  )

  const handleLineMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "line") return

      setIsDrawing(true)

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const screenPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      const canvasPoint = screenToCanvas(screenPoint)

      const clickedNode = findNodeAtPoint(canvasPoint)

      if (clickedNode) {
        startNodeRef.current = clickedNode
        const connectionPoint = getNodeConnectionPoint(clickedNode, canvasPoint)
        startLineDrawing(connectionPoint)
      } else {
        startNodeRef.current = null
        startLineDrawing(canvasPoint)
      }
    },
    [
      activeTool,
      screenToCanvas,
      findNodeAtPoint,
      getNodeConnectionPoint,
      startLineDrawing,
    ]
  )

  const handleLineMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "line" || !lineDrawingState.isDrawing) return

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const screenPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      const canvasPoint = screenToCanvas(screenPoint)

      const hoveredNode = findNodeAtPoint(canvasPoint)

      let endPoint = canvasPoint
      if (hoveredNode && hoveredNode !== startNodeRef.current) {
        endPoint = getNodeConnectionPoint(hoveredNode, canvasPoint)
        endNodeRef.current = hoveredNode
      } else {
        endNodeRef.current = null
      }

      updateLineDrawing(endPoint)
    },
    [
      activeTool,
      lineDrawingState.isDrawing,
      screenToCanvas,
      findNodeAtPoint,
      getNodeConnectionPoint,
      updateLineDrawing,
    ]
  )

  const handleLineMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "line" || !lineDrawingState.isDrawing) return

      setIsDrawing(false)

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const screenPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      const canvasPoint = screenToCanvas(screenPoint)

      const endNode = findNodeAtPoint(canvasPoint)

      let finalEndPoint = canvasPoint
      if (endNode && endNode !== startNodeRef.current) {
        finalEndPoint = getNodeConnectionPoint(endNode, canvasPoint)
        endNodeRef.current = endNode
      }

      const newLine = finishLineDrawing()

      if (newLine) {
        const enhancedLine: LineToolData = {
          ...newLine,
          endPoint: finalEndPoint,
          strokeStyle: newLine.strokeStyle || "solid",
          edgeStyle: newLine.edgeStyle || "square",
          strokeColor: newLine.strokeColor || "#000000",
          strokeWidth: newLine.strokeWidth || 2,
          opacity: newLine.opacity || 1,
          sloppiness: newLine.sloppiness || 0,
          createdAt: newLine.createdAt || Date.now(),
          updatedAt: newLine.updatedAt || Date.now(),
        }

        addLine(enhancedLine)
        setSelectedLine(enhancedLine.id)
      }

      startNodeRef.current = null
      endNodeRef.current = null
    },
    [
      activeTool,
      lineDrawingState.isDrawing,
      screenToCanvas,
      findNodeAtPoint,
      getNodeConnectionPoint,
      finishLineDrawing,
      addLine,
      setSelectedLine,
    ]
  )

  const handleCanvasKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        activeTool === "line" &&
        lineDrawingState.isDrawing &&
        event.key === "Escape"
      ) {
        cancelLineDrawing()
        setIsDrawing(false)
        startNodeRef.current = null
        endNodeRef.current = null
      }
    },
    [activeTool, lineDrawingState.isDrawing, cancelLineDrawing]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleCanvasKeyDown)
    return () => document.removeEventListener("keydown", handleCanvasKeyDown)
  }, [handleCanvasKeyDown])

  return {
    handleLineMouseDown,
    handleLineMouseMove,
    handleLineMouseUp,
    isDrawingLine: lineDrawingState.isDrawing || isDrawing,
    drawingState: lineDrawingState,
  }
}

// ✅ ENHANCED: Main line tool integration component
export const LineToolIntegration: React.FC<LineToolIntegrationProps> = ({
  activeTool,
  viewport,
  isDrawing,
  lines,
  previewLine,
}) => {
  const drawingToolsStore = useDrawingToolsStore()
  const { selectedLineId, lineDrawingState } = drawingToolsStore

  const handleLineSelect = useCallback(
    (lineId: string) => {
      drawingToolsStore.setSelectedLine(lineId)
    },
    [drawingToolsStore]
  )

  const handleLineDelete = useCallback(
    (lineId: string) => {
      drawingToolsStore.deleteLine(lineId)
    },
    [drawingToolsStore]
  )

  const handleBackgroundClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "line" && selectedLineId) {
        drawingToolsStore.setSelectedLine(null)
      }
    },
    [activeTool, selectedLineId, drawingToolsStore]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === "Escape" && isDrawing) {
        drawingToolsStore.cancelLineDrawing()
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedLineId
      ) {
        event.preventDefault()
        drawingToolsStore.deleteLine(selectedLineId)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDrawing, selectedLineId, drawingToolsStore])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      onClick={handleBackgroundClick}
    >
      {/* Render all existing lines */}
      <LineRenderer
        lines={lines}
        selectedLineId={selectedLineId}
        onLineSelect={handleLineSelect}
        onLineDelete={handleLineDelete}
        viewport={viewport}
      />

      {/* Render preview line during drawing */}
      {isDrawing && previewLine && (
        <PreviewLineRenderer previewLine={previewLine} viewport={viewport} />
      )}

      {/* Line tool instructions */}
      {activeTool === "line" && !isDrawing && lines.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 max-w-sm text-center shadow-lg">
            <div className="text-blue-600 font-medium mb-2">
              Line Tool Active
            </div>
            <div className="text-blue-500 text-sm">
              Click and drag to draw lines between points
            </div>
            <div className="text-blue-400 text-xs mt-1">
              Press Escape to cancel • Delete to remove selected line
            </div>
          </div>
        </div>
      )}

      {/* Drawing feedback */}
      {isDrawing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              Drawing line... Release to finish
            </span>
          </div>
        </div>
      )}

      {/* Selected line properties panel */}
      {selectedLineId && (
        <div className="absolute top-4 right-4 pointer-events-none">
          {(() => {
            const selectedLine = lines.find((l) => l.id === selectedLineId)
            if (!selectedLine) return null

            const lineLength = Math.sqrt(
              Math.pow(selectedLine.endPoint.x - selectedLine.startPoint.x, 2) +
                Math.pow(selectedLine.endPoint.y - selectedLine.startPoint.y, 2)
            )

            return (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                <div className="font-medium text-gray-800 mb-2">
                  Line Properties
                </div>
                <div className="space-y-1 text-gray-600">
                  <div>Length: {Math.round(lineLength)}px</div>
                  <div>
                    Color:{" "}
                    <span
                      className="inline-block w-3 h-3 rounded border border-gray-300"
                      style={{ backgroundColor: selectedLine.strokeColor }}
                    ></span>{" "}
                    {selectedLine.strokeColor}
                  </div>
                  <div>Width: {selectedLine.strokeWidth}px</div>
                  <div>Style: {selectedLine.strokeStyle}</div>
                  <div>Opacity: {Math.round(selectedLine.opacity * 100)}%</div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Press Delete to remove
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
