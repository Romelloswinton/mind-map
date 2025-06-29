// File: app/mind-map/[id]/_components/text-tool/TextToolHandlers.tsx

import { useCallback, useState } from "react"
import { Viewport } from "@xyflow/react"
import { useTextDrawing } from "@/src/stores/drawing-tools" // ✅ FIXED: Correct import
import { inverseTransformPosition } from "@/app/utils/view-transforms"

export const useTextToolHandlers = (
  activeTool: string | null,
  viewport: Viewport
) => {
  // ✅ FIXED: Use the correct hook that exists in your store
  const {
    startTextCreation,
    finishTextCreation,
    cancelTextCreation,
    addText, // ✅ addText is part of useTextDrawing hook
  } = useTextDrawing()

  const [isCreatingText, setIsCreatingText] = useState(false)

  const handleCanvasMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "text") return

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const clientPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      // Transform screen coordinates to world coordinates
      const worldPos = inverseTransformPosition(clientPos, viewport)

      console.log("🎨 Starting text creation at:", worldPos)
      startTextCreation(worldPos)
      setIsCreatingText(true)
    },
    [activeTool, viewport, startTextCreation]
  )

  // ✅ FIXED: Handle optional content parameter to match store signature
  const handleTextSave = useCallback(
    (content?: string) => {
      const trimmedContent = content?.trim()

      if (trimmedContent) {
        // ✅ Pass the trimmed content to finishTextCreation
        const newText = finishTextCreation(trimmedContent)
        if (newText) {
          console.log("✅ Text created:", newText)
          // ✅ Add the text to the store
          addText(newText)
        }
      } else {
        // ✅ Cancel if no content provided
        cancelTextCreation()
      }
      setIsCreatingText(false)
    },
    [finishTextCreation, cancelTextCreation, addText]
  )

  // ✅ ALTERNATIVE: If you prefer to keep the required string parameter
  const handleTextSaveRequired = useCallback(
    (content: string) => {
      const trimmedContent = content.trim()

      if (trimmedContent) {
        // ✅ Pass the trimmed content - finishTextCreation accepts optional parameter
        const newText = finishTextCreation(trimmedContent)
        if (newText) {
          console.log("✅ Text created:", newText)
          // ✅ Add the text to the store
          addText(newText)
        }
      } else {
        // ✅ Cancel if empty content
        cancelTextCreation()
      }
      setIsCreatingText(false)
    },
    [finishTextCreation, cancelTextCreation, addText]
  )

  const handleTextCancel = useCallback(() => {
    cancelTextCreation()
    setIsCreatingText(false)
  }, [cancelTextCreation])

  return {
    handleCanvasMouseDown,
    handleTextSave, // ✅ This now accepts optional content
    handleTextSaveRequired, // ✅ Alternative that requires content
    handleTextCancel,
    isCreatingText,
  }
}
