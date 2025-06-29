// File: src/stores/drawing-tools.ts
// =====================================
// DRAWING TOOLS STORE - src/stores/drawing-tools.ts
// =====================================

import { create } from "zustand"

// ✅ Import from unified types
import type {
  DrawingToolType,
  ToolType, // ✅ Import full ToolType
  DrawingToolSettings,
  LineToolData,
  LineDrawingState,
  TextToolData,
  TextDrawingState,
} from "@/src/types/drawing-tools"

// ✅ Updated interface to accept full ToolType
interface DrawingToolsState {
  // ✅ Panel state - updated to accept full ToolType
  isPanelVisible: boolean
  activeTool: ToolType | null // ✅ FIXED: Accept full ToolType instead of just DrawingToolType
  isCollapsed: boolean
  toolSettings: Record<DrawingToolType, DrawingToolSettings>

  // ✅ Drawing data
  lineDrawingState: LineDrawingState
  lines: LineToolData[]
  textDrawingState: TextDrawingState
  texts: TextToolData[]

  // ✅ Selection tracking
  selectedLineId: string | null
  selectedTextId: string | null
  selectedNodeId: string | null
  updateCounter: number

  // Actions - updated to accept full ToolType
  showPanel: (tool: DrawingToolType) => void // Keep DrawingToolType for panel-specific tools
  hidePanel: () => void
  toggleCollapsed: () => void
  setActiveTool: (tool: ToolType | null) => void // ✅ FIXED: Accept full ToolType

  // Settings
  updateToolSetting: (
    tool: DrawingToolType,
    key: keyof DrawingToolSettings,
    value: any
  ) => void
  updateToolSettings: (
    tool: DrawingToolType,
    settings: Partial<DrawingToolSettings>
  ) => void
  resetToolSettings: (tool?: DrawingToolType) => void

  // Line operations
  startLineDrawing: (startPoint: { x: number; y: number }) => void
  updateLineDrawing: (currentPoint: { x: number; y: number }) => void
  finishLineDrawing: () => LineToolData | null
  cancelLineDrawing: () => void
  addLine: (line: LineToolData) => void
  updateLine: (lineId: string, updates: Partial<LineToolData>) => void
  deleteLine: (lineId: string) => void

  // Text operations
  startTextCreation: (position: { x: number; y: number }) => void
  finishTextCreation: (content?: string) => TextToolData | null
  cancelTextCreation: () => void
  addText: (text: TextToolData) => void
  updateText: (textId: string, updates: Partial<TextToolData>) => void
  deleteText: (textId: string) => void

  // Selection
  setSelectedLine: (lineId: string | null) => void
  setSelectedText: (textId: string | null) => void
  setSelectedNode: (nodeId: string | null) => void
  clearSelection: () => void
  forceUpdate: () => void
}

// ✅ Default tool settings
const defaultToolSettings: Record<DrawingToolType, DrawingToolSettings> = {
  rectangle: {
    strokeColor: "#6b7280",
    fillColor: "#3b82f6",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 1,
  },
  diamond: {
    strokeColor: "#6b7280",
    fillColor: "#10b981",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 1,
  },
  circle: {
    strokeColor: "#6b7280",
    fillColor: "#f59e0b",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 1,
  },
  line: {
    strokeColor: "#374151",
    fillColor: "#374151",
    strokeWidth: 2,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 1,
  },
  text: {
    strokeColor: "#374151",
    fillColor: "#000000",
    strokeWidth: 1,
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "square",
    opacity: 1,
    fontSize: 16,
    fontFamily: "Arial",
  },
}

// ✅ Initial states
const initialLineDrawingState: LineDrawingState = {
  isDrawing: false,
  startPoint: undefined,
  currentPoint: undefined,
  previewLine: undefined,
}

const initialTextDrawingState: TextDrawingState = {
  isCreating: false,
  position: undefined,
  previewText: undefined,
}

// ✅ Helper function to check if tool is a drawing tool
const isDrawingTool = (tool: ToolType | null): tool is DrawingToolType => {
  return (
    tool !== null &&
    ["rectangle", "diamond", "circle", "line", "text"].includes(tool)
  )
}

