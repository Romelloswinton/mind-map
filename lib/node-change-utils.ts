import { MindMapNodeData } from "@/src/stores/mind-map-store"
import { NodeChange, EdgeChange, Node, Edge } from "@xyflow/react"

/**
 * 🔥 Type-safe utilities for handling React Flow changes
 * These functions provide proper type guards and safe handling of change events
 */

// Type guards for different node change types
export const isNodePositionChange = (
  change: NodeChange
): change is Extract<NodeChange, { type: "position" }> => {
  return change.type === "position"
}

export const isNodeSelectionChange = (
  change: NodeChange
): change is Extract<NodeChange, { type: "select" }> => {
  return change.type === "select"
}

export const isNodeDimensionChange = (
  change: NodeChange
): change is Extract<NodeChange, { type: "dimensions" }> => {
  return change.type === "dimensions"
}

export const isNodeRemoveChange = (
  change: NodeChange
): change is Extract<NodeChange, { type: "remove" }> => {
  return change.type === "remove"
}

export const isNodeAddChange = (
  change: NodeChange
): change is Extract<NodeChange, { type: "add" }> => {
  return change.type === "add"
}

// Type guards for edge changes
export const isEdgeSelectionChange = (
  change: EdgeChange
): change is Extract<EdgeChange, { type: "select" }> => {
  return change.type === "select"
}

export const isEdgeRemoveChange = (
  change: EdgeChange
): change is Extract<EdgeChange, { type: "remove" }> => {
  return change.type === "remove"
}

export const isEdgeAddChange = (
  change: EdgeChange
): change is Extract<EdgeChange, { type: "add" }> => {
  return change.type === "add"
}

// Utility to check if a change has an id property
export const hasId = (
  change: NodeChange | EdgeChange
): change is (NodeChange | EdgeChange) & { id: string } => {
  return "id" in change && typeof change.id === "string"
}

/**
 * Safely applies node changes with proper type checking
 * Returns updated nodes array or null if no changes apply
 */
export const applyNodeChanges = (
  nodes: Node<MindMapNodeData>[],
  changes: NodeChange[]
): Node<MindMapNodeData>[] => {
  const updatedNodes = nodes
    .map((node) => {
      // Find changes that apply to this node
      const nodeChanges = changes.filter(
        (change) => hasId(change) && change.id === node.id
      )

      if (nodeChanges.length === 0) return node

      let updatedNode = { ...node }

      for (const change of nodeChanges) {
        if (isNodePositionChange(change)) {
          if (change.position) {
            updatedNode = { ...updatedNode, position: change.position }
          }
        } else if (isNodeSelectionChange(change)) {
          updatedNode = { ...updatedNode, selected: change.selected ?? false }
        } else if (isNodeDimensionChange(change)) {
          if (change.dimensions) {
            // Update node style
            updatedNode = {
              ...updatedNode,
              style: {
                ...updatedNode.style,
                width: change.dimensions.width,
                height: change.dimensions.height,
              },
            }

            // Update node data if it has width/height properties
            if (updatedNode.data && typeof updatedNode.data === "object") {
              updatedNode = {
                ...updatedNode,
                data: {
                  ...updatedNode.data,
                  width: change.dimensions.width,
                  height: change.dimensions.height,
                } as MindMapNodeData,
              }
            }
          }
        } else if (isNodeRemoveChange(change)) {
          // Mark for removal
          return null
        }
      }

      return updatedNode
    })
    .filter((node): node is Node<MindMapNodeData> => node !== null)

  // Handle add changes
  const addChanges = changes.filter(isNodeAddChange)
  const newNodes = addChanges.map((change) => {
    const addedNode = change.item
    // Ensure the added node has the correct data type
    return {
      ...addedNode,
      data: addedNode.data as MindMapNodeData,
    } as Node<MindMapNodeData>
  })

  return [...updatedNodes, ...newNodes]
}

/**
 * Safely applies edge changes with proper type checking
 */
export const applyEdgeChanges = (
  edges: Edge[],
  changes: EdgeChange[]
): Edge[] => {
  const updatedEdges = edges
    .map((edge) => {
      // Find changes that apply to this edge
      const edgeChanges = changes.filter(
        (change) => hasId(change) && change.id === edge.id
      )

      if (edgeChanges.length === 0) return edge

      let updatedEdge = { ...edge }

      for (const change of edgeChanges) {
        if (isEdgeSelectionChange(change)) {
          updatedEdge = { ...updatedEdge, selected: change.selected ?? false }
        } else if (isEdgeRemoveChange(change)) {
          // Mark for removal
          return null
        }
      }

      return updatedEdge
    })
    .filter((edge): edge is Edge => edge !== null)

  // Handle add changes
  const addChanges = changes.filter(isEdgeAddChange)
  const newEdges = addChanges.map((change) => change.item)

  return [...updatedEdges, ...newEdges]
}

/**
 * Performance optimized change handler
 * Only processes changes that actually modify data
 */
export const hasSignificantChanges = (
  changes: NodeChange[] | EdgeChange[]
): boolean => {
  return changes.some((change) => {
    switch (change.type) {
      case "position":
      case "dimensions":
      case "select":
      case "add":
      case "remove":
        return true
      default:
        return false
    }
  })
}

/**
 * Debugging utility to log change details
 */
export const debugChanges = (
  changes: NodeChange[] | EdgeChange[],
  prefix = "Changes"
): void => {
  if (process.env.NODE_ENV === "development") {
    console.group(`[Debug] ${prefix}:`, changes.length)
    changes.forEach((change, index) => {
      console.log(`${index + 1}.`, {
        type: change.type,
        id: hasId(change) ? change.id : "no-id",
        details: change,
      })
    })
    console.groupEnd()
  }
}
