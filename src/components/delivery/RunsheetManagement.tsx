import { useState } from "react";
import { Truck, MapPin, Phone, Navigation, Clock, Package, Download, Plus, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function RunsheetManagement() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isCreateRunsheetOpen, setIsCreateRunsheetOpen] = useState(false);
  const [runsheetForm, setRunsheetForm] = useState({
    date: new Date().toISOString().split('T')[0],
    driver: "",
    vehicle: "",
    route: "",
    orders: [] as string[]
  });

  const deliveries = [
    {
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
      priority: "High",
      distance: "2.3 km",
      status: "pending",
      specialInstructions: "Call before reaching, Gate code: 1234"
    },
    {
      id: "ORD-002",
      customer: "Priya Sharma", 
      address: "House No. 15, Road No. 36, Jubilee Hills, Hyderabad - 500033",
      phone: "+91 87654 32109",
      items: [
        { name: "Fresh Bananas", quantity: "2 dozen", price: "₹120" },
        { name: "Carrots", quantity: "1 kg", price: "₹40" },
        { name: "Coriander", quantity: "2 bunches", price: "₹30" }
      ],
      totalAmount: "₹1,230",
      paymentMode: "Online Paid",
      timeSlot: "3:00-4:00 PM", 
      priority: "Medium",
      distance: "3.7 km",
      status: "pending",
      specialInstructions: "Leave at security if not available"
    },
    {
      id: "ORD-003",
      customer: "Amit Patel",
      address: "B-302, Hitech City Towers, Madhapur, Hyderabad - 500081",
      phone: "+91 76543 21098",
      items: [
        { name: "Cauliflower", quantity: "1 piece", price: "₹45" },
        { name: "Green Peas", quantity: "500g", price: "₹80" }
      ],
      totalAmount: "₹520",
      paymentMode: "COD",
      timeSlot: "4:00-5:00 PM",
      priority: "Low", 
      distance: "1.8 km",
      status: "pending",
      specialInstructions: null
    }
  ];

  const drivers = [
    { id: "1", name: "Rajesh Kumar", vehicle: "DLV-001" },
    { id: "2", name: "Priya Sharma", vehicle: "DLV-002" },
    { id: "3", name: "Amit Patel", vehicle: "DLV-003" },
    { id: "4", name: "Sunita Reddy", vehicle: "DLV-004" }
  ];

  const vehicles = [
    { id: "DLV-001", make: "Tata Ace", capacity: "1.5 tonnes" },
    { id: "DLV-002", make: "Mahindra Bolero", capacity: "2 tonnes" },
    { id: "DLV-003", make: "Tata Ace", capacity: "1.5 tonnes" },
    { id: "DLV-004", make: "Ashok Leyland Dost", capacity: "3 tonnes" }
  ];

  const handleCreateRunsheet = () => {
    if (!runsheetForm.driver || !runsheetForm.vehicle || !runsheetForm.route) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Runsheet created successfully",
    });

    setRunsheetForm({
      date: new Date().toISOString().split('T')[0],
      driver: "",
      vehicle: "",
      route: "",
      orders: []
    });
    setIsCreateRunsheetOpen(false);
  };

  const handleDownloadRunsheet = () => {
    // Create runsheet content
    const runsheetContent = `
PROMODE AGRO FARMS - DELIVERY RUNSHEET
======================================

Date: ${new Date().toLocaleDateString()}
Driver: ${runsheetForm.driver || "To be assigned"}
Vehicle: ${runsheetForm.vehicle || "To be assigned"}
Route: ${runsheetForm.route || "Standard Route"}

DELIVERY ORDERS:
================

${deliveries.map((delivery, index) => `
${index + 1}. Order ID: ${delivery.id}
Customer: ${delivery.customer}
Address: ${delivery.address}
Phone: ${delivery.phone}
Time Slot: ${delivery.timeSlot}
Amount: ${delivery.totalAmount}
Payment: ${delivery.paymentMode}
Items:
${delivery.items.map(item => `  - ${item.name} (${item.quantity}) - ${item.price}`).join('\n')}
${delivery.specialInstructions ? `Special Instructions: ${delivery.specialInstructions}` : ''}
${'='.repeat(50)}
`).join('')}

Total Orders: ${deliveries.length}
Total Value: ₹${deliveries.reduce((sum, d) => sum + parseInt(d.totalAmount.replace('₹', '').replace(',', '')), 0).toLocaleString()}
Total Distance: 7.8 km
Estimated Duration: 1h 45m

Driver Signature: ________________    Date: ________________
    `;

    // Create blob and download
    const blob = new Blob([runsheetContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runsheet-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Runsheet downloaded successfully",
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-500/10 text-red-500 border-red-200",
      "Medium": "bg-yellow-500/10 text-yellow-500 border-yellow-200",
      "Low": "bg-green-500/10 text-green-500 border-green-200"
    };
    return colors[priority as keyof typeof colors];
  };

  const getPaymentColor = (mode: string) => {
    return mode === "COD" ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">Runsheet Management</h2>
          <p className="text-muted-foreground">Create and manage delivery runsheets</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateRunsheetOpen} onOpenChange={setIsCreateRunsheetOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Runsheet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Runsheet</DialogTitle>
                <DialogDescription>
                  Generate a new delivery runsheet for today
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Delivery Date</label>
                  <Input
                    type="date"
                    value={runsheetForm.date}
                    onChange={(e) => setRunsheetForm({ ...runsheetForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Assign Driver</label>
                  <Select value={runsheetForm.driver} onValueChange={(value) => setRunsheetForm({ ...runsheetForm, driver: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.name}>
                          {driver.name} ({driver.vehicle})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Assign Vehicle</label>
                  <Select value={runsheetForm.vehicle} onValueChange={(value) => setRunsheetForm({ ...runsheetForm, vehicle: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.id} - {vehicle.make} ({vehicle.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Route Name</label>
                  <Input
                    placeholder="e.g., Route A - Gachibowli"
                    value={runsheetForm.route}
                    onChange={(e) => setRunsheetForm({ ...runsheetForm, route: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateRunsheet} className="flex-1">
                  Create Runsheet
                </Button>
                <Button variant="outline" onClick={() => setIsCreateRunsheetOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleDownloadRunsheet}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Today's Delivery Runsheet
          </CardTitle>
          <CardDescription>
            Delivery schedule for {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card 
                key={delivery.id} 
                className={`hover:shadow-md transition-all cursor-pointer ${
                  selectedOrder === delivery.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedOrder(selectedOrder === delivery.id ? null : delivery.id)}
              >
                <CardContent className="p-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {delivery.id}
                      </Badge>
                      <Badge className={getPriorityColor(delivery.priority)}>
                        {delivery.priority}
                      </Badge>
                      <Badge className={getPaymentColor(delivery.paymentMode)}>
                        {delivery.paymentMode}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{delivery.totalAmount}</div>
                      <div className="text-sm text-muted-foreground">{delivery.distance}</div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-lg">{delivery.customer}</h4>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{delivery.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {delivery.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {delivery.items.length} items
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder === delivery.id && (
                    <div className="space-y-4 border-t pt-4">
                      {/* Items List */}
                      <div>
                        <h5 className="font-medium mb-2">Order Items</h5>
                        <div className="space-y-2">
                          {delivery.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">({item.quantity})</span>
                              </div>
                              <span className="font-semibold">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {delivery.specialInstructions && (
                        <div>
                          <h5 className="font-medium mb-2">Special Instructions</h5>
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border-l-4 border-blue-500">
                            <p className="text-sm">{delivery.specialInstructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">Call Customer</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      <span className="hidden sm:inline">Navigate</span>
                    </Button>
                    <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90 flex-1 sm:flex-none">
                      Start Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Optimization */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-accent" />
            Route Optimization
          </CardTitle>
          <CardDescription>Optimized delivery sequence for efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">7.8 km</div>
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">1h 45m</div>
              <p className="text-sm text-muted-foreground">Est. Duration</p>
            </div>
            <div className="text-center">  
              <div className="text-2xl font-bold text-secondary">₹2,595</div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}