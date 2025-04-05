import dbConnect from "@/lib/mongodb"
import MenuItem from "@/models/MenuItem"
import { menuItems } from "@/data/menu-items"

async function seedDatabase() {
  try {
    await dbConnect()

    // First, clear the existing menu items
    await MenuItem.deleteMany({})
    console.log("Cleared existing menu items")

    // Insert the new menu items
    await MenuItem.insertMany(menuItems)
    console.log(`Added ${menuItems.length} menu items to the database`)

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()

