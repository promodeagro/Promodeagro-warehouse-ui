import { useMemo, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee,
  ShoppingCart,
  Receipt,
  Clock,
  Calendar,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("this_month");

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    let start = startOfDay(now);
    let end = endOfDay(now);
    if (timeFilter === "this_week") {
      const day = now.getDay();
      const diff = (day + 6) % 7; // Monday as start
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff));
    } else if (timeFilter === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (timeFilter === "last_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (timeFilter === "this_quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      end = endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0));
    } else if (timeFilter === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfDay(new Date(now.getFullYear(), 11, 31));
    }
    return { rangeStart: start, rangeEnd: end };
  }, [timeFilter]);

  const parseDate = (s: string) => new Date(s);
  const inRange = (d: string) => {
    const date = parseDate(d);
    return date >= rangeStart && date <= rangeEnd;
  };

  const invoices = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("invoices") || "[]"); } catch { return []; }
  }, []);
  const purchases = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("purchases") || "[]"); } catch { return []; }
  }, []);
  const expenses = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("expenses") || "[]"); } catch { return []; }
  }, []);
  const cartSales = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("cartSales") || "[]"); } catch { return []; }
  }, []);
  const otherIncomes = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("otherIncomes") || "[]"); } catch { return []; }
  }, []);
  const journalEntries = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("journalEntries") || "[]"); } catch { return []; }
  }, []);

  // Stats
  const totalSales = useMemo(() => {
    const invoicesSum = invoices.filter((r: any) => r.invoiceDate && inRange(r.invoiceDate)).reduce((s: number, r: any) => s + (Number(r.totalAmount) || 0), 0);
    const cartSum = cartSales.filter((r: any) => r.date && inRange(r.date)).reduce((s: number, r: any) => s + (Number(r.totalSales) || 0), 0);
    const otherInc = otherIncomes.filter((r: any) => r.date && inRange(r.date)).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
    return invoicesSum + cartSum + otherInc;
  }, [invoices, cartSales, otherIncomes, rangeStart, rangeEnd]);

  const totalExpenses = useMemo(() => {
    return expenses.filter((r: any) => r.date && inRange(r.date)).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);
  }, [expenses, rangeStart, rangeEnd]);

  const inventoryBalance = useMemo(() => {
    // Compute Inventory balance from journalEntries
    return journalEntries.reduce((bal: number, je: any) => {
      if (!je.lines) return bal;
      je.lines.forEach((line: any) => {
        if (String(line.account).toLowerCase() === "inventory") {
          bal += (Number(line.debit) || 0) - (Number(line.credit) || 0);
        }
      });
      return bal;
    }, 0);
  }, [journalEntries]);

  const stats = useMemo(() => ({
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,
    stockValue: Math.max(0, Math.round(inventoryBalance)),
  }), [totalSales, totalExpenses, inventoryBalance]);

  // Pending AR/AP
  const pendingReceivables = useMemo(() => {
    return invoices
      .filter((r: any) => r.status === "pending")
      .map((r: any) => ({
        id: r.id,
        customer: r.customer || "Customer",
        amount: Number(r.totalAmount) || 0,
        dueDate: r.dueDate || r.invoiceDate,
        days: r.dueDate ? Math.max(0, Math.ceil((parseDate(r.dueDate).getTime() - Date.now()) / (1000*60*60*24))) : 0,
      }));
  }, [invoices]);

  const pendingPayables = useMemo(() => {
    return purchases
      .filter((r: any) => r.status === "pending")
      .map((r: any) => ({
        id: r.id,
        vendor: r.vendor || "Vendor",
        amount: Number(r.totalAmount) || 0,
        dueDate: r.dueDate || r.date,
        days: r.dueDate ? Math.max(0, Math.ceil((parseDate(r.dueDate).getTime() - Date.now()) / (1000*60*60*24))) : 0,
      }));
  }, [purchases]);

  const totalReceivables = useMemo(() => pendingReceivables.reduce((sum, item) => sum + item.amount, 0), [pendingReceivables]);
  const totalPayables = useMemo(() => pendingPayables.reduce((sum, item) => sum + item.amount, 0), [pendingPayables]);

  // Recent transactions (latest across modules)
  const recentTransactions = useMemo(() => {
    const salesTx = invoices.map((r: any) => ({ id: r.id, type: "Sale", customer: r.customer, amount: Number(r.totalAmount)||0, date: r.invoiceDate, status: r.status, refId: r.id }));
    const purchaseTx = purchases.map((r: any) => ({ id: r.id, type: "Purchase", vendor: r.vendor, amount: Number(r.totalAmount)||0, date: r.date, status: r.status, refId: r.id }));
    const cartTx = cartSales.map((r: any) => ({ id: r.id, type: "Cart Sale", customer: r.notes || "Cash Sale", amount: Number(r.totalSales)||0, date: r.date, status: "paid", refId: r.id }));
    const expTx = expenses.map((r: any) => ({ id: r.id, type: "Expense", vendor: r.vendor, amount: Number(r.amount)||0, date: r.date, status: r.status, refId: r.id }));
    const all = [...salesTx, ...purchaseTx, ...cartTx, ...expTx].filter((t: any) => t.date).sort((a: any, b: any) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
    return all.slice(0, 5);
  }, [invoices, purchases, cartSales, expenses]);

  // Sales vs Expenses chart by month for the current range year
  const salesVsExpensesData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const year = rangeStart.getFullYear();
    const agg = Array.from({ length: 12 }, (_, i) => ({ month: months[i], sales: 0, expenses: 0 }));
    invoices.forEach((r: any) => { if (r.invoiceDate && new Date(r.invoiceDate).getFullYear() === year) { const m = new Date(r.invoiceDate).getMonth(); agg[m].sales += Number(r.totalAmount)||0; }});
    cartSales.forEach((r: any) => { if (r.date && new Date(r.date).getFullYear() === year) { const m = new Date(r.date).getMonth(); agg[m].sales += Number(r.totalSales)||0; }});
    otherIncomes.forEach((r: any) => { if (r.date && new Date(r.date).getFullYear() === year) { const m = new Date(r.date).getMonth(); agg[m].sales += Number(r.amount)||0; }});
    expenses.forEach((r: any) => { if (r.date && new Date(r.date).getFullYear() === year) { const m = new Date(r.date).getMonth(); agg[m].expenses += Number(r.amount)||0; }});
    return agg;
  }, [invoices, cartSales, otherIncomes, expenses, rangeStart]);

  const chartConfig = {
    sales: { label: "Sales", color: "hsl(var(--success))" },
    expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
  };

  const handleTransactionClick = (transaction: typeof recentTransactions[0]) => {
    if (transaction.type === "Sale") {
      navigate(`/accounts/sales/${transaction.refId}`);
    } else if (transaction.type === "Purchase") {
      navigate(`/accounts/purchases/${transaction.refId}`);
    } else if (transaction.type === "Cart Sale") {
      navigate(`/accounts/cart-sales/${transaction.refId}`);
    } else if (transaction.type === "Expense") {
      navigate(`/accounts/expenses/${transaction.refId}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales (Month)"
          value={`₹${stats.totalSales.toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
          subtitle="+12% from last month"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          variant="destructive"
          subtitle="+5% from last month"
        />
        <StatCard
          title="Net Profit"
          value={`₹${stats.profit.toLocaleString()}`}
          icon={IndianRupee}
          variant="success"
          subtitle="This month"
        />
        <StatCard
          title="Stock Value"
          value={`₹${stats.stockValue.toLocaleString()}`}
          icon={Package}
          variant="default"
          subtitle="Current inventory"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-success" />
              Pending Receivables
            </CardTitle>
            <div className="mt-3">
              <p className="text-3xl font-bold text-success">₹{totalReceivables.toLocaleString()}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pendingReceivables.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/accounts/sales/${payment.id}`)}
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.id} • Due: {payment.dueDate}
                    </p>
                    <Badge variant="outline" className="mt-1 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
                      {payment.days} days remaining
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">₹{payment.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Pending Payables
            </CardTitle>
            <div className="mt-3">
              <p className="text-3xl font-bold text-destructive">₹{totalPayables.toLocaleString()}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pendingPayables.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/accounts/purchases/${payment.id}`)}
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.vendor}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.id} • Due: {payment.dueDate}
                    </p>
                    <Badge variant="outline" className="mt-1 bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
                      {payment.days} days remaining
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">₹{payment.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales vs Expenses Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales vs Expenses</CardTitle>
            <Select defaultValue="this_month">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--color-sales)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-sales)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="var(--color-expenses)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-expenses)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 gap-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border ${
                    transaction.type === "Sale" 
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800" 
                      : transaction.type === "Purchase"
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800"
                      : transaction.type === "Cart Sale"
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800"
                      : "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800"
                  }`}
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{transaction.type}</p>
                      <Badge 
                        variant={transaction.status === "paid" ? "default" : "secondary"}
                        className={transaction.status === "paid" 
                          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" 
                          : "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{transaction.customer || transaction.vendor}</p>
                    <p className="text-xs text-muted-foreground">{transaction.refId} • {transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">₹{transaction.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/accounts/sales/new')}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">New Sale</p>
            </button>
            <button 
              onClick={() => navigate('/accounts/purchases/new')}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Receipt className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">New Purchase</p>
            </button>
            <button 
              onClick={() => navigate('/accounts/expenses/new')}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <TrendingDown className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Add Expense</p>
            </button>
            <button 
              onClick={() => navigate('/accounts/journal-entries/new')}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Journal Entry</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}