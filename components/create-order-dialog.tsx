"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Order, OrderItem } from "@/types/order"
import CategorySelection from "@/components/category-selection"
import OrderSummary from "@/components/order-summary"
import { useOrders } from "@/context/order-context"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateOrder: (order: Order) => void
}

export default function CreateOrderDialog({ open, onOpenChange, onCreateOrder }: CreateOrderDialogProps) {
  const { getNextOrderNumber } = useOrders()
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])

  const handleAddItem = (item: OrderItem) => {
    const existingItemIndex = items.findIndex((i) => i.id === item.id)

    if (existingItemIndex > -1) {
      const updatedItems = [...items]
      updatedItems[existingItemIndex].quantity += item.quantity
      setItems(updatedItems)
    } else {
      setItems([...items, item])
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const handleCreateOrder = () => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const newOrder: Order = {
      id: getNextOrderNumber(),
      customerName: customerName.trim() || "Guest",
      items,
      total,
      isPaid: false,
      createdAt: new Date().toISOString(),
    }

    onCreateOrder(newOrder)
    resetForm()
  }

  const resetForm = () => {
    setCustomerName("")
    setItems([])
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name (Optional)</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name or leave blank"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1">
            <CategorySelection onAddItem={handleAddItem} />

            {items.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Current Items</h3>
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  <OrderSummary items={items} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4 pt-2 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={items.length === 0}>
              Create Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

