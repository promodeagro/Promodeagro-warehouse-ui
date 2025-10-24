import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getExpenseAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function NewExpense() {
  const navigate = useNavigate();
  const [expenseAccount, setExpenseAccount] = useState("5100");
  const [paymentAccount, setPaymentAccount] = useState("1010");
  const [status, setStatus] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!status) {
      toast({
        title: "Error",
        description: "Please select a payment status.",
        variant: "destructive"
      });
      return;
    }
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const vendor = (formData.get("vendor") as string) || "";
    const date = (formData.get("date") as string) || "";
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const description = (formData.get("description") as string) || "";
    
    if (!vendor || !date || amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Generate unique ID
      const id = `EXP-${Date.now()}`;
      
      // Create expense record
      const newExpense = {
        id,
        expenseAccount,
        vendor,
        date,
        amount,
        status,
        paymentAccount,
        description,
        uploadedImages: uploadedImages.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          data: URL.createObjectURL(file)
        })),
      };
      
      // Save to localStorage
      const stored = localStorage.getItem("expenses");
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem("expenses", JSON.stringify([newExpense, ...list]));
      
      // Create journal entries
      const jeStored = localStorage.getItem("journalEntries");
      const jeList = jeStored ? JSON.parse(jeStored) : [];
      
      // Journal Entry: Record Expense
      const je = {
        id: `JE-${Date.now()}`,
        date,
        description: `Expense: ${description}`,
        reference: id,
        status: "posted",
        lines: [
          { 
            account: getExpenseAccounts().find(acc => acc.code === expenseAccount)?.name || "Expense", 
            debit: amount, 
            credit: 0 
          },
          { 
            account: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "Cash in Hand", 
            debit: 0, 
            credit: amount 
          },
        ]
      };
      
      localStorage.setItem("journalEntries", JSON.stringify([je, ...jeList]));
      
      toast({
        title: "Expense Added",
        description: "New expense has been recorded successfully with accounting entries.",
      });
      navigate("/accounts/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: "Failed to save expense.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/expenses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Expense</h1>
          <p className="text-muted-foreground">Record a new business expense</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expenseAccount">Expense Account</Label>
                <Select value={expenseAccount} onValueChange={setExpenseAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getExpenseAccounts().map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Payee</Label>
                <Input id="vendor" name="vendor" placeholder="Enter vendor name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  required 
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select value={status} onValueChange={(value) => {
                  setStatus(value);
                  // Auto-select payment account based on status
                  if (value === "pending") {
                    setPaymentAccount("2010"); // Accounts Payable
                  } else if (value === "paid") {
                    setPaymentAccount("1010"); // Cash in Hand
                  }
                }}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="Enter expense description..." rows={4} />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Attach Images (Optional)</Label>
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
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
                <span className="text-sm text-muted-foreground">
                  Upload receipts, invoices, or product images.
                </span>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white text-xs opacity-0 group-hover:opacity-100 text-center px-2">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/expenses")}>
                Cancel
              </Button>
              <Button type="submit">Add Expense</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}