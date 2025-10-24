import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getAccountByCode } from "@/lib/accounts";

export default function NewCartSale() {
  const navigate = useNavigate();
  const [cashAccount, setCashAccount] = useState("1010"); // Cash in Hand
  const [upiAccount, setUpiAccount] = useState("1040"); // UPI Receivables
  const [receivableAccount, setReceivableAccount] = useState("1100"); // Accounts Receivable
  const [salesAccount, setSalesAccount] = useState("4020"); // Sales - Cart
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
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const date = (formData.get("date") as string) || "";
    const totalSales = parseFloat(formData.get("totalSales") as string) || 0;
    const cashAmount = parseFloat(formData.get("cash") as string) || 0;
    const upiAmount = parseFloat(formData.get("upi") as string) || 0;
    const pendingAmount = parseFloat(formData.get("pending") as string) || 0;
    const notes = (formData.get("notes") as string) || "";
    
    // Validate that amounts add up to total sales
    const calculatedTotal = cashAmount + upiAmount + pendingAmount;
    if (Math.abs(calculatedTotal - totalSales) > 0.01) {
      toast({
        title: "Error",
        description: "Cash + UPI + Pending amounts must equal Total Sales amount.",
        variant: "destructive"
      });
      return;
    }
    
    // Persist Cart Sale in localStorage (temporary memory)
    try {
      const stored = localStorage.getItem("cartSales");
      const list = stored ? JSON.parse(stored) : [];
      // Ensure unique sequential ID by considering seeded IDs as well
      const seededIds = ["CS-001", "CS-002"]; // keep in sync with seed data in CartSales
      const allIds: string[] = [...list.map((r: any) => r.id), ...seededIds];
      const maxNum = allIds.reduce((max, id) => {
        const num = parseInt(String(id).split("-")[1]);
        return Number.isFinite(num) ? Math.max(max, num) : max;
      }, 0);
      const nextIndex = maxNum + 1;
      const id = `CS-${String(nextIndex).padStart(3, "0")}`;
      const record = {
        id,
        date,
        totalSales,
        cash: cashAmount,
        upi: upiAmount,
        pending: pendingAmount,
        notes,
        uploadedImages: uploadedImages.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          // Convert to base64 for storage
          data: URL.createObjectURL(file)
        })),
      };
      localStorage.setItem("cartSales", JSON.stringify([record, ...list]));

      // Create related Journal Entry and persist
      const jeStored = localStorage.getItem("journalEntries");
      const jeList = jeStored ? JSON.parse(jeStored) : [];
      const jeId = `JE-${Date.now()}`;
      const lines: any[] = [];
      if (cashAmount > 0) lines.push({ account: getAccountByCode(cashAccount)?.name, debit: cashAmount, credit: 0 });
      if (upiAmount > 0) lines.push({ account: getAccountByCode(upiAccount)?.name, debit: upiAmount, credit: 0 });
      if (pendingAmount > 0) lines.push({ account: getAccountByCode(receivableAccount)?.name, debit: pendingAmount, credit: 0 });
      lines.push({ account: getAccountByCode(salesAccount)?.name, debit: 0, credit: totalSales });
      const je = {
        id: jeId,
        date,
        description: "Cart sale recorded",
        reference: id,
        status: "posted",
        lines,
      };
      localStorage.setItem("journalEntries", JSON.stringify([je, ...jeList]));
    } catch (_) {}
    
    toast({
      title: "Cart Sale Recorded",
      description: "New cart sale has been recorded successfully with accounting entries.",
    });
    navigate("/accounts/cart-sales");
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/cart-sales")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Record Cart Sale</h1>
          <p className="text-muted-foreground">Add a new cart sales record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Cart Sale Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSales">Total Sales (₹)</Label>
                <Input id="totalSales" name="totalSales" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash">Cash (₹)</Label>
                <Input id="cash" name="cash" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi">UPI Amount (₹)</Label>
                <Input id="upi" name="upi" type="number" min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending">Pending Amount to Receive (₹)</Label>
                <Input id="pending" name="pending" type="number" min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesAccount">Sales Account</Label>
                <Select value={salesAccount} onValueChange={setSalesAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4020">Sales - Cart (₹30,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Account Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cashAccount">Cash Account</Label>
                  <Select value={cashAccount} onValueChange={setCashAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cash account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1010">Cash in Hand (₹45,000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiAccount">UPI Account</Label>
                  <Select value={upiAccount} onValueChange={setUpiAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select UPI account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1040">UPI Receivables (₹8,500)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivableAccount">Receivable Account</Label>
                  <Select value={receivableAccount} onValueChange={setReceivableAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select receivable account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1100">Accounts Receivable (₹15,430)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Add any notes about this cart sale..." rows={4} />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/cart-sales")}>
                Cancel
              </Button>
              <Button type="submit">Record Sale</Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="mt-6">
          <CardContent className="space-y-4 p-6">
            <Label>Attach Images (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="cartSaleImageUpload"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cartSaleImageUpload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
                <span className="text-sm text-muted-foreground">Upload receipts, invoices, or product images</span>
              </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
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
                      <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}