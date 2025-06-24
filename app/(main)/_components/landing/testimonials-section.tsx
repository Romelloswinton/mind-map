import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow",
      image: "SC",
      content:
        "MindMap AI has revolutionized how our team brainstorms. The AI suggestions help us discover connections we never would have thought of. It's like having a creative partner that never runs out of ideas.",
      rating: 5,
    },
    {
      name: "Dr. Marcus Rodriguez",
      role: "Professor of Psychology",
      company: "Stanford University",
      image: "MR",
      content:
        "I've used this with my students for complex research projects. The collaborative features are outstanding, and the AI helps students organize their thoughts more effectively than any tool I've seen.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Creative Director",
      company: "Design Studio",
      image: "ET",
      content:
        "As someone who thinks visually, this app is a game-changer. The interface is intuitive, the AI is genuinely helpful, and exporting to different formats saves me hours every week.",
      rating: 5,
    },
    {
      name: "Alex Kumar",
      role: "Startup Founder",
      company: "InnovateAI",
      image: "AK",
      content:
        "We use MindMap AI for everything from strategy planning to product roadmaps. The real-time collaboration means our remote team can brainstorm as effectively as if we were in the same room.",
      rating: 5,
    },
    {
      name: "Dr. Lisa Park",
      role: "Research Scientist",
      company: "MIT Labs",
      image: "LP",
      content:
        "The AI's ability to suggest research connections and help organize complex data relationships is incredible. It's become an essential tool for my research methodology.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Learning & Development",
      company: "Global Corp",
      image: "JW",
      content:
        "We've rolled this out across our organization for training and project planning. The learning curve is minimal, but the impact on productivity and creativity is massive.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-green-100 text-green-700"
          >
            <Star className="w-4 h-4 mr-2" />
            Loved by Thousands
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From students to Fortune 500 companies, see how MindMap AI is
            transforming the way people think and collaborate.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">500K+</div>
            <div className="text-gray-600">Mind Maps Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
