"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import OrderCard from "@/components/order-card"
import CreateOrderDialog from "@/components/create-order-dialog"
import type { Order } from "@/types/order"
import { useOrders } from "@/context/order-context"
import Navbar from "@/components/navbar"
import RouteGuard from "@/components/route-guard"

export default function OrdersPage() {
  const { orders, addOrder } = useOrders()
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)

  const handleCreateOrder = (order: Order) => {
    addOrder(order)
    setIsCreateOrderOpen(false)
  }

  // Sort orders with latest on top
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Orders</h1>
            </div>

            {sortedOrders.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium text-muted-foreground">No orders yet</h2>
                <p className="text-muted-foreground mt-2">Create a new order to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            <Button
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
              onClick={() => setIsCreateOrderOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>

            <CreateOrderDialog
              open={isCreateOrderOpen}
              onOpenChange={setIsCreateOrderOpen}
              onCreateOrder={handleCreateOrder}
            />
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}

