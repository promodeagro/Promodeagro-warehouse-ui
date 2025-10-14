import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InventoryAnalytics() {
  const inventoryTrends = [
    { month: "Jan", inbound: 42, outbound: 38, waste: 2.1 },
    { month: "Feb", inbound: 45, outbound: 41, waste: 1.8 },
    { month: "Mar", inbound: 48, outbound: 44, waste: 2.3 },
    { month: "Apr", inbound: 52, outbound: 47, waste: 1.9 },
    { month: "May", inbound: 58, outbound: 53, waste: 2.5 },
    { month: "Jun", inbound: 61, outbound: 56, waste: 2.2 },
    { month: "Jul", inbound: 55, outbound: 51, waste: 1.7 },
    { month: "Aug", inbound: 59, outbound: 54, waste: 2.0 }
  ];

  const categoryDistribution = [
    { name: "Vegetables", value: 45, color: "hsl(var(--primary))" },
    { name: "Fruits", value: 30, color: "hsl(var(--accent))" },
    { name: "Leafy Greens", value: 15, color: "hsl(var(--secondary))" },
    { name: "Herbs", value: 10, color: "hsl(var(--muted))" }
  ];

  const turnoverAnalysis = [
    { product: "Tomatoes", turnover: 12, demand: "High", days: 3 },
    { product: "Onions", turnover: 8, demand: "Medium", days: 5 },
    { product: "Bananas", turnover: 15, demand: "High", days: 2 },
    { product: "Spinach", turnover: 18, demand: "High", days: 2 },
    { product: "Carrots", turnover: 6, demand: "Medium", days: 7 },
    { product: "Coriander", turnover: 20, demand: "High", days: 1 },
    { product: "Potatoes", turnover: 4, demand: "Low", days: 12 }
  ];

  const wasteAnalysis = [
    { category: "Vegetables", waste: 2.1, target: 2.5, status: "good" },
    { category: "Fruits", waste: 3.2, target: 3.0, status: "warning" },
    { category: "Leafy Greens", waste: 4.1, target: 4.0, status: "warning" },
    { category: "Herbs", waste: 1.8, target: 2.0, status: "excellent" }
  ];

  const getDemandColor = (demand: string) => {
    const colors = {
      "High": "bg-red-500/10 text-red-500",
      "Medium": "bg-yellow-500/10 text-yellow-500",
      "Low": "bg-green-500/10 text-green-500"
    };
    return colors[demand as keyof typeof colors];
  };

  const getWasteStatusColor = (status: string) => {
    const colors = {
      "excellent": "text-green-500",
      "good": "text-blue-500",
      "warning": "text-orange-500",
      "critical": "text-red-500"
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">45.8T</p>
                <p className="text-sm text-muted-foreground">Current Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">12.3</p>
                <p className="text-sm text-muted-foreground">Avg Turnover/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">2.3%</p>
                <p className="text-sm text-muted-foreground">Waste Ratio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-muted-foreground">Stock Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Trends */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Inventory Flow Trends
          </CardTitle>
          <CardDescription>Monthly inbound vs outbound inventory movement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <Line 
                  type="monotone" 
                  dataKey="inbound" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                  name="Inbound (Tonnes)"
                />
                <Line 
                  type="monotone" 
                  dataKey="outbound" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                  name="Outbound (Tonnes)"
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                  name="Waste (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Current stock distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {categoryDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Analysis */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Waste Analysis
            </CardTitle>
            <CardDescription>Category-wise waste percentage vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wasteAnalysis.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getWasteStatusColor(item.status)}`}>
                        {item.waste}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (Target: {item.target}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.waste <= item.target ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${(item.waste / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turnover Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Turnover Analysis
          </CardTitle>
          <CardDescription>Product rotation speed and demand levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {turnoverAnalysis.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="space-y-1">
                  <h4 className="font-medium">{product.product}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getDemandColor(product.demand)}>
                      {product.demand} Demand
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Avg shelf life: {product.days} days
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {product.turnover}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    times/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}