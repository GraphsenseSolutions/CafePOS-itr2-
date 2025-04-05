"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { OrderItem } from "@/types/order"

interface CategorySelectionProps {
  onAddItem: (item: OrderItem) => void
}

type SelectionLevel = "category" | "subcategory" | "item"

export default function CategorySelection({ onAddItem }: CategorySelectionProps) {
  const [level, setLevel] = useState<SelectionLevel>("category")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [menuItems, setMenuItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu-items")
        const data = await response.json()

        if (data.success) {
          setMenuItems(
            data.items.map((item: any) => ({
              ...item,
              quantity: 1, // Add default quantity for order items
            })),
          )
        } else {
          console.error("Failed to fetch menu items")
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)

    // Check if this category has any subcategories
    const hasSubcategories = menuItems.filter((item) => item.category === category).some((item) => item.subcategory)

    if (hasSubcategories) {
      setLevel("subcategory")
    } else {
      // If no subcategories, go directly to items
      setSelectedSubcategory(null)
      setLevel("item")
    }
  }

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    setLevel("item")
  }

  const handleItemSelect = (item: OrderItem) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const handleAddItem = () => {
    if (selectedItem) {
      onAddItem({
        ...selectedItem,
        quantity,
      })
      setSelectedItem(null)
      setQuantity(1)
    }
  }

  const handleBack = () => {
    if (level === "subcategory") {
      setLevel("category")
      setSelectedCategory(null)
    } else if (level === "item") {
      // If we came directly from category to item (no subcategories)
      if (!selectedSubcategory) {
        setLevel("category")
        setSelectedCategory(null)
      } else {
        setLevel("subcategory")
        setSelectedSubcategory(null)
      }
      setSelectedItem(null)
    }
  }

  const renderCategories = () => {
    const categories = Array.from(new Set(menuItems.map((item) => item.category)))

    return (
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-4">Loading menu items...</div>
        ) : (
          categories.map((category) => (
            <Card
              key={category}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCategorySelect(category)}
            >
              <CardContent className="flex items-center justify-center p-6">
                <span className="font-medium">{category}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const renderSubcategories = () => {
    if (!selectedCategory) return null

    // Get all subcategories for the selected category
    const subcategories = Array.from(
      new Set(
        menuItems
          .filter((item) => item.category === selectedCategory && item.subcategory)
          .map((item) => item.subcategory),
      ),
    ).filter(Boolean) as string[]

    return (
      <div className="grid grid-cols-2 gap-4">
        {subcategories.map((subcategory) => (
          <Card
            key={subcategory}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSubcategorySelect(subcategory)}
          >
            <CardContent className="flex items-center justify-center p-6">
              <span className="font-medium">{subcategory}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderItems = () => {
    // Filter items based on category and subcategory (if selected)
    const items = menuItems.filter((item) => {
      if (selectedCategory && selectedSubcategory) {
        return item.category === selectedCategory && item.subcategory === selectedSubcategory
      } else if (selectedCategory) {
        // If no subcategory is selected, show all items in the category
        // or items without a subcategory
        return item.category === selectedCategory && !item.subcategory
      }
      return false
    })

    return (
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedItem?.id === item.id ? "border-primary" : ""
            }`}
            onClick={() => handleItemSelect(item)}
          >
            <CardContent className="p-4">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground mt-1">₹{item.price.toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderQuantitySelector = () => {
    if (!selectedItem) return null

    return (
      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{selectedItem.name}</div>
            <div className="text-sm text-muted-foreground">₹{selectedItem.price.toFixed(2)}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
              +
            </Button>
          </div>
        </div>
        <Button className="w-full mt-2" onClick={handleAddItem}>
          Add to Order
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {level !== "category" && (
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <div>
        {level === "category" && renderCategories()}
        {level === "subcategory" && renderSubcategories()}
        {level === "item" && (
          <>
            {renderItems()}
            {renderQuantitySelector()}
          </>
        )}
      </div>
    </div>
  )
}

