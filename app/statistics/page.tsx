"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/types/order"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useOrders } from "@/context/order-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import RouteGuard from "@/components/route-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TimeScale = "day" | "week" | "month" | "all"

export default function StatisticsPage() {
  const { orders, historyOrders } = useOrders()
  const [timeScale, setTimeScale] = useState<TimeScale>("day")
  const [todayOrders, setTodayOrders] = useState<Order[]>([])
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [chartData, setChartData] = useState<{ label: string; orders: number; revenue: number }[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number; color: string }[]>([])
  const [activeTab, setActiveTab] = useState<string>("orders")

  // Calculate statistics whenever orders, historyOrders, or timeScale change
  useEffect(() => {
    const allOrders = [...orders, ...historyOrders]

    // Calculate total orders and revenue (excluding cancelled orders)
    const validOrders = allOrders.filter((order) => !order.isCancelled)
    setTotalOrders(validOrders.length)
    setTotalRevenue(validOrders.filter((order) => order.isPaid).reduce((acc, order) => acc + order.total, 0))

    // Filter today's orders (excluding cancelled orders)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysOrders = validOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      const orderDay = new Date(orderDate)
      orderDay.setHours(0, 0, 0, 0)
      return orderDay.getTime() === today.getTime()
    })

    setTodayOrders(todaysOrders)

    // Calculate today's revenue (only from paid orders)
    const revenue = todaysOrders.filter((order) => order.isPaid).reduce((acc, order) => acc + order.total, 0)

    setTodayRevenue(revenue)

    // Calculate payment method breakdown
    const paidOrders = validOrders.filter((order) => order.isPaid)
    const upiTotal = paidOrders
      .filter((order) => order.paymentMethod === "upi")
      .reduce((acc, order) => acc + order.total, 0)

    const cashTotal = paidOrders
      .filter((order) => order.paymentMethod === "cash")
      .reduce((acc, order) => acc + order.total, 0)

    const unknownTotal = paidOrders.filter((order) => !order.paymentMethod).reduce((acc, order) => acc + order.total, 0)

    setPaymentMethodData(
      [
        { name: "UPI", value: upiTotal, color: "#8884d8" },
        { name: "Cash", value: cashTotal, color: "#82ca9d" },
        { name: "Unknown", value: unknownTotal, color: "#ffc658" },
      ].filter((item) => item.value > 0),
    )

    // Generate chart data based on selected time scale
    if (timeScale === "day") {
      // Hourly data for today
      const hourlyMap = new Map<number, { orders: number; revenue: number }>()

      // Initialize hours
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { orders: 0, revenue: 0 })
      }

      // Populate with actual data
      todaysOrders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours()
        const current = hourlyMap.get(hour)!

        hourlyMap.set(hour, {
          orders: current.orders + 1,
          revenue: order.isPaid ? current.revenue + order.total : current.revenue,
        })
      })

      // Convert to array for chart
      const hourlyDataArray = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        label: `${hour}:00`,
        orders: data.orders,
        revenue: data.revenue,
      }))

      setChartData(hourlyDataArray)
    } else if (timeScale === "week") {
      // Daily data for the last 7 days
      const dailyMap = new Map<string, { orders: number; revenue: number }>()

      // Initialize days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const dateStr = date.toISOString().split("T")[0]
        dailyMap.set(dateStr, { orders: 0, revenue: 0 })
      }

      // Populate with actual data (excluding cancelled orders)
      validOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const dateStr = orderDate.toISOString().split("T")[0]

        if (dailyMap.has(dateStr)) {
          const current = dailyMap.get(dateStr)!

          dailyMap.set(dateStr, {
            orders: current.orders + 1,
            revenue: order.isPaid ? current.revenue + order.total : current.revenue,
          })
        }
      })

      // Convert to array for chart
      const dailyDataArray = Array.from(dailyMap.entries()).map(([dateStr, data]) => {
        const date = new Date(dateStr)
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

        return {
          label: dayName,
          orders: data.orders,
          revenue: data.revenue,
        }
      })

      setChartData(dailyDataArray)
    } else if (timeScale === "month") {
      // Weekly data for the last 4 weeks
      const weeklyMap = new Map<number, { orders: number; revenue: number }>()

      // Initialize weeks
      for (let i = 0; i < 4; i++) {
        weeklyMap.set(i, { orders: 0, revenue: 0 })
      }

      // Populate with actual data (excluding cancelled orders)
      validOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        const diffTime = today.getTime() - orderDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 28) {
          const weekIndex = Math.floor(diffDays / 7)

          if (weekIndex < 4) {
            const current = weeklyMap.get(weekIndex)!

            weeklyMap.set(weekIndex, {
              orders: current.orders + 1,
              revenue: order.isPaid ? current.revenue + order.total : current.revenue,
            })
          }
        }
      })

      // Convert to array for chart
      const weeklyDataArray = Array.from(weeklyMap.entries())
        .map(([weekIndex, data]) => ({
          label: `Week ${4 - weekIndex}`,
          orders: data.orders,
          revenue: data.revenue,
        }))
        .reverse()

      setChartData(weeklyDataArray)
    } else if (timeScale === "all") {
      // Monthly data for all time
      const monthlyMap = new Map<string, { orders: number; revenue: number }>()

      // Get all unique year-month combinations
      const monthSet = new Set<string>()
      validOrders.forEach((order) => {
        const date = new Date(order.createdAt)
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`
        monthSet.add(yearMonth)
      })

      // Sort months chronologically
      const sortedMonths = Array.from(monthSet).sort()

      // Initialize months
      sortedMonths.forEach((yearMonth) => {
        monthlyMap.set(yearMonth, { orders: 0, revenue: 0 })
      })

      // Populate with actual data (excluding cancelled orders)
      validOrders.forEach((order) => {
        const date = new Date(order.createdAt)
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`

        const current = monthlyMap.get(yearMonth)!

        monthlyMap.set(yearMonth, {
          orders: current.orders + 1,
          revenue: order.isPaid ? current.revenue + order.total : current.revenue,
        })
      })

      // Convert to array for chart
      const monthlyDataArray = Array.from(monthlyMap.entries()).map(([yearMonth, data]) => {
        const [year, month] = yearMonth.split("-").map(Number)
        const date = new Date(year, month - 1)
        const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        return {
          label: monthName,
          orders: data.orders,
          revenue: data.revenue,
        }
      })

      setChartData(monthlyDataArray)
    }
  }, [orders, historyOrders, timeScale])

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Statistics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {timeScale === "all" ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{totalOrders}</p>
                      <p className="text-sm text-muted-foreground mt-1">All time (excluding cancelled)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground mt-1">From paid orders only</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Today's Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{todayOrders.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date().toLocaleDateString()} (excluding cancelled)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Today's Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">₹{todayRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground mt-1">From paid orders only</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="mb-4 flex justify-between items-center">
              <div className="w-[200px]">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Select value={timeScale} onValueChange={(value) => setTimeScale(value as TimeScale)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today (Hourly)</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 4 Weeks</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="orders">
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>
                        {timeScale === "day"
                          ? "Hourly Orders"
                          : timeScale === "week"
                            ? "Daily Orders (Last 7 Days)"
                            : timeScale === "month"
                              ? "Weekly Orders (Last 4 Weeks)"
                              : "Monthly Orders (All Time)"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {timeScale === "day"
                            ? "Hourly Revenue"
                            : timeScale === "week"
                              ? "Daily Revenue (Last 7 Days)"
                              : timeScale === "month"
                                ? "Weekly Revenue (Last 4 Weeks)"
                                : "Monthly Revenue (All Time)"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Revenue"]} />
                              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {paymentMethodData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Revenue"]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}

