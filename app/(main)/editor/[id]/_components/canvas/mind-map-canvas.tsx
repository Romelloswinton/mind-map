// File: app/mind-map/[id]/_components/canvas/mind-map-canvas.tsx

"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Viewport,
  useReactFlow,
  BackgroundVariant, // ✅ Import BackgroundVariant enum
} from "@xyflow/react"

// ✅ FIXED: Import all types from unified drawing-tools to avoid conflicts
import type {
  ToolType,
  NodeShape,
  MindMapNodeData,
  ReactFlowNode,
} from "@/src/types/drawing-tools"
import { toReactFlowNodes } from "@/src/types/drawing-tools" // ✅ Import utility function

// ✅ FIXED: Store integration with unified imports
import {
  useMindMapStore,
  useMindMapSelectors,
} from "@/src/stores/mind-map-store"

// ✅ FIXED: Drawing tools store integration with eraser
import {
  useDrawingToolsStore,
  useEraserDrawing,
} from "@/src/stores/drawing-tools"

// ✅ FIXED: Component imports with correct paths
import { MindMapNode } from "../node-tools/mind-map-node"
import { IntegratedFloatingToolbar } from "../shared/integrated-floating-toolbar"
import { DrawingToolsPanel } from "../drawing-tools/drawing-tools-panel"
import { LineToolIntegration } from "../line-tools/line-tool"
import { EraserToolIntegration } from "../eraser-tool/eraser-tool" // ✅ Added eraser tool

// ✅ FIXED: Text tool components with correct paths
import { TextRenderer } from "../text-tool/TextRenderer"
import { TextEditor } from "../text-tool/TextEditor"
import { TextPreview } from "../text-tool/TextPreview"
import { useTextToolHandlers } from "../text-tool/TextToolHandlers" // ✅ Fixed import path

// Import ReactFlow styles
import "@xyflow/react/dist/style.css"

// ✅ FIXED: Node types registration
const nodeTypes = {
  mindMapNode: MindMapNode,
}

// ✅ FIXED: Mind Map Canvas Interface
interface MindMapCanvasProps {
  mindMapId: string
  initialNodes?: ReactFlowNode[]
  initialEdges?: Edge[]
  initialViewport?: Viewport
}

// ✅ ENHANCED: Default viewport configuration
const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
}

