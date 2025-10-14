import { useState } from "react";
import { Camera, QrCode, Package, Scale, Thermometer, Upload, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StockReceiving() {
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  
  const productTypes = [
    "Tomatoes", "Onions", "Potatoes", "Spinach", "Coriander", "Carrots", 
    "Cauliflower", "Cabbage", "Bananas", "Apples", "Oranges", "Lemons"
  ];

  const freshnessGrades = [
    { value: "excellent", label: "Excellent", color: "bg-green-500" },
    { value: "very-good", label: "Very Good", color: "bg-green-400" },
    { value: "good", label: "Good", color: "bg-yellow-500" },
    { value: "fair", label: "Fair", color: "bg-orange-500" },
    { value: "poor", label: "Poor", color: "bg-red-500" }
  ];

  const [formData, setFormData] = useState({
    weight: "",
    temperature: "",
    freshness: "",
    supplier: "",
    batchId: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle stock receiving submission
    console.log("Stock received:", formData);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Stock Receiving
          </CardTitle>
          <CardDescription>
            Scan or manually enter product details for incoming stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Scan Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
            </Button>
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {/* Camera Scan Mode */}
          {scanMode === "camera" && (
            <Card className="mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Camera View</h3>
                    <p className="text-sm text-muted-foreground">
                      Position QR code or barcode in the frame
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      Switch Camera
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Selection */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Product Type</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((product) => (
                      <SelectItem key={product} value={product.toLowerCase()}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="0.00"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="0.0"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input
                  id="batchId"
                  placeholder="TB-001"
                  value={formData.batchId}
                  onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                />
              </div>
            </div>

            {/* Freshness Grade */}
            <div className="space-y-2">
              <Label>Freshness Grade</Label>
              <div className="grid grid-cols-5 gap-2">
                {freshnessGrades.map((grade) => (
                  <Button
                    key={grade.value}
                    type="button"
                    variant={formData.freshness === grade.value ? "default" : "outline"}
                    className="flex flex-col h-16 p-2"
                    onClick={() => setFormData({...formData, freshness: grade.value})}
                  >
                    <div className={`w-4 h-4 rounded-full ${grade.color} mb-1`} />
                    <span className="text-xs">{grade.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Quality Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional quality observations..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {/* Photo Upload */}
            <Card className="border-dashed border-2">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Upload Quality Photos</h4>
                    <p className="text-sm text-muted-foreground">
                      Take photos of the received stock for quality records
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      Upload Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Receipt
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Receipts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Stock Receipts</CardTitle>
          <CardDescription>Latest items received today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "10:30", product: "Tomatoes", weight: "150kg", grade: "Excellent", supplier: "Green Farm" },
              { time: "09:45", product: "Spinach", weight: "80kg", grade: "Very Good", supplier: "Organic Valley" },
              { time: "09:15", product: "Onions", weight: "200kg", grade: "Good", supplier: "Local Co-op" }
            ].map((receipt, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{receipt.time}</Badge>
                  <div>
                    <p className="font-medium">{receipt.product}</p>
                    <p className="text-sm text-muted-foreground">{receipt.supplier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{receipt.weight}</Badge>
                  <Badge className="bg-green-500/10 text-green-500">{receipt.grade}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}