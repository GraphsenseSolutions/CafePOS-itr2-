import jwt from "jsonwebtoken"

export async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    // Verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    return decoded.id
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