// ✅ Create the drawing tools store
export const useDrawingToolsStore = create<DrawingToolsState>((set, get) => ({
  // ✅ Panel state
  isPanelVisible: false,
  activeTool: null,
  isCollapsed: false,
  toolSettings: { ...defaultToolSettings },

  // ✅ Drawing data
  lineDrawingState: { ...initialLineDrawingState },
  lines: [],
  textDrawingState: { ...initialTextDrawingState },
  texts: [],

  // ✅ Selection tracking
  selectedLineId: null,
  selectedTextId: null,
  selectedNodeId: null,
  updateCounter: 0,

  // ✅ Panel actions
  showPanel: (tool) => {
    set({
      isPanelVisible: true,
      activeTool: tool,
      isCollapsed: false,
    })
    console.log("🎨 Showing drawing tools panel for:", tool)
  },

  hidePanel: () => {
    set({
      isPanelVisible: false,
      // Don't clear activeTool when hiding panel - user might still want to use the tool
    })
    console.log("🎨 Hiding drawing tools panel")
  },

  toggleCollapsed: () => {
    set((state) => ({
      isCollapsed: !state.isCollapsed,
    }))
  },

  // ✅ FIXED: Accept full ToolType
  setActiveTool: (tool) => {
    set({ activeTool: tool })

    // Only show panel for drawing tools that have settings
    if (tool && isDrawingTool(tool)) {
      set({ isPanelVisible: true })
    } else if (!isDrawingTool(tool)) {
      // Hide panel for non-drawing tools like hand, select, eraser
      set({ isPanelVisible: false })
    }

    console.log("🎨 Active tool changed to:", tool)
  },

  // ✅ Settings actions
  updateToolSetting: (tool, key, value) => {
    set((state) => ({
      toolSettings: {
        ...state.toolSettings,
        [tool]: {
          ...state.toolSettings[tool],
          [key]: value,
        },
      },
      updateCounter: state.updateCounter + 1,
    }))
    console.log(`🎨 Updated ${tool} ${key} to:`, value)
  },

  updateToolSettings: (tool, settings) => {
    set((state) => ({
      toolSettings: {
        ...state.toolSettings,
        [tool]: {
          ...state.toolSettings[tool],
          ...settings,
        },
      },
      updateCounter: state.updateCounter + 1,
    }))
    console.log(`🎨 Updated ${tool} settings:`, settings)
  },

  resetToolSettings: (tool) => {
    if (tool) {
      set((state) => ({
        toolSettings: {
          ...state.toolSettings,
          [tool]: { ...defaultToolSettings[tool] },
        },
        updateCounter: state.updateCounter + 1,
      }))
      console.log(`🔄 Reset ${tool} settings to defaults`)
    } else {
      set((state) => ({
        toolSettings: { ...defaultToolSettings },
        updateCounter: state.updateCounter + 1,
      }))
      console.log("🔄 Reset all tool settings to defaults")
    }
  },

  // ✅ Line operations
  startLineDrawing: (startPoint) => {
    const { toolSettings, activeTool } = get()
    const lineSettings = toolSettings.line

    const previewLine: Omit<LineToolData, "id" | "createdAt" | "updatedAt"> = {
      startPoint,
      endPoint: startPoint,
      strokeColor: lineSettings.strokeColor,
      strokeWidth: lineSettings.strokeWidth,
      strokeStyle: lineSettings.strokeStyle,
      opacity: lineSettings.opacity,
      sloppiness: lineSettings.sloppiness,
      edgeStyle: lineSettings.edgeStyle,
    }

    set({
      lineDrawingState: {
        isDrawing: true,
        startPoint,
        currentPoint: startPoint,
        previewLine,
      },
      updateCounter: get().updateCounter + 1,
    })

    console.log("🖍️ Started line drawing at:", startPoint)
  },

  updateLineDrawing: (currentPoint) => {
    const { lineDrawingState } = get()

    if (!lineDrawingState.isDrawing || !lineDrawingState.startPoint) return

    const updatedPreviewLine = lineDrawingState.previewLine
      ? {
          ...lineDrawingState.previewLine,
          endPoint: currentPoint,
        }
      : undefined

    set({
      lineDrawingState: {
        ...lineDrawingState,
        currentPoint,
        previewLine: updatedPreviewLine,
      },
      updateCounter: get().updateCounter + 1,
    })
  },

  finishLineDrawing: () => {
    const { lineDrawingState, toolSettings } = get()

    if (
      !lineDrawingState.isDrawing ||
      !lineDrawingState.startPoint ||
      !lineDrawingState.currentPoint
    ) {
      console.warn("⚠️ Cannot finish line - invalid drawing state")
      return null
    }

    const timestamp = Date.now()
    const lineId = `line-${timestamp}-${Math.random()
      .toString(36)
      .substr(2, 12)}`
    const lineSettings = toolSettings.line

    const newLine: LineToolData = {
      id: lineId,
      startPoint: lineDrawingState.startPoint,
      endPoint: lineDrawingState.currentPoint,
      strokeColor: lineSettings.strokeColor,
      strokeWidth: lineSettings.strokeWidth,
      strokeStyle: lineSettings.strokeStyle,
      opacity: lineSettings.opacity,
      sloppiness: lineSettings.sloppiness || 0,
      edgeStyle: lineSettings.edgeStyle,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    set({
      lineDrawingState: { ...initialLineDrawingState },
      updateCounter: get().updateCounter + 1,
    })

    console.log("✅ Finished line drawing:", newLine)
    return newLine
  },

  cancelLineDrawing: () => {
    set({
      lineDrawingState: { ...initialLineDrawingState },
      updateCounter: get().updateCounter + 1,
    })
    console.log("❌ Cancelled line drawing")
  },

  addLine: (line) => {
    set((state) => ({
      lines: [...state.lines, line],
      updateCounter: state.updateCounter + 1,
    }))
    console.log("➕ Added line:", line.id)
  },

  updateLine: (lineId, updates) => {
    set((state) => ({
      lines: state.lines.map((line) =>
        line.id === lineId
          ? { ...line, ...updates, updatedAt: Date.now() }
          : line
      ),
      updateCounter: state.updateCounter + 1,
    }))
    console.log("📝 Updated line:", lineId, updates)
  },

  deleteLine: (lineId) => {
    set((state) => ({
      lines: state.lines.filter((line) => line.id !== lineId),
      selectedLineId:
        state.selectedLineId === lineId ? null : state.selectedLineId,
      updateCounter: state.updateCounter + 1,
    }))
    console.log("🗑️ Deleted line:", lineId)
  },

  // ✅ Text operations
  startTextCreation: (position) => {
    set({
      textDrawingState: {
        isCreating: true,
        position,
        previewText: {
          position,
          content: "",
          fontSize: get().toolSettings.text.fontSize || 16,
          color: get().toolSettings.text.fillColor,
        },
      },
      updateCounter: get().updateCounter + 1,
    })
    console.log("📝 Started text creation at:", position)
  },

  finishTextCreation: (content) => {
    const { textDrawingState, toolSettings } = get()

    if (!textDrawingState.isCreating || !textDrawingState.position) {
      console.warn("⚠️ Cannot finish text - invalid creation state")
      return null
    }

    if (!content || content.trim() === "") {
      // Cancel creation if no content
      set({
        textDrawingState: { ...initialTextDrawingState },
        updateCounter: get().updateCounter + 1,
      })
      return null
    }

    const timestamp = Date.now()
    const textId = `text-${timestamp}-${Math.random()
      .toString(36)
      .substr(2, 12)}`
    const textSettings = toolSettings.text

    const newText: TextToolData = {
      id: textId,
      position: textDrawingState.position,
      content: content.trim(),
      fontSize: textSettings.fontSize || 16,
      fontFamily: textSettings.fontFamily || "Arial",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      color: textSettings.fillColor,
      backgroundColor: undefined,
      padding: 4,
      lineHeight: 1.2,
      letterSpacing: 0,
      textDecoration: "none",
      opacity: textSettings.opacity,
      rotation: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    set({
      textDrawingState: { ...initialTextDrawingState },
      updateCounter: get().updateCounter + 1,
    })

    console.log("✅ Finished text creation:", newText)
    return newText
  },

  cancelTextCreation: () => {
    set({
      textDrawingState: { ...initialTextDrawingState },
      updateCounter: get().updateCounter + 1,
    })
    console.log("❌ Cancelled text creation")
  },

  addText: (text) => {
    set((state) => ({
      texts: [...state.texts, text],
      updateCounter: state.updateCounter + 1,
    }))
    console.log("➕ Added text:", text.id)
  },

  updateText: (textId, updates) => {
    set((state) => ({
      texts: state.texts.map((text) =>
        text.id === textId
          ? { ...text, ...updates, updatedAt: Date.now() }
          : text
      ),
      updateCounter: state.updateCounter + 1,
    }))
    console.log("📝 Updated text:", textId, updates)
  },

  deleteText: (textId) => {
    set((state) => ({
      texts: state.texts.filter((text) => text.id !== textId),
      selectedTextId:
        state.selectedTextId === textId ? null : state.selectedTextId,
      updateCounter: state.updateCounter + 1,
    }))
    console.log("🗑️ Deleted text:", textId)
  },

  // ✅ Selection actions
  setSelectedLine: (lineId) => {
    set({
      selectedLineId: lineId,
      selectedTextId: null,
      selectedNodeId: null,
      updateCounter: get().updateCounter + 1,
    })
    console.log("🎯 Selected line:", lineId)
  },

  setSelectedText: (textId) => {
    set({
      selectedTextId: textId,
      selectedLineId: null,
      selectedNodeId: null,
      updateCounter: get().updateCounter + 1,
    })
    console.log("🎯 Selected text:", textId)
  },

  setSelectedNode: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      selectedLineId: null,
      selectedTextId: null,
      updateCounter: get().updateCounter + 1,
    })
    console.log("🎯 Selected node:", nodeId)
  },

  clearSelection: () => {
    set({
      selectedLineId: null,
      selectedTextId: null,
      selectedNodeId: null,
      updateCounter: get().updateCounter + 1,
    })
    console.log("🎯 Cleared all selections")
  },

  forceUpdate: () => {
    set((state) => ({
      updateCounter: state.updateCounter + 1,
    }))
  },
}))

