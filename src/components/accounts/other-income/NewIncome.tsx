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
import { getIncomeAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function NewIncome() {
  const navigate = useNavigate();
  const [incomeAccount, setIncomeAccount] = useState("4100");
  const [paymentAccount, setPaymentAccount] = useState("1010");
  const [status, setStatus] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
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
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const description = formData.get("description") as string || "";
    const date = formData.get("date") as string || "";
    
    if (!amount || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Generate unique ID
    const id = `OI-${Date.now()}`;
    
    // Create new income record
    const newIncome = {
      id,
      incomeAccount,
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
      }))
    };

    // Save to localStorage
    try {
      const existingIncomes = JSON.parse(localStorage.getItem("otherIncomes") || "[]");
      existingIncomes.push(newIncome);
      localStorage.setItem("otherIncomes", JSON.stringify(existingIncomes));
    } catch (error) {
      console.error("Error saving income:", error);
    }

    // Create journal entry (normalized)
    const journalEntry = {
      id: `JE-${Date.now()}`,
      date,
      description: `Other Income: ${getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name || "Other Income"}`,
      reference: id,
      status: "posted",
      lines: [
        {
          account: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "Cash in Hand",
          debit: amount,
          credit: 0
        },
        {
          account: getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name || "Income",
          debit: 0,
          credit: amount
        }
      ]
    };

    // Save journal entry
    try {
      const existingEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      localStorage.setItem("journalEntries", JSON.stringify([journalEntry, ...existingEntries]));
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
    
    toast({ 
      title: "Success!", 
      description: "Income successfully added with accounting entries.",
    });
    navigate("/accounts/other-income");
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/other-income")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Other Income</h1>
          <p className="text-muted-foreground">Record miscellaneous income</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Income Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="incomeAccount">Income Account</Label>
                <Select value={incomeAccount} onValueChange={setIncomeAccount}>
                  <SelectTrigger>
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
                    setPaymentAccount("1100"); // Accounts Receivable
                  } else if (value === "received") {
                    setPaymentAccount("1010"); // Cash in Hand
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
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
              <Textarea id="description" name="description" rows={4} />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Attach Images (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
                <p className="text-sm text-muted-foreground">
                  Upload receipts, invoices, or supporting documents
                </p>
              </div>
              
              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/other-income")}>Cancel</Button>
              <Button type="submit">Add Income</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}