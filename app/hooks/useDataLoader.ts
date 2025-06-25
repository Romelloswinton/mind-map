// hooks/useDataLoader.ts
import { useEffect, useCallback } from "react"
import { ReactFlowNode, NodeShape } from "@/src/types/mindmap"
import { Edge } from "@xyflow/react"

interface UseDataLoaderProps {
  mindMapId: string
  setIsLoading: (loading: boolean) => void
  setNodes: (nodes: ReactFlowNode[]) => void
  setEdges: (edges: Edge[]) => void
  setLastSaved: (date: Date) => void
  setHistory: (
    history: Array<{ nodes: ReactFlowNode[]; edges: Edge[] }>
  ) => void
  setHistoryIndex: (index: number) => void
  nodes: ReactFlowNode[]
  edges: Edge[]
  isSaving: boolean
  hasUnsavedChanges: React.MutableRefObject<boolean>
  setIsSaving: (saving: boolean) => void
}

export function useDataLoader({
  mindMapId,
  setIsLoading,
  setNodes,
  setEdges,
  setLastSaved,
  setHistory,
  setHistoryIndex,
  nodes,
  edges,
  isSaving,
  hasUnsavedChanges,
  setIsSaving,
}: UseDataLoaderProps) {
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
                shape: (node.shape as NodeShape) || "rectangle", // Ensure shape is always set
                // Load any drawing tool properties from database
                ...(node.strokeColor && { strokeColor: node.strokeColor }),
                ...(node.fillColor && { fillColor: node.fillColor }),
                ...(node.strokeWidth && { strokeWidth: node.strokeWidth }),
                ...(node.strokeStyle && { strokeStyle: node.strokeStyle }),
                ...(node.opacity !== undefined && { opacity: node.opacity }),
                ...(node.sloppiness && { sloppiness: node.sloppiness }),
                ...(node.edgeStyle && { edgeStyle: node.edgeStyle }),
              },
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
        // Toast error would go here
      } finally {
        setIsLoading(false)
      }
    }

    loadMindMap()
  }, [
    mindMapId,
    setNodes,
    setEdges,
    setIsLoading,
    setLastSaved,
    setHistory,
    setHistoryIndex,
  ])

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
        // Save drawing tool properties
        ...(node.data.strokeColor && { strokeColor: node.data.strokeColor }),
        ...(node.data.fillColor && { fillColor: node.data.fillColor }),
        ...(node.data.strokeWidth && { strokeWidth: node.data.strokeWidth }),
        ...(node.data.strokeStyle && { strokeStyle: node.data.strokeStyle }),
        ...(node.data.opacity !== undefined && { opacity: node.data.opacity }),
        ...(node.data.sloppiness && { sloppiness: node.data.sloppiness }),
        ...(node.data.edgeStyle && { edgeStyle: node.data.edgeStyle }),
      }))

      const response = await fetch(`/api/mindmaps/${mindMapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: dbNodes }),
      })

      if (!response.ok) throw new Error("Failed to save mind map")

      hasUnsavedChanges.current = false
      setLastSaved(new Date())
      console.log("✅ Mind map saved!")
    } catch (error) {
      console.error("Error saving mind map:", error)
      // Toast error would go here
    } finally {
      setIsSaving(false)
    }
  }, [
    nodes,
    edges,
    mindMapId,
    isSaving,
    hasUnsavedChanges,
    setIsSaving,
    setLastSaved,
  ])

  return {
    saveMindMap,
  }
}
