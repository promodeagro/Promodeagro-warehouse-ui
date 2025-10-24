import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CartSales() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });
  // Seed + localStorage cart sales
  const seed = [
    { id: "CS-001", date: "2025-10-06", totalSales: 12450, cash: 8000, upi: 3450, pending: 1000, status: "received" },
    { id: "CS-002", date: "2025-09-29", totalSales: 11200, cash: 7500, upi: 2900, pending: 800, status: "received" },
  ];
  let storedList: any[] = [];
  try {
    const stored = localStorage.getItem("cartSales");
    storedList = stored ? JSON.parse(stored) : [];
  } catch (_) {}
  const allCartSales = [...storedList, ...seed];

  // Filtering logic
  const filteredCartSales = useMemo(() => {
    let filtered = allCartSales;

    // Search by ID
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => {
        const status = sale.status === "cancelled" ? "cancelled" : (sale.pending > 0 ? "pending" : "received");
        return status === statusFilter;
      });
    }

    // Time filter
    if (timeFilter !== "custom") {
      const now = new Date();
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        
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
      toDate.setHours(23, 59, 59, 999); // Include end of day
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= fromDate && saleDate <= toDate;
      });
    }

    return filtered;
  }, [allCartSales, searchTerm, statusFilter, timeFilter, customDateRange]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cart Sales</h1>
          <p className="text-muted-foreground">Track your Sunday market cart sales</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/cart-sales/new')}>
          <Plus className="h-4 w-4" />
          Record Cart Sale
        </Button>
      </div>

      {/* Filters (Search, Status, Time) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by cart sale ID..."
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
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">This Week Sales</p>
            <h3 className="text-2xl font-bold text-foreground mb-1">₹12,450</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">+11% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Amount Collected</p>
            <h3 className="text-2xl font-bold text-foreground mb-1">₹15,500</h3>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Pending Amounts</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">₹1,800</h3>
            <p className="text-sm text-muted-foreground">To be received</p>
          </CardContent>
        </Card>
      </div>

      {/* Cart Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCartSales.map((sale) => {
              const status = sale.status === "cancelled" ? "cancelled" : (sale.pending > 0 ? "pending" : "received");
              const handleDelete = () => {
                if (!confirm(`Cancel ${sale.id}? This will reverse the accounting entries to show no sale occurred.`)) return;
                try {
                  // Update cart sale status to cancelled
                  const stored = localStorage.getItem("cartSales");
                  const list = stored ? JSON.parse(stored) : [];
                  const updated = list.map((r: any) => 
                    r.id === sale.id ? { ...r, status: "cancelled" } : r
                  );
                  localStorage.setItem("cartSales", JSON.stringify(updated));

                  // Create reversal journal entries
                  const jeStored = localStorage.getItem("journalEntries");
                  const jeList = jeStored ? JSON.parse(jeStored) : [];
                  
                  // Find original journal entries for this cart sale
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
              <div key={sale.id} className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{sale.id}</h3>
                    <Badge className={
                      status === "cancelled" ? "bg-red-500 text-white" : 
                      status === "pending" ? "bg-amber-500 text-white" : 
                      "bg-emerald-600 text-white"
                    }>
                      {status === "cancelled" ? "Cancelled" : status === "pending" ? "Pending" : "Received"}
                    </Badge>
                  </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/cart-sales/${sale.id}`)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/cart-sales/${sale.id}/edit`)}>Edit</Button>
                      {status !== "cancelled" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDelete}
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
                        >
                          Cancel Sale
                        </Button>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{sale.date}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                    <p className="text-xl font-bold text-foreground">₹{sale.totalSales.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cash</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{sale.cash.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">UPI Amount</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{sale.upi.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pending Amount</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹{sale.pending.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}