import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, Package, Users, ShoppingCart } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState("this_month");

  // Mock analytics data
  const stats = {
    totalIncome: 145230,
    totalExpenses: 89450,
    netProfit: 55780,
    topSellingProducts: 15,
    totalCustomers: 48,
    totalOrders: 127,
  };

  const topSellingProducts = [
    { name: "Tomato", sales: 45, revenue: 18000 },
    { name: "Ghee", sales: 38, revenue: 19000 },
    { name: "Carrot", sales: 32, revenue: 16000 },
    { name: "Butter", sales: 28, revenue: 8400 },
    { name: "Cucumber", sales: 25, revenue: 7500 },
  ];

  const topCustomers = [
    { name: "Rajesh Kumar", orders: 15, revenue: 25430 },
    { name: "Priya Sharma", orders: 12, revenue: 18900 },
    { name: "Amit Patel", orders: 10, revenue: 15680 },
    { name: "Sneha Reddy", orders: 8, revenue: 12340 },
    { name: "Vikram Singh", orders: 7, revenue: 9870 },
  ];

  const weeklyRevenue = [
    { week: "Week 1", income: 32000, expenses: 18000 },
    { week: "Week 2", income: 38000, expenses: 22000 },
    { week: "Week 3", income: 35000, expenses: 21000 },
    { week: "Week 4", income: 40230, expenses: 28450 },
  ];

  const categoryDistribution = [
    { name: "Vegetables", value: 45, color: "hsl(var(--success))" },
    { name: "Dairy", value: 30, color: "hsl(var(--primary))" },
    { name: "Grains", value: 15, color: "hsl(var(--warning))" },
    { name: "Others", value: 10, color: "hsl(var(--muted))" },
  ];

  const monthlySalesTrend = [
    { month: "May", sales: 98000 },
    { month: "Jun", sales: 105000 },
    { month: "Jul", sales: 112000 },
    { month: "Aug", sales: 119000 },
    { month: "Sep", sales: 123000 },
    { month: "Oct", sales: 145230 },
  ];

  // Mock income and expenses breakdown for donut charts
  // Colors order: green, red, orange, blue
  const incomeBreakdown = [
    { name: "Cart Sales", value: 42000, color: "hsl(var(--success))" },
    { name: "Online Sales", value: 28000, color: "hsl(var(--destructive))" },
    { name: "Direct Sales", value: 51000, color: "hsl(var(--warning))" },
    { name: "Other Income", value: 24000, color: "hsl(var(--primary))" },
  ];
  const totalIncomeAmount = incomeBreakdown.reduce((sum, i) => sum + i.value, 0);

  const expensesBreakdown = [
    { name: "Purchase Expenses", value: 38000, color: "hsl(var(--success))" },
    { name: "Fuel Expenses", value: 14000, color: "hsl(var(--destructive))" },
    { name: "Other Expenses", value: 26000, color: "hsl(var(--warning))" },
  ];
  const totalExpensesAmount = expensesBreakdown.reduce((sum, i) => sum + i.value, 0);

  // New analytics data
  const customerPurchaseFrequency = [
    { frequency: "Daily", customers: 15, percentage: 31 },
    { frequency: "Weekly", customers: 20, percentage: 42 },
    { frequency: "Monthly", customers: 10, percentage: 21 },
    { frequency: "Occasional", customers: 3, percentage: 6 },
  ];

  const productBundles = [
    { bundle: "Tomato + Onion + Potato", purchases: 45, revenue: 12500 },
    { bundle: "Milk + Ghee + Butter", purchases: 38, revenue: 18900 },
    { bundle: "Rice + Dal + Oil", purchases: 32, revenue: 15600 },
    { bundle: "Carrot + Beans + Cabbage", purchases: 28, revenue: 8400 },
  ];

  const customerSegmentation = [
    { segment: "Regular", customers: 25, revenue: 2800, color: "hsl(var(--primary))" },
    { segment: "Premium", customers: 12, revenue: 5500, color: "hsl(var(--success))" },
    { segment: "Budget", customers: 11, revenue: 1200, color: "hsl(var(--warning))" },
  ];
  const totalSegmentCustomers = customerSegmentation.reduce((sum, s) => sum + s.customers, 0);

  // Mock top pincodes (replace with real aggregation later). Kept to 4.
  const pincodeDistribution = [
    { pincode: "500006", label: "Old City", customers: 18, revenue: 45000 },
    { pincode: "500032", label: "Hitech City", customers: 15, revenue: 38000 },
    { pincode: "500081", label: "Gachibowli", customers: 10, revenue: 32000 },
    { pincode: "500034", label: "Banjara Hills", customers: 5, revenue: 30230 },
    { pincode: "500007", label: "Secunderabad", customers: 9, revenue: 21500 },
    { pincode: "500090", label: "Kukatpally", customers: 12, revenue: 28600 },
  ];

  const cartSizeAnalytics = [
    { size: "1-3 items", count: 35, avgValue: 450 },
    { size: "4-6 items", count: 28, avgValue: 1250 },
    { size: "7-10 items", count: 15, avgValue: 2550 },
    { size: "10+ items", count: 8, avgValue: 4750 },
  ];

  const orderSizeDistribution = [
    { range: "₹0-500", orders: 45, percentage: 35 },
    { range: "₹501-1500", orders: 38, percentage: 30 },
    { range: "₹1501-3000", orders: 28, percentage: 22 },
    { range: "₹3000+", orders: 16, percentage: 13 },
  ];

  // New: Customer acquisition (mock) and seasonal distribution (mock)
  const customerAcquisition = [
    { month: "May", newCustomers: 28, oldCustomers: 15 },
    { month: "Jun", newCustomers: 35, oldCustomers: 18 },
    { month: "Jul", newCustomers: 31, oldCustomers: 20 },
    { month: "Aug", newCustomers: 38, oldCustomers: 22 },
    { month: "Sep", newCustomers: 29, oldCustomers: 25 },
    { month: "Oct", newCustomers: 42, oldCustomers: 28 },
  ];

  const seasonalProducts = [
    { season: "Summer", topProduct: "Mango Kasundi", salesVolume: 123, unitType: "400gms", revenue: 22140 },
    { season: "Rainy", topProduct: "Delhi carrot", salesVolume: 69, unitType: "250gms", revenue: 1035 },
    { season: "Post-monsoon", topProduct: "Onion", salesVolume: 69, unitType: "250grams", revenue: 621 },
    { season: "Winter", topProduct: "Mukhorachok special papri chanachur (jhal chanachur)", salesVolume: 72, unitType: "400gms", revenue: 12960 },
  ];

  const peakShoppingHours = [
    { hour: "8-9 AM", orders: 12, percentage: 9 },
    { hour: "9-10 AM", orders: 18, percentage: 14 },
    { hour: "10-11 AM", orders: 25, percentage: 20 },
    { hour: "11-12 PM", orders: 32, percentage: 25 },
    { hour: "12-1 PM", orders: 20, percentage: 16 },
    { hour: "1-2 PM", orders: 15, percentage: 12 },
    { hour: "2-3 PM", orders: 5, percentage: 4 },
  ];

  const chartConfig = {
    income: { label: "Income", color: "hsl(var(--success))" },
    expenses: { label: "Expenses", color: "hsl(var(--destructive))" },
    sales: { label: "Sales", color: "hsl(var(--primary))" },
    customers: { label: "Customers", color: "hsl(var(--primary))" },
    revenue: { label: "Revenue", color: "hsl(var(--success))" },
    count: { label: "Count", color: "hsl(var(--primary))" },
    avgValue: { label: "Avg Value (₹)", color: "hsl(var(--success))" },
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
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

      

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          variant="success"
          filled
          subtitle="+8 new this month"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          variant="info"
          filled
          subtitle="+15% this month"
        />
        <StatCard
          title="Total Products"
          value="156"
          icon={Package}
          variant="purple"
          filled
          subtitle="In inventory"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          icon={IndianRupee}
          variant="success"
          filled
          subtitle="+18% from last period"
        />
        <StatCard
          title="Net Profit"
          value={`₹${stats.netProfit.toLocaleString()}`}
          icon={TrendingUp}
          variant={stats.netProfit >= 0 ? "success" : "destructive"}
          filled
          subtitle={stats.netProfit >= 0 ? "+ profitable" : "- loss"}
        />
      </div>

      {/* Income and Expenses Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Income Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
              <ChartContainer config={{}} className="h-full aspect-auto">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={incomeBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`income-slice-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) translate(-0px, -0px)", pointerEvents: "none", textAlign: "center" }}>
                <div className="text-sm text-muted-foreground">Total Income</div>
                <div className="text-2xl font-bold">₹{totalIncomeAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
              {incomeBreakdown.map((entry, idx) => (
                <div key={`income-legend-${idx}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Expenses Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
              <ChartContainer config={{}} className="h-full aspect-auto">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={expensesBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                      {expensesBreakdown.map((entry, index) => (
                        <Cell key={`expense-slice-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) translate(-0px, -0px)", pointerEvents: "none", textAlign: "center" }}>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-2xl font-bold">₹{totalExpensesAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
              {expensesBreakdown.map((entry, idx) => (
                <div key={`expense-legend-${idx}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

{/* Top 5 Selling Products and Top 5 Customers */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Top 5 Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} kg sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success text-lg">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top 5 Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center font-bold text-success text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success text-lg">₹{customer.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total spent</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Customer Segmentation and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segmentation Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-72">
                <ChartContainer config={{}} className="h-full aspect-auto">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={customerSegmentation} dataKey="customers" nameKey="segment" innerRadius={70} outerRadius={110} paddingAngle={2}>
                        {customerSegmentation.map((entry, index) => (
                          <Cell key={`seg-slice-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) translate(0px, 0px)", pointerEvents: "none", textAlign: "center" }}>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                  <div className="text-2xl font-bold">{totalSegmentCustomers}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
                {customerSegmentation.map((entry, idx) => (
                  <div key={`seg-legend-${idx}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span>{entry.segment}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Purchase Frequency (moved left) */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Purchase Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-72">
              <ChartContainer config={{}} className="h-full aspect-auto">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={customerPurchaseFrequency.filter((i) => ["Daily", "Weekly", "Monthly"].includes(i.frequency))}
                      dataKey="customers"
                      nameKey="frequency"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {customerPurchaseFrequency
                        .filter((i) => ["Daily", "Weekly", "Monthly"].includes(i.frequency))
                        .map((entry, index) => (
                          <Cell key={`cpf-slice-top-${index}`} fill={["hsl(var(--primary))","hsl(var(--success))","hsl(var(--warning))"][index % 3]} />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", textAlign: "center" }}>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold">
                  {customerPurchaseFrequency
                    .filter((i) => ["Daily", "Weekly", "Monthly"].includes(i.frequency))
                    .reduce((s, i) => s + i.customers, 0)}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
              {customerPurchaseFrequency
                .filter((i) => ["Daily", "Weekly", "Monthly"].includes(i.frequency))
                .map((entry, idx) => (
                  <div key={`cpf-legend-top-${idx}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: ["hsl(var(--primary))","hsl(var(--success))","hsl(var(--warning))"][idx % 3] }}></span>
                    <span>{entry.frequency}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Pincode Distribution and Product Bundles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pincode Distribution (moved right) */}
        <Card>
          <CardHeader>
            <CardTitle>Pincode Wise Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {pincodeDistribution.map((pin, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{pin.pincode} ({pin.label})</p>
                      <p className="text-sm text-muted-foreground">{pin.customers} customers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">₹{pin.revenue.toLocaleString()}</p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Bundle Combinations */}
        <Card>
          <CardHeader>
            <CardTitle>Product Bundle Combinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productBundles.map((bundle, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{bundle.bundle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{bundle.purchases} purchases</span>
                    <span className="font-bold text-success">₹{bundle.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      

      {/* Customer Acquisition & Seasonal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerAcquisition}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="newCustomers" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 6 }} name="New Customers" />
                  <Line type="monotone" dataKey="oldCustomers" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 6 }} name="Old Customers" />
                  <Legend />
                </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Seasonal Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2">Season</th>
                    <th className="text-left py-2">Top Product</th>
                    <th className="text-right py-2 pr-6">Sales unit</th>
                    <th className="text-right py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonalProducts.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-medium">{product.season}</td>
                      <td className="py-3">{product.topProduct}</td>
                      <td className="py-3 text-right pr-6">{`${product.salesVolume}${product.unitType}`}</td>
                      <td className="py-3 text-right font-medium">₹{product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Size Analytics and Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cart Size Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Size Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cartSizeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="size" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Count" />
                  <Bar yAxisId="right" dataKey="avgValue" fill="hsl(var(--success))" name="Avg Value (₹)" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySalesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Size Distribution and Peak Shopping Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderSizeDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.range}</span>
                    <span className="text-sm text-muted-foreground">{item.orders} orders ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Shopping Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Shopping Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {peakShoppingHours.map((hour, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{hour.hour}</span>
                    <span className="text-sm text-muted-foreground">{hour.orders} orders ({hour.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-success h-3 rounded-full transition-all duration-300"
                      style={{ width: `${hour.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: "Vegetables", sales: 45000, orders: 120, color: "hsl(var(--success))" },
                { category: "Dairy", sales: 38000, orders: 95, color: "hsl(var(--primary))" },
                { category: "Grains", sales: 27000, orders: 75, color: "hsl(var(--warning))" },
                { category: "Fruits", sales: 32000, orders: 85, color: "hsl(var(--destructive))" },
                { category: "Spices", sales: 18000, orders: 45, color: "hsl(var(--muted))" }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Sales (₹)" />
                <Bar dataKey="orders" fill="hsl(var(--success))" opacity={0.7} radius={[8, 8, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}