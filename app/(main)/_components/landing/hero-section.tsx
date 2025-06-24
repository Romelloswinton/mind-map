import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 25px 25px, #e5e7eb 1px, transparent 1px),
            radial-gradient(circle at 75px 75px, #e5e7eb 1px, transparent 1px)
          `,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            The Smartest Way to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Organize Ideas
            </span>{" "}
            with{" "}
            <span className="relative">
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              AI
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Reimagine how you brainstorm with AI-assisted mind mapping that
            helps you{" "}
            <span className="font-semibold text-gray-800">
              create, connect, and visualize
            </span>{" "}
            ideas effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 shadow-lg"
            >
              <Link href="/sign-up">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-gray-300 hover:bg-gray-50"
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm ml-2">
                <span className="font-semibold text-gray-900">10,000+</span>{" "}
                creators already using
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-sm ml-2 font-semibold text-gray-900">
                4.9/5
              </span>
              <span className="text-sm text-gray-600">from 2,000+ reviews</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Google", "Microsoft", "Stanford", "MIT", "Y Combinator"].map(
                (company) => (
                  <div
                    key={company}
                    className="text-gray-400 font-semibold text-lg"
                  >
                    {company}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div
        className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-40 right-20 w-3 h-3 bg-blue-300 rounded-full animate-bounce"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-20 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
        style={{ animationDelay: "2s" }}
      />
    </section>
  )
}
