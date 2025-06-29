// Updated TextRenderer.tsx - Clean Production Version
// File: app/mind-map/[id]/_components/TextRenderer.tsx

import React, { useCallback, useState, useEffect, useRef } from "react"
import { Viewport } from "@xyflow/react"

// ✅ FIXED: Import from unified types
import type { TextToolData } from "@/src/types/drawing-tools"

// ✅ FIXED: Import actual drawing tools store
import { useDrawingToolsStore } from "@/src/stores/drawing-tools"

// ✅ FIXED: Import transform utilities
import { transformPosition } from "@/app/utils/view-transforms"

interface TextRendererProps {
  text: TextToolData
  viewport: Viewport
  isSelected?: boolean
  onSelect?: (textId: string) => void
  onUpdate?: (textId: string, updates: Partial<TextToolData>) => void
  onDelete?: (textId: string) => void
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  text,
  viewport,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  // ✅ FIXED: Store integration
  const drawingToolsStore = useDrawingToolsStore()

  // ✅ Local state for interactions
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(text.content)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // ✅ Refs for editing and dragging
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  // ✅ Validation and error handling
  if (!text?.position || !text.id) {
    console.warn("Text missing required properties:", text)
    return null
  }

  // ✅ Calculate screen position
  const screenPos = transformPosition(text.position, viewport)

  // ✅ Safe property extraction with defaults
  const fontSize = Math.max(text.fontSize || 16, 8)
  const fontFamily = text.fontFamily || "Arial, sans-serif"
  const color = text.color || "#000000"
  const padding = Math.max(text.padding || 4, 2)
  const rotation = text.rotation || 0
  const opacity =
    text.opacity !== undefined ? Math.max(0, Math.min(1, text.opacity)) : 1
  const backgroundColor = text.backgroundColor || "transparent"

