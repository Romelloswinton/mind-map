import { create } from "zustand"

export interface MindMap {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  _count: {
    nodes: number
  }
}

export interface UserStats {
  totalMindMaps: number
  publicMindMaps: number
  totalNodes: number
  recentlyActive: number
}

export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface RecentMindMap {
  id: string
  title: string
  updatedAt: string
  _count: {
    nodes: number
  }
}

interface DashboardStore {
  // User data
  user: User | null
  stats: UserStats | null
  mindMaps: MindMap[]
  recentMindMaps: RecentMindMap[]

  // UI state
  isLoading: boolean
  isLoadingStats: boolean
  isLoadingMindMaps: boolean
  error: string | null

  // View preferences
  viewMode: "grid" | "list"
  sortMode: "updated" | "created" | "title" | "nodes"
  searchQuery: string

  // Actions
  setViewMode: (mode: "grid" | "list") => void
  setSortMode: (mode: "updated" | "created" | "title" | "nodes") => void
  setSearchQuery: (query: string) => void

  // Data actions
  fetchUserProfile: () => Promise<void>
  fetchMindMaps: () => Promise<void>
  addMindMap: (mindMap: MindMap) => void
  removeMindMap: (id: string) => void
  updateMindMap: (id: string, updates: Partial<MindMap>) => void

  // Utility actions
  clearError: () => void
  reset: () => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  user: null,
  stats: null,
  mindMaps: [],
  recentMindMaps: [],
  isLoading: false,
  isLoadingStats: false,
  isLoadingMindMaps: false,
  error: null,
  viewMode: "grid",
  sortMode: "updated",
  searchQuery: "",

  // UI actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Data actions
  fetchUserProfile: async () => {
    set({ isLoadingStats: true, error: null })
    try {
      const response = await fetch("/api/user")

      if (response.ok) {
        const result = await response.json()
        set({
          user: result.data.user,
          stats: result.data.stats,
          recentMindMaps: result.data.recentMindMaps || [],
        })
      } else {
        // Fallback to mock data for demo
        set({
          stats: {
            totalMindMaps: 3,
            publicMindMaps: 1,
            totalNodes: 35,
            recentlyActive: 2,
          },
          recentMindMaps: [
            {
              id: "1",
              title: "Project Planning 2024",
              updatedAt: "2024-01-16T14:30:00Z",
              _count: { nodes: 12 },
            },
            {
              id: "2",
              title: "Learning React & Next.js",
              updatedAt: "2024-01-15T16:45:00Z",
              _count: { nodes: 8 },
            },
            {
              id: "3",
              title: "Team Brainstorming Session",
              updatedAt: "2024-01-14T13:20:00Z",
              _count: { nodes: 15 },
            },
          ],
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      set({ error: "Failed to load user data" })
    } finally {
      set({ isLoadingStats: false })
    }
  },

  fetchMindMaps: async () => {
    set({ isLoadingMindMaps: true, error: null })
    try {
      const response = await fetch("/api/mindmaps")

      if (response.ok) {
        const result = await response.json()
        set({ mindMaps: result.data || [] })
      } else {
        // Fallback to mock data for demo
        set({
          mindMaps: [
            {
              id: "1",
              title: "Project Planning 2024",
              description:
                "Quarterly goals and roadmap for the upcoming projects",
              isPublic: false,
              createdAt: "2024-01-15T10:00:00Z",
              updatedAt: "2024-01-16T14:30:00Z",
              _count: { nodes: 12 },
            },
            {
              id: "2",
              title: "Learning React & Next.js",
              description: "My journey to master modern web development",
              isPublic: true,
              createdAt: "2024-01-10T09:00:00Z",
              updatedAt: "2024-01-15T16:45:00Z",
              _count: { nodes: 8 },
            },
            {
              id: "3",
              title: "Team Brainstorming Session",
              description: "Ideas for improving our product user experience",
              isPublic: false,
              createdAt: "2024-01-12T11:30:00Z",
              updatedAt: "2024-01-14T13:20:00Z",
              _count: { nodes: 15 },
            },
          ],
        })
      }
    } catch (error) {
      console.error("Error fetching mind maps:", error)
      set({ error: "Failed to load mind maps" })
    } finally {
      set({ isLoadingMindMaps: false })
    }
  },

  addMindMap: (mindMap) => {
    set((state) => ({
      mindMaps: [mindMap, ...state.mindMaps],
      stats: state.stats
        ? {
            ...state.stats,
            totalMindMaps: state.stats.totalMindMaps + 1,
            totalNodes: state.stats.totalNodes + (mindMap._count?.nodes || 0),
          }
        : null,
    }))
  },

  removeMindMap: (id) => {
    set((state) => {
      const mindMapToRemove = state.mindMaps.find((map) => map.id === id)
      return {
        mindMaps: state.mindMaps.filter((map) => map.id !== id),
        stats:
          state.stats && mindMapToRemove
            ? {
                ...state.stats,
                totalMindMaps: Math.max(0, state.stats.totalMindMaps - 1),
                totalNodes: Math.max(
                  0,
                  state.stats.totalNodes - (mindMapToRemove._count?.nodes || 0)
                ),
                publicMindMaps: mindMapToRemove.isPublic
                  ? Math.max(0, state.stats.publicMindMaps - 1)
                  : state.stats.publicMindMaps,
              }
            : state.stats,
      }
    })
  },

  updateMindMap: (id, updates) => {
    set((state) => ({
      mindMaps: state.mindMaps.map((map) =>
        map.id === id ? { ...map, ...updates } : map
      ),
    }))
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      user: null,
      stats: null,
      mindMaps: [],
      recentMindMaps: [],
      isLoading: false,
      isLoadingStats: false,
      isLoadingMindMaps: false,
      error: null,
      viewMode: "grid",
      sortMode: "updated",
      searchQuery: "",
    }),
}))
