// File: src/stores/drawing-tools.ts
// =====================================
// DRAWING TOOLS STORE WITH ERASER - src/stores/drawing-tools.ts
// =====================================

import { create } from "zustand"

// ✅ Import from unified types including eraser
import type {
  DrawingToolType,
  ToolType,
  DrawingToolSettings,
  LineToolData,
  LineDrawingState,
  TextToolData,
  TextDrawingState,
  EraserState,
  EraserMode,
  Point,
  isPointInBounds,
  isPointNearLine,
} from "@/src/types/drawing-tools"

// ✅ Updated interface to include eraser functionality
interface DrawingToolsState {
  // Panel state
  isPanelVisible: boolean
  activeTool: ToolType | null
  isCollapsed: boolean
  toolSettings: Record<DrawingToolType, DrawingToolSettings>

  // ✅ Drawing data with eraser state
  lineDrawingState: LineDrawingState
  lines: LineToolData[]
  textDrawingState: TextDrawingState
  texts: TextToolData[]
  eraserState: EraserState

  // ✅ Selection tracking
  selectedLineId: string | null
  selectedTextId: string | null
  selectedNodeId: string | null
  updateCounter: number

  // Actions
  showPanel: (tool: DrawingToolType) => void
  hidePanel: () => void
  toggleCollapsed: () => void
  setActiveTool: (tool: ToolType | null) => void

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

  // ✅ Eraser operations
  startErasing: (position: { x: number; y: number }) => void
  updateErasing: (position: { x: number; y: number }) => void
  finishErasing: () => void
  cancelErasing: () => void
  eraseAtPosition: (position: { x: number; y: number }) => void
  eraseInArea: (
    startPos: { x: number; y: number },
    endPos: { x: number; y: number }
  ) => void
  setEraserMode: (mode: EraserMode) => void
  setEraserSize: (size: number) => void

  // Selection
  setSelectedLine: (lineId: string | null) => void
  setSelectedText: (textId: string | null) => void
  setSelectedNode: (nodeId: string | null) => void
  clearSelection: () => void
  forceUpdate: () => void

  // ✅ Integration with mind map store for node/edge deletion
  onDeleteNodes: (nodeIds: string[]) => void
  onDeleteEdges: (edgeIds: string[]) => void
  setNodeEdgeDeletionCallbacks: (
    deleteNodes: (nodeIds: string[]) => void,
    deleteEdges: (edgeIds: string[]) => void
  ) => void
}

