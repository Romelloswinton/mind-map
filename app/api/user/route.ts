import { db } from "@/src/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/user - Get current user profile and stats
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to view your profile",
        },
        { status: 401 }
      )
    }

    // Get the Clerk user data
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found", message: "Clerk user not found" },
        { status: 404 }
      )
    }

    // Get or create user in our database
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        mindMaps: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { nodes: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    // If user doesn't exist in our database, create them
    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            null,
          imageUrl: clerkUser.imageUrl,
        },
        include: {
          mindMaps: {
            select: {
              id: true,
              title: true,
              isPublic: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: { nodes: true },
              },
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      })

      console.log(`✅ New user created in database: ${userId}`)
    }

    // Calculate user statistics
    const totalMindMaps = user.mindMaps.length
    const publicMindMaps = user.mindMaps.filter((map) => map.isPublic).length
    const totalNodes = user.mindMaps.reduce(
      (sum, map) => sum + map._count.nodes,
      0
    )
    const recentlyActive = user.mindMaps.filter(
      (map) =>
        new Date(map.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          totalMindMaps,
          publicMindMaps,
          totalNodes,
          recentlyActive,
        },
        recentMindMaps: user.mindMaps.slice(0, 5), // Last 5 mind maps
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch user profile",
      },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update user profile preferences
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to update your profile",
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, preferences } = body

    // Get user from database
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // If user doesn't exist, create them first
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json(
          { error: "User not found", message: "Clerk user not found" },
          { status: 404 }
        )
      }

      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name:
            name ||
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            null,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) {
      if (typeof name === "string") {
        updateData.name = name.trim() || null
      }
    }

    // Add preferences when we implement them
    // if (preferences !== undefined) {
    //   updateData.preferences = preferences
    // }

    // Update user
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: updateData,
    })

    console.log(`✅ User profile updated: ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        name: updatedUser.name,
        imageUrl: updatedUser.imageUrl,
        updatedAt: updatedUser.updatedAt,
      },
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update profile" },
      { status: 500 }
    )
  }
}

// POST /api/user/sync - Sync user data from Clerk (useful for webhooks)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to sync your profile",
        },
        { status: 401 }
      )
    }

    // Get the latest Clerk user data
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found", message: "Clerk user not found" },
        { status: 404 }
      )
    }

    // Upsert user in our database
    const user = await db.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          null,
        imageUrl: clerkUser.imageUrl,
      },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          null,
        imageUrl: clerkUser.imageUrl,
        updatedAt: new Date(),
      },
    })

    console.log(`✅ User profile synced: ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        updatedAt: user.updatedAt,
      },
      message: "Profile synced successfully",
    })
  } catch (error) {
    console.error("Error syncing user profile:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to sync profile" },
      { status: 500 }
    )
  }
}
