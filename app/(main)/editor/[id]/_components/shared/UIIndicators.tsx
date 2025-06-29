// Fixed UIIndicators Component - Updated Type Consistency
// File: components/UIIndicators.tsx

import { Save, Loader2 } from "lucide-react"

// ✅ FIXED: Import from unified types
import type { ToolType, NodeShape, ToolContext } from "@/src/types"

interface UIIndicatorsProps {
  isLocked: boolean
  showDrawingTools: boolean
  activeDrawingTool: string | null
  toolContext?: ToolContext
  activeTool: ToolType
  selectedNodeShape: NodeShape
  isSaving: boolean
  lastSaved: Date | null
  selectedNodes: string[]
}

export function UIIndicators({
  isLocked,
  showDrawingTools,
  activeDrawingTool,
  toolContext,
  activeTool,
  selectedNodeShape,
  isSaving,
  lastSaved,
  selectedNodes,
}: UIIndicatorsProps) {
  return (
    <>
      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-red-400/50 z-30">
          <span className="text-sm font-medium">🔒 Canvas Locked</span>
        </div>
      )}

      {/* Enhanced Drawing Tool Indicator with Line Support */}
      {showDrawingTools && activeDrawingTool && toolContext && (
        <div className="absolute top-20 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            🎨{" "}
            {toolContext.type === "node"
              ? `${toolContext.shape} Customization`
              : toolContext.type === "connector"
              ? "Connector Styling"
              : toolContext.type === "line"
              ? "Line Customization"
              : toolContext.type === "text"
              ? "Text Customization"
              : `${
                  activeDrawingTool.charAt(0).toUpperCase() +
                  activeDrawingTool.slice(1)
                } Tool`}{" "}
            Active
          </span>
        </div>
      )}

      {/* Compact Save Status */}
      {(isSaving || lastSaved) && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 z-30">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              <span className="text-xs text-gray-600">Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Save className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-600">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Enhanced Shape Selection Indicator with Line Tool Support */}
      {["rectangle", "circle", "diamond"].includes(activeTool) && !isLocked && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            🔸 Click anywhere to create {activeTool} node
          </span>
        </div>
      )}

      {/* Line Tool Indicator */}
      {activeTool === "line" && !isLocked && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            📏 Click and drag to draw lines
          </span>
        </div>
      )}

      {/* Text Tool Indicator */}
      {activeTool === "text" && !isLocked && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            📝 Click anywhere to add text
          </span>
        </div>
      )}

      {/* Compact Shape Selection Indicator for non-node tools */}
      {selectedNodeShape !== "rectangle" &&
        !isLocked &&
        !showDrawingTools &&
        !["rectangle", "circle", "diamond", "line", "text"].includes(
          activeTool
        ) && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 z-30">
            <span className="text-xs text-gray-600">
              Next shape:{" "}
              <strong className="capitalize">{selectedNodeShape}</strong>
            </span>
          </div>
        )}

      {/* Enhanced Keyboard Shortcuts Helper with Line & Text Tools */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 z-30">
        <span>
          2-4: Shapes | 5: Line | 8: Text | 9: Image | 0: Eraser | H: Hand | V:
          Select | Esc: Close Panel
        </span>
      </div>

      {/* Enhanced Debug Panel with Line & Text Tool Support */}
      {process.env.NODE_ENV === "development" && showDrawingTools && (
        <div className="fixed bottom-20 left-4 bg-black/80 text-white p-2 rounded-lg text-xs font-mono z-50 max-w-xs">
          <div className="text-green-400 mb-1">🔧 Debug:</div>
          <div>
            Tool: <span className="text-blue-300">{activeDrawingTool}</span>
          </div>
          <div>
            Context: <span className="text-blue-300">{toolContext?.type}</span>
          </div>
          <div>
            Node:{" "}
            <span className="text-yellow-300">
              {toolContext?.selectedNodeId || "None"}
            </span>
          </div>
          <div>
            Line:{" "}
            <span className="text-yellow-300">
              {toolContext?.selectedLineId || "None"}
            </span>
          </div>
          <div>
            Text:{" "}
            <span className="text-yellow-300">
              {toolContext?.selectedTextId || "None"}
            </span>
          </div>
          <div>
            Selected:{" "}
            <span className="text-yellow-300">
              [{selectedNodes.join(", ") || "None"}]
            </span>
          </div>
          <div className="mt-1 text-gray-400 text-xs">
            💡 Select tool (2-5, 8) → create element
          </div>
        </div>
      )}

      {/* Line Selection Indicator */}
      {toolContext?.type === "line" && toolContext.selectedLineId && (
        <div className="absolute top-32 left-4 flex items-center space-x-2 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-blue-400/50 z-30">
          <span className="text-sm font-medium">
            📏 Line Selected - Double-click to delete
          </span>
        </div>
      )}

      {/* Text Selection Indicator */}
      {toolContext?.type === "text" && toolContext.selectedTextId && (
        <div className="absolute top-32 left-4 flex items-center space-x-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-green-400/50 z-30">
          <span className="text-sm font-medium">
            📝 Text Selected - Double-click to edit
          </span>
        </div>
      )}

      {/* Active Tool Status for Line Tool */}
      {activeTool === "line" && !showDrawingTools && (
        <div className="absolute top-20 right-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">📏 Line Tool Active</span>
        </div>
      )}

      {/* Active Tool Status for Text Tool */}
      {activeTool === "text" && !showDrawingTools && (
        <div className="absolute top-20 right-4 flex items-center space-x-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-green-400/50 z-30">
          <span className="text-sm font-medium">📝 Text Tool Active</span>
        </div>
      )}
    </>
  )
}
