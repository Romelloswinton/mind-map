// components/UIIndicators.tsx
import { Save, Loader2 } from "lucide-react"
import { ToolType, NodeShape } from "@/src/types/mindmap"

interface UIIndicatorsProps {
  isLocked: boolean
  showDrawingTools: boolean
  activeDrawingTool: string | null
  toolContext?: {
    type: "node" | "connector" | "drawing"
    shape?: NodeShape
    selectedNodeId?: string
  }
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

      {/* Enhanced Drawing Tool Indicator - More Compact */}
      {showDrawingTools && activeDrawingTool && toolContext && (
        <div className="absolute top-20 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            🎨{" "}
            {toolContext.type === "node"
              ? `${toolContext.shape} Customization`
              : toolContext.type === "connector"
              ? "Connector Styling"
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

      {/* Enhanced Shape Selection Indicator with Click Instructions */}
      {["rectangle", "circle", "diamond"].includes(activeTool) && !isLocked && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-purple-400/50 z-30">
          <span className="text-sm font-medium">
            🔸 Click anywhere to create {activeTool} node
          </span>
        </div>
      )}

      {/* Compact Shape Selection Indicator for non-node tools */}
      {selectedNodeShape !== "rectangle" &&
        !isLocked &&
        !showDrawingTools &&
        !["rectangle", "circle", "diamond"].includes(activeTool) && (
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 z-30">
            <span className="text-xs text-gray-600">
              Next shape:{" "}
              <strong className="capitalize">{selectedNodeShape}</strong>
            </span>
          </div>
        )}

      {/* Compact Keyboard Shortcuts Helper */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 z-30">
        <span>
          2-4: Shapes (Click to create) | 8: Text | 9: Image | 0: Eraser | H:
          Hand | V: Select | Esc: Close Panel
        </span>
      </div>

      {/* Compact Debug Panel for Development */}
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
            Selected:{" "}
            <span className="text-yellow-300">
              [{selectedNodes.join(", ") || "None"}]
            </span>
          </div>
          <div className="mt-1 text-gray-400 text-xs">
            💡 Select tool (2-4) → click node
          </div>
        </div>
      )}
    </>
  )
}
