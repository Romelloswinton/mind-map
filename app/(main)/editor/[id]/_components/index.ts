// File: app/mind-map/[id]/_components/index.ts
// =====================================
// MIND MAP COMPONENTS INDEX
// =====================================

// 🎯 MAIN CANVAS COMPONENTS
// Performance-optimized components with ReactFlow integration
export { default as MindMapCanvas } from "./canvas/mind-map-canvas"
export { default as SimpleMindMapCanvas } from "./canvas/mind-map-canvas" // Compatibility alias

// =====================================
// NODE COMPONENTS
// =====================================

// Main node component with resize and editing capabilities
export { MindMapNode } from "./node-tools/mind-map-node"

// =====================================
// DRAWING TOOLS
// =====================================

// Drawing tools panel and sections
export { DrawingToolsPanel } from "./drawing-tools/drawing-tools-panel"
export { default as DrawingToolsSections } from "./drawing-tools/drawing-tools-sections"

// =====================================
// LINE TOOL COMPONENTS
// =====================================

// Line tool integration and rendering
export { LineToolIntegration } from "./line-tools/line-tool"
export { PreviewLineRenderer } from "./line-tools/preview-line-renderer"

// =====================================
// TEXT TOOL COMPONENTS
// =====================================

// Text tool components and rendering
export { TextRenderer } from "./text-tool/TextRenderer"
export { TextEditor } from "./text-tool/TextEditor"
export { TextPreview } from "./text-tool/TextPreview"

// =====================================
// ERASER TOOL COMPONENTS
// =====================================

// ✅ NEW: Eraser tool components
export { EraserToolIntegration } from "./eraser-tool/eraser-tool"

// =====================================
// SHAPE TOOLS COMPONENTS
// =====================================

// Shape tools
export { ShapeOutline } from "./shape-tools/shape-outline"

// =====================================
// SHARED COMPONENTS
// =====================================

// Core shared UI components
export { UIIndicators } from "./shared/UIIndicators"
export { IntegratedFloatingToolbar } from "./shared/integrated-floating-toolbar"

// =====================================
// STORE INTEGRATIONS
// =====================================

// Performance utilities and selectors from stores
export * from "@/src/stores/mind-map-store"
export * from "@/src/stores/drawing-tools"

// =====================================
// LEGACY COMPATIBILITY EXPORTS
// =====================================

// Backward compatibility aliases (if needed)
export { MindMapNode as LegacyMindMapNode } from "./node-tools/mind-map-node"
export { IntegratedFloatingToolbar as LegacyToolbar } from "./shared/integrated-floating-toolbar"

// =====================================
// COMPONENT GROUPS FOR CONVENIENCE
// =====================================

// ✅ FIXED: Export grouped components as string paths (for documentation/reference)
export const ComponentPaths = {
  Canvas: {
    MindMapCanvas: "./canvas/mind-map-canvas",
  },
  DrawingTools: {
    Panel: "./drawing-tools/drawing-tools-panel",
    Sections: "./drawing-tools/drawing-tools-sections",
    LineTool: "./line-tools/line-tool",
    PreviewLineRenderer: "./line-tools/preview-line-renderer",
    EraserTool: "./eraser-tool/eraser-tool-integration", // ✅ Added eraser
  },
  NodeTools: {
    MindMapNode: "./node-tools/mind-map-node",
  },
  TextTools: {
    TextRenderer: "./text-tool/TextRenderer",
    TextEditor: "./text-tool/TextEditor",
    TextPreview: "./text-tool/TextPreview",
    TextToolHandler: "./text-tool/TextToolHandler",
  },
  ShapeTools: {
    ShapeOutline: "./shape-tools/shape-outline",
  },
  SharedComponents: {
    UIIndicators: "./shared/UIIndicators",
    IntegratedFloatingToolbar: "./shared/integrated-floating-toolbar",
  },
} as const

// =====================================
// TYPE-SAFE COMPONENT REFERENCES
// =====================================

// ✅ FIXED: Import actual components for type-safe references
import MindMapCanvasComponent from "./canvas/mind-map-canvas"
import { MindMapNode as MindMapNodeComponent } from "./node-tools/mind-map-node"
import { DrawingToolsPanel as DrawingToolsPanelComponent } from "./drawing-tools/drawing-tools-panel"
import { LineToolIntegration as LineToolIntegrationComponent } from "./line-tools/line-tool"
import { EraserToolIntegration as EraserToolIntegrationComponent } from "./eraser-tool/eraser-tool"
import { TextRenderer as TextRendererComponent } from "./text-tool/TextRenderer"
import { UIIndicators as UIIndicatorsComponent } from "./shared/UIIndicators"
import { IntegratedFloatingToolbar as IntegratedFloatingToolbarComponent } from "./shared/integrated-floating-toolbar"

