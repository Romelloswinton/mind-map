// hooks/useEventHandlers.ts
import { useCallback } from "react"
import { useReactFlow } from "@xyflow/react"
import { ReactFlowNode, NodeShape, ToolType } from "@/src/types/mindmap"

interface UseEventHandlersProps {
  addNode: (position?: { x: number; y: number }, shape?: NodeShape) => void
  activeTool: ToolType
  isLocked: boolean
  selectedNodeShape: NodeShape
  setSelectedNodes: (nodes: string[]) => void
  hasUnsavedChanges: React.MutableRefObject<boolean>
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>
}

export function useEventHandlers({
  addNode,
  activeTool,
  isLocked,
  selectedNodeShape,
  setSelectedNodes,
  hasUnsavedChanges,
  reactFlowWrapper,
}: UseEventHandlersProps) {
  const { screenToFlowPosition } = useReactFlow()

  // Handle canvas single-click to create nodes
  const onCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      // Only proceed if we're in a node creation mode (tools 2-4: rectangle, circle, diamond)
      const nodeCreationTools: ToolType[] = ["rectangle", "circle", "diamond"]

      if (
        !reactFlowWrapper.current ||
        isLocked ||
        !nodeCreationTools.includes(activeTool)
      ) {
        return
      }

      // Prevent creating nodes when clicking on existing nodes or UI elements
      const target = event.target as HTMLElement
      if (
        target.closest(".react-flow__node") ||
        target.closest(".react-flow__edge") ||
        target.closest("button")
      ) {
        return
      }

      const rect = reactFlowWrapper.current.getBoundingClientRect()
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })

      // Determine the shape based on active tool
      let nodeShape: NodeShape = "rectangle"
      if (activeTool === "circle") {
        nodeShape = "circle"
      } else if (activeTool === "diamond") {
        nodeShape = "diamond"
      }

      console.log(
        `🖱️ Single-click at position:`,
        position,
        `Shape: ${nodeShape}`,
        `Tool: ${activeTool}`
      )

      addNode(position, nodeShape)
    },
    [addNode, screenToFlowPosition, isLocked, activeTool, reactFlowWrapper]
  )

  // Handle canvas double-click to create nodes (kept for backward compatibility)
  const onCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowWrapper.current || isLocked) return

      // Prevent creating nodes when double-clicking on existing nodes or UI elements
      const target = event.target as HTMLElement
      if (
        target.closest(".react-flow__node") ||
        target.closest(".react-flow__edge") ||
        target.closest("button")
      ) {
        return
      }

      const rect = reactFlowWrapper.current.getBoundingClientRect()
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })

      console.log(
        `🖱️ Double-click at position:`,
        position,
        `Shape: ${selectedNodeShape}`
      )
      addNode(position, selectedNodeShape)
    },
    [
      addNode,
      screenToFlowPosition,
      isLocked,
      selectedNodeShape,
      reactFlowWrapper,
    ]
  )

  // Node event handlers
  const onNodeDrag = useCallback((event: any, node: ReactFlowNode) => {
    console.log("🔄 Node dragging:", node.id, node.position)
  }, [])

  const onNodeDragStop = useCallback(
    (event: any, node: ReactFlowNode) => {
      console.log(
        "🛑 Node drag stopped:",
        node.id,
        "Final position:",
        node.position
      )
      hasUnsavedChanges.current = true
    },
    [hasUnsavedChanges]
  )

  const onNodeClick = useCallback((event: any, node: ReactFlowNode) => {
    console.log("👆 Node clicked:", node.id, "Selected:", node.selected)
    // Selection will be handled by onSelectionChange
  }, [])

  const handleNodeSelectionChange = useCallback(
    (params: { nodes: ReactFlowNode[]; edges: any[] }) => {
      const nodeIds = params.nodes.map((node) => node.id)
      setSelectedNodes(nodeIds)
      console.log(`🔍 Selection changed - Node IDs: [${nodeIds.join(", ")}]`)
    },
    [setSelectedNodes]
  )

  return {
    onCanvasClick,
    onCanvasDoubleClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeClick,
    handleNodeSelectionChange,
  }
}
