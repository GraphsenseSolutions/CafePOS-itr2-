import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Array of protected API routes that require authentication
const protectedApiRoutes = ["/api/orders", "/api/orders/history"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is an API route that needs protection
  if (protectedApiRoutes.some((route) => path.startsWith(route)) || path.match(/^\/api\/orders\/[^/]+$/)) {
    const headerToken = request.headers.get("authorization")

    if (!headerToken || !headerToken.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const token = headerToken.split(" ")[1]

    try {
      // Verify JWT token
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))

      return NextResponse.next()
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}

