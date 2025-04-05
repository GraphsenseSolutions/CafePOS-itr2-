"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Order, OrderItem } from "@/types/order"
import CategorySelection from "@/components/category-selection"
import OrderSummary from "@/components/order-summary"
import { useOrders } from "@/context/order-context"

interface EditOrderDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditOrderDialog({ order, open, onOpenChange }: EditOrderDialogProps) {
  const { updateOrder } = useOrders()
  const [items, setItems] = useState<OrderItem[]>(order.items)

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

  const handleSaveChanges = () => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const updatedOrder: Order = {
      ...order,
      items,
      total,
    }

    updateOrder(updatedOrder)
    onOpenChange(false)
  }

  const handleClose = () => {
    // Reset to original items if dialog is closed without saving
    setItems(order.items)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
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
            <Button onClick={handleSaveChanges} disabled={items.length === 0}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

