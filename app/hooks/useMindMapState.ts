// hooks/useMindMapState.ts
import { useState, useRef } from "react"
import { useNodesState, useEdgesState, Viewport } from "@xyflow/react"
import {
  ReactFlowNode,
  NodeShape,
  ConnectionType,
  ToolType,
  ToolContext,
} from "@/src/types/mindmap"
import { Edge } from "@xyflow/react"

export function useMindMapState() {
  // React Flow state - cast to our types to resolve type conflicts
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Core state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })

  // Tool state
  const [selectedNodeShape, setSelectedNodeShape] =
    useState<NodeShape>("rectangle")
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(
    null
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>("select")
  const [isLocked, setIsLocked] = useState(false)
  const [panMode, setPanMode] = useState(false)

  // Drawing tools state
  const [showDrawingTools, setShowDrawingTools] = useState(false)
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(
    null
  )
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [toolContext, setToolContext] = useState<ToolContext | undefined>(
    undefined
  )

  // History state
  const [history, setHistory] = useState<
    Array<{ nodes: any[]; edges: Edge[] }>
  >([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)

  return {
    // React Flow state
    nodes: nodes as ReactFlowNode[], // Cast to our type
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,

    // Core state
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
    viewport,
    setViewport,

    // Tool state
    selectedNodeShape,
    setSelectedNodeShape,
    connectionMode,
    setConnectionMode,
    isConnecting,
    setIsConnecting,
    activeTool,
    setActiveTool,
    isLocked,
    setIsLocked,
    panMode,
    setPanMode,

    // Drawing tools state
    showDrawingTools,
    setShowDrawingTools,
    activeDrawingTool,
    setActiveDrawingTool,
    selectedNodes,
    setSelectedNodes,
    toolContext,
    setToolContext,

    // History state
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,

    // Refs
    saveTimeoutRef,
    hasUnsavedChanges,
    reactFlowWrapper,
  }
}
