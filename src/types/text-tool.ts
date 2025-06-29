// text-tool/types.ts - Type definitions for text tool components

import { Viewport } from "@xyflow/react"
import { TextToolData } from "@/src/types/drawing-tools"

export interface TextEditorProps {
  text: TextToolData
  onSave: (content: string) => void
  onCancel: () => void
  onUpdateText: (updates: Partial<TextToolData>) => void
  viewport: Viewport
}

export interface TextPreviewProps {
  textDrawingState: {
    isCreating: boolean
    previewText: TextToolData | null
  }
  viewport: Viewport
}

export interface TextRendererProps {
  texts: TextToolData[]
  selectedTextId?: string
  onTextSelect: (textId: string) => void
  onTextDelete: (textId: string) => void
  onTextEdit: (textId: string) => void
  viewport: Viewport
}

export interface TextToolHandlers {
  handleCanvasMouseDown: (event: React.MouseEvent) => void
  handleTextSave: (content: string) => void
  handleTextCancel: () => void
  isCreatingText: boolean
} // text-tool/types.ts - Type definitions for text tool components
