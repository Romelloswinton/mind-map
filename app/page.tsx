import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Check } from "lucide-react"
import { LandingHeader } from "./(main)/_components/landing/landing-header"
import { HeroSection } from "./(main)/_components/landing/hero-section"
import { DemoPreview } from "./(main)/_components/landing/demo-preview"
import { FeaturesSection } from "./(main)/_components/landing/features-section"
import { TestimonialsSection } from "./(main)/_components/landing/testimonials-section"
import { LandingFooter } from "./(main)/_components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Demo Preview */}
      <DemoPreview />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Ideas?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of creators, students, and professionals who are
              already using AI to supercharge their thinking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
              >
                <Link href="/sign-up">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                <Link href="/demo">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-purple-200 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Setup in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
