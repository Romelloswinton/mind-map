export interface MindMapNode {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  color: string
  parentId?: string
  children?: MindMapNode[]
}

export interface MindMap {
  id: string
  title: string
  description?: string
  thumbnail?: string
  isPublic: boolean
  nodes: MindMapNode[]
  createdAt: Date
  updatedAt: Date
}

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

export interface CanvasState {
  isDragging: boolean
  dragOffset: { x: number; y: number }
  selectedTool: "select" | "pan" | "node"
}

export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
