import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { getPaymentMethodAccounts, getIncomeAccounts } from "@/lib/accounts";

export default function EditInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State for form data
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentAccount, setPaymentAccount] = useState("1100");
  const [incomeAccount] = useState("4010");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Load invoice data on mount
  useEffect(() => {
    const loadInvoice = () => {
      try {
        if (!id) return;
        
        const stored = localStorage.getItem("invoices");
        const list = stored ? JSON.parse(stored) : [];
        const found = list.find((r: any) => r.id === id);
        
        if (found) {
          setCustomer(found.customer || "");
          setInvoiceDate(found.invoiceDate || "");
          setDueDate(found.dueDate || "");
          setPaymentStatus(found.status || "pending");
          setPaymentAccount(found.paymentAccount || "1100");
          setNotes(found.notes || "");
          setItems(found.items || []);
          setDiscountPercentage(found.discountPercentage || 0);
        } else {
          // Fallback to seed data
          if (id === "INV-001") {
            setCustomer("Rajesh Kumar");
            setInvoiceDate("2025-10-06");
            setDueDate("2025-10-20");
            setPaymentStatus("paid");
            setPaymentAccount("1010");
            setNotes("Urgent delivery.");
            setItems([
              { name: "Tomato", image: "🍅", quantity: 5, rate: 80, amount: 400 },
              { name: "Fresh Spinach", image: "🥬", quantity: 2, rate: 60, amount: 120 },
              { name: "Carrots", image: "🥕", quantity: 3, rate: 50, amount: 150 },
            ]);
            setDiscountPercentage(0);
          } else if (id === "INV-002") {
            setCustomer("Priya Sharma");
            setInvoiceDate("2025-10-06");
            setDueDate("2025-10-20");
            setPaymentStatus("pending");
            setPaymentAccount("1100");
            setNotes("");
            setItems([]);
            setDiscountPercentage(0);
          } else if (id === "INV-003") {
            setCustomer("Amit Patel");
            setInvoiceDate("2025-10-05");
            setDueDate("2025-10-19");
            setPaymentStatus("paid");
            setPaymentAccount("1020");
            setNotes("");
            setItems([]);
            setDiscountPercentage(0);
          }
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  const addItem = () => {
    setItems([...items, { name: "", image: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAmount = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount;
    const cogsAmount = totalAmount * 0.6;

    try {
      // Update invoice in localStorage
      const stored = localStorage.getItem("invoices");
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = list.map((inv: any) => 
        inv.id === id 
          ? {
              ...inv,
              customer,
              invoiceDate,
              dueDate,
              status: paymentStatus,
              paymentAccount,
              paymentMode: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "",
              subtotal,
              discountAmount,
              totalAmount,
              items,
              notes,
              cogsAmount,
              discountPercentage,
            }
          : inv
      );
      localStorage.setItem("invoices", JSON.stringify(updatedList));

      // Update journal entries
      const jeStored = localStorage.getItem("journalEntries");
      const jeList = jeStored ? JSON.parse(jeStored) : [];
      
      // Remove old journal entries for this invoice
      const filteredJeList = jeList.filter((e: any) => e.reference !== id);
      
      // Create new journal entries
      const je1 = {
        id: `JE-${Date.now()}-1`,
        date: invoiceDate,
        description: "Record sale (updated)",
        reference: id,
        status: "posted",
        lines: [
          { account: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name, debit: totalAmount, credit: 0 },
          { account: getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name, debit: 0, credit: totalAmount },
        ]
      };
      
      const je2 = {
        id: `JE-${Date.now()}-2`,
        date: invoiceDate,
        description: "Record COGS (updated)",
        reference: id,
        status: "posted",
        lines: [
          { account: "Cost of Goods Sold", debit: cogsAmount, credit: 0 },
          { account: "Inventory", debit: 0, credit: cogsAmount },
        ]
      };
      
      localStorage.setItem("journalEntries", JSON.stringify([je1, je2, ...filteredJeList]));

      toast({
        title: "Invoice Updated",
        description: "Invoice has been updated successfully.",
      });
      navigate(`/accounts/sales/${id}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setPaymentStatus(value);
    if (value === "paid") {
      setPaymentAccount("1010"); // Cash in Hand
    } else if (value === "pending") {
      setPaymentAccount("1100"); // Accounts Receivable
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/sales/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Invoice {id}</h1>
            <p className="text-muted-foreground">Loading invoice details...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/sales/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Invoice {id}</h1>
          <p className="text-muted-foreground">Update invoice details</p>
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
                <Input 
                  id="customer" 
                  name="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input 
                  id="invoiceDate" 
                  name="invoiceDate"
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate"
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={handleStatusChange}>
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
                <Label htmlFor="incomeAccount">Income Account</Label>
                <Input value="Direct Sales (4010)" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
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
                <Label>Invoice Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Item</th>
                      <th className="text-left p-3 font-medium w-24">Qty</th>
                      <th className="text-left p-3 font-medium w-32">Rate</th>
                      <th className="text-left p-3 font-medium w-32">Amount</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {(item.image || item.imageUrl) ? <span className="text-xl leading-none">{item.image || item.imageUrl}</span> : null}
                            {item.name && item.name.trim() !== "" ? (
                              <span className="font-medium">{item.name}</span>
                            ) : (
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                placeholder="Item name"
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                            min="1"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input value={`₹${item.amount.toFixed(2)}`} disabled />
                        </td>
                        <td className="p-2">
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
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
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/accounts/sales/${id}`)}>
                Cancel
              </Button>
              <Button type="submit">Update Invoice</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}