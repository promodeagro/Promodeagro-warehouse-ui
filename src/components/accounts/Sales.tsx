import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Sales() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });

  // Default seed data
  const seedSales = [
    { 
      id: "INV-001", 
      customer: "Rajesh Kumar", 
      date: "2025-10-06", 
      amount: 845, 
      status: "paid",
      items: 3,
      paymentMode: "UPI",
      source: "manual"
    },
    { 
      id: "INV-002", 
      customer: "Priya Sharma", 
      date: "2025-10-06", 
      amount: 1250, 
      status: "pending",
      items: 5,
      paymentMode: "Cash",
      source: "ecommerce"
    },
    { 
      id: "INV-003", 
      customer: "Amit Patel", 
      date: "2025-10-05", 
      amount: 620, 
      status: "paid",
      items: 2,
      paymentMode: "Bank Transfer",
      source: "manual"
    },
  ];

  // Load from localStorage + seed data
  let storedList: any[] = [];
  try {
    const stored = localStorage.getItem("invoices");
    storedList = stored ? JSON.parse(stored) : [];
  } catch (_) {}
  const allSales = [...storedList, ...seedSales];

  // Filtering logic
  const filteredSales = useMemo(() => {
    let filtered = allSales;

    // Search by ID or customer name
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== "custom") {
      const now = new Date();
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date || sale.invoiceDate);
        
        switch (timeFilter) {
          case "today":
            return saleDate.toDateString() === now.toDateString();
          case "this_week":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return saleDate >= startOfWeek && saleDate <= now;
          case "this_month":
            return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
          case "last_month":
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
          case "this_year":
            return saleDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    } else if (customDateRange.from && customDateRange.to) {
      // Custom date range
      const fromDate = new Date(customDateRange.from);
      const toDate = new Date(customDateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date || sale.invoiceDate);
        return saleDate >= fromDate && saleDate <= toDate;
      });
    }

    return filtered;
  }, [allSales, searchTerm, statusFilter, timeFilter, customDateRange]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Manage your online orders and invoices</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/sales/new')}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {timeFilter === "custom" && (
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={customDateRange.from}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="grid gap-4">
        {filteredSales.map((sale) => {
          const handleDownload = () => {
            // Generate PDF content
            const invoiceContent = `
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #333; margin: 0;">INVOICE</h1>
                  <p style="color: #666; margin: 5px 0;">Invoice #${sale.id}</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                  <div>
                    <h3 style="margin: 0 0 10px 0; color: #333;">Bill To:</h3>
                    <p style="margin: 0; color: #666;">${sale.customer}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0; color: #666;"><strong>Date:</strong> ${sale.date || sale.invoiceDate}</p>
                    <p style="margin: 0; color: #666;"><strong>Status:</strong> ${sale.status}</p>
                    <p style="margin: 0; color: #666;"><strong>Source:</strong> ${sale.source === 'ecommerce' ? 'E-commerce' : 'Manual'}</p>
                  </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #333;">Items:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sale.items && Array.isArray(sale.items) ? sale.items.map((item: any) => `
                        <tr>
                          <td style="padding: 10px; border: 1px solid #ddd;">${item.name || 'Item'}</td>
                          <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity || 1}</td>
                          <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${(item.rate || 0).toFixed(2)}</td>
                          <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${(item.amount || 0).toFixed(2)}</td>
                        </tr>
                      `).join('') : `
                        <tr>
                          <td style="padding: 10px; border: 1px solid #ddd;" colspan="4">No items details available</td>
                        </tr>
                      `}
                    </tbody>
                    <tfoot>
                      <tr style="background-color: #f5f5f5; font-weight: bold;">
                        <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total:</td>
                        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${(sale.amount || sale.totalAmount || 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div style="text-align: center; margin-top: 40px; color: #666;">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            `;
            
            // Create and download PDF
            const element = document.createElement('div');
            element.innerHTML = invoiceContent;
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            document.body.appendChild(element);
            
            // Use html2pdf if available, otherwise fallback to print
            if (window.html2pdf) {
              window.html2pdf().from(element).save(`Invoice-${sale.id}.pdf`);
            } else {
              // Fallback: open print dialog
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head><title>Invoice ${sale.id}</title></head>
                    <body>${invoiceContent}</body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }
            
            document.body.removeChild(element);
          };

          const handleCancel = () => {
            if (!confirm(`Cancel ${sale.id}? This will reverse the accounting entries to show no sale occurred.`)) return;
            try {
              // Update invoice status
              const stored = localStorage.getItem("invoices");
              const list = stored ? JSON.parse(stored) : [];
              const updated = list.map((r: any) => 
                r.id === sale.id ? { ...r, status: "cancelled" } : r
              );
              localStorage.setItem("invoices", JSON.stringify(updated));

              // Create reversal journal entries
              const jeStored = localStorage.getItem("journalEntries");
              const jeList = jeStored ? JSON.parse(jeStored) : [];
              
              // Find original journal entries for this invoice
              const originalEntries = jeList.filter((e: any) => e.reference === sale.id);
              
              // Create reversal entries (opposite of original)
              const reversalEntries = originalEntries.map((entry: any) => ({
                id: `JE-${Date.now()}-REV-${entry.id}`,
                date: new Date().toISOString().split('T')[0],
                description: `Reversal - ${entry.description}`,
                reference: sale.id,
                status: "posted",
                lines: entry.lines.map((line: any) => ({
                  account: line.account,
                  debit: line.credit, // Swap debit and credit
                  credit: line.debit
                }))
              }));
              
              // Add reversal entries to journal
              localStorage.setItem("journalEntries", JSON.stringify([...reversalEntries, ...jeList]));
              
              window.location.reload();
            } catch (_) {}
          };

          return (
            <Card key={sale.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{sale.id}</h3>
                      <Badge variant={sale.status === "paid" ? "default" : sale.status === "cancelled" ? "destructive" : "secondary"}>
                        {sale.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Customer: {sale.customer}</p>
                    <p className="text-sm text-muted-foreground">Date: {sale.date || sale.invoiceDate} | Items: {typeof sale.items === 'number' ? sale.items : (sale.itemsCount || 0)}</p>
                    <p className="text-sm text-muted-foreground">Payment: {sale.paymentMode || sale.paymentModeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{(sale.amount || sale.totalAmount).toLocaleString()}</p>
                    <div className="mt-3 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/sales/${sale.id}`)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/sales/${sale.id}/edit`)}>Edit</Button>
                      {sale.status !== "cancelled" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancel}
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
                        >
                          Cancel Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}