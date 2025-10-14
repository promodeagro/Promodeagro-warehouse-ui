import { useState } from "react";
import { CheckCircle, XCircle, Camera, FileSignature, Phone, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function OrderDelivery() {
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [customerOTP, setCustomerOTP] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [customerName, setCustomerName] = useState("");

  const currentOrder = {
    id: "ORD-001",
    customer: "Rajesh Kumar",
    address: "Flat 201, Green Valley Apartments, Gachibowli, Hyderabad - 500032",
    phone: "+91 98765 43210",
    items: [
      { name: "Fresh Tomatoes", quantity: "2 kg", price: "₹90" },
      { name: "Organic Spinach", quantity: "1 bunch", price: "₹35" },
      { name: "Red Onions", quantity: "1 kg", price: "₹30" }
    ],
    totalAmount: "₹845",
    paymentMode: "COD",
    timeSlot: "2:00-3:00 PM",
    specialInstructions: "Call before reaching, Gate code: 1234"
  };

  const deliveryOptions = [
    { value: "delivered", label: "Successfully Delivered", icon: CheckCircle, color: "text-green-500" },
    { value: "failed-not-home", label: "Customer Not Available", icon: XCircle, color: "text-orange-500" },
    { value: "failed-refused", label: "Customer Refused Order", icon: XCircle, color: "text-red-500" },
    { value: "failed-address", label: "Incorrect Address", icon: XCircle, color: "text-red-500" },
    { value: "rescheduled", label: "Delivery Rescheduled", icon: MessageSquare, color: "text-blue-500" }
  ];

  const handleSubmitDelivery = () => {
    console.log("Delivery Status:", {
      orderId: currentOrder.id,
      status: deliveryStatus,
      customerOTP,
      deliveryNotes,
      customerName,
      timestamp: new Date().toISOString()
    });
    
    // Reset form
    setDeliveryStatus("");
    setCustomerOTP("");
    setDeliveryNotes("");
    setCustomerName("");
  };

  return (
    <div className="space-y-6">
      {/* Current Order Details */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Active Delivery - {currentOrder.id}
              </CardTitle>
              <CardDescription>
                Deliver to {currentOrder.customer}
              </CardDescription>
            </div>
            <Badge className="bg-blue-500/10 text-blue-500">
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer & Address Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-2">
                  <p className="font-medium">{currentOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">{currentOrder.address}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {currentOrder.phone}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {currentOrder.specialInstructions && (
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                    <p className="text-sm">{currentOrder.specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">Items to Deliver</h4>
              <div className="space-y-2">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({item.quantity})</span>
                    </div>
                    <span className="font-semibold">{item.price}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 border-t font-bold">
                  <span>Total Amount</span>
                  <span className="text-lg">{currentOrder.totalAmount}</span>
                </div>
                <Badge className="w-fit">
                  Payment: {currentOrder.paymentMode}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Status Selection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Update Delivery Status</CardTitle>
          <CardDescription>
            Select the appropriate delivery status and provide necessary details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Options */}
          <div>
            <Label className="text-base font-semibold">Delivery Status</Label>
            <RadioGroup value={deliveryStatus} onValueChange={setDeliveryStatus} className="mt-2">
              {deliveryOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex items-center gap-2 flex-1">
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Conditional Fields based on Status */}
          {deliveryStatus === "delivered" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Received By</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Customer OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 4-digit OTP"
                  value={customerOTP}
                  onChange={(e) => setCustomerOTP(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          )}

          {/* Delivery Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about the delivery..."
              rows={3}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
            />
          </div>

          {/* Proof of Delivery */}
          <div>
            <Label className="text-base font-semibold">Proof of Delivery</Label>
            <div className="grid gap-4 md:grid-cols-2 mt-2">
              <Card className="border-dashed border-2 cursor-pointer hover:bg-muted/50">
                <CardContent className="p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-medium">Take Photo</h4>
                  <p className="text-sm text-muted-foreground">Photo of delivered items</p>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 cursor-pointer hover:bg-muted/50">
                <CardContent className="p-6 text-center">
                  <FileSignature className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-medium">Digital Signature</h4>
                  <p className="text-sm text-muted-foreground">Customer signature</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmitDelivery}
              disabled={!deliveryStatus}
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Delivery
            </Button>
            <Button variant="outline" className="flex-1">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold">Call Customer</h4>
            <p className="text-sm text-muted-foreground">Contact for delivery</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-accent" />
            <h4 className="font-semibold">Send SMS</h4>
            <p className="text-sm text-muted-foreground">Notify customer</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
            <h4 className="font-semibold">Report Issue</h4>
            <p className="text-sm text-muted-foreground">Log delivery problem</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}