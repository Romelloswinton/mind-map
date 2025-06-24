import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Network, Share2, Trash2, Users, Sparkles } from "lucide-react"

export function DemoPreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            See It In Action
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Mind Mapping Reimagined
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how AI transforms scattered thoughts into organized, visual
            masterpieces
          </p>
        </div>

        {/* Demo Mockup */}
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden shadow-2xl border-0 bg-white">
            {/* Browser Header */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <div className="flex-1 text-center">
                <div className="bg-white rounded px-4 py-1 text-sm text-gray-600 max-w-md mx-auto">
                  mindmap-ai.com/editor/campaign-strategy
                </div>
              </div>
            </div>

            {/* App Header */}
            <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900">
                  Campaign Strategy 2024
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Collaborators */}
                <div className="flex -space-x-2">
                  {["A", "B", "C"].map((initial, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <Share2 className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
            </div>

            {/* Mind Map Content */}
            <CardContent className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[400px] relative overflow-hidden">
              {/* Background Grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Central Node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold">
                  Campaign Strategy
                </div>
              </div>

              {/* Branch Nodes */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="font-medium text-gray-900">
                    Performance Metrics
                  </div>
                  <div className="text-sm text-gray-600">
                    ROI, CTR, Conversions
                  </div>
                </div>
              </div>

              <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="font-medium text-gray-900">
                    Target Audience
                  </div>
                  <div className="text-sm text-gray-600">
                    Demographics, Interests
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-l-4 border-purple-500">
                  <div className="font-medium text-gray-900">
                    Content Strategy
                  </div>
                  <div className="text-sm text-gray-600">
                    Blog posts, Social media
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border-l-4 border-orange-500">
                  <div className="font-medium text-gray-900">
                    Distribution Channels
                  </div>
                  <div className="text-sm text-gray-600">
                    Email, Social, Paid ads
                  </div>
                </div>
              </div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Lines from center to each node */}
                <path
                  d="M 50% 50% Q 25% 35% 25% 25%"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 50% 50% Q 75% 35% 75% 25%"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 50% 50% Q 25% 65% 25% 75%"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 50% 50% Q 75% 65% 75% 75%"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </svg>

              {/* AI Assistant Popup */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      AI Suggestion
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      I noticed you might want to add "Budget Planning" as a key
                      branch. Should I create that for you?
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Add it
                      </button>
                      <button className="text-xs text-gray-500">Not now</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Icon */}
              <Network className="absolute bottom-4 left-4 w-6 h-6 text-purple-400" />
            </CardContent>
          </Card>
        </div>

        {/* Feature Callouts */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              AI-Powered Suggestions
            </h3>
            <p className="text-gray-600 text-sm">
              Smart recommendations help you discover connections and expand
              your ideas
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Real-Time Collaboration
            </h3>
            <p className="text-gray-600 text-sm">
              Work together seamlessly with live cursors and instant updates
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Visual Connections
            </h3>
            <p className="text-gray-600 text-sm">
              Beautiful, intuitive mind maps that make complex ideas simple
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
