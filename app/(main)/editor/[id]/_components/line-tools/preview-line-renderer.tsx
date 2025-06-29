// PreviewLineRenderer Component
// File: app/mind-map/[id]/_components/PreviewLineRenderer.tsx

import React from "react"

// ✅ FIXED: Import from unified types
import type { LineToolData } from "@/src/types/drawing-tools"

// ✅ FIXED: Transform utilities
import { transformPosition } from "@/app/utils/view-transforms"

interface PreviewLineRendererProps {
  previewLine: Omit<LineToolData, "id" | "createdAt" | "updatedAt">
  viewport: { x: number; y: number; zoom: number }
  className?: string
}

export const PreviewLineRenderer: React.FC<PreviewLineRendererProps> = ({
  previewLine,
  viewport,
  className = "",
}) => {
  const startScreen = transformPosition(previewLine.startPoint, viewport)
  const endScreen = transformPosition(previewLine.endPoint, viewport)

  const length = Math.sqrt(
    Math.pow(endScreen.x - startScreen.x, 2) +
      Math.pow(endScreen.y - startScreen.y, 2)
  )
  const angle = Math.atan2(
    endScreen.y - startScreen.y,
    endScreen.x - startScreen.x
  )

  // Handle different stroke styles with proper fallback
  const getStrokeDasharray = () => {
    switch (previewLine.strokeStyle) {
      case "dashed":
        return "8,4"
      case "dotted":
        return "2,2"
      case "solid":
      default:
        return undefined
    }
  }

  // Transform coordinates based on viewport for SVG rendering
  const x1 = previewLine.startPoint.x * viewport.zoom + viewport.x
  const y1 = previewLine.startPoint.y * viewport.zoom + viewport.y
  const x2 = previewLine.endPoint.x * viewport.zoom + viewport.x
  const y2 = previewLine.endPoint.y * viewport.zoom + viewport.y

  const strokeWidth = (previewLine.strokeWidth || 2) * viewport.zoom
  const strokeColor = previewLine.strokeColor || "#000000"
  const strokeDasharray = getStrokeDasharray()

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-25 ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Preview gradient for visual feedback */}
          <linearGradient
            id="previewGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.4" />
          </linearGradient>

          {/* Dashed preview gradient */}
          <linearGradient
            id="previewDashedGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>

          {/* Sloppiness filter for preview if enabled */}
          {previewLine.sloppiness && previewLine.sloppiness > 0 && (
            <filter
              id="previewSloppy"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                baseFrequency={0.02 + previewLine.sloppiness * 0.01}
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={previewLine.sloppiness * 1.5}
              />
            </filter>
          )}
        </defs>

        {/* Background glow effect for preview */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#previewGradient)"
          strokeWidth={strokeWidth + 4}
          strokeDasharray={strokeDasharray}
          strokeLinecap={
            previewLine.edgeStyle === "rounded" ? "round" : "square"
          }
          opacity={0.6}
          className="animate-pulse"
          style={{
            filter:
              previewLine.sloppiness && previewLine.sloppiness > 0
                ? "url(#previewSloppy)"
                : undefined,
          }}
        />

        {/* Main preview line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap={
            previewLine.edgeStyle === "rounded" ? "round" : "square"
          }
          opacity={previewLine.opacity * 0.8}
          style={{
            filter:
              previewLine.sloppiness && previewLine.sloppiness > 0
                ? "url(#previewSloppy)"
                : undefined,
          }}
        />

        {/* Dashed selection indicator */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#previewDashedGradient)"
          strokeWidth={strokeWidth + 2}
          strokeDasharray="4,2"
          opacity={0.7}
          className="animate-pulse"
        />

        {/* Start point indicator */}
        <circle
          cx={x1}
          cy={y1}
          r={6 * viewport.zoom}
          fill="#22c55e"
          stroke="white"
          strokeWidth={2 * viewport.zoom}
          opacity={0.9}
          className="animate-pulse"
        />

        {/* End point indicator */}
        <circle
          cx={x2}
          cy={y2}
          r={6 * viewport.zoom}
          fill="#ef4444"
          stroke="white"
          strokeWidth={2 * viewport.zoom}
          opacity={0.9}
          className="animate-pulse"
        />

        {/* Drawing guidance text */}
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 15}
          fill={strokeColor}
          fontSize={12 * viewport.zoom}
          textAnchor="middle"
          style={{ pointerEvents: "none" }}
          className="font-medium"
          opacity={0.8}
        >
          Drawing line...
        </text>

        {/* Length indicator */}
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 + 25}
          fill="#3b82f6"
          fontSize={10 * viewport.zoom}
          textAnchor="middle"
          style={{ pointerEvents: "none" }}
          className="font-medium"
          opacity={0.7}
        >
          {Math.round(length / viewport.zoom)}px
        </text>

        {/* Style indicator */}
        <text
          x={x1 + 10}
          y={y1 - 10}
          fill="#6b7280"
          fontSize={9 * viewport.zoom}
          style={{ pointerEvents: "none" }}
          className="font-medium"
          opacity={0.6}
        >
          {previewLine.strokeStyle} • {previewLine.strokeWidth}px
        </text>
      </svg>

      {/* Alternative DOM-based preview (fallback) */}
      <div
        className="absolute pointer-events-none opacity-70"
        style={{
          left: startScreen.x,
          top: startScreen.y,
          width: length,
          height: previewLine.strokeWidth,
          transform: `rotate(${angle}rad)`,
          transformOrigin: "0 50%",
          backgroundColor: previewLine.strokeColor,
          opacity: previewLine.opacity * 0.7,
          borderRadius:
            previewLine.edgeStyle === "rounded"
              ? `${previewLine.strokeWidth / 2}px`
              : "0",
          border: "2px dashed rgba(59, 130, 246, 0.5)",
          zIndex: 25,
          display: "none", // Hidden by default, can be shown as fallback
        }}
      >
        {/* Dashed/dotted pattern overlay for DOM fallback */}
        {previewLine.strokeStyle !== "solid" && (
          <div
            className="absolute inset-0"
            style={{
              background:
                previewLine.strokeStyle === "dashed"
                  ? `repeating-linear-gradient(
                      to right,
                      ${previewLine.strokeColor} 0px,
                      ${previewLine.strokeColor} ${
                      previewLine.strokeWidth * 2
                    }px,
                      transparent ${previewLine.strokeWidth * 2}px,
                      transparent ${previewLine.strokeWidth * 4}px
                    )`
                  : `repeating-linear-gradient(
                      to right,
                      ${previewLine.strokeColor} 0px,
                      ${previewLine.strokeColor} ${previewLine.strokeWidth}px,
                      transparent ${previewLine.strokeWidth}px,
                      transparent ${previewLine.strokeWidth * 2}px
                    )`,
              borderRadius: "inherit",
            }}
          />
        )}

        {/* Length indicator for DOM fallback */}
        <div
          className="absolute bg-blue-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap animate-pulse"
          style={{
            left: "50%",
            top: -24,
            transform: `translateX(-50%) rotate(${-angle}rad)`,
          }}
        >
          {Math.round(length / viewport.zoom)}px
        </div>
      </div>
    </div>
  )
}

// ✅ ENHANCED: Hook for preview line state management
export const usePreviewLine = () => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [previewData, setPreviewData] = React.useState<Omit<
    LineToolData,
    "id" | "createdAt" | "updatedAt"
  > | null>(null)

  const showPreview = React.useCallback(
    (data: Omit<LineToolData, "id" | "createdAt" | "updatedAt">) => {
      setPreviewData(data)
      setIsVisible(true)
    },
    []
  )

  const hidePreview = React.useCallback(() => {
    setIsVisible(false)
    setPreviewData(null)
  }, [])

  const updatePreview = React.useCallback(
    (
      updates: Partial<Omit<LineToolData, "id" | "createdAt" | "updatedAt">>
    ) => {
      setPreviewData((prev) => (prev ? { ...prev, ...updates } : null))
    },
    []
  )

  return {
    isVisible,
    previewData,
    showPreview,
    hidePreview,
    updatePreview,
  }
}

export default PreviewLineRenderer
