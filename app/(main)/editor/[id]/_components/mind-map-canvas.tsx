"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
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
  NodeResizer, // 🔥 ADDED: Import NodeResizer for resizing support
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import IntegratedFloatingToolbar, {
  ToolType,
} from "./integrated-floating-toolbar"
import { Save, Loader2 } from "lucide-react"
import {
  ReactFlowNode,
  NodeShape,
  ConnectionType,
} from "@/src/stores/mind-map-store"
import { MindMapNode } from "./mind-map-node"
import { cn } from "@/lib/utils"

// Simple toast implementation
const toast = {
  success: (message: string) => console.log("✅", message),
  error: (message: string) => console.error("❌", message),
}

const nodeTypes = {
  mindMapNode: MindMapNode,
}

interface MindMapCanvasProps {
  mindMapId: string
}

function MindMapCanvasInner({ mindMapId }: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })

  // 🔥 Extended state for floating toolbar integration
  const [selectedNodeShape, setSelectedNodeShape] =
    useState<NodeShape>("rectangle")
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(
    null
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>("select")
  const [isLocked, setIsLocked] = useState(false)
  const [panMode, setPanMode] = useState(false)

  // Simple history for undo/redo
  const [history, setHistory] = useState<
    Array<{ nodes: ReactFlowNode[]; edges: Edge[] }>
  >([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const {
    screenToFlowPosition,
    zoomIn,
    zoomOut,
    fitView,
    getViewport,
    setViewport: setReactFlowViewport,
  } = useReactFlow()

  // Auto-save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Update viewport when React Flow viewport changes
  const onViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport)
  }, [])

  // 🔥 Floating toolbar event handlers
  const handleToolChange = useCallback((tool: ToolType) => {
    setActiveTool(tool)

    // Handle specific tool behaviors
    switch (tool) {
      case "hand":
        setPanMode(true)
        setIsConnecting(false)
        break
      case "select":
        setPanMode(false)
        setIsConnecting(false)
        break
      case "arrow":
        setConnectionMode("curved")
        setIsConnecting(true)
        setPanMode(false)
        break
      case "rectangle":
      case "circle":
      case "diamond":
        setSelectedNodeShape(tool as NodeShape)
        setPanMode(false)
        setIsConnecting(false)
        break
      default:
        setPanMode(false)
        setIsConnecting(false)
        break
    }

    console.log(`🔧 Tool changed to: ${tool}`)
  }, [])

  const handleShapeChange = useCallback((shape: NodeShape) => {
    setSelectedNodeShape(shape)
    console.log(`🔷 Shape changed to: ${shape}`)
  }, [])

  const handleToggleLock = useCallback(() => {
    setIsLocked(!isLocked)
    console.log(`🔒 Canvas ${!isLocked ? "locked" : "unlocked"}`)
  }, [isLocked])

  const handleShare = useCallback(() => {
    console.log("📤 Share button clicked")
    toast.success("Share functionality triggered!")
  }, [])

  const handleLibrary = useCallback(() => {
    console.log("📚 Library button clicked")
    toast.success("Library functionality triggered!")
  }, [])

  // Simple history management
  const pushToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: [...nodes], edges: [...edges] })

    if (newHistory.length > 20) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
      setHistoryIndex(historyIndex - 1)
      hasUnsavedChanges.current = true
    }
  }, [history, historyIndex, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
      hasUnsavedChanges.current = true
    }
  }, [history, historyIndex, setNodes, setEdges])

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 })
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 })
  }, [zoomOut])

  const handleFitView = useCallback(() => {
    fitView({
      duration: 500,
      padding: 0.2,
      includeHiddenNodes: false,
      maxZoom: 1.5,
      minZoom: 0.5,
    })
  }, [fitView])

  const handleResetZoom = useCallback(() => {
    const currentViewport = getViewport()
    setReactFlowViewport(
      {
        x: currentViewport.x,
        y: currentViewport.y,
        zoom: 1,
      },
      { duration: 300 }
    )
  }, [getViewport, setReactFlowViewport])

  const handleCustomZoomIn = useCallback(() => {
    const currentViewport = getViewport()
    const newZoom = Math.min(currentViewport.zoom * 1.2, 2)
    setReactFlowViewport(
      {
        x: currentViewport.x,
        y: currentViewport.y,
        zoom: newZoom,
      },
      { duration: 200 }
    )
  }, [getViewport, setReactFlowViewport])

  const handleCustomZoomOut = useCallback(() => {
    const currentViewport = getViewport()
    const newZoom = Math.max(currentViewport.zoom / 1.2, 0.1)
    setReactFlowViewport(
      {
        x: currentViewport.x,
        y: currentViewport.y,
        zoom: newZoom,
      },
      { duration: 200 }
    )
  }, [getViewport, setReactFlowViewport])

  // Connection mode handler
  const handleSetConnectionMode = useCallback((type: ConnectionType | null) => {
    setConnectionMode(type)
    setIsConnecting(!!type)

    if (type) {
      console.log(`🔗 Connection mode activated: ${type}`)
      setActiveTool("arrow")
    } else {
      console.log(`🔗 Connection mode disabled`)
      setActiveTool("select")
    }
  }, [])

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

  // Load mind map data
  useEffect(() => {
    const loadMindMap = async () => {
      try {
        setIsLoading(true)

        if (mindMapId === "new") {
          const initialNode: ReactFlowNode = {
            id: "root",
            type: "mindMapNode",
            position: { x: 400, y: 300 },
            style: { width: 200, height: 120 },
            data: {
              text: "Main Idea",
              color: "#3b82f6",
              isEditing: false,
              shape: "rectangle" as NodeShape,
            },
            // 🔥 CRITICAL: Enable resizing for nodes
            resizing: false,
            selected: false,
            dragging: false,
          }
          setNodes([initialNode])
          setHistory([{ nodes: [initialNode], edges: [] }])
          setHistoryIndex(0)
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/mindmaps/${mindMapId}`)
        if (!response.ok) throw new Error("Failed to load mind map")

        const data = await response.json()

        const flowNodes: ReactFlowNode[] =
          data.nodes?.map(
            (node: any): ReactFlowNode => ({
              id: node.id,
              type: "mindMapNode",
              position: { x: node.x, y: node.y },
              style: {
                width: node.width || 200,
                height: node.height || 120,
              },
              data: {
                text: node.text,
                color: node.color || "#3b82f6",
                isEditing: false,
                shape: (node.shape as NodeShape) || "rectangle",
              },
              // 🔥 CRITICAL: Enable resizing for loaded nodes
              resizing: false,
              selected: false,
              dragging: false,
            })
          ) || []

        const flowEdges: Edge[] =
          data.nodes
            ?.filter((node: any) => node.parentId)
            .map(
              (node: any): Edge => ({
                id: `e${node.parentId}-${node.id}`,
                source: node.parentId,
                target: node.id,
                type: "smoothstep",
                style: { stroke: "#94a3b8", strokeWidth: 2 },
              })
            ) || []

        setNodes(flowNodes)
        setEdges(flowEdges)
        setLastSaved(new Date(data.updatedAt))
        setHistory([{ nodes: flowNodes, edges: flowEdges }])
        setHistoryIndex(0)
      } catch (error) {
        console.error("Error loading mind map:", error)
        toast.error("Failed to load mind map")
      } finally {
        setIsLoading(false)
      }
    }

    loadMindMap()
  }, [mindMapId, setNodes, setEdges])

  // Auto-save functionality
  const saveMindMap = useCallback(async () => {
    if (!hasUnsavedChanges.current || isSaving || mindMapId === "new") return

    try {
      setIsSaving(true)

      const dbNodes = nodes.map((node) => ({
        id: node.id,
        text: node.data.text,
        x: node.position.x,
        y: node.position.y,
        width: node.measured?.width || node.style?.width || 200,
        height: node.measured?.height || node.style?.height || 120,
        color: node.data.color,
        shape: node.data.shape || "rectangle",
        parentId:
          edges.find((edge: Edge) => edge.target === node.id)?.source || null,
      }))

      const response = await fetch(`/api/mindmaps/${mindMapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: dbNodes }),
      })

      if (!response.ok) throw new Error("Failed to save mind map")

      hasUnsavedChanges.current = false
      setLastSaved(new Date())
      toast.success("Mind map saved!")
    } catch (error) {
      console.error("Error saving mind map:", error)
      toast.error("Failed to save mind map")
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges, mindMapId, isSaving])

  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges.current) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => saveMindMap(), 3000)
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [nodes, edges, saveMindMap])

  // Handle nodes change with NaN protection and dimension tracking
  const handleNodesChange = useCallback(
    (changes: NodeChange<ReactFlowNode>[]) => {
      console.log("Node changes detected:", changes)

      hasUnsavedChanges.current = true

      setNodes((nds) => {
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

        // 🔥 RESTORED: Log specific change types including dimensions
        changes.forEach((change) => {
          if (
            change.type === "position" &&
            "position" in change &&
            change.position
          ) {
            console.log(`✅ Node ${change.id} moved to:`, change.position)
          } else if (change.type === "dimensions" && "id" in change) {
            console.log(`📏 Node ${change.id} dimensions changed`)
            // 🔥 RESTORED: Log the new dimensions for debugging
            const updatedNode = validatedNodes.find((n) => n.id === change.id)
            if (updatedNode) {
              console.log(`📏 New dimensions:`, {
                width: updatedNode.measured?.width || updatedNode.style?.width,
                height:
                  updatedNode.measured?.height || updatedNode.style?.height,
              })
            }
          } else if (change.type === "remove") {
            console.log(`🗑️ Node ${change.id} removed`)
          } else if (change.type === "add") {
            console.log(`➕ Node ${change.item.id} added`)
          } else if (change.type === "replace") {
            console.log(`🔄 Node ${change.item.id} replaced`)
          }
        })

        return validatedNodes
      })

      onNodesChange(changes)
    },
    [setNodes, onNodesChange]
  )

  // Node event handlers
  const onNodeDrag = useCallback((event: any, node: ReactFlowNode) => {
    console.log("🔄 Node dragging:", node.id, node.position)
  }, [])

  const onNodeDragStop = useCallback((event: any, node: ReactFlowNode) => {
    console.log(
      "🛑 Node drag stopped:",
      node.id,
      "Final position:",
      node.position
    )
    hasUnsavedChanges.current = true
  }, [])

  const onNodeClick = useCallback((event: any, node: ReactFlowNode) => {
    console.log("👆 Node clicked:", node.id, "Selected:", node.selected)
  }, [])

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      hasUnsavedChanges.current = true
      setEdges((eds) => applyEdgeChanges(changes, eds))
      onEdgesChange(changes)
    },
    [setEdges, onEdgesChange]
  )

  // Enhanced onConnect handler
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      hasUnsavedChanges.current = true
      pushToHistory()

      const edge = createEdgeWithStyle(connection, connectionMode || "curved")
      setEdges((eds) => addEdge(edge, eds))

      if (connectionMode) {
        console.log(`✅ Connected nodes with ${connectionMode} style`)
      }
    },
    [setEdges, pushToHistory, connectionMode, createEdgeWithStyle]
  )

  // Add new node
  const addNode = useCallback(
    (
      position?: { x: number; y: number },
      shape: NodeShape = selectedNodeShape
    ) => {
      const defaultPosition = {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150,
      }

      const newNodePosition = position
        ? {
            x: isNaN(position.x) ? defaultPosition.x : position.x,
            y: isNaN(position.y) ? defaultPosition.y : position.y,
          }
        : defaultPosition

      pushToHistory()

      const newNode: ReactFlowNode = {
        id: `node-${Date.now()}`,
        type: "mindMapNode",
        position: newNodePosition,
        style: { width: 200, height: 120 },
        data: {
          text: "New Idea",
          color: "#3b82f6",
          isEditing: true,
          shape: shape,
        },
        // 🔥 CRITICAL: Enable resizing for new nodes
        resizing: false,
        selected: false,
        dragging: false,
      }

      setNodes((nds) => [...nds, newNode])
      setSelectedNodeShape(shape)
      hasUnsavedChanges.current = true
    },
    [setNodes, pushToHistory, selectedNodeShape]
  )

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<ReactFlowNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      )
      hasUnsavedChanges.current = true
    },
    [setNodes]
  )

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      pushToHistory()
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      )
      hasUnsavedChanges.current = true
    },
    [setNodes, setEdges, pushToHistory]
  )

  // Handle canvas double-click
  const onCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowWrapper.current || isLocked) return

      const rect = reactFlowWrapper.current.getBoundingClientRect()
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })

      addNode(position)
    },
    [addNode, screenToFlowPosition, isLocked]
  )

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Node shortcuts
      if (event.key === " " && !event.repeat) {
        event.preventDefault()
        addNode()
      }

      if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        saveMindMap()
      }

      // Tool shortcuts
      if (event.key === "1" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToggleLock()
      } else if (event.key === "2" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setSelectedNodeShape("rectangle")
        setActiveTool("rectangle")
      } else if (event.key === "3" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setSelectedNodeShape("diamond")
        setActiveTool("diamond")
      } else if (event.key === "4" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setSelectedNodeShape("circle")
        setActiveTool("circle")
      } else if (event.key === "5" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleSetConnectionMode(connectionMode ? null : "curved")
      } else if (event.key === "6" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setActiveTool("pencil")
      } else if (event.key === "8" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setActiveTool("text")
      } else if (event.key === "9" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setActiveTool("image")
      } else if (event.key === "0" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setActiveTool("eraser")
      }

      // Tool mode shortcuts
      if (event.key === "h" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("hand")
      } else if (event.key === "v" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("select")
      }

      if (event.key === "c" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleSetConnectionMode(connectionMode ? null : "curved")
      }

      // Zoom shortcuts
      if (
        (event.key === "+" || event.key === "=" || event.key === "Add") &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        handleCustomZoomIn()
      } else if (
        (event.key === "-" || event.key === "_" || event.key === "Subtract") &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        handleCustomZoomOut()
      } else if (event.key === "0" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleResetZoom()
      } else if (event.key === "1" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleFitView()
      }

      // Alternative zoom shortcuts (without Ctrl/Cmd)
      if (event.key === "+" || event.key === "=") {
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault()
          handleCustomZoomIn()
        }
      } else if (event.key === "-") {
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault()
          handleCustomZoomOut()
        }
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault()
        handleFitView()
      }

      // History shortcuts
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey
      ) {
        event.preventDefault()
        handleUndo()
      } else if (
        (event.key === "y" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "z" &&
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey)
      ) {
        event.preventDefault()
        handleRedo()
      }
    }

    // Handle custom events from nodes
    const handleNodeUpdate = (event: CustomEvent) => {
      const { nodeId, data } = event.detail
      updateNodeData(nodeId, data)
    }

    const handleNodeDelete = (event: CustomEvent) => {
      const { nodeId } = event.detail
      deleteNode(nodeId)
    }

    const handleNodeAddChild = (event: CustomEvent) => {
      const { parentId, position } = event.detail
      addNode(position)
    }

    window.addEventListener("keydown", handleKeyPress)
    window.addEventListener("nodeUpdate", handleNodeUpdate as EventListener)
    window.addEventListener("nodeDelete", handleNodeDelete as EventListener)
    window.addEventListener("nodeAddChild", handleNodeAddChild as EventListener)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
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
  }, [
    addNode,
    saveMindMap,
    updateNodeData,
    deleteNode,
    handleUndo,
    handleRedo,
    handleCustomZoomIn,
    handleCustomZoomOut,
    handleFitView,
    handleResetZoom,
    handleSetConnectionMode,
    connectionMode,
    setSelectedNodeShape,
    handleToolChange,
    handleToggleLock,
  ])

  if (isLoading) {
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
          isConnecting && "connecting-mode",
          panMode && "cursor-grab",
          isLocked && "pointer-events-none"
        )}
        ref={reactFlowWrapper}
      >
        {/* Floating Toolbar */}
        <IntegratedFloatingToolbar
          activeTool={activeTool}
          selectedNodeShape={selectedNodeShape}
          onToolChange={handleToolChange}
          onShapeChange={handleShapeChange}
          onAddNode={addNode}
          isLocked={isLocked}
          onToggleLock={handleToggleLock}
          onShare={handleShare}
          onLibrary={handleLibrary}
        />

        <ReactFlow<ReactFlowNode, Edge>
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onDoubleClick={onCanvasDoubleClick}
          onViewportChange={onViewportChange}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-white"
          nodesDraggable={!isLocked && activeTool !== "hand"}
          nodesConnectable={
            !isLocked && (isConnecting || activeTool === "arrow")
          }
          elementsSelectable={!isLocked && activeTool === "select"}
          nodesFocusable={!isLocked}
          edgesFocusable={!isLocked}
          panOnScroll={true}
          zoomOnScroll={!isLocked}
          zoomOnPinch={!isLocked}
          selectNodesOnDrag={false}
          panOnDrag={panMode || activeTool === "hand"}
          selectionOnDrag={activeTool === "select" && !isLocked}
          multiSelectionKeyCode={["Meta", "Shift"]}
          deleteKeyCode={!isLocked ? ["Backspace", "Delete"] : []}
          snapToGrid={false}
          snapGrid={[15, 15]}
          // 🔥 RESTORED: Enable selection and resizing
          onSelectionChange={(params) => {
            console.log("Selection changed:", params)
          }}
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

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-red-400/50">
            <span className="text-sm font-medium">🔒 Canvas Locked</span>
          </div>
        )}

        {/* Save Status */}
        {(isSaving || lastSaved) && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  Saved at {lastSaved.toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>
        )}

        {/* Shape Selection Indicator */}
        {selectedNodeShape !== "rectangle" && !isLocked && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <span className="text-sm text-gray-600">
              Next shape:{" "}
              <strong className="capitalize">{selectedNodeShape}</strong>
            </span>
          </div>
        )}
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
