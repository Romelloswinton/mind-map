// Fixed TextPreview Component - Updated Type Consistency
// File: app/mind-map/[id]/_components/text-tool/TextPreview.tsx

import React from "react"
import { Viewport } from "@xyflow/react"

// ✅ FIXED: Import from unified types
import type { TextDrawingState } from "@/src/types/drawing-tools"

// ✅ ENHANCED: Utility function for transforming positions
const transformPosition = (
  position: { x: number; y: number },
  viewport: Viewport
) => {
  return {
    x: position.x * viewport.zoom + viewport.x,
    y: position.y * viewport.zoom + viewport.y,
  }
}

interface TextPreviewProps {
  textDrawingState: TextDrawingState
  viewport: Viewport
}

export const TextPreview: React.FC<TextPreviewProps> = ({
  textDrawingState,
  viewport,
}) => {
  // ✅ ENHANCED: Better validation and early returns
  if (!textDrawingState?.isCreating || !textDrawingState?.position) {
    console.log("📝 TextPreview: Not creating text or no position")
    return null
  }

  // ✅ ENHANCED: Position validation
  const position = textDrawingState.position
  if (
    typeof position.x !== "number" ||
    typeof position.y !== "number" ||
    !isFinite(position.x) ||
    !isFinite(position.y)
  ) {
    console.warn("⚠️ TextPreview: Invalid position:", position)
    return null
  }

  const screenPos = transformPosition(position, viewport)

  console.log("📝 Rendering TextPreview at:", {
    canvas: position,
    screen: screenPos,
    viewport,
  })

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: screenPos.x,
        top: screenPos.y,
        transform: "translateZ(0)", // Hardware acceleration
      }}
    >
      {/* ✅ ENHANCED: Preview box with better styling */}
      <div className="relative">
        {/* Main preview container */}
        <div className="border-2 border-dashed border-blue-500 bg-blue-50/90 backdrop-blur-sm rounded-lg p-3 min-w-32 min-h-12 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-blue-600 text-sm font-medium select-none">
            Click to add text
          </span>
        </div>

        {/* ✅ ENHANCED: Cursor indicator with animation */}
        <div className="absolute top-0 left-0 flex items-center">
          <div className="w-0.5 h-6 bg-blue-500 animate-pulse" />
          <div className="ml-1 text-xs text-blue-600 font-medium">
            Type here
          </div>
        </div>

        {/* ✅ ENHANCED: Position indicator */}
        <div className="absolute -bottom-8 left-0 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border">
          <span className="font-mono">
            x: {Math.round(position.x)}, y: {Math.round(position.y)}
          </span>
        </div>

        {/* ✅ ENHANCED: Preview guidelines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Crosshair guides */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-blue-300/50 transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-px h-full bg-blue-300/50 transform -translate-x-1/2" />
        </div>

        {/* ✅ ENHANCED: Corner indicators */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm" />

        {/* ✅ ENHANCED: Tool tip with instructions */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-90">
          <span>Click to start typing</span>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>

        {/* ✅ ENHANCED: Zoom-aware scaling */}
        <style jsx>{`
          @media (max-width: 768px) {
            .text-preview {
              transform: scale(${Math.max(0.8, viewport.zoom)});
            }
          }
        `}</style>
      </div>
    </div>
  )
}

// ✅ ENHANCED: Alternative preview component for different states
export const TextPreviewVariant: React.FC<
  TextPreviewProps & {
    variant?: "default" | "minimal" | "detailed"
    showInstructions?: boolean
    customMessage?: string
  }
> = ({
  textDrawingState,
  viewport,
  variant = "default",
  showInstructions = true,
  customMessage,
}) => {
  if (!textDrawingState?.isCreating || !textDrawingState?.position) {
    return null
  }

  const screenPos = transformPosition(textDrawingState.position, viewport)
  const message = customMessage || "Click to add text"

  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          container: "border border-blue-400 bg-blue-50/60 rounded p-2 text-xs",
          text: "text-blue-500",
        }
      case "detailed":
        return {
          container:
            "border-2 border-dashed border-purple-500 bg-purple-50/80 rounded-lg p-4 shadow-xl",
          text: "text-purple-600 font-semibold",
        }
      default:
        return {
          container:
            "border-2 border-dashed border-blue-500 bg-blue-50/90 rounded-lg p-3 shadow-lg",
          text: "text-blue-600 font-medium",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: screenPos.x,
        top: screenPos.y,
      }}
    >
      <div className={`${styles.container} animate-pulse`}>
        <span className={`${styles.text} text-sm select-none`}>{message}</span>

        {showInstructions && variant === "detailed" && (
          <div className="mt-2 text-xs text-gray-600">
            <div>• Start typing immediately</div>
            <div>• Ctrl+Enter to save</div>
            <div>• Esc to cancel</div>
          </div>
        )}
      </div>

      {/* Cursor for all variants */}
      <div className="absolute top-0 left-0 w-px h-4 bg-blue-500 animate-pulse" />
    </div>
  )
}

// ✅ ENHANCED: Export both components
export default TextPreview
