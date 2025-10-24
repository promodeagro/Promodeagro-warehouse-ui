import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AddItemsDialog from "@/components/AddItemsDialog";
import { getIncomeAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

interface InvoiceItem {
  id: string;
  name: string;
  image?: string; // optional emoji/image
  quantity: number;
  rate: number;
  amount: number;
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showAddItemsDialog, setShowAddItemsDialog] = useState(false);
  const [status, setStatus] = useState("");
  const [incomeAccount, setIncomeAccount] = useState("4010");
  const [paymentAccount, setPaymentAccount] = useState("1010");
  const [notes, setNotes] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  

  const handleStatusChange = (value: string) => {
    setStatus(value);
    if (value === "paid") {
      setPaymentAccount("1010"); // Cash in Hand
    } else if (value === "pending") {
      setPaymentAccount("1100"); // Accounts Receivable
    }
  };

  const handleAddItems = (selectedItems: any[]) => {
    const newItems = selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.imageUrl, // preserve item image if provided
      quantity: 1,
      rate: item.sellingPrice,
      amount: item.sellingPrice,
    }));
    
    // Filter out items that are already in the invoice to avoid duplicates
    const existingItemIds = new Set(items.map(item => item.id));
    const newUniqueItems = newItems.filter(item => !existingItemIds.has(item.id));
    
    setItems([...items, ...newUniqueItems]);
    
    // Update selected item IDs with all current items
    const allItemIds = new Set([...items, ...newUniqueItems].map(item => item.id));
    setSelectedItemIds(allItemIds);
  };

  const removeItem = (index: number) => {
    const itemToRemove = items[index];
    setItems(items.filter((_, i) => i !== index));
    
    // Remove from selected item IDs
    const newSelectedIds = new Set(selectedItemIds);
    newSelectedIds.delete(itemToRemove.id);
    setSelectedItemIds(newSelectedIds);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "quantity") {
      newItems[index].quantity = value;
      newItems[index].amount = value * newItems[index].rate;
    } else if (field === "rate") {
      newItems[index].rate = value;
      newItems[index].amount = newItems[index].quantity * value;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const customer = (formData.get("customer") as string) || "";
    const invoiceDate = (formData.get("invoiceDate") as string) || "";
    const dueDate = (formData.get("dueDate") as string) || "";
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount;
    const cogsAmount = totalAmount * 0.6; // Assuming 60% COGS ratio
    
    // Validate required fields
    if (!customer || !invoiceDate) {
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
        description: "Please add at least one item to the invoice.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate unique sequential ID
    try {
      const stored = localStorage.getItem("invoices");
      const list = stored ? JSON.parse(stored) : [];
      const seededIds = ["INV-001", "INV-002", "INV-003"];
      const allIds = [...list.map((r: any) => r.id), ...seededIds];
      const maxNum = allIds.reduce((max, id) => {
        const num = parseInt(String(id).split("-")[1]);
        return Number.isFinite(num) ? Math.max(max, num) : max;
      }, 0);
      const nextIndex = maxNum + 1;
      const id = `INV-${String(nextIndex).padStart(3, "0")}`;
      
      // Create complete invoice record
      const newInvoice = {
        id,
        customer,
        invoiceDate,
        dueDate,
        status,
        paymentMode: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "",
        paymentAccount,
        incomeAccount,
        itemsCount: items.length,
        subtotal,
        discountAmount,
        totalAmount,
        items,
        notes,
        cogsAmount,
        discountPercentage,
      };
      
      // Save to localStorage
      localStorage.setItem("invoices", JSON.stringify([newInvoice, ...list]));
      
      // Create journal entries
      const jeStored = localStorage.getItem("journalEntries");
      const jeList = jeStored ? JSON.parse(jeStored) : [];
      
      // Journal Entry 1: Record Sale
      const je1 = {
        id: `JE-${Date.now()}-1`,
        date: invoiceDate,
        description: "Record sale",
        reference: id,
        status: "posted",
        lines: [
          { account: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name, debit: totalAmount, credit: 0 },
          { account: getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name, debit: 0, credit: totalAmount },
        ]
      };
      
      // Journal Entry 2: Record COGS
      const je2 = {
        id: `JE-${Date.now()}-2`,
        date: invoiceDate,
        description: "Record COGS",
        reference: id,
        status: "posted",
        lines: [
          { account: "Cost of Goods Sold", debit: cogsAmount, credit: 0 },
          { account: "Inventory", debit: 0, credit: cogsAmount },
        ]
      };
      
      localStorage.setItem("journalEntries", JSON.stringify([je1, je2, ...jeList]));
      
    } catch (error) {
      console.error("Error saving invoice:", error);
    }

    toast({
      title: "Invoice Created",
      description: "New invoice has been created successfully with accounting entries.",
    });
    
    navigate("/accounts/sales");
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/sales")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground">Create a new sales invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" name="customer" placeholder="Enter customer name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input id="invoiceDate" name="invoiceDate" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
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
              <div className="space-y-2">
                <Label htmlFor="incomeAccount">Income Account</Label>
                <Select value={incomeAccount} onValueChange={setIncomeAccount}>
                  <SelectTrigger disabled>
                    <SelectValue placeholder="Select income account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getIncomeAccounts().map((account) => (
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
                <Label>Invoice Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddItemsDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Item Name</th>
                        <th className="text-left p-3 font-medium w-24">Qty</th>
                        <th className="text-left p-3 font-medium w-32">Rate</th>
                        <th className="text-left p-3 font-medium w-32">Amount</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">
                            <span className="font-medium flex items-center gap-2">
                              {item.image ? <span className="text-xl leading-none">{item.image}</span> : null}
                              {item.name}
                            </span>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                              min="1"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Input value={`₹${item.amount.toFixed(2)}`} disabled />
                          </td>
                          <td className="p-2">
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
                      <tr>
                        <td colSpan={3} className="p-3 text-right">Subtotal:</td>
                        <td className="p-3">₹{subtotal.toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right">Discount (%):</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-20 h-8 text-sm"
                            placeholder="0"
                          />
                        </td>
                        <td></td>
                      </tr>
                      {discountPercentage > 0 && (
                        <tr>
                          <td colSpan={3} className="p-3 text-right">Discount Amount:</td>
                          <td className="p-3 text-red-600">-₹{discountAmount.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      )}
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
                  No items added. Click "Add Item" to add items to the invoice.
                </div>
              )}
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Add any notes for this invoice..." />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/sales")}>
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <AddItemsDialog
        open={showAddItemsDialog}
        onOpenChange={setShowAddItemsDialog}
        onAddItems={handleAddItems}
        selectedItems={selectedItemIds}
      />
    </div>
  );
}