"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Order } from "@/types/order"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

interface OrderContextType {
  orders: Order[]
  historyOrders: Order[]
  nextOrderNumber: number
  addOrder: (order: Order) => void
  updateOrder: (order: Order) => void
  removeOrder: (orderId: string) => void
  markOrderAsPaid: (orderId: string, paymentMethod: "upi" | "cash") => void
  cancelOrder: (orderId: string) => void
  clearHistory: () => void
  getNextOrderNumber: () => string
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [historyOrders, setHistoryOrders] = useState<Order[]>([])
  const [nextOrderNumber, setNextOrderNumber] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Get the authorization header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // Load orders from API when user logs in
  useEffect(() => {
    if (!user) {
      setOrders([])
      setHistoryOrders([])
      return
    }

    const fetchOrders = async () => {
      try {
        // Fetch active orders
        const activeResponse = await fetch("/api/orders", {
          headers: getAuthHeader(),
        })
        const activeData = await activeResponse.json()

        if (activeData.success) {
          setOrders(activeData.orders)
        }

        // Fetch history orders
        const historyResponse = await fetch("/api/orders/history", {
          headers: getAuthHeader(),
        })
        const historyData = await historyResponse.json()

        if (historyData.success) {
          setHistoryOrders(historyData.orders)
        }

        // Set next order number
        const allOrders = [...activeData.orders, ...historyData.orders]
        if (allOrders.length > 0) {
          const orderNumbers = allOrders.map((order) => Number.parseInt(order.id, 10))
          const maxOrderNumber = Math.max(...orderNumbers)
          setNextOrderNumber(maxOrderNumber + 1)
        } else {
          setNextOrderNumber(1)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchOrders()
  }, [user, toast])

  const getNextOrderNumber = () => {
    const orderNumber = nextOrderNumber.toString().padStart(3, "0")
    setNextOrderNumber(nextOrderNumber + 1)
    return orderNumber
  }

  const addOrder = async (order: Order) => {
    if (!user) return

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(order),
      })

      const data = await response.json()

      if (data.success) {
        setOrders((prevOrders) => [...prevOrders, data.order])
      } else {
        toast({
          title: "Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateOrder = async (updatedOrder: Order) => {
    if (!user) return

    try {
      const response = await fetch(`/api/orders/${updatedOrder.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(updatedOrder),
      })

      const data = await response.json()

      if (data.success) {
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? data.order : order)))
      } else {
        toast({
          title: "Error",
          description: "Failed to update order. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeOrder = (orderId: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
  }

  const markOrderAsPaid = async (orderId: string, paymentMethod: "upi" | "cash") => {
    if (!user) return

    const orderToMove = orders.find((order) => order.id === orderId)

    if (orderToMove) {
      const paidOrder = {
        ...orderToMove,
        isPaid: true,
        paymentMethod,
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify(paidOrder),
        })

        const data = await response.json()

        if (data.success) {
          // Remove from active orders
          setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
          // Add to history
          setHistoryOrders((prevHistory) => [...prevHistory, data.order])
        } else {
          toast({
            title: "Error",
            description: "Failed to mark order as paid. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error marking order as paid:", error)
        toast({
          title: "Error",
          description: "Failed to mark order as paid. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!user) return

    const orderToCancel = orders.find((order) => order.id === orderId)

    if (orderToCancel) {
      const cancelledOrder = { ...orderToCancel, isCancelled: true }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify(cancelledOrder),
        })

        const data = await response.json()

        if (data.success) {
          // Remove from active orders
          setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
          // Add to history
          setHistoryOrders((prevHistory) => [...prevHistory, data.order])
        } else {
          toast({
            title: "Error",
            description: "Failed to cancel order. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error cancelling order:", error)
        toast({
          title: "Error",
          description: "Failed to cancel order. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const clearHistory = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/orders/history", {
        method: "DELETE",
        headers: getAuthHeader(),
      })

      const data = await response.json()

      if (data.success) {
        setHistoryOrders([])
      } else {
        toast({
          title: "Error",
          description: "Failed to clear history. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        historyOrders,
        nextOrderNumber,
        addOrder,
        updateOrder,
        removeOrder,
        markOrderAsPaid,
        cancelOrder,
        clearHistory,
        getNextOrderNumber,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}

