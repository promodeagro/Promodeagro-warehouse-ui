import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getAccountByCode } from "@/lib/accounts";

export default function EditCartSale() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Load from localStorage first, fallback to seed data by ID
  const loadById = (saleId: string | undefined) => {
    try {
      if (!saleId) return null;
      const stored = localStorage.getItem("cartSales");
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((r: any) => r.id === saleId);
      if (found) return { ...found };
    } catch (_) {}
    // fallback seeds consistent with CartSales.tsx
    if (saleId === "CS-002") {
      return { date: "2025-09-29", totalSales: 11200, cash: 7500, upi: 2900, pending: 800, notes: "" };
    }
    if (saleId === "CS-001") {
      return { date: "2025-10-06", totalSales: 12450, cash: 8000, upi: 3450, pending: 1000, notes: "Good turnout today, sold all organic vegetables quickly." };
    }
    return { date: "", totalSales: 0, cash: 0, upi: 0, pending: 0, notes: "" };
  };

  const initialSale = loadById(id);

  const [cashAccount, setCashAccount] = useState("1010");
  const [upiAccount, setUpiAccount] = useState("1040");
  const [receivableAccount, setReceivableAccount] = useState("1100");
  const [salesAccount, setSalesAccount] = useState("4020");
  const [uploadedImages, setUploadedImages] = useState<any[]>(initialSale?.uploadedImages || []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      const imageObjects = newImages.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: URL.createObjectURL(file)
      }));
      setUploadedImages(prev => [...prev, ...imageObjects]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const date = (formData.get("date") as string) || "";
    const totalSales = parseFloat((formData.get("totalSales") as string) || "0");
    const cashAmount = parseFloat((formData.get("cash") as string) || "0");
    const upiAmount = parseFloat((formData.get("upi") as string) || "0");
    const pendingAmount = parseFloat((formData.get("pending") as string) || "0");
    const notes = (formData.get("notes") as string) || "";

    const calculatedTotal = cashAmount + upiAmount + pendingAmount;
    if (Math.abs(calculatedTotal - totalSales) > 0.01) {
      toast({
        title: "Error",
        description: "Cash + UPI + Pending amounts must equal Total Sales amount.",
        variant: "destructive",
      });
      return;
    }

    // Log accounting entries (mock) similar to NewCartSale
    if (cashAmount > 0) {
      console.log(`DEBIT: ${cashAccount} (${getAccountByCode(cashAccount)?.name}) - ₹${cashAmount}`);
    }
    if (upiAmount > 0) {
      console.log(`DEBIT: ${upiAccount} (${getAccountByCode(upiAccount)?.name}) - ₹${upiAmount}`);
    }
    if (pendingAmount > 0) {
      console.log(`DEBIT: ${receivableAccount} (${getAccountByCode(receivableAccount)?.name}) - ₹${pendingAmount}`);
    }
    console.log(`CREDIT: ${salesAccount} (${getAccountByCode(salesAccount)?.name}) - ₹${totalSales}`);

    // Persist updates to localStorage cartSales
    try {
      const stored = localStorage.getItem("cartSales");
      const list = stored ? JSON.parse(stored) : [];
      const updated = list.map((r: any) => r.id === id ? { ...r, date, totalSales, cash: cashAmount, upi: upiAmount, pending: pendingAmount, notes, uploadedImages } : r);
      localStorage.setItem("cartSales", JSON.stringify(updated));

      // Update existing journal entry for this sale if present; else create one
      const jeStored = localStorage.getItem("journalEntries");
      let jeList = jeStored ? JSON.parse(jeStored) : [];
      const lines: any[] = [];
      if (cashAmount > 0) lines.push({ account: getAccountByCode(cashAccount)?.name, debit: cashAmount, credit: 0 });
      if (upiAmount > 0) lines.push({ account: getAccountByCode(upiAccount)?.name, debit: upiAmount, credit: 0 });
      if (pendingAmount > 0) lines.push({ account: getAccountByCode(receivableAccount)?.name, debit: pendingAmount, credit: 0 });
      lines.push({ account: getAccountByCode(salesAccount)?.name, debit: 0, credit: totalSales });

      const existingIndex = jeList.findIndex((e: any) => e.reference === id);
      if (existingIndex >= 0) {
        jeList[existingIndex] = { ...jeList[existingIndex], date, description: "Cart sale updated", lines };
      } else {
        const jeId = `JE-${Date.now()}`;
        jeList = [{ id: jeId, date, description: "Cart sale updated", reference: id, status: "posted", lines }, ...jeList];
      }
      localStorage.setItem("journalEntries", JSON.stringify(jeList));
    } catch (_) {}

    toast({
      title: "Cart Sale Updated",
      description: "Cart sale has been updated successfully.",
    });
    navigate(`/accounts/cart-sales/${id}`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/cart-sales/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Cart Sale {id}</h1>
          <p className="text-muted-foreground">Update cart sale details</p>
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
                <Input id="date" name="date" type="date" defaultValue={initialSale.date} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSales">Total Sales (₹)</Label>
                <Input id="totalSales" name="totalSales" type="number" min="0" step="0.01" defaultValue={initialSale.totalSales} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash">Cash (₹)</Label>
                <Input id="cash" name="cash" type="number" min="0" step="0.01" defaultValue={initialSale.cash} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi">UPI Amount (₹)</Label>
                <Input id="upi" name="upi" type="number" min="0" step="0.01" defaultValue={initialSale.upi} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending">Pending Amount to Receive (₹)</Label>
                <Input id="pending" name="pending" type="number" min="0" step="0.01" defaultValue={initialSale.pending} />
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
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.data}
                        alt={image.name}
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
                          {image.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={initialSale.notes} rows={4} />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/accounts/cart-sales/${id}`)}>
                Cancel
              </Button>
              <Button type="submit">Update Sale</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}