import mongoose from "mongoose"

const MenuItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema)