// ✅ Helper hooks for easier usage
export const useDrawingToolsPanel = () => {
  const store = useDrawingToolsStore()

  return {
    isPanelVisible: store.isPanelVisible,
    activeTool: store.activeTool,
    isCollapsed: store.isCollapsed,
    showPanel: store.showPanel,
    hidePanel: store.hidePanel,
    toggleCollapsed: store.toggleCollapsed,
    setActiveTool: store.setActiveTool,
  }
}

export const useLineDrawing = () => {
  const store = useDrawingToolsStore()

  return {
    lineDrawingState: store.lineDrawingState,
    lines: store.lines,
    startLineDrawing: store.startLineDrawing,
    updateLineDrawing: store.updateLineDrawing,
    finishLineDrawing: store.finishLineDrawing,
    cancelLineDrawing: store.cancelLineDrawing,
    addLine: store.addLine,
    updateLine: store.updateLine,
    deleteLine: store.deleteLine,
  }
}

export const useTextDrawing = () => {
  const store = useDrawingToolsStore()

  return {
    textDrawingState: store.textDrawingState,
    texts: store.texts,
    startTextCreation: store.startTextCreation,
    finishTextCreation: store.finishTextCreation,
    cancelTextCreation: store.cancelTextCreation,
    addText: store.addText,
    updateText: store.updateText,
    deleteText: store.deleteText,
  }
}

export const useDrawingToolsSelection = () => {
  const store = useDrawingToolsStore()

  return {
    selectedLineId: store.selectedLineId,
    selectedTextId: store.selectedTextId,
    selectedNodeId: store.selectedNodeId,
    setSelectedLine: store.setSelectedLine,
    setSelectedText: store.setSelectedText,
    setSelectedNode: store.setSelectedNode,
    clearSelection: store.clearSelection,
  }
}

export const useDrawingToolsSettings = () => {
  const store = useDrawingToolsStore()

  return {
    toolSettings: store.toolSettings,
    updateToolSetting: store.updateToolSetting,
    updateToolSettings: store.updateToolSettings,
    resetToolSettings: store.resetToolSettings,
  }
}

// ✅ Default export for convenience
export default useDrawingToolsStore