// ✅ Default tool settings including eraser
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
  // ✅ NEW: Eraser default settings
  eraser: {
    strokeColor: "#ff4444", // Visual indicator color
    fillColor: "#ff4444",
    strokeWidth: 20, // Eraser size
    strokeStyle: "solid",
    sloppiness: 0,
    edgeStyle: "rounded",
    opacity: 0.3, // Semi-transparent for preview
    eraserMode: "single" as EraserMode,
    eraserSize: 20,
    canDeleteNodes: true,
    canDeleteLines: true,
    canDeleteTexts: true,
    canDeleteEdges: true,
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

// ✅ Initial eraser state
const initialEraserState: EraserState = {
  isErasing: false,
  mode: "single",
  brushPosition: undefined,
  eraserPath: undefined,
  itemsToDelete: {
    nodes: [],
    lines: [],
    texts: [],
    edges: [],
  },
}

// ✅ Helper function to check if tool is a drawing tool (now includes eraser)
const isDrawingTool = (tool: ToolType | null): tool is DrawingToolType => {
  return (
    tool !== null &&
    ["rectangle", "diamond", "circle", "line", "text", "eraser"].includes(tool)
  )
}

// ✅ Create the drawing tools store with eraser functionality
export const useDrawingToolsStore = create<DrawingToolsState>((set, get) => ({
  // ✅ Panel state
  isPanelVisible: false,
  activeTool: null,
  isCollapsed: false,
  toolSettings: { ...defaultToolSettings },

  // ✅ Drawing data including eraser
  lineDrawingState: { ...initialLineDrawingState },
  lines: [],
  textDrawingState: { ...initialTextDrawingState },
  texts: [],
  eraserState: { ...initialEraserState },

  // ✅ Selection tracking
  selectedLineId: null,
  selectedTextId: null,
  selectedNodeId: null,
  updateCounter: 0,

  // ✅ Callbacks for node/edge deletion
  onDeleteNodes: () => {
    console.warn("⚠️ Node deletion callback not set")
  },
  onDeleteEdges: () => {
    console.warn("⚠️ Edge deletion callback not set")
  },

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
    })
    console.log("🎨 Hiding drawing tools panel")
  },

  toggleCollapsed: () => {
    set((state) => ({
      isCollapsed: !state.isCollapsed,
    }))
  },

  // ✅ Accept full ToolType including eraser
  setActiveTool: (tool) => {
    set({ activeTool: tool })

    // Show panel for all drawing tools (including eraser)
    if (tool && isDrawingTool(tool)) {
      set({ isPanelVisible: true })
    } else {
      // Hide panel for utility tools like hand, select
      set({ isPanelVisible: false })
    }

    // Reset states when switching tools
    if (tool !== "line") {
      set({ lineDrawingState: { ...initialLineDrawingState } })
    }
    if (tool !== "text") {
      set({ textDrawingState: { ...initialTextDrawingState } })
    }
    if (tool !== "eraser") {
      set({ eraserState: { ...initialEraserState } })
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

  // ✅ Line operations (unchanged)
  startLineDrawing: (startPoint) => {
    const { toolSettings } = get()
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

  // ✅ Text operations (unchanged)
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

  // ✅ NEW: Eraser operations
  startErasing: (position) => {
    const { toolSettings } = get()
    const eraserSettings = toolSettings.eraser

    set({
      eraserState: {
        isErasing: true,
        mode: (eraserSettings.eraserMode as EraserMode) || "single",
        brushPosition: position,
        eraserPath: [position],
        itemsToDelete: {
          nodes: [],
          lines: [],
          texts: [],
          edges: [],
        },
      },
      updateCounter: get().updateCounter + 1,
    })

    console.log("🧹 Started erasing at:", position)

    // For single mode, immediately check for items to erase
    if (eraserSettings.eraserMode === "single") {
      get().eraseAtPosition(position)
    }
  },

  updateErasing: (position) => {
    const { eraserState, toolSettings } = get()
    const eraserSettings = toolSettings.eraser

    if (!eraserState.isErasing) return

    const newPath = eraserState.eraserPath
      ? [...eraserState.eraserPath, position]
      : [position]

    set({
      eraserState: {
        ...eraserState,
        brushPosition: position,
        eraserPath: newPath,
      },
      updateCounter: get().updateCounter + 1,
    })

    // For stroke mode, continuously check for items along the path
    if (eraserSettings.eraserMode === "stroke") {
      get().eraseAtPosition(position)
    }
  },

  finishErasing: () => {
    const { eraserState, toolSettings } = get()
    const eraserSettings = toolSettings.eraser

    if (!eraserState.isErasing) return

    // For area mode, erase everything within the drawn area
    if (
      eraserSettings.eraserMode === "area" &&
      eraserState.eraserPath &&
      eraserState.eraserPath.length > 2
    ) {
      const path = eraserState.eraserPath
      const minX = Math.min(...path.map((p) => p.x))
      const maxX = Math.max(...path.map((p) => p.x))
      const minY = Math.min(...path.map((p) => p.y))
      const maxY = Math.max(...path.map((p) => p.y))

      get().eraseInArea({ x: minX, y: minY }, { x: maxX, y: maxY })
    }

    // Execute all deletions
    const { itemsToDelete } = eraserState

    if (itemsToDelete.lines.length > 0) {
      itemsToDelete.lines.forEach((lineId) => get().deleteLine(lineId))
    }

    if (itemsToDelete.texts.length > 0) {
      itemsToDelete.texts.forEach((textId) => get().deleteText(textId))
    }

    if (itemsToDelete.nodes.length > 0) {
      get().onDeleteNodes(itemsToDelete.nodes)
    }

    if (itemsToDelete.edges.length > 0) {
      get().onDeleteEdges(itemsToDelete.edges)
    }

    set({
      eraserState: { ...initialEraserState },
      updateCounter: get().updateCounter + 1,
    })

    console.log("✅ Finished erasing")
  },

  cancelErasing: () => {
    set({
      eraserState: { ...initialEraserState },
      updateCounter: get().updateCounter + 1,
    })
    console.log("❌ Cancelled erasing")
  },

  eraseAtPosition: (position) => {
    const { lines, texts, toolSettings, eraserState } = get()
    const eraserSettings = toolSettings.eraser
    const eraserSize = eraserSettings.eraserSize || 20

    // Check lines
    if (eraserSettings.canDeleteLines) {
      lines.forEach((line) => {
        if (
          isPointNearLine(
            position,
            line.startPoint,
            line.endPoint,
            eraserSize / 2
          )
        ) {
          set((state) => ({
            eraserState: {
              ...state.eraserState,
              itemsToDelete: {
                ...state.eraserState.itemsToDelete,
                lines: [
                  ...new Set([
                    ...state.eraserState.itemsToDelete.lines,
                    line.id,
                  ]),
                ],
              },
            },
          }))
        }
      })
    }

    // Check texts
    if (eraserSettings.canDeleteTexts) {
      texts.forEach((text) => {
        const textBounds = {
          x: text.position.x,
          y: text.position.y,
          width: text.maxWidth || 100, // Estimate based on content
          height: text.fontSize * text.lineHeight,
        }

        if (isPointInBounds(position, textBounds)) {
          set((state) => ({
            eraserState: {
              ...state.eraserState,
              itemsToDelete: {
                ...state.eraserState.itemsToDelete,
                texts: [
                  ...new Set([
                    ...state.eraserState.itemsToDelete.texts,
                    text.id,
                  ]),
                ],
              },
            },
          }))
        }
      })
    }

    // Note: Nodes and edges will be handled by the mind map store
    // through the callback system when finishErasing is called
  },

  eraseInArea: (startPos, endPos) => {
    const { lines, texts, toolSettings } = get()
    const eraserSettings = toolSettings.eraser

    const area = {
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y),
      width: Math.abs(endPos.x - startPos.x),
      height: Math.abs(endPos.y - startPos.y),
    }

    // Check lines in area
    if (eraserSettings.canDeleteLines) {
      lines.forEach((line) => {
        if (
          isPointInBounds(line.startPoint, area) ||
          isPointInBounds(line.endPoint, area)
        ) {
          set((state) => ({
            eraserState: {
              ...state.eraserState,
              itemsToDelete: {
                ...state.eraserState.itemsToDelete,
                lines: [
                  ...new Set([
                    ...state.eraserState.itemsToDelete.lines,
                    line.id,
                  ]),
                ],
              },
            },
          }))
        }
      })
    }

    // Check texts in area
    if (eraserSettings.canDeleteTexts) {
      texts.forEach((text) => {
        if (isPointInBounds(text.position, area)) {
          set((state) => ({
            eraserState: {
              ...state.eraserState,
              itemsToDelete: {
                ...state.eraserState.itemsToDelete,
                texts: [
                  ...new Set([
                    ...state.eraserState.itemsToDelete.texts,
                    text.id,
                  ]),
                ],
              },
            },
          }))
        }
      })
    }

    console.log("🧹 Erased area:", area)
  },

  setEraserMode: (mode) => {
    set((state) => ({
      toolSettings: {
        ...state.toolSettings,
        eraser: {
          ...state.toolSettings.eraser,
          eraserMode: mode,
        },
      },
      updateCounter: state.updateCounter + 1,
    }))
    console.log("🧹 Eraser mode changed to:", mode)
  },

  setEraserSize: (size) => {
    set((state) => ({
      toolSettings: {
        ...state.toolSettings,
        eraser: {
          ...state.toolSettings.eraser,
          eraserSize: size,
          strokeWidth: size, // Keep visual size in sync
        },
      },
      updateCounter: state.updateCounter + 1,
    }))
    console.log("🧹 Eraser size changed to:", size)
  },

  // ✅ Integration methods
  setNodeEdgeDeletionCallbacks: (deleteNodes, deleteEdges) => {
    set({
      onDeleteNodes: deleteNodes,
      onDeleteEdges: deleteEdges,
    })
    console.log("🔗 Node/edge deletion callbacks set")
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

// ✅ NEW: Eraser drawing hook
export const useEraserDrawing = () => {
  const store = useDrawingToolsStore()

  return {
    eraserState: store.eraserState,
    startErasing: store.startErasing,
    updateErasing: store.updateErasing,
    finishErasing: store.finishErasing,
    cancelErasing: store.cancelErasing,
    eraseAtPosition: store.eraseAtPosition,
    eraseInArea: store.eraseInArea,
    setEraserMode: store.setEraserMode,
    setEraserSize: store.setEraserSize,
    setNodeEdgeDeletionCallbacks: store.setNodeEdgeDeletionCallbacks,
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
