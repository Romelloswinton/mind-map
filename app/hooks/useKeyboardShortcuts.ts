// hooks/useKeyboardShortcuts.ts
import { useEffect } from "react"
import { ToolType } from "@/src/types/mindmap"

interface UseKeyboardShortcutsProps {
  addNode: () => void
  saveMindMap: () => void
  updateNodeData: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  handleUndo: () => void
  handleRedo: () => void
  handleToolChange: (tool: ToolType) => void
  handleToggleLock: () => void
  showDrawingTools: boolean
  handleCloseDrawingTools: () => void
}

export function useKeyboardShortcuts({
  addNode,
  saveMindMap,
  updateNodeData,
  deleteNode,
  handleUndo,
  handleRedo,
  handleToolChange,
  handleToggleLock,
  showDrawingTools,
  handleCloseDrawingTools,
}: UseKeyboardShortcutsProps) {
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

      // Tool shortcuts - now with drawing tools integration
      if (event.key === "1" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToggleLock()
      } else if (event.key === "2" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("rectangle")
      } else if (event.key === "3" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("diamond")
      } else if (event.key === "4" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("circle")
      } else if (event.key === "5" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 5 reserved for future tool
      } else if (event.key === "6" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 6 reserved for future tool
      } else if (event.key === "7" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        // Key 7 reserved for future tool
      } else if (event.key === "8" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("text")
      } else if (event.key === "9" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("image")
      } else if (event.key === "0" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("eraser")
      }

      // Tool mode shortcuts
      if (event.key === "h" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("hand")
      } else if (event.key === "v" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        handleToolChange("select")
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

      // Escape to close drawing tools panel
      if (event.key === "Escape" && showDrawingTools) {
        event.preventDefault()
        handleCloseDrawingTools()
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
      addNode()
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
    handleToolChange,
    handleToggleLock,
    showDrawingTools,
    handleCloseDrawingTools,
  ])
}
