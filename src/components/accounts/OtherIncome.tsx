import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIncomeAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function OtherIncome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });

  // Load incomes from localStorage only
  let storedList: any[] = [];
  try {
    const stored = localStorage.getItem("otherIncomes");
    storedList = stored ? JSON.parse(stored) : [];
  } catch (_) {}
  const allIncomes = storedList;

  // Filtering logic
  const filteredIncomes = useMemo(() => {
    let filtered = allIncomes;

    // Search by ID, description
    if (searchTerm) {
      filtered = filtered.filter(income => 
        income.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (income.description && income.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(income => income.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== "custom") {
      const now = new Date();
      filtered = filtered.filter(income => {
        const incomeDate = new Date(income.date);
        
        switch (timeFilter) {
          case "today":
            return incomeDate.toDateString() === now.toDateString();
          case "this_week":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return incomeDate >= startOfWeek && incomeDate <= now;
          case "this_month":
            return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear();
          case "last_month":
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            return incomeDate.getMonth() === lastMonth.getMonth() && incomeDate.getFullYear() === lastMonth.getFullYear();
          case "this_year":
            return incomeDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    } else if (customDateRange.from && customDateRange.to) {
      // Custom date range
      const fromDate = new Date(customDateRange.from);
      const toDate = new Date(customDateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include end of day
      
      filtered = filtered.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= fromDate && incomeDate <= toDate;
      });
    }

    return filtered;
  }, [allIncomes, searchTerm, statusFilter, timeFilter, customDateRange]);

  // Calculate stats
  const totalIncome = filteredIncomes
    .filter(i => i.status === "received")
    .reduce((sum, income) => sum + income.amount, 0);

  const pendingIncome = filteredIncomes
    .filter(i => i.status === "pending")
    .reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Other Income</h1>
          <p className="text-muted-foreground">Track miscellaneous income sources</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/other-income/new')}>
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Other Income</p>
            <h3 className="text-2xl font-bold mt-2 text-green-600">₹{totalIncome.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending Income</p>
            <h3 className="text-2xl font-bold mt-2 text-amber-600">₹{pendingIncome.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Count</p>
            <h3 className="text-2xl font-bold mt-2">{filteredIncomes.length}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <h3 className="text-2xl font-bold mt-2 text-blue-600">₹{filteredIncomes.reduce((sum, income) => sum + income.amount, 0).toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or description..."
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
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time" />
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
          
          {/* Custom Date Range */}
          {timeFilter === "custom" && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={customDateRange.from}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income List */}
      <div className="grid gap-4">
        {filteredIncomes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No income entries found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredIncomes.map((income) => (
            <Card key={income.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{income.id}</h3>
                      <Badge variant="outline">
                        {getIncomeAccounts().find(acc => acc.code === income.incomeAccount)?.name || "Unknown Account"}
                      </Badge>
                      <Badge variant={income.status === "received" ? "default" : "secondary"}>
                        {income.status}
                      </Badge>
                    </div>
                    {income.description && (
                      <p className="text-sm font-medium">{income.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Date: {income.date}</p>
                    <p className="text-sm text-muted-foreground">
                      Payment: {getPaymentMethodAccounts().find(acc => acc.code === income.paymentAccount)?.name || "Unknown Account"}
                    </p>
                    {income.uploadedImages && income.uploadedImages.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📎 {income.uploadedImages.length} image{income.uploadedImages.length !== 1 ? 's' : ''} attached
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{income.amount.toLocaleString()}</p>
                    <div className="mt-3 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/other-income/${income.id}`)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/other-income/${income.id}/edit`)}>Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}