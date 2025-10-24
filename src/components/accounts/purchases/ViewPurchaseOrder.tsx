import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";

export default function ViewPurchaseOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Load purchase order from localStorage with fallback to seed data
  const purchaseOrder = useMemo(() => {
    try {
      const stored = localStorage.getItem("purchases");
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((p: any) => p.id === id);
      
      if (found) {
        return found;
      }
    } catch (error) {
      console.error("Error loading purchase:", error);
    }

    // Fallback to seed data
    return {
      id: id || "PO-001",
      poId: "PO-003",
      vendor: "Green Farm Co.",
      date: "2025-10-05",
      dueDate: "2025-10-20",
      status: "pending",
      paymentMode: "Bank Transfer",
      items: [
        { id: "1", name: "Organic Tomatoes", quantity: 15, rate: 40, amount: 600, image: "🍅", imageUrl: "🍅", category: "Vegetables", subCategory: "Fresh", unit: "kg" },
        { id: "5", name: "Fresh Cucumbers", quantity: 8, rate: 30, amount: 240, image: "🥒", imageUrl: "🥒", category: "Vegetables", subCategory: "Fresh", unit: "kg" },
      ],
      subtotal: 840,
      discountPercentage: 0,
      discountAmount: 0,
      totalAmount: 840,
      notes: "",
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      // Simple print functionality instead of PDF generation
      window.print();
      
      toast({
        title: "Print Ready",
        description: "Purchase order is ready for printing.",
      });
    } catch (error) {
      console.error("Error preparing print:", error);
      toast({
        title: "Error",
        description: "Failed to prepare for printing. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/purchases")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Purchase Order {purchaseOrder.id}</h1>
            <p className="text-muted-foreground">View purchase order details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/accounts/purchases/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div id="purchase-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>Purchase Order Details</CardTitle>
              <Badge variant={purchaseOrder.status === "paid" ? "default" : purchaseOrder.status === "cancelled" ? "destructive" : "secondary"}>
                {purchaseOrder.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Purchase Order ID</p>
                <p className="font-medium">{purchaseOrder.poId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{purchaseOrder.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{purchaseOrder.date}</p>
              </div>
              {purchaseOrder.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{purchaseOrder.dueDate}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Payment Mode</p>
                <p className="font-medium">{purchaseOrder.paymentMode}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Item Name</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Rate</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {(item.image || item.imageUrl) && <span className="text-xl">{item.image || item.imageUrl}</span>}
                            <span className="font-medium">{item.name || item.description}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.rate}</td>
                        <td className="p-3 text-right font-medium">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {purchaseOrder.notes && (
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {purchaseOrder.notes}
                </p>
              </div>
            )}

            {purchaseOrder.uploadedImages && purchaseOrder.uploadedImages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Attached Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {purchaseOrder.uploadedImages.map((image: any, index: number) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={image.data}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{purchaseOrder.subtotal || purchaseOrder.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0).toFixed(2)}</span>
            </div>
            {purchaseOrder.discountPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount ({purchaseOrder.discountPercentage}%)</span>
                <span className="font-medium text-red-600">-₹{purchaseOrder.discountAmount || ((purchaseOrder.subtotal || purchaseOrder.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)) * purchaseOrder.discountPercentage / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">₹0</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg">₹{purchaseOrder.totalAmount || purchaseOrder.total || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}