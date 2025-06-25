// Save as: ./store/drawing-tools.ts

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { devtools } from "zustand/middleware"
import {
  DrawingToolSettings,
  DrawingToolsState,
  DrawingToolType,
} from "../types/drawing-tools"
import {
  deepMerge,
  normalizeToolSettings,
  validateToolSettings,
} from "@/app/utils/drawing-tools"
import {
  DEFAULT_TOOL_SETTINGS,
  STORAGE_KEYS,
} from "@/app/constants/drawing-tools"

// =====================================
// STORE IMPLEMENTATION
// =====================================

export const useDrawingToolsStore = create<DrawingToolsState>()(
  devtools(
    persist(
      (set, get) => ({
        // =====================================
        // INITIAL STATE
        // =====================================
        isPanelVisible: false,
        activeTool: null,
        isCollapsed: false,
        toolSettings: { ...DEFAULT_TOOL_SETTINGS },

        // =====================================
        // PANEL VISIBILITY ACTIONS
        // =====================================
        showPanel: (tool: DrawingToolType) => {
          set(
            {
              isPanelVisible: true,
              activeTool: tool,
            },
            false,
            "showPanel"
          )
          console.log(`🎨 Panel shown for ${tool}`)
        },

        hidePanel: () => {
          set(
            {
              isPanelVisible: false,
              activeTool: null,
            },
            false,
            "hidePanel"
          )
          console.log("🚪 Panel hidden")
        },

        toggleCollapsed: () => {
          set(
            (state) => ({
              isCollapsed: !state.isCollapsed,
            }),
            false,
            "toggleCollapsed"
          )
          console.log(
            `📱 Panel ${get().isCollapsed ? "expanded" : "collapsed"}`
          )
        },

        setActiveTool: (tool: DrawingToolType | null) => {
          set({ activeTool: tool }, false, "setActiveTool")
        },

        // =====================================
        // SETTINGS ACTIONS
        // =====================================
        updateToolSetting: (tool, key, value) => {
          const currentSettings = get().toolSettings[tool]
          const newPartialSettings = { [key]: value }

          // Validate the new setting
          if (!validateToolSettings(newPartialSettings)) {
            console.warn(`❌ Invalid setting for ${tool}.${key}:`, value)
            return
          }

          // Normalize the setting
          const normalizedSettings = normalizeToolSettings(newPartialSettings)
          const normalizedValue = normalizedSettings[key] ?? value

          set(
            (state) => ({
              toolSettings: {
                ...state.toolSettings,
                [tool]: {
                  ...currentSettings,
                  [key]: normalizedValue,
                },
              },
            }),
            false,
            "updateToolSetting"
          )

          console.log(`🔧 Updated ${tool} ${key}:`, normalizedValue)
        },

        updateToolSettings: (tool, settings) => {
          const currentSettings = get().toolSettings[tool]

          // Validate the new settings
          if (!validateToolSettings(settings)) {
            console.warn(`❌ Invalid settings for ${tool}:`, settings)
            return
          }

          // Normalize the settings
          const normalizedSettings = normalizeToolSettings(settings)
          const mergedSettings = deepMerge(currentSettings, normalizedSettings)

          set(
            (state) => ({
              toolSettings: {
                ...state.toolSettings,
                [tool]: mergedSettings,
              },
            }),
            false,
            "updateToolSettings"
          )

          console.log(`🔧 Updated ${tool} settings:`, normalizedSettings)
        },

        resetToolSettings: (tool) => {
          if (tool) {
            // Reset specific tool
            set(
              (state) => ({
                toolSettings: {
                  ...state.toolSettings,
                  [tool]: { ...DEFAULT_TOOL_SETTINGS[tool] },
                },
              }),
              false,
              "resetToolSettings"
            )
            console.log(`🔄 Reset ${tool} settings`)
          } else {
            // Reset all tools
            set(
              {
                toolSettings: { ...DEFAULT_TOOL_SETTINGS },
              },
              false,
              "resetAllToolSettings"
            )
            console.log("🔄 Reset all tool settings")
          }
        },

        getToolSettings: (tool) => {
          return get().toolSettings[tool]
        },

        // =====================================
        // BULK OPERATIONS
        // =====================================
        exportSettings: () => {
          const settings = get().toolSettings
          console.log("📤 Exported settings:", settings)
          return settings
        },

        importSettings: (settings) => {
          // Validate and merge with defaults to ensure all properties exist
          const validatedSettings = Object.keys(DEFAULT_TOOL_SETTINGS).reduce(
            (acc, toolKey) => {
              const tool = toolKey as DrawingToolType
              const toolSettings = settings[tool] || {}

              // Validate each tool's settings
              if (validateToolSettings(toolSettings)) {
                acc[tool] = {
                  ...DEFAULT_TOOL_SETTINGS[tool],
                  ...normalizeToolSettings(toolSettings),
                }
              } else {
                console.warn(`❌ Invalid settings for ${tool}, using defaults`)
                acc[tool] = { ...DEFAULT_TOOL_SETTINGS[tool] }
              }

              return acc
            },
            {} as Record<DrawingToolType, DrawingToolSettings>
          )

          set({ toolSettings: validatedSettings }, false, "importSettings")
          console.log("📥 Imported settings:", validatedSettings)
        },
      }),
      {
        name: STORAGE_KEYS.TOOL_SETTINGS,
        storage: createJSONStorage(() => localStorage),
        // Only persist tool settings, not panel state
        partialize: (state) => ({
          toolSettings: state.toolSettings,
        }),
        // Migrations for handling schema changes
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // Migration from version 0 to 1
            // Handle any breaking changes in the settings structure
            return {
              ...persistedState,
              toolSettings: {
                ...DEFAULT_TOOL_SETTINGS,
                ...persistedState.toolSettings,
              },
            }
          }
          return persistedState
        },
      }
    ),
    {
      name: "drawing-tools-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)

// =====================================
// SELECTORS FOR PERFORMANCE
// =====================================

export const useDrawingToolsSelectors = () => {
  const store = useDrawingToolsStore()

  return {
    // Panel state selectors
    isPanelVisible: () => store.isPanelVisible,
    activeTool: () => store.activeTool,
    isCollapsed: () => store.isCollapsed,

    // Settings selectors for individual properties
    getStrokeColor: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.strokeColor,
    getFillColor: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.fillColor,
    getStrokeWidth: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.strokeWidth,
    getStrokeStyle: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.strokeStyle,
    getSloppiness: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.sloppiness,
    getEdgeStyle: (tool: DrawingToolType) =>
      store.toolSettings[tool]?.edgeStyle,
    getOpacity: (tool: DrawingToolType) => store.toolSettings[tool]?.opacity,

    // Computed properties
    currentToolSettings: () => {
      const tool = store.activeTool
      return tool ? store.toolSettings[tool] : null
    },

    // Validation helpers
    hasValidSettings: (tool: DrawingToolType) => {
      const settings = store.toolSettings[tool]
      return settings && validateToolSettings(settings)
    },

    // Comparison helpers
    isDefaultSettings: (tool: DrawingToolType) => {
      const current = store.toolSettings[tool]
      const defaults = DEFAULT_TOOL_SETTINGS[tool]
      return JSON.stringify(current) === JSON.stringify(defaults)
    },

    // Statistics
    getModifiedToolsCount: () => {
      return Object.keys(store.toolSettings).filter((toolKey) => {
        const tool = toolKey as DrawingToolType
        const current = store.toolSettings[tool]
        const defaults = DEFAULT_TOOL_SETTINGS[tool]
        return JSON.stringify(current) !== JSON.stringify(defaults)
      }).length
    },
  }
}

// =====================================
// CUSTOM HOOKS FOR COMMON OPERATIONS
// =====================================

/**
 * Hook to get current tool settings
 */
export const useCurrentToolSettings = () => {
  const activeTool = useDrawingToolsStore((state) => state.activeTool)
  const getToolSettings = useDrawingToolsStore((state) => state.getToolSettings)

  return activeTool ? getToolSettings(activeTool) : null
}

/**
 * Hook for a specific tool setting with setter
 */
export const useToolSetting = <K extends keyof DrawingToolSettings>(
  tool: DrawingToolType,
  key: K
) => {
  const value = useDrawingToolsStore((state) => state.toolSettings[tool]?.[key])
  const updateSetting = useDrawingToolsStore((state) => state.updateToolSetting)

  return [
    value,
    (newValue: DrawingToolSettings[K]) => updateSetting(tool, key, newValue),
  ] as const
}

/**
 * Hook for all settings of a specific tool
 */
export const useToolSettings = (tool: DrawingToolType) => {
  const settings = useDrawingToolsStore((state) => state.toolSettings[tool])
  const updateSettings = useDrawingToolsStore(
    (state) => state.updateToolSettings
  )
  const resetSettings = useDrawingToolsStore((state) => state.resetToolSettings)

  return {
    settings,
    updateSettings: (newSettings: Partial<DrawingToolSettings>) =>
      updateSettings(tool, newSettings),
    resetSettings: () => resetSettings(tool),
  }
}

/**
 * Hook for panel visibility control
 */
export const usePanelControl = () => {
  const isPanelVisible = useDrawingToolsStore((state) => state.isPanelVisible)
  const isCollapsed = useDrawingToolsStore((state) => state.isCollapsed)
  const showPanel = useDrawingToolsStore((state) => state.showPanel)
  const hidePanel = useDrawingToolsStore((state) => state.hidePanel)
  const toggleCollapsed = useDrawingToolsStore((state) => state.toggleCollapsed)

  return {
    isPanelVisible,
    isCollapsed,
    showPanel,
    hidePanel,
    toggleCollapsed,
  }
}

/**
 * Hook for settings import/export
 */
export const useSettingsIO = () => {
  const exportSettings = useDrawingToolsStore((state) => state.exportSettings)
  const importSettings = useDrawingToolsStore((state) => state.importSettings)
  const resetToolSettings = useDrawingToolsStore(
    (state) => state.resetToolSettings
  )

  return {
    exportSettings,
    importSettings,
    resetAllSettings: () => resetToolSettings(),

    // Helper methods
    exportToFile: () => {
      const settings = exportSettings()
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `drawing-tools-settings-${
        new Date().toISOString().split("T")[0]
      }.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    importFromFile: (file: File) => {
      return new Promise<boolean>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string)
            importSettings(settings)
            resolve(true)
          } catch (error) {
            console.error("Failed to import settings:", error)
            resolve(false)
          }
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
      })
    },
  }
}

// =====================================
// STORE DEBUGGING UTILITIES
// =====================================

if (process.env.NODE_ENV === "development") {
  // Expose store to window for debugging
  ;(window as any).drawingToolsStore = useDrawingToolsStore

  // Log store state changes
  useDrawingToolsStore.subscribe((state, prevState) => {
    console.log("🔄 Drawing Tools Store updated:", {
      prevState,
      newState: state,
      changes: Object.keys(state).filter(
        (key) =>
          state[key as keyof typeof state] !==
          prevState[key as keyof typeof prevState]
      ),
    })
  })
}
