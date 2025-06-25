"use client"

import { useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  OnConnect,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  Viewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MindMapNode } from "./mind-map-node"

// Drawing tools imports
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"
import type {
  DrawingToolType,
  DrawingToolSettings,
} from "@/src/types/drawing-tools"

// Import components
import IntegratedFloatingToolbar from "./integrated-floating-toolbar"

// Types

import { Edge } from "@xyflow/react"
import {
  ConnectionType,
  MindMapCanvasProps,
  ReactFlowNode,
} from "@/src/types/mindmap"
import { useMindMapState } from "@/app/hooks/useMindMapState"
import { useNodeOperations } from "@/app/hooks/useNodeOperations"
import { useEventHandlers } from "@/app/hooks/useEventHandlers"
import { useDataLoader } from "@/app/hooks/useDataLoader"
import { useKeyboardShortcuts } from "@/app/hooks/useKeyboardShortcuts"
import DrawingToolsPanel from "./drawing-tools-panel"
import { UIIndicators } from "./UIIndicators"
import { useToolHandlers } from "@/app/hooks/useToolHandlers"

const nodeTypes = {
  mindMapNode: MindMapNode,
}

function MindMapCanvasInner({ mindMapId }: MindMapCanvasProps) {
  // Initialize all state with our custom hook
  const state = useMindMapState()
  const { setViewport: setReactFlowViewport } = useReactFlow()

  // History operations
  const pushToHistory = useCallback(() => {
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push({ nodes: [...state.nodes], edges: [...state.edges] })

    if (newHistory.length > 20) {
      newHistory.shift()
    }

    state.setHistory(newHistory)
    state.setHistoryIndex(newHistory.length - 1)
  }, [
    state.nodes,
    state.edges,
    state.history,
    state.historyIndex,
    state.setHistory,
    state.setHistoryIndex,
  ])

  const handleUndo = useCallback(() => {
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1]
      state.setNodes(previousState.nodes)
      state.setEdges(previousState.edges)
      state.setHistoryIndex(state.historyIndex - 1)
      state.hasUnsavedChanges.current = true
    }
  }, [
    state.history,
    state.historyIndex,
    state.setNodes,
    state.setEdges,
    state.setHistoryIndex,
    state.hasUnsavedChanges,
  ])

  const handleRedo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1]
      state.setNodes(nextState.nodes)
      state.setEdges(nextState.edges)
      state.setHistoryIndex(state.historyIndex + 1)
      state.hasUnsavedChanges.current = true
    }
  }, [
    state.history,
    state.historyIndex,
    state.setNodes,
    state.setEdges,
    state.setHistoryIndex,
    state.hasUnsavedChanges,
  ])

  // Initialize node operations
  const { addNode, deleteNode, updateNodeData } = useNodeOperations({
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    pushToHistory,
    hasUnsavedChanges: state.hasUnsavedChanges,
    selectedNodeShape: state.selectedNodeShape,
    activeDrawingTool: state.activeDrawingTool,
  })

  // Initialize event handlers
  const eventHandlers = useEventHandlers({
    addNode,
    activeTool: state.activeTool,
    isLocked: state.isLocked,
    selectedNodeShape: state.selectedNodeShape,
    setSelectedNodes: state.setSelectedNodes,
    hasUnsavedChanges: state.hasUnsavedChanges,
    reactFlowWrapper: state.reactFlowWrapper,
  })

  // Initialize tool handlers
  const toolHandlers = useToolHandlers({
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool,
    isLocked: state.isLocked,
    setIsLocked: state.setIsLocked,
    setPanMode: state.setPanMode,
    setIsConnecting: state.setIsConnecting,
    setShowDrawingTools: state.setShowDrawingTools,
    setActiveDrawingTool: state.setActiveDrawingTool,
    setToolContext: state.setToolContext,
    setSelectedNodeShape: state.setSelectedNodeShape,
    selectedNodes: state.selectedNodes,
    showDrawingTools: state.showDrawingTools,
    toolContext: state.toolContext,
  })

  // Initialize data loader
  const { saveMindMap } = useDataLoader({
    mindMapId,
    setIsLoading: state.setIsLoading,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    setLastSaved: state.setLastSaved,
    setHistory: state.setHistory,
    setHistoryIndex: state.setHistoryIndex,
    nodes: state.nodes,
    edges: state.edges,
    isSaving: state.isSaving,
    hasUnsavedChanges: state.hasUnsavedChanges,
    setIsSaving: state.setIsSaving,
  })

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    addNode,
    saveMindMap,
    updateNodeData,
    deleteNode,
    handleUndo,
    handleRedo,
    handleToolChange: toolHandlers.handleToolChange,
    handleToggleLock: toolHandlers.handleToggleLock,
    showDrawingTools: state.showDrawingTools,
    handleCloseDrawingTools: toolHandlers.handleCloseDrawingTools,
  })

  // Enhanced edge creation with different styles
  const createEdgeWithStyle = useCallback(
    (connection: Connection, type: ConnectionType = "curved"): Edge => {
      const baseEdge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      }

      switch (type) {
        case "straight":
          return { ...baseEdge, type: "straight" }
        case "step":
          return { ...baseEdge, type: "step" }
        case "bezier":
          return { ...baseEdge, type: "default" }
        case "curved":
        default:
          return { ...baseEdge, type: "smoothstep" }
      }
    },
    []
  )

  // Auto-save effect
  useEffect(() => {
    if (state.hasUnsavedChanges.current) {
      if (state.saveTimeoutRef.current)
        clearTimeout(state.saveTimeoutRef.current)
      state.saveTimeoutRef.current = setTimeout(() => saveMindMap(), 3000)
    }
    return () => {
      if (state.saveTimeoutRef.current)
        clearTimeout(state.saveTimeoutRef.current)
    }
  }, [
    state.nodes,
    state.edges,
    saveMindMap,
    state.saveTimeoutRef,
    state.hasUnsavedChanges,
  ])

  // Update tool context when selection changes
  useEffect(() => {
    if (
      state.showDrawingTools &&
      state.toolContext?.type === "node" &&
      state.selectedNodes.length > 0
    ) {
      const selectedNodeId = state.selectedNodes[0]
      const selectedNode = state.nodes.find((n) => n.id === selectedNodeId)

      if (selectedNode && state.toolContext.selectedNodeId !== selectedNodeId) {
        state.setToolContext((prev) =>
          prev
            ? {
                ...prev,
                selectedNodeId: selectedNodeId,
                shape: selectedNode.data.shape || "rectangle",
              }
            : undefined
        )
      }
    } else if (
      state.showDrawingTools &&
      state.toolContext?.type === "node" &&
      state.selectedNodes.length === 0
    ) {
      if (state.toolContext.selectedNodeId) {
        state.setToolContext((prev) =>
          prev ? { ...prev, selectedNodeId: undefined } : undefined
        )
      }
    }
  }, [
    state.selectedNodes,
    state.showDrawingTools,
    state.toolContext?.type,
    state.toolContext?.selectedNodeId,
    state.nodes,
    state.setToolContext,
  ])

  // Handle nodes change with NaN protection
  const handleNodesChange = useCallback(
    (changes: NodeChange<ReactFlowNode>[]) => {
      state.hasUnsavedChanges.current = true

      state.setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds)

        const validatedNodes = updatedNodes.map((node) => {
          const x = isNaN(node.position.x) ? 0 : node.position.x
          const y = isNaN(node.position.y) ? 0 : node.position.y

          if (isNaN(node.position.x) || isNaN(node.position.y)) {
            console.warn(
              `🚨 Fixed NaN position for node ${node.id}:`,
              `${node.position.x} -> ${x}, ${node.position.y} -> ${y}`
            )
          }

          return { ...node, position: { x, y } }
        })

        return validatedNodes
      })

      state.onNodesChange(changes)
    },
    [state.setNodes, state.onNodesChange, state.hasUnsavedChanges]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      state.hasUnsavedChanges.current = true
      state.setEdges((eds) => applyEdgeChanges(changes, eds))
      state.onEdgesChange(changes)
    },
    [state.setEdges, state.onEdgesChange, state.hasUnsavedChanges]
  )

  // Enhanced onConnect handler
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      state.hasUnsavedChanges.current = true
      pushToHistory()

      const edge = createEdgeWithStyle(
        connection,
        state.connectionMode || "curved"
      )
      state.setEdges((eds) => addEdge(edge, eds))

      if (state.connectionMode) {
        console.log(`✅ Connected nodes with ${state.connectionMode} style`)
      }
    },
    [
      state.setEdges,
      pushToHistory,
      state.connectionMode,
      createEdgeWithStyle,
      state.hasUnsavedChanges,
    ]
  )

  // Update viewport when React Flow viewport changes
  const onViewportChange = useCallback(
    (newViewport: Viewport) => {
      state.setViewport(newViewport)
    },
    [state.setViewport]
  )

  // Drawing tools handlers
  const handleDrawingToolSettings = useCallback(
    (tool: DrawingToolType, settings: Partial<DrawingToolSettings>) => {
      console.log(`🎨 Drawing tool settings changed for ${tool}:`, settings)

      // Helper function to apply settings to a node
      const applyToNode = (nodeId: string) => {
        const nodeData: Partial<ReactFlowNode["data"]> = {}

        // Map drawing tool settings to node data
        if (settings.strokeColor) {
          nodeData.strokeColor = settings.strokeColor
        }

        if (settings.fillColor) {
          nodeData.fillColor = settings.fillColor
          nodeData.color = settings.fillColor // Update main color too
        }

        if (settings.strokeWidth) {
          nodeData.strokeWidth = settings.strokeWidth
        }

        if (settings.strokeStyle) {
          nodeData.strokeStyle = settings.strokeStyle
        }

        if (settings.opacity) {
          nodeData.opacity = settings.opacity
        }

        if (settings.sloppiness) {
          nodeData.sloppiness = settings.sloppiness
        }

        if (settings.edgeStyle) {
          nodeData.edgeStyle = settings.edgeStyle
        }

        // Update the node
        updateNodeData(nodeId, nodeData)

        console.log(`🎨 Applied ${tool} settings to node ${nodeId}:`, nodeData)
      }

      // Apply settings based on context
      if (
        state.toolContext?.type === "node" &&
        state.toolContext.selectedNodeId
      ) {
        // Apply to specifically selected node
        applyToNode(state.toolContext.selectedNodeId)
      } else if (
        state.toolContext?.type === "node" &&
        state.selectedNodes.length > 0
      ) {
        // Apply to all selected nodes
        state.selectedNodes.forEach((nodeId) => {
          applyToNode(nodeId)
        })
      } else if (state.toolContext?.type === "connector") {
        // Apply to connector styling
        console.log("Applying connector styles:", settings)
        // TODO: Apply to selected edges in future
      } else {
        // Store as defaults for new nodes
        console.log(
          `Setting default styling for future ${
            state.toolContext?.shape || "nodes"
          }:`,
          settings
        )
      }
    },
    [state.toolContext, state.selectedNodes, updateNodeData]
  )

  if (state.isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your mind map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      <div
        className={cn(
          "h-full relative",
          state.isConnecting && "connecting-mode",
          state.panMode && "cursor-grab",
          state.isLocked && "pointer-events-none"
        )}
        ref={state.reactFlowWrapper}
      >
        {/* Compact Floating Toolbar */}
        <IntegratedFloatingToolbar
          activeTool={state.activeTool}
          onToolChange={toolHandlers.handleToolChange}
          onToggleLock={toolHandlers.handleToggleLock}
          isLocked={state.isLocked}
        />

        {/* Enhanced Drawing Tools Panel */}
        {state.showDrawingTools && state.activeDrawingTool && (
          <DrawingToolsPanel
            activeTool={state.activeDrawingTool as DrawingToolType}
            isVisible={state.showDrawingTools}
            onClose={toolHandlers.handleCloseDrawingTools}
            onSettingsChange={handleDrawingToolSettings}
            toolContext={state.toolContext}
            updateNodeData={updateNodeData}
            className="mt-16"
          />
        )}

        {/* UI Indicators */}
        <UIIndicators
          isLocked={state.isLocked}
          showDrawingTools={state.showDrawingTools}
          activeDrawingTool={state.activeDrawingTool}
          toolContext={state.toolContext}
          activeTool={state.activeTool}
          selectedNodeShape={state.selectedNodeShape}
          isSaving={state.isSaving}
          lastSaved={state.lastSaved}
          selectedNodes={state.selectedNodes}
        />

        <ReactFlow<ReactFlowNode, Edge>
          nodes={state.nodes}
          edges={state.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onClick={eventHandlers.onCanvasClick}
          onDoubleClick={eventHandlers.onCanvasDoubleClick}
          onViewportChange={onViewportChange}
          onNodeDrag={eventHandlers.onNodeDrag}
          onNodeDragStop={eventHandlers.onNodeDragStop}
          onNodeClick={eventHandlers.onNodeClick}
          onSelectionChange={eventHandlers.handleNodeSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-white"
          nodesDraggable={!state.isLocked && state.activeTool !== "hand"}
          elementsSelectable={
            !state.isLocked &&
            (state.activeTool === "select" || state.showDrawingTools)
          }
          nodesFocusable={!state.isLocked}
          edgesFocusable={!state.isLocked}
          panOnScroll={true}
          zoomOnScroll={!state.isLocked}
          zoomOnPinch={!state.isLocked}
          selectNodesOnDrag={false}
          panOnDrag={state.panMode || state.activeTool === "hand"}
          selectionOnDrag={state.activeTool === "select" && !state.isLocked}
          multiSelectionKeyCode={["Meta", "Shift"]}
          deleteKeyCode={!state.isLocked ? ["Backspace", "Delete"] : []}
          snapToGrid={false}
          snapGrid={[15, 15]}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls
            className="bg-white shadow-lg border border-gray-200"
            showInteractive={false}
          />
          <MiniMap
            className="bg-white border border-gray-200"
            nodeColor="#3b82f6"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}

// Export both the inner component and the main component
export function SimpleMindMapCanvas({ mindMapId }: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner mindMapId={mindMapId} />
    </ReactFlowProvider>
  )
}

// Main export for compatibility
export function MindMapCanvas({ mindMapId }: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner mindMapId={mindMapId} />
    </ReactFlowProvider>
  )
}
