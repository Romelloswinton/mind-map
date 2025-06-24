"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Edit,
  Plus,
  FileText,
  Network,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useDashboardStore } from "@/src/stores/dashboard-store"

interface ActivityItem {
  id: string
  type: "created" | "updated" | "shared"
  mindMapId: string
  mindMapTitle: string
  timestamp: string
  nodeCount?: number
}

export function RecentActivity() {
  const { recentMindMaps, isLoadingStats, fetchUserProfile } =
    useDashboardStore()

  useEffect(() => {
    if (recentMindMaps.length === 0) {
      fetchUserProfile()
    }
  }, [recentMindMaps.length, fetchUserProfile])

  // Convert recent mind maps to activity items
  const activityItems: ActivityItem[] = recentMindMaps.map((mindMap) => ({
    id: mindMap.id,
    type: "updated",
    mindMapId: mindMap.id,
    mindMapTitle: mindMap.title,
    timestamp: mindMap.updatedAt,
    nodeCount: mindMap._count.nodes,
  }))

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="w-4 h-4 text-green-600" />
      case "updated":
        return <Edit className="w-4 h-4 text-blue-600" />
      case "shared":
        return <FileText className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return "bg-green-100"
      case "updated":
        return "bg-blue-100"
      case "shared":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  const getActivityText = (item: ActivityItem) => {
    switch (item.type) {
      case "created":
        return "Created"
      case "updated":
        return "Updated"
      case "shared":
        return "Shared"
      default:
        return "Modified"
    }
  }

  if (isLoadingStats) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activityItems.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-4">
              No recent activity yet. Start by creating your first mind map!
            </p>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Mind Map
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {activityItems.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                href={`/editor/${item.mindMapId}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`p-4 ${
                    index !== activityItems.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(
                        item.type
                      )}`}
                    >
                      {getActivityIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.mindMapTitle}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {getActivityText(item)}{" "}
                            {formatDistanceToNow(new Date(item.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                          {item.nodeCount !== undefined && (
                            <div className="flex items-center gap-1 mt-1">
                              <Network className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {item.nodeCount} nodes
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {activityItems.length > 5 && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-600"
                >
                  View All Activity
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Quick Stats Footer */}
      {activityItems.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>This week</span>
            <Badge variant="secondary" className="bg-white text-gray-700">
              {activityItems.length} updates
            </Badge>
          </div>
        </div>
      )}
    </Card>
  )
}
