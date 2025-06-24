import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Sparkles,
  Users,
  Download,
  Zap,
  Network,
  MousePointer,
  Palette,
  FileText,
  Globe,
  Shield,
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI Brainstorm Assistant",
      description:
        "Let AI help you discover new connections, suggest related ideas, and overcome creative blocks with intelligent recommendations.",
      badge: "Most Popular",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: MousePointer,
      title: "Drag-and-Drop Interface",
      description:
        "Intuitive design that feels natural. Create, move, and connect ideas with simple gestures that don't get in your way.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description:
        "Work together seamlessly with live cursors, instant updates, and smart conflict resolution. Perfect for teams and classrooms.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Download,
      title: "Export Anywhere",
      description:
        "Export your mind maps as PDF, PNG, SVG, or even Markdown. Your ideas stay with you, in any format you need.",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: Palette,
      title: "Beautiful Themes",
      description:
        "Choose from dozens of professionally designed themes, or create your own. Make your mind maps as unique as your ideas.",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built for speed with modern technology. Handle thousands of nodes without lag, even on complex mind maps.",
      color: "from-yellow-500 to-amber-600",
    },
    {
      icon: Globe,
      title: "Access Anywhere",
      description:
        "Your mind maps sync across all devices. Start on your phone, continue on your laptop, present on any screen.",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your ideas are yours. End-to-end encryption, granular permissions, and enterprise-grade security keep your thoughts safe.",
      color: "from-slate-500 to-gray-600",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-purple-100 text-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Think Better
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered insights to seamless collaboration, we've built the
            most comprehensive mind mapping platform for modern thinkers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon

            return (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-gray-300"
              >
                {feature.badge && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                    {feature.badge}
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-700"
            >
              <Network className="w-4 h-4 mr-2" />
              Advanced AI
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Mind Mapping Meets Artificial Intelligence
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Smart Suggestions
                  </h4>
                  <p className="text-gray-600">
                    AI analyzes your content and suggests relevant branches,
                    connections, and related concepts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Auto-Organization
                  </h4>
                  <p className="text-gray-600">
                    Watch as AI automatically arranges your nodes for optimal
                    clarity and visual appeal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Content Generation
                  </h4>
                  <p className="text-gray-600">
                    Generate summaries, expand on ideas, or create entire mind
                    map structures from simple prompts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 border border-purple-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl" />
                <div className="relative bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-semibold text-gray-900">
                      AI Assistant
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-700">
                        💡 Suggestion
                      </div>
                      <div className="text-gray-600 mt-1">
                        I noticed you're planning a marketing campaign. Would
                        you like me to suggest some key performance metrics to
                        track?
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-medium">
                        Add them
                      </button>
                      <button className="text-gray-500 px-3 py-1 rounded text-xs">
                        Not now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
