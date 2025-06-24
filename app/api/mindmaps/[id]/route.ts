import { db } from "@/src/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/mindmaps/[id] - Get a specific mind map
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to view this mind map",
        },
        { status: 401 }
      )
    }

    const { id } = params

    // Validate the ID format (cuid)
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid ID", message: "Mind map ID is required" },
        { status: 400 }
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

    // Get the mind map with all its nodes
    const mindMap = await db.mindMap.findUnique({
      where: {
        id,
        authorId: user.id, // Ensure user can only access their own mind maps
      },
      include: {
        nodes: {
          orderBy: { createdAt: "asc" },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!mindMap) {
      return NextResponse.json(
        {
          error: "Mind Map Not Found",
          message: "Mind map not found or you do not have access",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mindMap,
    })
  } catch (error) {
    console.error("Error fetching mind map:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch mind map" },
      { status: 500 }
    )
  }
}

// PUT /api/mindmaps/[id] - Update a mind map
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to update mind maps",
        },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { title, description, nodes } = body

    // Validate inputs
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid ID", message: "Mind map ID is required" },
        { status: 400 }
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

    // Check if mind map exists and user owns it
    const existingMindMap = await db.mindMap.findUnique({
      where: {
        id,
        authorId: user.id,
      },
    })

    if (!existingMindMap) {
      return NextResponse.json(
        {
          error: "Mind Map Not Found",
          message: "Mind map not found or you do not have access",
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Title must be a non-empty string",
          },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    // Use a transaction to update mind map and nodes
    const updatedMindMap = await db.$transaction(async (tx) => {
      // Update the mind map basic info
      const mindMap = await tx.mindMap.update({
        where: { id },
        data: updateData,
      })

      // If nodes are provided, update them
      if (nodes && Array.isArray(nodes)) {
        // Delete existing nodes and create new ones
        // This is a simple approach - in production you might want more sophisticated diffing
        await tx.mindMapNode.deleteMany({
          where: { mindMapId: id },
        })

        // Create new nodes
        if (nodes.length > 0) {
          await tx.mindMapNode.createMany({
            data: nodes.map((node: any) => ({
              id: node.id,
              text: node.text || "",
              x: parseFloat(node.x) || 0,
              y: parseFloat(node.y) || 0,
              width: parseFloat(node.width) || 120,
              height: parseFloat(node.height) || 60,
              color: node.color || "#3b82f6",
              parentId: node.parentId || null,
              mindMapId: id,
            })),
          })
        }
      }

      // Return the updated mind map with nodes
      return await tx.mindMap.findUnique({
        where: { id },
        include: {
          nodes: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    })

    console.log(`✅ Mind map updated: ${id} by user ${userId}`)

    return NextResponse.json({
      success: true,
      data: updatedMindMap,
      message: "Mind map updated successfully",
    })
  } catch (error) {
    console.error("Error updating mind map:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update mind map" },
      { status: 500 }
    )
  }
}

// DELETE /api/mindmaps/[id] - Delete a mind map
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to delete mind maps",
        },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid ID", message: "Mind map ID is required" },
        { status: 400 }
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

    // Check if mind map exists and user owns it
    const existingMindMap = await db.mindMap.findUnique({
      where: {
        id,
        authorId: user.id,
      },
    })

    if (!existingMindMap) {
      return NextResponse.json(
        {
          error: "Mind Map Not Found",
          message: "Mind map not found or you do not have access",
        },
        { status: 404 }
      )
    }

    // Delete the mind map (cascade will delete nodes automatically)
    await db.mindMap.delete({
      where: { id },
    })

    console.log(`✅ Mind map deleted: ${id} by user ${userId}`)

    return NextResponse.json({
      success: true,
      message: "Mind map deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting mind map:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete mind map" },
      { status: 500 }
    )
  }
}
