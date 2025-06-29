// Fixed Drawing Tools Panel - Properly Integrated Version
// File: app/mind-map/[id]/_components/drawing-tools-panel.tsx

import React, { useEffect, useCallback, useState } from "react"
import { ChevronLeft, ChevronRight, X, GripVertical } from "lucide-react"

// ✅ FIXED: Consistent store imports
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"
import { useMindMapPanelIntegration } from "@/src/stores/mind-map-store"

// ✅ FIXED: Import from unified types
import type {
  DrawingToolType,
  DrawingToolSettings,
  DrawingToolsPanelProps,
} from "@/src/types/drawing-tools"

// ✅ FIXED: Import drawing tools sections
import { DrawingToolsSections } from "./drawing-tools-sections"

// ✅ ENHANCED: Panel position and size management
interface PanelState {
  position: { x: number; y: number }
  isDragging: boolean
  dragOffset: { x: number; y: number }
  isCollapsed: boolean
  width: number
  height: number
}

const DEFAULT_PANEL_STATE: PanelState = {
  position: { x: 20, y: 20 },
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  isCollapsed: false,
  width: 320,
  height: 480,
}

export const DrawingToolsPanel: React.FC<DrawingToolsPanelProps> = ({
  activeTool,
  isVisible,
  onClose,
  onSettingsChange,
  className = "",
}) => {
  // ✅ FIXED: Store integration
  const drawingToolsStore = useDrawingToolsStore()
  const mindMapIntegration = useMindMapPanelIntegration()

  const {
    toolSettings,
    selectedNodeId,
    selectedLineId,
    selectedTextId,
    updateCounter,
    lines,
    texts,
  } = drawingToolsStore

  // ✅ ENHANCED: Panel state management
  const [panelState, setPanelState] = useState<PanelState>(DEFAULT_PANEL_STATE)
  const [activeSection, setActiveSection] = useState<string>("appearance")

  // ✅ ENHANCED: Get current tool settings
  const currentToolSettings = activeTool ? toolSettings[activeTool] : null

  // ✅ ENHANCED: Determine what we're styling (node, line, or text)
  const stylingTarget = selectedNodeId
    ? "node"
    : selectedLineId
    ? "line"
    : selectedTextId
    ? "text"
    : "default"

  // ✅ ENHANCED: Get current target data for display
  const getCurrentTargetData = useCallback(() => {
    if (selectedNodeId) {
      const node = mindMapIntegration.getNodeForPanel(selectedNodeId)
      return {
        type: "node",
        id: selectedNodeId,
        data: node?.data,
        name: node?.data.text || "Node",
      }
    }

    if (selectedLineId) {
      const line = lines.find((l) => l.id === selectedLineId)
      return {
        type: "line",
        id: selectedLineId,
        data: line,
        name: `Line (${line?.strokeWidth}px)`,
      }
    }

    if (selectedTextId) {
      const text = texts.find((t) => t.id === selectedTextId)
      return {
        type: "text",
        id: selectedTextId,
        data: text,
        name: text?.content || "Text",
      }
    }

    return {
      type: "default",
      id: null,
      data: null,
      name: activeTool ? `${activeTool} Tool` : "Drawing Tools",
    }
  }, [
    selectedNodeId,
    selectedLineId,
    selectedTextId,
    activeTool,
    mindMapIntegration,
    lines,
    texts,
  ])

  const targetData = getCurrentTargetData()

  // ✅ ENHANCED: Settings update handler with proper integration
  const handleSettingsUpdate = useCallback(
    (key: keyof DrawingToolSettings, value: any) => {
      if (!activeTool) return

      console.log(`🎨 Panel: Updating ${activeTool} ${key} to:`, value)

      // Update tool settings in store
      drawingToolsStore.updateToolSetting(activeTool, key, value)

      // Apply to currently selected target
      if (selectedNodeId && mindMapIntegration.updateSelectedNode) {
        const nodeUpdates: any = {}

        // Map drawing tool settings to node properties
        switch (key) {
          case "strokeColor":
            nodeUpdates.strokeColor = value
            break
          case "fillColor":
            nodeUpdates.fillColor = value
            nodeUpdates.color = value // Also update main color
            break
          case "strokeWidth":
            nodeUpdates.strokeWidth = value
            break
          case "strokeStyle":
            nodeUpdates.strokeStyle = value
            break
          case "opacity":
            nodeUpdates.opacity = value
            break
          case "sloppiness":
            nodeUpdates.sloppiness = value
            break
          case "edgeStyle":
            nodeUpdates.edgeStyle = value
            break
        }

        if (Object.keys(nodeUpdates).length > 0) {
          mindMapIntegration.updateSelectedNode(nodeUpdates)
          console.log(
            `✅ Panel: Applied to node ${selectedNodeId}:`,
            nodeUpdates
          )
        }
      }

      if (selectedLineId) {
        const lineUpdates: any = {}

        // Map settings to line properties
        switch (key) {
          case "strokeColor":
            lineUpdates.strokeColor = value
            break
          case "strokeWidth":
            lineUpdates.strokeWidth = value
            break
          case "strokeStyle":
            lineUpdates.strokeStyle = value
            break
          case "opacity":
            lineUpdates.opacity = value
            break
          case "sloppiness":
            lineUpdates.sloppiness = value
            break
          case "edgeStyle":
            lineUpdates.edgeStyle = value
            break
        }

        if (Object.keys(lineUpdates).length > 0) {
          drawingToolsStore.updateLine(selectedLineId, {
            ...lineUpdates,
            updatedAt: Date.now(),
          })
          console.log(
            `✅ Panel: Applied to line ${selectedLineId}:`,
            lineUpdates
          )
        }
      }

      if (selectedTextId) {
        const textUpdates: any = {}

        // Map settings to text properties
        switch (key) {
          case "fillColor":
            textUpdates.color = value
            break
          case "strokeColor":
            textUpdates.backgroundColor = value
            break
          case "opacity":
            textUpdates.opacity = value
            break
          case "fontSize":
            textUpdates.fontSize = value
            break
          case "fontFamily":
            textUpdates.fontFamily = value
            break
        }

        if (Object.keys(textUpdates).length > 0) {
          drawingToolsStore.updateText(selectedTextId, {
            ...textUpdates,
            updatedAt: Date.now(),
          })
          console.log(
            `✅ Panel: Applied to text ${selectedTextId}:`,
            textUpdates
          )
        }
      }

      // Call external callback if provided
      if (onSettingsChange && activeTool) {
        onSettingsChange(activeTool, { [key]: value })
      }
    },
    [
      activeTool,
      selectedNodeId,
      selectedLineId,
      selectedTextId,
      drawingToolsStore,
      mindMapIntegration,
      onSettingsChange,
    ]
  )

  // ✅ ENHANCED: Panel dragging functionality
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest(".panel-content")) return

    setPanelState((prev) => ({
      ...prev,
      isDragging: true,
      dragOffset: {
        x: event.clientX - prev.position.x,
        y: event.clientY - prev.position.y,
      },
    }))
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setPanelState((prev) => {
      if (!prev.isDragging) return prev

      return {
        ...prev,
        position: {
          x: Math.max(
            0,
            Math.min(
              window.innerWidth - prev.width,
              event.clientX - prev.dragOffset.x
            )
          ),
          y: Math.max(
            0,
            Math.min(
              window.innerHeight - prev.height,
              event.clientY - prev.dragOffset.y
            )
          ),
        },
      }
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    setPanelState((prev) => ({
      ...prev,
      isDragging: false,
    }))
  }, [])

  // ✅ ENHANCED: Setup drag event listeners
  useEffect(() => {
    if (panelState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [panelState.isDragging, handleMouseMove, handleMouseUp])

  // ✅ ENHANCED: Collapse/expand functionality
  const toggleCollapsed = useCallback(() => {
    setPanelState((prev) => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
    }))
  }, [])

  // ✅ ENHANCED: Section navigation
  const sections = [
    { id: "appearance", name: "Appearance", icon: "🎨" },
    { id: "stroke", name: "Stroke", icon: "✏️" },
    { id: "fill", name: "Fill", icon: "🎭" },
    { id: "effects", name: "Effects", icon: "✨" },
  ]

  // Don't render if not visible
  if (!isVisible) return null

  return (
    <div
      className={`fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${className}`}
      style={{
        left: panelState.position.x,
        top: panelState.position.y,
        width: panelState.width,
        height: panelState.isCollapsed ? "auto" : panelState.height,
        cursor: panelState.isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* ✅ ENHANCED: Panel header with drag handle and controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <div className="font-medium text-gray-800">{targetData.name}</div>
          {targetData.type !== "default" && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {targetData.type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleCollapsed}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
            title={panelState.isCollapsed ? "Expand" : "Collapse"}
          >
            {panelState.isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ ENHANCED: Panel content (collapsible) */}
      {!panelState.isCollapsed && (
        <div className="panel-content">
          {/* ✅ ENHANCED: Target info section */}
          {targetData.type !== "default" && (
            <div className="p-3 bg-blue-50 border-b border-gray-200">
              <div className="text-sm text-blue-800">
                <div className="font-medium">Editing: {targetData.name}</div>
                <div className="text-blue-600 text-xs mt-1">
                  ID: {targetData.id?.slice(-8)}
                </div>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Section tabs */}
          <div className="flex border-b border-gray-200">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-1 p-2 text-sm transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs">{section.icon}</span>
                <span className="hidden sm:inline">{section.name}</span>
              </button>
            ))}
          </div>

          {/* ✅ ENHANCED: Panel content with drawing tools sections */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {currentToolSettings && activeTool && (
              <DrawingToolsSections
                activeTool={activeTool}
                settings={currentToolSettings}
                onSettingChange={handleSettingsUpdate}
                activeSection={activeSection}
                targetType={stylingTarget}
                targetData={targetData.data}
              />
            )}

            {/* ✅ ENHANCED: No tool active state */}
            {!activeTool && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎨</div>
                <div className="font-medium">No tool selected</div>
                <div className="text-sm mt-1">
                  Select a drawing tool to customize its settings
                </div>
              </div>
            )}

            {/* ✅ ENHANCED: Status display */}
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <div className="text-gray-600 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Lines:</span>
                  <span className="font-medium">{lines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Texts:</span>
                  <span className="font-medium">{texts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Update Counter:</span>
                  <span className="font-medium">{updateCounter}</span>
                </div>
                {(selectedLineId || selectedTextId || selectedNodeId) && (
                  <div className="pt-1 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>Selection:</span>
                      <span className="text-blue-600 font-medium">
                        {selectedLineId
                          ? `Line: ${selectedLineId.slice(-8)}`
                          : selectedTextId
                          ? `Text: ${selectedTextId.slice(-8)}`
                          : selectedNodeId
                          ? `Node: ${selectedNodeId.slice(-8)}`
                          : "None"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ ENHANCED: Development debug panel */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-gray-800 rounded-lg p-3 mt-4">
                <div className="text-white text-xs font-medium mb-2">
                  🔧 Debug Panel
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      console.log("🔍 Drawing Tools Store State:", {
                        activeTool,
                        toolSettings,
                        selections: {
                          selectedLineId,
                          selectedTextId,
                          selectedNodeId,
                        },
                        lines: lines.length,
                        texts: texts.length,
                        updateCounter,
                      })
                    }}
                    className="w-full bg-blue-500 px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors text-white"
                  >
                    Log Store State
                  </button>

                  <button
                    onClick={() => {
                      if (selectedLineId) {
                        drawingToolsStore.updateLine(selectedLineId, {
                          strokeColor: "#ff0000",
                          strokeWidth: 8,
                        })
                        console.log("🧪 Updated line with test values")
                      }
                      if (selectedTextId) {
                        drawingToolsStore.updateText(selectedTextId, {
                          color: "#00ff00",
                          fontSize: 28,
                        })
                        console.log("🧪 Updated text with test values")
                      }
                      if (
                        selectedNodeId &&
                        mindMapIntegration.updateSelectedNode
                      ) {
                        mindMapIntegration.updateSelectedNode({
                          strokeColor: "#0000ff",
                          fillColor: "#ffff00",
                        })
                        console.log("🧪 Updated node with test values")
                      }
                    }}
                    className="w-full bg-green-500 px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors text-white"
                  >
                    Test Updates
                  </button>

                  <button
                    onClick={() => drawingToolsStore.forceUpdate()}
                    className="w-full bg-purple-500 px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors text-white"
                  >
                    Force Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
