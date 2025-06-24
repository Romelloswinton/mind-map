import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateMindMapDialog } from "./_components/create-mind-map-dialog"
import { DashboardStats } from "./_components/dashboard-stats"
import { MindMapGrid } from "./_components/mind-map-grid"
import { RecentActivity } from "./_components/recent-activity"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MindMap</h1>
                  <p className="text-xs text-gray-500">
                    Organize your thoughts
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <CreateMindMapDialog>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Mind Map
                </Button>
              </CreateMindMapDialog>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Continue working on your mind maps or create something new.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mind Maps - Takes up more space */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Your Mind Maps
                </h3>
                <CreateMindMapDialog>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </CreateMindMapDialog>
              </div>
              <p className="text-gray-600 mt-1">
                Organize and visualize your ideas
              </p>
            </div>

            <MindMapGrid />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
