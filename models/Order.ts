import mongoose from "mongoose"

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  subcategory: String,
  quantity: Number,
})

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  paymentMethod: {
    type: String,
    enum: ["upi", "cash", null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)

