// 🔥 Performance mind map components
// All components use static selectors and memoization to prevent infinite loops

// Main canvas component with ReactFlow integration
export { SimpleMindMapCanvas } from "./mind-map-canvas"

// Individual node component with resize and editing capabilities
export { MindMapNode } from "./mind-map-node"

// Type-safe node wrapper for React Flow compatibility

// Floating toolbar with tool selection and history controls
export { IntegratedFloatingToolbar } from "./integrated-floating-toolbar"

// Performance utilities and selectors
export * from "@/src/stores/mind-map-selectors"

// Legacy exports for backward compatibility (if needed)
// Note: Use the optimized versions above for best performance
// export { MindMapCanvas } from './mind-map-canvas'
// export { MindMapNode as LegacyMindMapNode } from './mind-map-node'
// export { IntegratedFloatingToolbar as LegacyToolbar } from './integrated-floating-toolbar'
