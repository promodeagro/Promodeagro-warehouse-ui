import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAccountByCode } from "@/lib/accounts";

export default function ViewCartSale() {
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
    if (saleId === "CS-002") return { date: "2025-09-29", totalSales: 11200, cash: 7500, upi: 2900, pending: 800, notes: "", status: "received" };
    if (saleId === "CS-001") return { date: "2025-10-06", totalSales: 12450, cash: 8000, upi: 3450, pending: 1000, notes: "Good turnout today, sold all organic vegetables quickly.", status: "received" };
    return { date: "", totalSales: 0, cash: 0, upi: 0, pending: 0, notes: "", status: "received" };
  };

  const data = loadById(id);

  const salesAccount = "4020"; // Sales - Cart
  const cashAccount = "1010"; // Cash in Hand
  const upiAccount = "1040"; // UPI Receivables
  const receivableAccount = "1100"; // Accounts Receivable
  const status = data.status === "cancelled" ? "cancelled" : (data.pending > 0 ? "pending" : "received");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/cart-sales")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cart Sale {id}</h1>
            <p className="text-muted-foreground">View cart sale details</p>
          </div>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate(`/accounts/cart-sales/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => {
                if (!id) return;
                if (!confirm(`Cancel ${id}? This will reverse the accounting entries to show no sale occurred.`)) return;
                try {
                  // Update cart sale status to cancelled
                  const stored = localStorage.getItem("cartSales");
                  const list = stored ? JSON.parse(stored) : [];
                  const updated = list.map((r: any) => 
                    r.id === id ? { ...r, status: "cancelled" } : r
                  );
                  localStorage.setItem("cartSales", JSON.stringify(updated));

                  // Create reversal journal entries
                  const jeStored = localStorage.getItem("journalEntries");
                  const jeList = jeStored ? JSON.parse(jeStored) : [];
                  
                  // Find original journal entries for this cart sale
                  const originalEntries = jeList.filter((e: any) => e.reference === id);
                  
                  // Create reversal entries (opposite of original)
                  const reversalEntries = originalEntries.map((entry: any) => ({
                    id: `JE-${Date.now()}-REV-${entry.id}`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Reversal - ${entry.description}`,
                    reference: id,
                    status: "posted",
                    lines: entry.lines.map((line: any) => ({
                      account: line.account,
                      debit: line.credit, // Swap debit and credit
                      credit: line.debit
                    }))
                  }));
                  
                  // Add reversal entries to journal
                  localStorage.setItem("journalEntries", JSON.stringify([...reversalEntries, ...jeList]));
                  
                  window.history.back();
                } catch (_) {}
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Sale
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{data.date}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge className={
                status === "cancelled" ? "bg-red-500 text-white" : 
                status === "pending" ? "bg-amber-500 text-white" : 
                "bg-emerald-600 text-white"
              }>
                {status === "cancelled" ? "Cancelled" : status === "pending" ? "Pending" : "Received"}
              </Badge>
            </div>
            {data.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{data.notes}</p>
              </div>
            )}
            {data.uploadedImages && data.uploadedImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Uploaded Images</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.uploadedImages.map((image: any, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.data}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white text-xs opacity-0 group-hover:opacity-100 text-center px-2">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">₹{data.totalSales.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash</p>
              <p className="text-xl font-semibold text-emerald-600">₹{data.cash.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">UPI Amount</p>
              <p className="text-xl font-semibold text-blue-600">₹{data.upi.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-xl font-semibold text-amber-600">₹{data.pending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Mapping</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sales Account</p>
            <p className="font-semibold">{getAccountByCode(salesAccount)?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cash Account</p>
            <p className="font-semibold">{getAccountByCode(cashAccount)?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">UPI Account</p>
            <p className="font-semibold">{getAccountByCode(upiAccount)?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Receivable Account</p>
            <p className="font-semibold">{getAccountByCode(receivableAccount)?.name}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}