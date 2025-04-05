"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Filter, CalendarIcon } from "lucide-react"
import type { Order } from "@/types/order"
import OrderDetailsDialog from "@/components/order-details-dialog"
import { useOrders } from "@/context/order-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import Navbar from "@/components/navbar"
import RouteGuard from "@/components/route-guard"
import { Label } from "@/components/ui/label"

export default function HistoryPage() {
  const { historyOrders, clearHistory } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isFiltering, setIsFiltering] = useState(false)

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleClearHistory = () => {
    clearHistory()
    setIsClearDialogOpen(false)
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Order ID", "Customer", "Date", "Status", "Total", "Payment Method", "Items"]
    const rows = filteredOrders.map((order) => {
      const status = order.isCancelled ? "Cancelled" : "Paid"
      const date = new Date(order.createdAt).toLocaleString()
      const items = order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")
      const paymentMethod = order.paymentMethod || "N/A"

      return [order.id, order.customerName, date, status, order.total.toFixed(2), paymentMethod, items]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.setAttribute("href", url)
    link.setAttribute("download", `cafe-orders-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleApplyFilter = () => {
    setIsFiltering(!!startDate || !!endDate)
  }

  const handleClearFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setIsFiltering(false)
  }

  // Sort orders with latest on top
  const sortedOrders = [...historyOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Filter orders by date range
  const filteredOrders =
    isFiltering && (startDate || endDate)
      ? sortedOrders.filter((order) => {
          const orderDate = new Date(order.createdAt)

          if (startDate && endDate) {
            // Set end date to end of day
            const endOfDay = new Date(endDate)
            endOfDay.setHours(23, 59, 59, 999)

            return orderDate >= startDate && orderDate <= endOfDay
          } else if (startDate) {
            return orderDate >= startDate
          } else if (endDate) {
            // Set end date to end of day
            const endOfDay = new Date(endDate)
            endOfDay.setHours(23, 59, 59, 999)

            return orderDate <= endOfDay
          }

          return true
        })
      : sortedOrders

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Order History</h1>

              <div className="flex space-x-2">
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        {isFiltering ? "Filtered" : "Filter"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="end">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                            {startDate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setStartDate(undefined)}
                                className="h-8 w-8"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                            {endDate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEndDate(undefined)}
                                className="h-8 w-8"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={handleClearFilter}>
                            Clear
                          </Button>
                          <Button size="sm" onClick={handleApplyFilter}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button variant="outline" onClick={handleExportCSV} disabled={filteredOrders.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setIsClearDialogOpen(true)}
                  disabled={historyOrders.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Clear History</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>

            {isFiltering && (
              <div className="mb-4 flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="text-sm sm:text-base">
                  <span className="font-medium">Filtered: </span>
                  {startDate && endDate ? (
                    <span>
                      {format(startDate, "PPP")} to {format(endDate, "PPP")}
                    </span>
                  ) : startDate ? (
                    <span>From {format(startDate, "PPP")}</span>
                  ) : endDate ? (
                    <span>Until {format(endDate, "PPP")}</span>
                  ) : (
                    <span>All orders</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                  Clear
                </Button>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium text-muted-foreground">No order history</h2>
                <p className="text-muted-foreground mt-2">
                  {isFiltering ? "No orders match your filter criteria" : "Completed orders will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleOrderClick(order)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant={order.isCancelled ? "destructive" : "success"}>
                          {order.isCancelled ? "Cancelled" : "Paid"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                          {order.paymentMethod && !order.isCancelled && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Paid via {order.paymentMethod.toUpperCase()}
                            </p>
                          )}
                        </div>
                        <p className="font-bold">₹{order.total.toFixed(2)}</p>
                      </div>

                      <div className="mt-3 space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-sm flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground">+ {order.items.length - 3} more items...</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedOrder && (
              <OrderDetailsDialog order={selectedOrder} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
            )}

            <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Order History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all order history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}

