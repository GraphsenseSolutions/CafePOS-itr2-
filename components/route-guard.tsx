"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Auth check function
    const authCheck = () => {
      // Public paths that don't require authentication
      const publicPaths = ["/login", "/register"]
      const path = pathname

      // If the path is not public and user is not logged in, redirect to login
      if (!publicPaths.includes(path) && !user && !isLoading) {
        setAuthorized(false)
        router.push("/login")
      } else {
        setAuthorized(true)
      }
    }

    // Run auth check
    authCheck()

    // Listen for route changes
    const handleRouteChange = () => {
      authCheck()
    }

    // Clean up event listener
    return () => {
      // Cleanup if needed
    }
  }, [user, isLoading, pathname, router])

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // If authorized, render children
  return authorized ? <>{children}</> : null
}

