"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MoreVertical,
  Edit,
  Share2,
  Download,
  Copy,
  Trash2,
  Calendar,
  Network,
  Eye,
  Lock,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { MindMap } from "@/src/stores/dashboard-store"

interface MindMapCardProps {
  mindMap: MindMap
  viewMode: "grid" | "list"
  onDelete: () => void
}

export function MindMapCard({ mindMap, viewMode, onDelete }: MindMapCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/mindmaps/${mindMap.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete()
        setShowDeleteDialog(false)
      } else {
        console.error("Failed to delete mind map")
      }
    } catch (error) {
      console.error("Error deleting mind map:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate mind map:", mindMap.id)
  }

  const handleShare = async () => {
    // TODO: Implement share functionality
    console.log("Share mind map:", mindMap.id)
  }

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log("Export mind map:", mindMap.id)
  }

  if (viewMode === "list") {
    return (
      <>
        <Card className="hover:shadow-md transition-all duration-200 border-gray-200 hover:border-purple-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Network className="w-6 h-6 text-purple-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href={`/editor/${mindMap.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors truncate">
                        {mindMap.title}
                      </h3>
                    </Link>
                    {mindMap.isPublic ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  {mindMap.description && (
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {mindMap.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Network className="w-3 h-3 mr-1" />
                      {mindMap._count.nodes} nodes
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Updated{" "}
                      {formatDistanceToNow(new Date(mindMap.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/editor/${mindMap.id}`} className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Mind Map</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{mindMap.title}"? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Grid view
  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-purple-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Link href={`/editor/${mindMap.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1">
                    {mindMap.title}
                  </h3>
                </Link>
                {mindMap.isPublic ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-800"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              {mindMap.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {mindMap.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/editor/${mindMap.id}`} className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Thumbnail */}
          <Link href={`/editor/${mindMap.id}`}>
            <div className="w-full h-32 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-lg border border-gray-200 flex items-center justify-center mb-4 group-hover:shadow-inner transition-all">
              <div className="text-center">
                <Network className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">
                  {mindMap._count.nodes} nodes
                </span>
              </div>
            </div>
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(mindMap.updatedAt), {
                addSuffix: true,
              })}
            </span>
            <span className="flex items-center">
              <Network className="w-3 h-3 mr-1" />
              {mindMap._count.nodes} nodes
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mind Map</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{mindMap.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
