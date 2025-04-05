import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email, password } = await request.json()

    // Find the user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 400 })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 400 })
    }

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
    }

    return NextResponse.json({
      success: true,
      user: userInfo,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

