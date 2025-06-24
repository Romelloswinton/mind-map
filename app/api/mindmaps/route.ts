import { NextRequest, NextResponse } from "next/server"
import { db } from "@/src/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"

// GET /api/mindmaps - Get all mind maps for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to view your mind maps",
        },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User profile not found" },
        { status: 404 }
      )
    }

    // Get all mind maps for this user
    const mindMaps = await db.mindMap.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        nodes: {
          select: {
            id: true,
            text: true,
            x: true,
            y: true,
            color: true,
            parentId: true,
          },
        },
        _count: {
          select: { nodes: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: mindMaps,
      count: mindMaps.length,
    })
  } catch (error) {
    console.error("Error fetching mind maps:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch mind maps" },
      { status: 500 }
    )
  }
}

// POST /api/mindmaps - Create a new mind map
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to create mind maps",
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, description } = body

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Title is required and must be a non-empty string",
        },
        { status: 400 }
      )
    }

    // Ensure user exists in our database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User profile not found" },
        { status: 404 }
      )
    }

    // Create the mind map
    const mindMap = await db.mindMap.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        authorId: user.id,
      },
      include: {
        nodes: true,
        _count: {
          select: { nodes: true },
        },
      },
    })

    console.log(`✅ Mind map created: ${mindMap.id} by user ${userId}`)

    return NextResponse.json(
      {
        success: true,
        data: mindMap,
        message: "Mind map created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating mind map:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create mind map" },
      { status: 500 }
    )
  }
}
