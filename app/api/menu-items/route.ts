import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import MenuItem from "@/models/MenuItem"
import { menuItems } from "@/data/menu-items"

// Get all menu items
export async function GET() {
  try {
    await dbConnect()
    const items = await MenuItem.find({})

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Seed the menu items (for initial setup)
export async function POST() {
  try {
    await dbConnect()

    // First clear existing items
    await MenuItem.deleteMany({})

    // Insert all items from data file
    await MenuItem.insertMany(menuItems)

    return NextResponse.json({
      success: true,
      message: "Menu items seeded successfully",
    })
  } catch (error) {
    console.error("Error seeding menu items:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

