import { auth } from "@clerk/nextjs/server"
import { db } from "./db"

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

export async function createUserIfNotExists(clerkUser: any) {
  const existingUser = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (!existingUser) {
    await db.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
      },
    })
  }
}
