import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import { getUserIdFromToken } from "@/lib/auth"

// Get all history orders (paid or cancelled)
export async function GET(request: Request) {
  try {
    await dbConnect()
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get the URL object to extract query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Base query: find all paid or cancelled orders for this user
    const query: any = {
      userId,
      $or: [{ isPaid: true }, { isCancelled: true }],
    }

    // Add date filters if provided
    if (startDate || endDate) {
      query.createdAt = {}

      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        // Set endDate to end of day
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        query.createdAt.$lte = endDateTime
      }
    }

    const orders = await Order.find(query)

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Error fetching history orders:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Clear history
export async function DELETE(request: Request) {
  try {
    await dbConnect()
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await Order.deleteMany({
      userId,
      $or: [{ isPaid: true }, { isCancelled: true }],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing history:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

