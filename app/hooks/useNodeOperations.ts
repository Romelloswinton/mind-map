// hooks/useNodeOperations.ts
import { useCallback } from "react"
import { ReactFlowNode, NodeShape } from "@/src/types/mindmap"
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"
import type { DrawingToolType } from "@/src/types/drawing-tools"
import { Dispatch, SetStateAction } from "react"

interface UseNodeOperationsProps {
  setNodes: Dispatch<SetStateAction<any[]>> // Accept the React state setter directly
  setEdges: Dispatch<SetStateAction<any[]>> // Accept the React state setter directly
  pushToHistory: () => void
  hasUnsavedChanges: React.MutableRefObject<boolean>
  selectedNodeShape: NodeShape
  activeDrawingTool: string | null
}

export function useNodeOperations({
  setNodes,
  setEdges,
  pushToHistory,
  hasUnsavedChanges,
  selectedNodeShape,
  activeDrawingTool,
}: UseNodeOperationsProps) {
  // Add new node with drawing tool defaults
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

      // Get current drawing tool settings to apply as defaults
      const currentTool = activeDrawingTool as DrawingToolType | null
      const { toolSettings } = useDrawingToolsStore.getState()
      const defaultSettings = currentTool ? toolSettings[currentTool] : null

      const newNode: ReactFlowNode = {
        id: `node-${Date.now()}`,
        type: "mindMapNode",
        position: newNodePosition,
        style: { width: 200, height: 120 },
        data: {
          text: "New Idea",
          color: defaultSettings?.fillColor || "#3b82f6",
          isEditing: true,
          shape: shape,
          // Apply current drawing tool settings as defaults for new nodes
          ...(defaultSettings?.strokeColor && {
            strokeColor: defaultSettings.strokeColor,
          }),
          ...(defaultSettings?.fillColor && {
            fillColor: defaultSettings.fillColor,
          }),
          ...(defaultSettings?.strokeWidth && {
            strokeWidth: defaultSettings.strokeWidth,
          }),
          ...(defaultSettings?.strokeStyle && {
            strokeStyle: defaultSettings.strokeStyle,
          }),
          ...(defaultSettings?.opacity && { opacity: defaultSettings.opacity }),
          ...(defaultSettings?.sloppiness && {
            sloppiness: defaultSettings.sloppiness,
          }),
          ...(defaultSettings?.edgeStyle && {
            edgeStyle: defaultSettings.edgeStyle,
          }),
        },
        resizing: false,
        selected: false,
        dragging: false,
      }

      setNodes((nds) => [...nds, newNode])
      hasUnsavedChanges.current = true

      console.log(`🎨 Created node with drawing tool defaults:`, newNode.data)
    },
    [
      setNodes,
      pushToHistory,
      selectedNodeShape,
      activeDrawingTool,
      hasUnsavedChanges,
    ]
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
    [setNodes, setEdges, pushToHistory, hasUnsavedChanges]
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
    [setNodes, hasUnsavedChanges]
  )

  return {
    addNode,
    deleteNode,
    updateNodeData,
  }
}