export default function MindMapCanvas({
  mindMapId,
  initialNodes = [],
  initialEdges = [],
  initialViewport = defaultViewport,
}: MindMapCanvasProps) {
  // ✅ FIXED: Store integration with proper selectors
  const mindMapStore = useMindMapStore()
  const {
    nodes,
    edges,
    selectedNodeId,
    viewport,
    isLoading,
    selectedNodeShape,
    drawingToolDefaults,
  } = useMindMapSelectors()

  // ✅ FIXED: Drawing tools store integration with eraser
  const drawingToolsStore = useDrawingToolsStore()
  const {
    activeTool,
    isPanelVisible,
    lineDrawingState,
    textDrawingState,
    lines,
    texts,
    selectedTextId,
    eraserState, // ✅ Added eraser state
  } = drawingToolsStore

  // ✅ NEW: Eraser functionality
  const {
    startErasing,
    updateErasing,
    finishErasing,
    setNodeEdgeDeletionCallbacks,
  } = useEraserDrawing()

  // ReactFlow instance
  const reactFlowInstance = useReactFlow()

  // ✅ FIXED: Local state for UI interactions
  const [reactFlowViewport, setReactFlowViewport] = useState<Viewport>(viewport)
  const [isInitialized, setIsInitialized] = useState(false)

  // ✅ FIXED: Text tool integration with proper handlers using new API
  const textToolHandlers = useTextToolHandlers(
    activeTool, // Now expects string | null
    reactFlowViewport
  )

  // ✅ ENHANCED: Line tool integration - using the LineToolIntegration component's handlers
  const handleLineMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "line") return

      // The LineToolIntegration component will handle this
      console.log("🖱️ Line tool mouse down - handled by LineToolIntegration")
    },
    [activeTool]
  )

  // ✅ ENHANCED: Initialize canvas with proper data and eraser integration
  useEffect(() => {
    if (!isInitialized) {
      console.log("🎯 Initializing Mind Map Canvas:", mindMapId)

      // Set the mind map ID
      mindMapStore.setMindMapId(mindMapId)

      // ✅ NEW: Set up eraser integration with mind map store
      setNodeEdgeDeletionCallbacks(
        // Delete nodes callback
        (nodeIds: string[]) => {
          console.log("🧹 Eraser deleting nodes:", nodeIds)
          nodeIds.forEach((nodeId) => mindMapStore.deleteNode(nodeId))
        },
        // Delete edges callback
        (edgeIds: string[]) => {
          console.log("🧹 Eraser deleting edges:", edgeIds)
          const currentEdges = mindMapStore.exportData().edges
          const updatedEdges = currentEdges.filter(
            (edge) => !edgeIds.includes(edge.id)
          )
          mindMapStore.setEdges(updatedEdges)
        }
      )

      // ✅ FIXED: Ensure nodes have the correct type before setting
      if (initialNodes.length > 0) {
        const validatedNodes: ReactFlowNode[] = initialNodes.map((node) => ({
          ...node,
          type: "mindMapNode" as const, // ✅ Ensure correct type
          data: {
            ...node.data,
            text: node.data.text || "New Node", // ✅ Ensure required fields
            color: node.data.color || "#3b82f6",
          },
        }))
        mindMapStore.setNodes(validatedNodes)
      }
      if (initialEdges.length > 0) {
        mindMapStore.setEdges(initialEdges)
      }
      if (initialViewport) {
        mindMapStore.setViewport(initialViewport)
        setReactFlowViewport(initialViewport)
      }

      setIsInitialized(true)
    }
  }, [
    mindMapId,
    initialNodes,
    initialEdges,
    initialViewport,
    isInitialized,
    mindMapStore,
    setNodeEdgeDeletionCallbacks, // ✅ Added dependency
  ])

  // ✅ ENHANCED: Sync viewport changes between ReactFlow and store
  const handleViewportChange = useCallback(
    (event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      setReactFlowViewport(viewport)
      mindMapStore.setViewport(viewport)
    },
    [mindMapStore]
  )

  // ✅ ENHANCED: Node changes handler with proper type conversion
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log("🔄 Node changes:", changes)

      // Apply changes to get updated nodes (returns NodeBase[])
      const updatedNodes = applyNodeChanges(changes, nodes)

      // ✅ FIXED: Convert to ReactFlowNode[] using utility function
      const validatedNodes = toReactFlowNodes(updatedNodes)

      mindMapStore.setNodes(validatedNodes)

      // Handle node selection changes
      changes.forEach((change) => {
        if (change.type === "select" && change.selected) {
          console.log("🎯 Node selected via drag:", change.id)
          mindMapStore.setSelectedNodeId(change.id)
        }
      })
    },
    [nodes, mindMapStore]
  )

  // ✅ ENHANCED: Edge changes handler
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log("🔄 Edge changes:", changes)
      const updatedEdges = applyEdgeChanges(changes, edges)
      mindMapStore.setEdges(updatedEdges)
    },
    [edges, mindMapStore]
  )

  // ✅ ENHANCED: Connection handler for new edges
  const handleConnect = useCallback(
    (connection: Connection) => {
      console.log("🔗 New connection:", connection)

      if (connection.source && connection.target) {
        const newEdge: Edge = {
          id: `e${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
        }

        const updatedEdges = addEdge(newEdge, edges)
        mindMapStore.setEdges(updatedEdges)
      }
    },
    [edges, mindMapStore]
  )

  // ✅ ENHANCED: Canvas click handler for tool interactions including eraser
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement

      // Don't handle clicks on ReactFlow controls or nodes
      if (
        target.closest(".react-flow__controls") ||
        target.closest(".react-flow__minimap") ||
        target.closest(".react-flow__node") ||
        target.closest("button")
      ) {
        return
      }

      console.log("🖱️ Canvas clicked with tool:", activeTool)

      // Handle tool-specific interactions
      if (activeTool === "text") {
        textToolHandlers.handleCanvasMouseDown(event) // ✅ Use new API
      } else if (activeTool === "line") {
        // LineToolIntegration component handles line drawing
        handleLineMouseDown(event)
      } else if (activeTool === "eraser") {
        // ✅ NEW: Handle eraser click for single-click erase mode
        const rect = (
          event.currentTarget as HTMLElement
        ).getBoundingClientRect()
        const canvasX =
          (event.clientX - rect.left - reactFlowViewport.x) /
          reactFlowViewport.zoom
        const canvasY =
          (event.clientY - rect.top - reactFlowViewport.y) /
          reactFlowViewport.zoom

        console.log("🧹 Eraser click at:", { x: canvasX, y: canvasY })

        // For single mode, do a quick erase at the click position
        startErasing({ x: canvasX, y: canvasY })
        setTimeout(() => finishErasing(), 50) // Quick erase and finish
      } else if (
        activeTool &&
        ["rectangle", "circle", "diamond"].includes(activeTool)
      ) {
        // Handle shape creation
        const rect = (
          event.currentTarget as HTMLElement
        ).getBoundingClientRect()
        const canvasX =
          (event.clientX - rect.left - reactFlowViewport.x) /
          reactFlowViewport.zoom
        const canvasY =
          (event.clientY - rect.top - reactFlowViewport.y) /
          reactFlowViewport.zoom

        console.log("🔸 Creating shape node at:", { x: canvasX, y: canvasY })

        const newNodeId = mindMapStore.addNodeAtPosition(
          { x: canvasX, y: canvasY },
          undefined,
          activeTool as NodeShape
        )

        if (newNodeId) {
          mindMapStore.setSelectedNodeId(newNodeId)
          console.log("✅ Created node:", newNodeId)
        }
      } else {
        // Clear selection when clicking empty canvas
        mindMapStore.setSelectedNodeId(null)
        drawingToolsStore.clearSelection()
      }
    },
    [
      activeTool,
      textToolHandlers,
      handleLineMouseDown,
      reactFlowViewport,
      mindMapStore,
      drawingToolsStore,
      startErasing, // ✅ Added eraser dependencies
      finishErasing,
    ]
  )

  // ✅ ENHANCED: Custom event handlers for node operations
  useEffect(() => {
    const handleNodeUpdate = (event: CustomEvent) => {
      const { nodeId, data } = event.detail
      console.log("📝 Custom node update:", nodeId, data)
      mindMapStore.updateNode(nodeId, data)
    }

    const handleNodeDelete = (event: CustomEvent) => {
      const { nodeId } = event.detail
      console.log("🗑️ Custom node delete:", nodeId)
      mindMapStore.deleteNode(nodeId)
    }

    const handleNodeAddChild = (event: CustomEvent) => {
      const { parentId, position } = event.detail
      console.log("👶 Custom add child node:", parentId, position)

      // Calculate position relative to parent
      const parentNode = nodes.find((n) => n.id === parentId)
      if (parentNode) {
        const newPosition = {
          x: parentNode.position.x + (position?.x || 200),
          y: parentNode.position.y + (position?.y || 100),
        }

        const newNodeId = mindMapStore.addNodeAtPosition(
          newPosition,
          parentId,
          selectedNodeShape
        )

        console.log("✅ Added child node:", newNodeId)
      }
    }

    // Register event listeners
    window.addEventListener("nodeUpdate", handleNodeUpdate as EventListener)
    window.addEventListener("nodeDelete", handleNodeDelete as EventListener)
    window.addEventListener("nodeAddChild", handleNodeAddChild as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener(
        "nodeUpdate",
        handleNodeUpdate as EventListener
      )
      window.removeEventListener(
        "nodeDelete",
        handleNodeDelete as EventListener
      )
      window.removeEventListener(
        "nodeAddChild",
        handleNodeAddChild as EventListener
      )
    }
  }, [mindMapStore, nodes, selectedNodeShape])

  // ✅ ENHANCED: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Handle shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "z":
            event.preventDefault()
            if (event.shiftKey) {
              mindMapStore.redo()
            } else {
              mindMapStore.undo()
            }
            break
          case "d":
            event.preventDefault()
            if (selectedNodeId) {
              mindMapStore.duplicateNode(selectedNodeId)
            }
            break
        }
      }

      // Delete key
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNodeId) {
          event.preventDefault()
          mindMapStore.deleteNode(selectedNodeId)
        } else if (drawingToolsStore.selectedLineId) {
          event.preventDefault()
          drawingToolsStore.deleteLine(drawingToolsStore.selectedLineId)
        } else if (selectedTextId) {
          event.preventDefault()
          drawingToolsStore.deleteText(selectedTextId)
        }
      }

      // Escape key
      if (event.key === "Escape") {
        mindMapStore.setSelectedNodeId(null)
        drawingToolsStore.clearSelection()
        drawingToolsStore.setActiveTool(null)

        // Cancel any active drawing
        if (lineDrawingState.isDrawing) {
          drawingToolsStore.cancelLineDrawing()
        }
        if (textDrawingState.isCreating) {
          drawingToolsStore.cancelTextCreation()
        }
        // ✅ NEW: Cancel eraser if active
        if (eraserState.isErasing) {
          drawingToolsStore.cancelErasing()
        }
      }

      // Tool shortcuts
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        switch (event.key) {
          case "h":
          case "H":
            event.preventDefault()
            drawingToolsStore.setActiveTool("hand")
            break
          case "v":
          case "V":
            event.preventDefault()
            drawingToolsStore.setActiveTool("select")
            break
          case "2":
            event.preventDefault()
            drawingToolsStore.setActiveTool("rectangle")
            break
          case "3":
            event.preventDefault()
            drawingToolsStore.setActiveTool("circle")
            break
          case "4":
            event.preventDefault()
            drawingToolsStore.setActiveTool("diamond")
            break
          case "5":
            event.preventDefault()
            drawingToolsStore.setActiveTool("line")
            break
          case "8":
            event.preventDefault()
            drawingToolsStore.setActiveTool("text")
            break
          case "0":
            event.preventDefault()
            drawingToolsStore.setActiveTool("eraser") // ✅ Now works with eraser!
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    selectedNodeId,
    selectedTextId,
    lineDrawingState.isDrawing,
    textDrawingState.isCreating,
    mindMapStore,
    drawingToolsStore,
  ])

  // ✅ ENHANCED: Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mind map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* ✅ ENHANCED: ReactFlow with all tool integrations */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onMove={handleViewportChange}
        onMoveEnd={handleViewportChange}
        onClick={handleCanvasClick}
        viewport={reactFlowViewport}
        fitView={false}
        attributionPosition="bottom-left"
        className="bg-white"
        nodesDraggable
        nodesConnectable
        elementsSelectable
        snapToGrid
        snapGrid={[10, 10]}
        defaultViewport={defaultViewport}
        minZoom={0.1}
        maxZoom={4}
        onInit={(reactFlowInstance) => {
          console.log("🎯 ReactFlow initialized")
        }}
      >
        {/* ✅ ENHANCED: Background with subtle pattern */}
        <Background
          color="#e5e7eb"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots} // ✅ Fixed: Use enum instead of string
          style={{ opacity: 0.4 }}
        />

        {/* ✅ ENHANCED: Controls with custom styling */}
        <Controls
          position="bottom-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          className="react-flow__controls-custom" // ✅ Use className for custom styling
        />

        {/* ✅ ENHANCED: MiniMap with custom styling */}
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            const nodeData = node.data as MindMapNodeData
            return nodeData.fillColor || nodeData.color || "#3b82f6"
          }}
          nodeStrokeWidth={2}
          nodeStrokeColor="#374151"
          pannable
          zoomable
          style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>

      {/* ✅ ENHANCED: Line Tool Integration Layer */}
      <LineToolIntegration
        activeTool={activeTool}
        viewport={reactFlowViewport}
        isDrawing={lineDrawingState.isDrawing}
        lines={lines}
        previewLine={lineDrawingState.previewLine}
      />

      {/* ✅ NEW: Eraser Tool Integration Layer */}
      <EraserToolIntegration
        activeTool={activeTool}
        viewport={reactFlowViewport}
        eraserState={eraserState}
        onEraseStart={startErasing}
        onEraseUpdate={updateErasing}
        onEraseEnd={finishErasing}
        eraserSize={drawingToolsStore.toolSettings.eraser?.eraserSize || 20}
        className="z-25"
      />

      {/* ✅ ENHANCED: Text Tool Integration Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Render existing texts */}
        {texts.map((text) => (
          <TextRenderer
            key={text.id}
            text={text}
            viewport={reactFlowViewport}
            isSelected={selectedTextId === text.id}
            onSelect={(textId) => drawingToolsStore.setSelectedText(textId)}
            onUpdate={(textId, updates) =>
              drawingToolsStore.updateText(textId, updates)
            }
            onDelete={(textId) => drawingToolsStore.deleteText(textId)}
          />
        ))}

        {/* Text creation preview */}
        <TextPreview
          textDrawingState={textDrawingState}
          viewport={reactFlowViewport}
        />

        {/* Text editor for editing mode */}
        {selectedTextId && (
          <TextEditor
            text={texts.find((t) => t.id === selectedTextId)!}
            viewport={reactFlowViewport}
            onSave={(content) => {
              if (selectedTextId) {
                drawingToolsStore.updateText(selectedTextId, {
                  content,
                  updatedAt: Date.now(),
                })
                drawingToolsStore.setSelectedText(null)
              }
            }}
            onCancel={() => drawingToolsStore.setSelectedText(null)}
            onUpdateText={(updates) => {
              // ✅ Fixed: Only accepts updates parameter
              if (selectedTextId) {
                drawingToolsStore.updateText(selectedTextId, updates)
              }
            }}
          />
        )}
      </div>

      {/* ✅ ENHANCED: Integrated Floating Toolbar */}
      <IntegratedFloatingToolbar
        activeTool={activeTool as ToolType}
        onToolChange={(tool) => {
          drawingToolsStore.setActiveTool(tool as any)
          if (tool && tool !== "hand" && tool !== "select") {
            drawingToolsStore.showPanel(tool as any)
          }
        }}
        isLocked={false} // ✅ Added missing prop
        onToggleLock={() => {}} // ✅ Added missing prop (placeholder)
        className="z-30" // ✅ Added className
      />

      {/* ✅ ENHANCED: Drawing Tools Panel with proper integration */}
      {isPanelVisible && activeTool && (
        <DrawingToolsPanel
          activeTool={activeTool as any} // ✅ Type assertion to handle ToolType vs DrawingToolType
          isVisible={isPanelVisible}
          onClose={() => drawingToolsStore.hidePanel()}
          onSettingsChange={(tool, settings) => {
            drawingToolsStore.updateToolSettings(tool, settings)

            // Apply to selected node if applicable
            if (
              selectedNodeId &&
              ["rectangle", "circle", "diamond"].includes(tool)
            ) {
              mindMapStore.updateNode(selectedNodeId, {
                strokeColor: settings.strokeColor,
                fillColor: settings.fillColor,
                strokeWidth: settings.strokeWidth,
                strokeStyle: settings.strokeStyle,
                opacity: settings.opacity,
                sloppiness: settings.sloppiness,
                edgeStyle: settings.edgeStyle,
              })
            }
          }}
          className="z-40"
        />
      )}

      {/* ✅ ENHANCED: Debug Panel (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded font-mono z-50">
          <div className="text-green-400 mb-1">🔧 Canvas Debug:</div>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
          <div>Selected: {selectedNodeId || "none"}</div>
          <div>Tool: {activeTool || "none"}</div>
          <div>Panel: {isPanelVisible ? "visible" : "hidden"}</div>
          <div>Lines: {lines.length}</div>
          <div>Texts: {texts.length}</div>
          <div>
            Viewport: {Math.round(reactFlowViewport.x)},{" "}
            {Math.round(reactFlowViewport.y)},{" "}
            {Math.round(reactFlowViewport.zoom * 100)}%
          </div>
          <div className="mt-1 pt-1 border-t border-gray-600">
            <div>
              Line Drawing: {lineDrawingState.isDrawing ? "active" : "inactive"}
            </div>
            <div>
              Text Creating:{" "}
              {textDrawingState.isCreating ? "active" : "inactive"}
            </div>
            <div>
              Erasing: {eraserState.isErasing ? "active" : "inactive"}{" "}
              {/* ✅ Added eraser status */}
            </div>
            {drawingToolsStore.selectedLineId && (
              <div>
                Selected Line: {drawingToolsStore.selectedLineId.slice(-8)}
              </div>
            )}
            {selectedTextId && (
              <div>Selected Text: {selectedTextId.slice(-8)}</div>
            )}
            {/* ✅ NEW: Eraser debug info */}
            {eraserState.isErasing && (
              <div>
                <div>Eraser Mode: {eraserState.mode}</div>
                <div>
                  Items to delete:{" "}
                  {eraserState.itemsToDelete.nodes.length +
                    eraserState.itemsToDelete.lines.length +
                    eraserState.itemsToDelete.texts.length +
                    eraserState.itemsToDelete.edges.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
