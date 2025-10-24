import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExpenseAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function Expenses() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });

  // Load expenses from localStorage
  let storedList: any[] = [];
  try {
    const stored = localStorage.getItem("expenses");
    storedList = stored ? JSON.parse(stored) : [];
  } catch (_) {}
  const allExpenses = storedList;

  // Filtering logic
  const filteredExpenses = useMemo(() => {
    let filtered = allExpenses;

    // Search by ID, vendor, or description
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== "custom") {
      const now = new Date();
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        
        switch (timeFilter) {
          case "today":
            return expenseDate.toDateString() === now.toDateString();
          case "this_week":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return expenseDate >= startOfWeek && expenseDate <= now;
          case "this_month":
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
          case "last_month":
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
          case "this_year":
            return expenseDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    } else if (customDateRange.from && customDateRange.to) {
      // Custom date range
      const fromDate = new Date(customDateRange.from);
      const toDate = new Date(customDateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include end of day
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= fromDate && expenseDate <= toDate;
      });
    }

    return filtered;
  }, [allExpenses, searchTerm, statusFilter, timeFilter, customDateRange]);

  // Calculate stats
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = filteredExpenses.filter(exp => exp.status === "paid").reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = filteredExpenses.filter(exp => exp.status === "pending").reduce((sum, exp) => sum + exp.amount, 0);


  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">Track and categorize business expenses</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/expenses/new')}>
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <h3 className="text-2xl font-bold mt-2">₹{totalExpenses.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Paid</p>
            <h3 className="text-2xl font-bold mt-2 text-green-600">₹{paidExpenses.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold mt-2 text-amber-600">₹{pendingExpenses.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Count</p>
            <h3 className="text-2xl font-bold mt-2">{filteredExpenses.length}</h3>
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
                placeholder="Search by ID, vendor, or description..."
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
                <SelectItem value="paid">Paid</SelectItem>
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


      {/* Expenses List */}
      <div className="grid gap-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No expenses found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{expense.id}</h3>
                      <Badge variant="outline">
                        {getExpenseAccounts().find(acc => acc.code === expense.expenseAccount)?.name || "Unknown Account"}
                      </Badge>
                      <Badge variant={expense.status === "paid" ? "default" : "secondary"}>
                        {expense.status}
                      </Badge>
                    </div>
                    {expense.description && (
                      <p className="text-sm font-medium">{expense.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Vendor: {expense.vendor}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {expense.date} | Payment: {getPaymentMethodAccounts().find(acc => acc.code === expense.paymentAccount)?.name || "Unknown Account"}
                    </p>
                    {expense.uploadedImages && expense.uploadedImages.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📎 {expense.uploadedImages.length} image{expense.uploadedImages.length !== 1 ? 's' : ''} attached
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-destructive">₹{expense.amount.toLocaleString()}</p>
                    <div className="mt-3 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/expenses/${expense.id}`)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/expenses/${expense.id}/edit`)}>Edit</Button>
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