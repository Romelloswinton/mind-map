"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Network, Eye, TrendingUp, Zap, Loader2 } from "lucide-react"
import { useDashboardStore } from "@/src/stores/dashboard-store"

export function DashboardStats() {
  const { stats, isLoadingStats, fetchUserProfile } = useDashboardStore()

  useEffect(() => {
    if (!stats) {
      fetchUserProfile()
    }
  }, [stats, fetchUserProfile])

  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: "Total Mind Maps",
      value: stats.totalMindMaps,
      description: "Mind maps created",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: stats.totalMindMaps > 0 ? "+" + stats.totalMindMaps : "0",
    },
    {
      title: "Total Nodes",
      value: stats.totalNodes,
      description: "Ideas captured",
      icon: Network,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: stats.totalNodes > 0 ? "+" + stats.totalNodes : "0",
    },
    {
      title: "Public Mind Maps",
      value: stats.publicMindMaps,
      description: "Shared with others",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend:
        stats.publicMindMaps > 0
          ? stats.publicMindMaps + " shared"
          : "None shared",
    },
    {
      title: "Recently Active",
      value: stats.recentlyActive,
      description: "Updated this week",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: stats.recentlyActive > 0 ? "Active" : "Quiet week",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon

        return (
          <Card
            key={stat.title}
            className="border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
                {index === 0 && stats.totalMindMaps > 0 && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    stat.trend.includes("+") || stat.trend === "Active"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
