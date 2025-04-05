"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Coffee, History, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    {
      name: "Orders",
      href: "/",
      icon: Coffee,
    },
    {
      name: "History",
      href: "/history",
      icon: History,
    },
    {
      name: "Statistics",
      href: "/statistics",
      icon: BarChart3,
    },
  ]

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Coffee className="h-6 w-6" />
          <h1 className="text-xl font-bold">Café POS</h1>
        </div>
        <div className="flex items-center space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <Link
            href="/settings"
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            <span>{user?.name || "Settings"}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

