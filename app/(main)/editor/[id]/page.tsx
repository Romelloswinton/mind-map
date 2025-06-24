import { SimpleMindMapCanvas } from "./_components/mind-map-canvas"
import { Suspense } from "react"

interface EditorPageProps {
  params: {
    id: string
  }
}

// Simple loading component
function CanvasLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading mind map...</p>
      </div>
    </div>
  )
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = params

  return (
    <div className="h-screen bg-gray-50">
      {/* Full Screen Canvas - No Header */}
      <main className="h-full overflow-hidden">
        <Suspense fallback={<CanvasLoading />}>
          <SimpleMindMapCanvas mindMapId={id} />
        </Suspense>
      </main>
    </div>
  )
}
