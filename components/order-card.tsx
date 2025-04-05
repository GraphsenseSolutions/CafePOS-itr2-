"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Order } from "@/types/order"
import OrderDetailsDialog from "@/components/order-details-dialog"
import EditOrderDialog from "@/components/edit-order-dialog"
import { useOrders } from "@/context/order-context"

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  const { cancelOrder } = useOrders()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)

  // Get up to 3 items to show in the summary
  const summaryItems = order.items.slice(0, 3)
  const hasMoreItems = order.items.length > 3

  const handleCardClick = () => {
    setIsDetailsOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(order.id)
    }
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader onClick={handleCardClick}>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order.id}</CardTitle>
            <Badge variant={order.isPaid ? "success" : "destructive"}>{order.isPaid ? "Paid" : "Unpaid"}</Badge>
          </div>
        </CardHeader>
        <CardContent onClick={handleCardClick}>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-muted-foreground mt-1">{totalItems} items</p>

          <div className="mt-3 space-y-1">
            {summaryItems.map((item) => (
              <div key={item.id} className="text-sm flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {hasMoreItems && (
              <div className="text-sm text-muted-foreground">+ {order.items.length - 3} more items...</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelClick}>
              <Trash2 className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
          <p className="font-bold">₹{order.total.toFixed(2)}</p>
        </CardFooter>
      </Card>

      <OrderDetailsDialog order={order} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />

      <EditOrderDialog order={order} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}