// ✅ FIXED: Properly structured component references
export const ComponentReferences = {
  Canvas: {
    MindMapCanvas: MindMapCanvasComponent,
  },
  DrawingTools: {
    Panel: DrawingToolsPanelComponent,
    LineTool: LineToolIntegrationComponent,
    EraserTool: EraserToolIntegrationComponent, // ✅ Added eraser
  },
  NodeTools: {
    MindMapNode: MindMapNodeComponent,
  },
  TextTools: {
    TextRenderer: TextRendererComponent,
  },
  SharedComponents: {
    UIIndicators: UIIndicatorsComponent,
    IntegratedFloatingToolbar: IntegratedFloatingToolbarComponent,
  },
} as const

// =====================================
// CONVENIENCE EXPORTS FOR COMMON USAGE
// =====================================

// ✅ FIXED: Most commonly used components with proper typing
export const CommonComponents = {
  // Core canvas
  MindMapCanvas: MindMapCanvasComponent,

  // Essential tools
  MindMapNode: MindMapNodeComponent,
  DrawingToolsPanel: DrawingToolsPanelComponent,

  // Drawing tools
  LineToolIntegration: LineToolIntegrationComponent,
  EraserToolIntegration: EraserToolIntegrationComponent, // ✅ Added eraser
  TextRenderer: TextRendererComponent,

  // UI components
  UIIndicators: UIIndicatorsComponent,
  IntegratedFloatingToolbar: IntegratedFloatingToolbarComponent,
} as const

// =====================================
// TOOL-SPECIFIC EXPORTS
// =====================================

// ✅ Drawing tools grouped by category
export const DrawingToolComponents = {
  Line: LineToolIntegrationComponent,
  Eraser: EraserToolIntegrationComponent, // ✅ Added eraser
  Text: TextRendererComponent,
} as const

// ✅ All canvas-related components
export const CanvasComponents = {
  Main: MindMapCanvasComponent,
  Node: MindMapNodeComponent,
  Toolbar: IntegratedFloatingToolbarComponent,
  Indicators: UIIndicatorsComponent,
} as const

// =====================================
// HOOK EXPORTS
// =====================================

// Re-export commonly used hooks
export {
  useMindMapStore,
  useMindMapSelectors,
  useMindMapDrawingTools,
  useMindMapPanelIntegration,
} from "@/src/stores/mind-map-store"

export {
  useDrawingToolsStore,
  useDrawingToolsPanel,
  useLineDrawing,
  useTextDrawing,
  useEraserDrawing, // ✅ Added eraser hook
  useDrawingToolsSelection,
  useDrawingToolsSettings,
} from "@/src/stores/drawing-tools"

// =====================================
// TYPE EXPORTS
// =====================================

// Re-export important types for consumers
export type {
  ReactFlowNode,
  MindMapNodeData,
  LineToolData,
  TextToolData,
  EraserState, // ✅ Added eraser types
  EraserMode,
  DrawingToolType,
  ToolType,
  NodeShape,
} from "@/src/types/drawing-tools"

export type {
  MindMapCanvasProps,
  IntegratedFloatingToolbarProps,
} from "@/src/types/mindmap"

// =====================================
// UTILITY EXPORTS
// =====================================

// Utility functions for working with components
export const ComponentUtils = {
  // Check if a tool is a drawing tool
  isDrawingTool: (tool: string): boolean => {
    return [
      "rectangle",
      "diamond",
      "circle",
      "line",
      "text",
      "eraser",
    ].includes(tool)
  },

  // Get component by tool type
  getToolComponent: (tool: string) => {
    switch (tool) {
      case "line":
        return LineToolIntegrationComponent
      case "eraser":
        return EraserToolIntegrationComponent // ✅ Added eraser
      case "text":
        return TextRendererComponent
      default:
        return null
    }
  },

  // Get tool capabilities
  getToolCapabilities: (tool: string) => {
    return {
      hasPanel: [
        "rectangle",
        "diamond",
        "circle",
        "line",
        "text",
        "eraser",
      ].includes(tool),
      hasIntegration: ["line", "eraser", "text"].includes(tool),
      isShape: ["rectangle", "diamond", "circle"].includes(tool),
    }
  },
} as const

// =====================================
// DEFAULT EXPORT
// =====================================

// Default export with most essential components
export default {
  MindMapCanvas: MindMapCanvasComponent,
  MindMapNode: MindMapNodeComponent,
  DrawingToolsPanel: DrawingToolsPanelComponent,
  IntegratedFloatingToolbar: IntegratedFloatingToolbarComponent,

  // Tool integrations
  LineToolIntegration: LineToolIntegrationComponent,
  EraserToolIntegration: EraserToolIntegrationComponent, // ✅ Added eraser
  TextRenderer: TextRendererComponent,

  // Utilities
  ComponentUtils,
}
