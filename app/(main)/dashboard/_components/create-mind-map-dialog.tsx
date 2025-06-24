"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Lightbulb, Sparkles } from "lucide-react"

interface CreateMindMapDialogProps {
  children: React.ReactNode
  onMindMapCreated?: (mindMap: any) => void
}

const TEMPLATE_IDEAS = [
  {
    title: "Project Planning",
    description: "Organize tasks, deadlines, and team responsibilities",
    icon: "📋",
  },
  {
    title: "Learning Path",
    description: "Map out your educational journey and goals",
    icon: "🎓",
  },
  {
    title: "Creative Brainstorm",
    description: "Unleash your creativity and capture all ideas",
    icon: "💡",
  },
  {
    title: "Problem Solving",
    description: "Break down complex problems into manageable parts",
    icon: "🧩",
  },
]

export function CreateMindMapDialog({
  children,
  onMindMapCreated,
}: CreateMindMapDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const router = useRouter()

  const handleCreate = async () => {
    if (!title.trim()) return

    try {
      setIsCreating(true)

      const response = await fetch("/api/mindmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Call the callback if provided
        if (onMindMapCreated) {
          onMindMapCreated(result.data)
        }

        // Close dialog and reset form
        setOpen(false)
        resetForm()

        // Navigate to the new mind map editor
        router.push(`/editor/${result.data.id}`)
      } else {
        console.error("Failed to create mind map")
        // TODO: Show error toast
      }
    } catch (error) {
      console.error("Error creating mind map:", error)
      // TODO: Show error toast
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedTemplate(null)
  }

  const handleTemplateSelect = (index: number) => {
    const template = TEMPLATE_IDEAS[index]
    setSelectedTemplate(index)
    setTitle(template.title)
    setDescription(template.description)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl">
        <div className="bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-50 to-blue-50 -m-6 mb-0 p-6 rounded-t-lg border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Create New Mind Map
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Start with a template or create a custom mind map from scratch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6 px-6 bg-white">
            {/* Template Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-800 mb-4 block">
                Choose a template (optional)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATE_IDEAS.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(index)}
                    className={`p-4 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      selectedTemplate === index
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md"
                        : "border-gray-200 hover:border-purple-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xl">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {template.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <hr className="flex-1 border-gray-300" />
              <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                OR CUSTOMIZE
              </span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Custom Form */}
            <div className="space-y-5 bg-white">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-800 mb-2 block"
                >
                  Mind Map Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1 bg-white">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-800 mb-2 block"
                >
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="What will this mind map help you organize or explore?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none shadow-sm"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 bg-white">
                  {description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Preview */}
            {title && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center border border-purple-200">
                    <Lightbulb className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {title}
                    </h4>
                    {description && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-gray-500 font-medium">
                        Preview of your new mind map
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-gray-50 -m-6 mt-0 p-6 rounded-b-lg border-t border-gray-100">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isCreating}
                className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || isCreating}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Mind Map
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
