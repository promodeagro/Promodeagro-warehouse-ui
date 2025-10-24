import { useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
import { ArrowLeft, Edit, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function ViewInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const printRef = useRef<HTMLDivElement>(null);

  // Load from localStorage first, fallback to seed data
  const loadInvoiceById = (invoiceId: string | undefined) => {
    try {
      if (!invoiceId) return null;
      const stored = localStorage.getItem("invoices");
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((r: any) => r.id === invoiceId);
      if (found) return found;
    } catch (_) {}
    
    // Fallback seed data
    if (invoiceId === "INV-001") {
      return {
        id: "INV-001",
        customer: "Rajesh Kumar",
        invoiceDate: "2025-10-06",
        dueDate: "2025-10-20",
        status: "paid",
        paymentMode: "UPI",
        paymentAccount: "1010",
        incomeAccount: "4010",
        notes: "Urgent delivery.",
        items: [
          { name: "Tomato", image: "🍅", quantity: 5, rate: 80, amount: 400 },
          { name: "Fresh Spinach", image: "🥬", quantity: 2, rate: 60, amount: 120 },
          { name: "Carrots", image: "🥕", quantity: 3, rate: 50, amount: 150 },
        ],
        totalAmount: 670,
        itemsCount: 3,
        source: "manual",
        discountPercentage: 0,
      };
    }
    if (invoiceId === "INV-002") {
      return {
        id: "INV-002",
        customer: "Priya Sharma",
        invoiceDate: "2025-10-06",
        dueDate: "2025-10-20",
        status: "pending",
        paymentMode: "Cash",
        paymentAccount: "1100",
        incomeAccount: "4010",
        notes: "",
        items: [],
        totalAmount: 1250,
        itemsCount: 5,
        source: "ecommerce",
        discountPercentage: 0,
      };
    }
    if (invoiceId === "INV-003") {
      return {
        id: "INV-003",
        customer: "Amit Patel",
        invoiceDate: "2025-10-05",
        dueDate: "2025-10-19",
        status: "paid",
        paymentMode: "Bank Transfer",
        paymentAccount: "1020",
        incomeAccount: "4010",
        notes: "",
        items: [],
        totalAmount: 620,
        itemsCount: 2,
        source: "manual",
        discountPercentage: 0,
      };
    }
    return null;
  };

  const invoice = loadInvoiceById(id);

  // Removed mark-as-paid flow per requirements

  const handleDownloadPdf = async () => {
    const content = printRef.current;
    if (!content) return;
    const w = window as any;
    const ensureLib = () =>
      new Promise<void>((resolve, reject) => {
        if (w.html2pdf) return resolve();
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load PDF library"));
        document.head.appendChild(s);
      });
    try {
      await ensureLib();
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${invoice.id}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };
      w.html2pdf().set(opt).from(content).save(`${invoice.id}.pdf`);
    } catch (e) {
      toast({ title: "Download failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/sales")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice {invoice.id}</h1>
            <p className="text-muted-foreground">View invoice details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/accounts/sales/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {invoice?.status !== "cancelled" && (
            <Button
              variant="outline"
              onClick={() => {
                if (!id) return;
                if (!confirm(`Cancel ${id}? This will reverse the accounting entries to show no sale occurred.`)) return;
                try {
                  // Update invoice status
                  const stored = localStorage.getItem("invoices");
                  const list = stored ? JSON.parse(stored) : [];
                  const updated = list.map((r: any) => 
                    r.id === id ? { ...r, status: "cancelled" } : r
                  );
                  localStorage.setItem("invoices", JSON.stringify(updated));

                  // Create reversal journal entries
                  const jeStored = localStorage.getItem("journalEntries");
                  const jeList = jeStored ? JSON.parse(jeStored) : [];
                  
                  // Find original journal entries for this invoice
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
                  
                  navigate("/accounts/sales");
                } catch (_) {}
              }}
              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
            >
              Cancel Invoice
            </Button>
          )}
        </div>
      </div>

      <div ref={printRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>Invoice Details</CardTitle>
              <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{invoice?.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{invoice?.invoiceDate || invoice?.date}</p>
              </div>
              {invoice?.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Payment Mode</p>
                <p className="font-medium">{invoice?.paymentMode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p className="font-medium">{invoice?.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income Account</p>
                <p className="font-medium">Direct Sales (4010)</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Item</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Rate</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice?.items || []).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <span className="flex items-center gap-2 font-medium">
                            {(item.image || item.imageUrl) && <span className="text-xl leading-none">{item.image || item.imageUrl}</span>}
                            {item.name}
                          </span>
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
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice?.notes || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{invoice?.subtotal || (invoice?.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0).toFixed(2)}</span>
            </div>
            {invoice?.discountPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount ({invoice.discountPercentage}%)</span>
                <span className="font-medium text-red-600">-₹{((invoice?.subtotal || (invoice?.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0)) * invoice.discountPercentage / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">₹0</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg">₹{invoice?.totalAmount || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}