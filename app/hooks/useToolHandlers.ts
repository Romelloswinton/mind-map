// hooks/useToolHandlers.ts
import { useCallback } from "react"
import { ToolType, NodeShape, ToolContext } from "@/src/types/mindmap"

interface UseToolHandlersProps {
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  setPanMode: (pan: boolean) => void
  setIsConnecting: (connecting: boolean) => void
  setShowDrawingTools: (show: boolean) => void
  setActiveDrawingTool: (tool: string | null) => void
  setToolContext: (context: ToolContext | undefined) => void
  setSelectedNodeShape: (shape: NodeShape) => void
  selectedNodes: string[]
  showDrawingTools: boolean
  toolContext?: ToolContext
}

// Map ToolType to DrawingToolType for the panel
const mapToolToDrawingTool = (tool: ToolType): string | null => {
  const toolMap: Record<string, string> = {
    rectangle: "pencil",
    circle: "pencil",
    diamond: "pencil",
    text: "text",
    image: "image",
    eraser: "pencil",
  }
  return toolMap[tool] || null
}

export function useToolHandlers({
  activeTool,
  setActiveTool,
  isLocked,
  setIsLocked,
  setPanMode,
  setIsConnecting,
  setShowDrawingTools,
  setActiveDrawingTool,
  setToolContext,
  setSelectedNodeShape,
  selectedNodes,
  showDrawingTools,
  toolContext,
}: UseToolHandlersProps) {
  // Enhanced tool change handler with drawing tools integration
  const handleToolChange = useCallback(
    (tool: ToolType) => {
      console.log(`🔧 Tool change requested: ${tool}`)
      setActiveTool(tool)

      // Check if this is a customization tool
      const isCustomTool = [
        "rectangle",
        "circle",
        "diamond",
        "text",
        "image",
        "eraser",
      ].includes(tool)

      if (isCustomTool) {
        const mappedTool = mapToolToDrawingTool(tool)
        if (mappedTool) {
          setActiveDrawingTool(mappedTool)
          setShowDrawingTools(true)

          // Set appropriate context
          if (["rectangle", "circle", "diamond"].includes(tool)) {
            setToolContext({
              type: "node",
              shape: tool as NodeShape,
              selectedNodeId: selectedNodes[0] || undefined,
            })
            // Update selected node shape for next node creation
            setSelectedNodeShape(tool as NodeShape)
            console.log(`🔷 Set node shape to: ${tool}`)
          } else {
            setToolContext({
              type: "drawing",
            })
          }
        }
      } else {
        // For non-customization tools, hide the panel
        setShowDrawingTools(false)
        setActiveDrawingTool(null)
        setToolContext(undefined)
      }

      // Handle specific tool behaviors
      switch (tool) {
        case "hand":
          setPanMode(true)
          setIsConnecting(false)
          console.log("🖐 Hand mode activated")
          break
        case "select":
          setPanMode(false)
          setIsConnecting(false)
          console.log("👆 Select mode activated")
          break
        case "rectangle":
        case "circle":
        case "diamond":
          setSelectedNodeShape(tool as NodeShape)
          setPanMode(false)
          setIsConnecting(false)
          console.log(`🔸 Shape tool activated: ${tool}`)
          break
        default:
          setPanMode(false)
          setIsConnecting(false)
          console.log(`🔧 Tool activated: ${tool}`)
          break
      }

      console.log(
        `🔧 Tool changed to: ${tool}${
          isCustomTool ? " (customization panel opened)" : ""
        }`
      )
    },
    [
      selectedNodes,
      setActiveTool,
      setActiveDrawingTool,
      setShowDrawingTools,
      setToolContext,
      setSelectedNodeShape,
      setPanMode,
      setIsConnecting,
    ]
  )

  const handleShapeChange = useCallback(
    (shape: NodeShape) => {
      setSelectedNodeShape(shape)

      // If drawing tools are open and we're in node mode, update the context
      if (showDrawingTools && toolContext?.type === "node") {
        const updatedContext = toolContext
          ? { ...toolContext, shape }
          : undefined
        setToolContext(updatedContext)
      }

      console.log(`🔷 Shape changed to: ${shape}`)
    },
    [showDrawingTools, toolContext, setSelectedNodeShape, setToolContext]
  )

  const handleToggleLock = useCallback(() => {
    setIsLocked(!isLocked)
    console.log(`🔒 Canvas ${!isLocked ? "locked" : "unlocked"}`)
  }, [isLocked, setIsLocked])

  const handleShare = useCallback(() => {
    console.log("📤 Share button clicked")
    // Toast implementation would go here
  }, [])

  const handleLibrary = useCallback(() => {
    console.log("📚 Library button clicked")
    // Toast implementation would go here
  }, [])

  const handleCloseDrawingTools = useCallback(() => {
    setShowDrawingTools(false)
    setActiveDrawingTool(null)
    setToolContext(undefined)
    setActiveTool("select")
  }, [setShowDrawingTools, setActiveDrawingTool, setToolContext, setActiveTool])

  return {
    handleToolChange,
    handleShapeChange,
    handleToggleLock,
    handleShare,
    handleLibrary,
    handleCloseDrawingTools,
  }
}
