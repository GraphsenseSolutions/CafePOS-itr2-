"use client"

import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OrderItem } from "@/types/order"

interface OrderSummaryProps {
  items: OrderItem[]
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  readonly?: boolean
}

export default function OrderSummary({ items, onUpdateQuantity, onRemoveItem, readonly = false }: OrderSummaryProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
            </div>

            {!readonly && onUpdateQuantity ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                  +
                </Button>
              </div>
            ) : (
              <div className="text-center w-8 mx-4">{item.quantity}</div>
            )}

            <div className="w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</div>

            {!readonly && onRemoveItem && (
              <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item.id)} className="ml-2">
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold pt-2">
        <span>Total</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  )
}