  // ✅ Text click handler
  const handleTextClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onSelect?.(text.id)
      drawingToolsStore.setSelectedText(text.id)
    },
    [text.id, onSelect, drawingToolsStore]
  )

  // ✅ Double click to edit
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      setIsEditing(true)
      setEditContent(text.content)
    },
    [text.content]
  )

  // ✅ Delete handler
  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onDelete?.(text.id)
      drawingToolsStore.deleteText(text.id)
    },
    [text.id, onDelete, drawingToolsStore]
  )

  // ✅ Drag functionality
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (
        event.button !== 0 ||
        (event.target as HTMLElement).closest("button") ||
        isEditing
      ) {
        return
      }

      event.preventDefault()
      setIsDragging(true)

      const rect = elementRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      }
    },
    [isEditing]
  )

  // ✅ Global mouse move and up handlers for dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return

      const newScreenPos = {
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      }

      const newCanvasPos = {
        x: (newScreenPos.x - viewport.x) / viewport.zoom,
        y: (newScreenPos.y - viewport.y) / viewport.zoom,
      }

      const updates = {
        position: newCanvasPos,
        updatedAt: Date.now(),
      }

      onUpdate?.(text.id, updates)
      drawingToolsStore.updateText(text.id, updates)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, viewport, text.id, onUpdate, drawingToolsStore])

  // ✅ Edit functionality
  const handleSaveEdit = useCallback(() => {
    const trimmedContent = editContent.trim()
    if (trimmedContent !== text.content) {
      const updates = {
        content: trimmedContent,
        updatedAt: Date.now(),
      }
      onUpdate?.(text.id, updates)
      drawingToolsStore.updateText(text.id, updates)
    }
    setIsEditing(false)
  }, [editContent, text.content, text.id, onUpdate, drawingToolsStore])

  const handleCancelEdit = useCallback(() => {
    setEditContent(text.content)
    setIsEditing(false)
  }, [text.content])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        handleSaveEdit()
      } else if (event.key === "Escape") {
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  // ✅ Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  // ✅ Rotation handler
  const handleRotate = useCallback(
    (deltaRotation: number) => {
      const newRotation = (rotation + deltaRotation) % 360
      const updates = {
        rotation: newRotation,
        updatedAt: Date.now(),
      }
      onUpdate?.(text.id, updates)
      drawingToolsStore.updateText(text.id, updates)
    },
    [rotation, text.id, onUpdate, drawingToolsStore]
  )

  // ✅ Text styles
  const getTextStyles = (): React.CSSProperties => ({
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    fontWeight: text.fontWeight || "normal",
    fontStyle: text.fontStyle || "normal",
    textAlign: (text.textAlign || "left") as React.CSSProperties["textAlign"],
    color: color,
    backgroundColor: backgroundColor,
    padding: `${padding}px`,
    lineHeight: text.lineHeight || 1.4,
    letterSpacing: text.letterSpacing ? `${text.letterSpacing}px` : "normal",
    textDecoration: text.textDecoration || "none",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    minWidth: "20px",
    minHeight: "20px",
    border: isSelected ? "1px solid transparent" : "none",
    borderRadius: "2px",
    userSelect: isDragging ? "none" : "auto",
    cursor: isDragging ? "grabbing" : isSelected ? "grab" : "pointer",
  })

  return (
    <div
      ref={elementRef}
      className={`absolute pointer-events-auto transition-all duration-200 group ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""
      } ${
        isHovered && !isSelected ? "ring-1 ring-blue-300 ring-offset-1" : ""
      } ${isDragging ? "scale-105 shadow-2xl z-50" : ""}`}
      style={{
        left: screenPos.x,
        top: screenPos.y,
        transform: `rotate(${rotation}deg) ${isDragging ? "scale(1.02)" : ""}`,
        transformOrigin: "top left",
        maxWidth: text.maxWidth ? `${text.maxWidth}px` : "auto",
        opacity: opacity,
        zIndex: isSelected ? 20 : isDragging ? 50 : 10,
      }}
      onClick={handleTextClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✅ Text content or editor */}
      {isEditing ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white border-2 border-blue-500 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              color: color,
              minWidth: "100px",
              minHeight: "30px",
            }}
            placeholder="Enter text..."
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={handleSaveEdit}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative select-none" style={getTextStyles()}>
          {text.content || "Empty text"}

          {/* Content length indicator for long texts */}
          {text.content && text.content.length > 100 && isSelected && (
            <div className="absolute -bottom-6 right-0 text-xs text-gray-500 bg-white px-1 rounded">
              {text.content.length} chars
            </div>
          )}
        </div>
      )}

      {/* ✅ Selection controls */}
      {isSelected && !isEditing && (
        <>
          {/* Delete button */}
          <button
            className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg z-10 border border-white"
            onClick={handleDelete}
            title="Delete text"
          >
            ×
          </button>

          {/* Edit button */}
          <button
            className="absolute -top-3 -left-3 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors shadow-lg z-10 border border-white"
            onClick={handleDoubleClick}
            title="Edit text"
          >
            ✏
          </button>

          {/* Rotation handle */}
          <button
            className="absolute -top-10 left-1/2 w-5 h-5 bg-green-500 rounded-full hover:bg-green-600 transition-colors border border-white flex items-center justify-center text-white text-xs"
            style={{ transform: "translateX(-50%)" }}
            title="Rotate text"
            onClick={(e) => {
              e.stopPropagation()
              handleRotate(15)
            }}
          >
            ↻
          </button>

          {/* Position indicator */}
          <div className="absolute -bottom-8 left-0 text-xs text-gray-500 bg-white px-1 rounded border">
            x:{Math.round(text.position.x)} y:{Math.round(text.position.y)}
          </div>

          {/* Property display */}
          <div className="absolute -top-16 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-90 pointer-events-none">
            {fontSize}px • {color} • {Math.round(opacity * 100)}%
          </div>

          {/* Selection outline */}
          <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none rounded animate-pulse" />

          {/* Corner markers */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </>
      )}

      {/* ✅ Hover indicator */}
      {isHovered && !isSelected && !isEditing && (
        <div className="absolute inset-0 border border-blue-300 border-dashed pointer-events-none rounded bg-blue-50 bg-opacity-20">
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
        </div>
      )}

      {/* ✅ Hover edit hint */}
      {isHovered && !isSelected && !isDragging && !isEditing && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Double-click to edit • Drag to move
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}

      {/* ✅ Dragging indicator */}
      {isDragging && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
          Dragging...
        </div>
      )}
    </div>
  )
}
