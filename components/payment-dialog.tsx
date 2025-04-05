"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Banknote, Check } from "lucide-react"
import Image from "next/image"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onPaymentComplete: (paymentMethod: "upi" | "cash") => void
}

type PaymentMethod = "upi" | "cash" | null
type PaymentStatus = "selecting" | "processing" | "completed"

export default function PaymentDialog({ open, onOpenChange, amount, onPaymentComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [status, setStatus] = useState<PaymentStatus>("selecting")
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    let processingTimer: NodeJS.Timeout

    if (status === "processing" && paymentMethod === "upi") {
      setShowQR(true)
    } else if (status === "processing" && paymentMethod === "cash") {
      // Simulate cash payment processing
      processingTimer = setTimeout(() => {
        setStatus("completed")
      }, 1500)
    }

    return () => {
      clearTimeout(processingTimer)
    }
  }, [status, paymentMethod])

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setStatus("processing")
  }

  const handleCompleteUpiPayment = () => {
    setShowQR(false)
    setStatus("completed")
  }

  const handleComplete = () => {
    if (paymentMethod) {
      onPaymentComplete(paymentMethod)
    }
    resetDialog()
  }

  const resetDialog = () => {
    setPaymentMethod(null)
    setStatus("selecting")
    setShowQR(false)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetDialog()
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {status === "selecting"
              ? "Select Payment Method"
              : status === "processing"
                ? "Processing Payment"
                : "Payment Complete"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {status === "selecting" && (
            <div className="grid grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectPaymentMethod("upi")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <CreditCard className="h-8 w-8 mb-2" />
                  <span className="font-medium">UPI</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectPaymentMethod("cash")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Banknote className="h-8 w-8 mb-2" />
                  <span className="font-medium">Cash</span>
                </CardContent>
              </Card>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-4">
              {showQR ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/scanner-upi%28Dummy1%29.jpg-Bq8MJYF13XM4v84xLQrCyX9g0dJcLx.jpeg"
                      alt="UPI QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <p className="mb-2">Scan this QR code to pay</p>
                  <p className="font-medium">₹{amount.toFixed(2)}</p>
                  <Button onClick={handleCompleteUpiPayment} className="mt-4">
                    Payment Completed
                  </Button>
                </div>
              ) : (
                <>
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>
                    Processing {paymentMethod === "upi" ? "UPI" : "Cash"} payment of ₹{amount.toFixed(2)}
                  </p>
                </>
              )}
            </div>
          )}

          {status === "completed" && (
            <div className="text-center py-8">
              <div className="bg-green-100 text-green-800 rounded-full p-2 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2">Payment Successful!</p>
              <p className="text-muted-foreground mb-4">
                ₹{amount.toFixed(2)} paid via {paymentMethod === "upi" ? "UPI" : "Cash"}
              </p>
              <Button onClick={handleComplete}>Complete</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

