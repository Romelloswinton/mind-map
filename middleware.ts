import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/webhooks(.*)",
])

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])
const isEditorRoute = createRouteMatcher(["/editor(.*)"])
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  const url = request.nextUrl

  console.log(
    `🧠 MindMap Middleware: ${url.pathname}, User: ${
      userId ? "authenticated" : "not authenticated"
    }`
  )

  // 🔧 Handle API routes that need authentication
  if (url.pathname.startsWith("/api/")) {
    // Routes that require authentication
    const protectedApiRoutes = ["/api/mindmaps", "/api/user", "/api/export"]
    const isProtectedApi = protectedApiRoutes.some((route) =>
      url.pathname.startsWith(route)
    )

    if (isProtectedApi && !userId) {
      console.log("🔒 Protected API route requires authentication")
      return Response.json(
        {
          error: "Unauthorized",
          message: "Please sign in to access your mind maps",
        },
        { status: 401 }
      )
    }

    // Allow API routes to continue
    return NextResponse.next()
  }

  // 🔧 Redirect authenticated users away from auth pages to dashboard
  if (userId && isAuthRoute(request)) {
    console.log(
      "✅ Authenticated user accessing auth page, redirecting to dashboard"
    )
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 🔧 Redirect authenticated users from home page to dashboard
  if (userId && url.pathname === "/") {
    console.log("✅ Authenticated user on home page, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow access to public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // 🧠 Special handling for dashboard route
  if (isDashboardRoute(request)) {
    if (!userId) {
      console.log(
        "🔒 Unauthenticated user accessing dashboard, redirecting to sign-in"
      )
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect_url", request.url)
      return NextResponse.redirect(signInUrl)
    } else {
      console.log("✅ Authenticated user accessing dashboard, proceeding")
      return NextResponse.next()
    }
  }

  // 🧠 Special handling for editor routes
  if (isEditorRoute(request)) {
    if (!userId) {
      console.log(
        "🔒 Unauthenticated user accessing editor, redirecting to sign-in"
      )
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect_url", request.url)
      return NextResponse.redirect(signInUrl)
    } else {
      console.log("✅ Authenticated user accessing editor, proceeding")
      return NextResponse.next()
    }
  }

  // 🔧 For all other protected routes, require authentication
  if (!userId) {
    console.log(
      "🔒 Protected route requires authentication, redirecting to sign-in"
    )
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect_url", request.url)
    return NextResponse.redirect(signInUrl)
  }

  // 🔧 Handle successful authentication redirects
  // Check if user just came from a sign-in/sign-up flow
  const referer = request.headers.get("referer")
  if (userId && referer) {
    const refererUrl = new URL(referer)
    if (
      refererUrl.pathname.includes("/sign-in") ||
      refererUrl.pathname.includes("/sign-up")
    ) {
      console.log(
        "✅ User just authenticated, ensuring they reach their destination"
      )
      // Let them proceed to their intended destination
      return NextResponse.next()
    }
  }

  console.log("✅ Authenticated user accessing protected route, proceeding")
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all request paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Explicitly include API routes
    "/api/(.*)",
  ],
}
