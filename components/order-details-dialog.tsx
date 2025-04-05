"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types/order"
import OrderSummary from "@/components/order-summary"
import PaymentDialog from "@/components/payment-dialog"
import { useOrders } from "@/context/order-context"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const { updateOrder, markOrderAsPaid } = useOrders()
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order>(order)

  // Update currentOrder when the order prop changes
  useEffect(() => {
    setCurrentOrder(order)
  }, [order])

  const handlePaymentComplete = (paymentMethod: "upi" | "cash") => {
    markOrderAsPaid(currentOrder.id, paymentMethod)
    setIsPaymentOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Order #{currentOrder.id} - {currentOrder.customerName}
              </span>
              <Badge variant={currentOrder.isPaid ? "success" : "destructive"}>
                {currentOrder.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <OrderSummary items={currentOrder.items} readonly />

            <div className="mt-6 text-sm text-muted-foreground">
              Created at: {new Date(currentOrder.createdAt).toLocaleString()}
            </div>

            {!currentOrder.isPaid && (
              <Button className="w-full mt-4" onClick={() => setIsPaymentOpen(true)}>
                Pay ₹{currentOrder.total.toFixed(2)}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        amount={currentOrder.total}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  )
}

