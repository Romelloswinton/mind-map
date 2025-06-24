"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Grid, List, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardStore } from "@/src/stores/dashboard-store"
import { CreateMindMapDialog } from "./create-mind-map-dialog"
import { MindMapCard } from "./mind-map-card"

export function MindMapGrid() {
  const {
    mindMaps,
    isLoadingMindMaps,
    searchQuery,
    viewMode,
    sortMode,
    setSearchQuery,
    setViewMode,
    setSortMode,
    fetchMindMaps,
    addMindMap,
    removeMindMap,
  } = useDashboardStore()

  // Fetch mind maps on component mount
  useEffect(() => {
    if (mindMaps.length === 0) {
      fetchMindMaps()
    }
  }, [mindMaps.length, fetchMindMaps])

  // Filter and sort mind maps
  const filteredAndSortedMindMaps = useMemo(() => {
    return mindMaps
      .filter(
        (mindMap) =>
          mindMap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mindMap.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortMode) {
          case "title":
            return a.title.localeCompare(b.title)
          case "created":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          case "nodes":
            return b._count.nodes - a._count.nodes
          case "updated":
          default:
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
        }
      })
  }, [mindMaps, searchQuery, sortMode])

  const handleMindMapCreated = (newMindMap: any) => {
    addMindMap(newMindMap)
  }

  const handleMindMapDeleted = (deletedId: string) => {
    removeMindMap(deletedId)
  }

  if (isLoadingMindMaps) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your mind maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search mind maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="title">Title A-Z</option>
            <option value="nodes">Most Nodes</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-none border-0 px-3",
                viewMode === "grid" && "bg-purple-100 text-purple-700"
              )}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-none border-0 px-3",
                viewMode === "list" && "bg-purple-100 text-purple-700"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredAndSortedMindMaps.length} mind map
        {filteredAndSortedMindMaps.length !== 1 ? "s" : ""} found
      </div>

      {/* Mind Maps Grid/List */}
      {filteredAndSortedMindMaps.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            // No search results
            <div>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No mind maps found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or create a new mind map.
              </p>
              <CreateMindMapDialog onMindMapCreated={handleMindMapCreated}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Mind Map
                </Button>
              </CreateMindMapDialog>
            </div>
          ) : (
            // No mind maps at all
            <div>
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your First Mind Map
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start organizing your thoughts and ideas with beautiful,
                interactive mind maps.
              </p>
              <CreateMindMapDialog onMindMapCreated={handleMindMapCreated}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Mind Map
                </Button>
              </CreateMindMapDialog>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {filteredAndSortedMindMaps.map((mindMap) => (
            <MindMapCard
              key={mindMap.id}
              mindMap={mindMap}
              viewMode={viewMode}
              onDelete={() => handleMindMapDeleted(mindMap.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
