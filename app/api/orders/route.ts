import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import { getUserIdFromToken } from "@/lib/auth"

// Get all active orders for the current user
export async function GET(request: Request) {
  try {
    await dbConnect()
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const orders = await Order.find({
      userId,
      isPaid: false,
      isCancelled: false,
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Create a new order
export async function POST(request: Request) {
  try {
    await dbConnect()
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const orderData = await request.json()

    // Add userId to the order
    const newOrder = await Order.create({
      ...orderData,
      userId,
    })

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

