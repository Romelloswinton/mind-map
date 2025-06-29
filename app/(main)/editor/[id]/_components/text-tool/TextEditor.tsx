import React, { useState, useRef, useEffect, useCallback } from "react"
import { Viewport } from "@xyflow/react"
import { TextToolData } from "@/src/types/drawing-tools"
import { transformPosition } from "@/app/utils/view-transforms"

interface TextEditorProps {
  text: TextToolData
  viewport: Viewport
  onSave: (content: string) => void
  onCancel: () => void
  onUpdateText: (updates: Partial<TextToolData>) => void
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  viewport,
  onSave,
  onCancel,
  onUpdateText,
}) => {
  const [content, setContent] = useState(text.content || "")
  const [isResizing, setIsResizing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [content])

  const screenPos = transformPosition(text.position, viewport)

  const handleSave = useCallback(() => {
    const trimmedContent = content.trim()
    if (trimmedContent) {
      onSave(trimmedContent)
    } else {
      // If empty, cancel instead of saving
      onCancel()
    }
  }, [content, onSave, onCancel])

  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleCancel()
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSave()
      }
      // Allow Tab for indentation
      else if (e.key === "Tab") {
        e.preventDefault()
        const textarea = textareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newContent =
            content.substring(0, start) + "\t" + content.substring(end)
          setContent(newContent)
          // Set cursor position after the tab
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1
          }, 0)
        }
      }
    },
    [handleSave, handleCancel, content]
  )

  const handleFontSizeChange = useCallback(
    (delta: number) => {
      const newSize = Math.max(8, Math.min(72, text.fontSize + delta))
      onUpdateText({ fontSize: newSize })
    },
    [text.fontSize, onUpdateText]
  )

  const handleStyleToggle = useCallback(
    (property: keyof TextToolData, value: any) => {
      onUpdateText({ [property]: value })
    },
    [onUpdateText]
  )

  const handleColorChange = useCallback(
    (color: string) => {
      onUpdateText({ color })
    },
    [onUpdateText]
  )

  return (
    <div
      ref={containerRef}
      className="absolute z-50 pointer-events-auto"
      style={{
        left: screenPos.x,
        top: screenPos.y,
        transform: `rotate(${text.rotation || 0}deg)`,
        transformOrigin: "top left",
      }}
    >
      {/* Editing Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="resize-none border-2 border-blue-500 rounded bg-white shadow-lg outline-none overflow-hidden"
        style={{
          fontSize: `${text.fontSize}px`,
          fontFamily: text.fontFamily,
          fontWeight: text.fontWeight,
          fontStyle: text.fontStyle,
          textAlign: text.textAlign,
          color: text.color,
          backgroundColor: text.backgroundColor || "white",
          padding: `${text.padding}px`,
          lineHeight: text.lineHeight,
          letterSpacing: `${text.letterSpacing}px`,
          textDecoration: text.textDecoration,
          width: text.maxWidth ? `${text.maxWidth}px` : "200px",
          minHeight: "40px",
          maxWidth: "400px",
          minWidth: "100px",
        }}
        placeholder="Type your text here..."
        rows={1}
      />

      {/* Quick Controls */}
      <div className="absolute -top-12 left-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border p-1">
        {/* Font Size Controls */}
        <button
          onClick={() => handleFontSizeChange(-2)}
          className="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="Decrease font size"
        >
          A-
        </button>
        <span className="text-xs px-1 min-w-6 text-center">
          {text.fontSize}
        </span>
        <button
          onClick={() => handleFontSizeChange(2)}
          className="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="Increase font size"
        >
          A+
        </button>

        <div className="w-px bg-gray-300 h-4 mx-1" />

        {/* Style Controls */}
        <button
          onClick={() =>
            handleStyleToggle(
              "fontWeight",
              text.fontWeight === "bold" ? "normal" : "bold"
            )
          }
          className={`w-6 h-6 flex items-center justify-center text-xs rounded font-bold transition-colors ${
            text.fontWeight === "bold"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() =>
            handleStyleToggle(
              "fontStyle",
              text.fontStyle === "italic" ? "normal" : "italic"
            )
          }
          className={`w-6 h-6 flex items-center justify-center text-xs rounded italic transition-colors ${
            text.fontStyle === "italic"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          title="Italic"
        >
          I
        </button>

        <div className="w-px bg-gray-300 h-4 mx-1" />

        {/* Color Picker */}
        <input
          type="color"
          value={text.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-6 h-6 rounded border-none cursor-pointer"
          title="Text color"
        />

        <div className="w-px bg-gray-300 h-4 mx-1" />

        {/* Action Buttons */}
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          title="Save (Ctrl+Enter)"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          title="Cancel (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Help Text */}
      <div className="absolute -bottom-8 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
        Ctrl+Enter to save • Esc to cancel
      </div>
    </div>
  )
}
