import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AddItemsDialog from "@/components/AddItemsDialog";
import { getPaymentMethodAccounts } from "@/lib/accounts";

interface PurchaseItem {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  category: string;
  subCategory: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function EditPurchaseOrder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [poId, setPoId] = useState("");
  const [vendor, setVendor] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("2010");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchase = () => {
      try {
        if (!id) return;

        const stored = localStorage.getItem("purchases");
        const list = stored ? JSON.parse(stored) : [];
        const found = list.find((p: any) => p.id === id);

        if (found) {
          setPoId(found.poId || "");
          setVendor(found.vendor || "");
          setOrderDate(found.date || "");
          setDueDate(found.dueDate || "");
          setPaymentStatus(found.status || "");
          setPaymentAccount(found.paymentAccount || "2010");
          setNotes(found.notes || "");
          setItems(found.items || []);
          setSelectedItemIds(new Set((found.items || []).map((item: any) => item.id)));
          setUploadedImages(found.uploadedImages || []);
        } else {
          // Fallback to seed data
          setPoId("PO-003");
          setVendor("Green Farm Co.");
          setOrderDate("2025-10-05");
          setDueDate("2025-10-20");
          setPaymentStatus("pending");
          setPaymentAccount("2010");
          setNotes("");
          setItems([
            { id: "1", name: "Organic Tomatoes", quantity: 15, rate: 40, amount: 600, image: "🍅", imageUrl: "🍅", category: "Vegetables", subCategory: "Fresh", unit: "kg" },
            { id: "5", name: "Fresh Cucumbers", quantity: 8, rate: 30, amount: 240, image: "🥒", imageUrl: "🥒", category: "Vegetables", subCategory: "Fresh", unit: "kg" },
          ]);
          setSelectedItemIds(new Set(["1", "5"]));
        }
      } catch (error) {
        console.error("Error loading purchase:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPurchase();
  }, [id]);

  const handleAddItems = (newItems: any[]) => {
    const purchaseItems = newItems.map(item => ({
      id: item.id,
      name: item.name,
      image: item.imageUrl,
      imageUrl: item.imageUrl,
      category: item.category,
      subCategory: item.subCategory,
      unit: item.unit,
      quantity: 1,
      rate: item.sellingPrice,
      amount: item.sellingPrice
    }));
    setItems([...items, ...purchaseItems]);
    setSelectedItemIds(new Set([...selectedItemIds, ...newItems.map(item => item.id)]));
  };

  const removeItem = (index: number) => {
    const itemToRemove = items[index];
    setItems(items.filter((_, i) => i !== index));
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemToRemove.id);
      return newSet;
    });
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: URL.createObjectURL(file)
      }));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!vendor || !orderDate || !paymentStatus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update purchase in localStorage
      const stored = localStorage.getItem("purchases");
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = list.map((purchase: any) =>
        purchase.id === id
          ? {
              ...purchase,
              poId,
              vendor,
              date: orderDate,
              dueDate,
              status: paymentStatus,
              paymentAccount,
              paymentMode: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "",
              subtotal: totalAmount, // Since we removed discount, subtotal = totalAmount
              discountPercentage: 0,
              discountAmount: 0,
              totalAmount,
              items,
              notes,
              uploadedImages,
            }
          : purchase
      );
      localStorage.setItem("purchases", JSON.stringify(updatedList));

      // Update journal entries
      const jeStored = localStorage.getItem("journalEntries");
      const jeList = jeStored ? JSON.parse(jeStored) : [];
      
      // Remove old journal entries for this purchase
      const filteredJeList = jeList.filter((je: any) => je.reference !== id);
      
      // Get the original purchase to check if status changed
      const originalPurchase = list.find((p: any) => p.id === id);
      const statusChanged = originalPurchase && originalPurchase.status !== paymentStatus;
      
      // Create new journal entry
      const je1 = {
        id: `JE-${Date.now()}-1`,
        date: orderDate,
        description: "Record inventory purchase",
        reference: id,
        status: "posted",
        lines: [
          { account: "Inventory", debit: totalAmount, credit: 0 },
          { account: paymentStatus === "paid" 
            ? getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "Cash in Hand"
            : "Accounts Payable", 
            debit: 0, 
            credit: totalAmount 
          },
        ]
      };
      
      // If status changed from pending to paid, create additional journal entry
      let newJournalEntries = [je1];
      if (statusChanged && originalPurchase.status === "pending" && paymentStatus === "paid") {
        const je2 = {
          id: `JE-${Date.now()}-2`,
          date: orderDate,
          description: "Payment made for purchase",
          reference: id,
          status: "posted",
          lines: [
            { account: "Accounts Payable", debit: totalAmount, credit: 0 },
            { account: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "Cash in Hand", debit: 0, credit: totalAmount },
          ]
        };
        newJournalEntries = [je1, je2];
      }
      
      localStorage.setItem("journalEntries", JSON.stringify([...newJournalEntries, ...filteredJeList]));

      toast({
        title: "Purchase Order Updated",
        description: "Purchase order has been updated successfully.",
      });
      navigate(`/accounts/purchases/${id}`);
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast({
        title: "Error",
        description: "Failed to update purchase order.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/purchases/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Purchase Order {id}</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/purchases/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Purchase Order {id}</h1>
          <p className="text-muted-foreground">Update purchase order details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="poId">Purchase Order ID</Label>
                <Input 
                  id="poId" 
                  value={poId}
                  onChange={(e) => setPoId(e.target.value)}
                  placeholder="PO ID"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name</Label>
                <Input 
                  id="vendor" 
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input 
                  id="orderDate" 
                  type="date" 
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAccount">Payment Account</Label>
                <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPaymentMethodAccounts().map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Purchase Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowItemDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Items
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Item Name</th>
                        <th className="text-left p-3 font-medium w-32">Quantity</th>
                        <th className="text-left p-3 font-medium w-32">Rate</th>
                        <th className="text-left p-3 font-medium w-32">Amount</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {(item.image || item.imageUrl) && <span className="text-2xl">{item.image || item.imageUrl}</span>}
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                              min="1"
                              className="w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-24"
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
                          </td>
                          <td className="p-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr className="border-t">
                        <td colSpan={3} className="p-3 text-right font-bold">Total:</td>
                        <td className="p-3 font-bold">₹{totalAmount.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  No items added. Click "Add Items" to add items to the purchase.
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Attach Images (Optional)</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="imageUpload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Images
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Upload receipts, invoices, or product images
                  </span>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={image.data}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={4} 
                placeholder="Add any notes for this purchase..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/accounts/purchases/${id}`)}>
                Cancel
              </Button>
              <Button type="submit">Update Purchase Order</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <AddItemsDialog
        open={showItemDialog}
        onOpenChange={setShowItemDialog}
        onAddItems={handleAddItems}
        selectedItems={selectedItemIds}
      />
    </div>
  );
}