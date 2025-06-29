import { Viewport } from "@xyflow/react"

/**
 * Transform world coordinates to screen coordinates
 */
export function transformPosition(
  worldPos: { x: number; y: number },
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: worldPos.x * viewport.zoom + viewport.x,
    y: worldPos.y * viewport.zoom + viewport.y,
  }
}

/**
 * Transform screen coordinates to world coordinates
 */
export function inverseTransformPosition(
  screenPos: { x: number; y: number },
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: (screenPos.x - viewport.x) / viewport.zoom,
    y: (screenPos.y - viewport.y) / viewport.zoom,
  }
}

/**
 * Transform a size value from world to screen coordinates
 */
export function transformSize(size: number, viewport: Viewport): number {
  return size * viewport.zoom
}

/**
 * Transform a size value from screen to world coordinates
 */
export function inverseTransformSize(size: number, viewport: Viewport): number {
  return size / viewport.zoom
}

/**
 * Alias for inverseTransformPosition for backward compatibility
 * @deprecated Use inverseTransformPosition instead
 */
export const reverseTransformPosition = inverseTransformPosition

/**
 * Transform a rectangle from world to screen coordinates
 */
export function transformRect(
  worldRect: { x: number; y: number; width: number; height: number },
  viewport: Viewport
): { x: number; y: number; width: number; height: number } {
  const screenPos = transformPosition(
    { x: worldRect.x, y: worldRect.y },
    viewport
  )
  return {
    x: screenPos.x,
    y: screenPos.y,
    width: transformSize(worldRect.width, viewport),
    height: transformSize(worldRect.height, viewport),
  }
}

/**
 * Transform a rectangle from screen to world coordinates
 */
export function inverseTransformRect(
  screenRect: { x: number; y: number; width: number; height: number },
  viewport: Viewport
): { x: number; y: number; width: number; height: number } {
  const worldPos = inverseTransformPosition(
    { x: screenRect.x, y: screenRect.y },
    viewport
  )
  return {
    x: worldPos.x,
    y: worldPos.y,
    width: inverseTransformSize(screenRect.width, viewport),
    height: inverseTransformSize(screenRect.height, viewport),
  }
}

/**
 * Check if a point is within the visible viewport bounds
 */
export function isPointInViewport(
  worldPos: { x: number; y: number },
  viewport: Viewport,
  canvasSize: { width: number; height: number }
): boolean {
  const screenPos = transformPosition(worldPos, viewport)
  return (
    screenPos.x >= 0 &&
    screenPos.y >= 0 &&
    screenPos.x <= canvasSize.width &&
    screenPos.y <= canvasSize.height
  )
}

/**
 * Get the world bounds of the current viewport
 */
export function getViewportWorldBounds(
  viewport: Viewport,
  canvasSize: { width: number; height: number }
): { x: number; y: number; width: number; height: number } {
  const topLeft = inverseTransformPosition({ x: 0, y: 0 }, viewport)
  const bottomRight = inverseTransformPosition(
    { x: canvasSize.width, y: canvasSize.height },
    viewport
  )

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  }
}
