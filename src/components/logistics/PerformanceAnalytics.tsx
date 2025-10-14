import { TrendingUp, Truck, Clock, Fuel } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export function PerformanceAnalytics() {
  const performanceData = [
    { month: "Jan", deliveries: 1200, onTime: 94, fuelEff: 12.1 },
    { month: "Feb", deliveries: 1350, onTime: 91, fuelEff: 12.3 },
    { month: "Mar", deliveries: 1480, onTime: 95, fuelEff: 12.5 },
    { month: "Apr", deliveries: 1620, onTime: 93, fuelEff: 12.2 },
    { month: "May", deliveries: 1750, onTime: 96, fuelEff: 12.8 },
    { month: "Jun", deliveries: 1890, onTime: 94, fuelEff: 12.6 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">1,890</p>
                <p className="text-sm text-muted-foreground">Monthly Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">94%</p>
                <p className="text-sm text-muted-foreground">On-Time Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">12.6</p>
                <p className="text-sm text-muted-foreground">Avg Fuel Eff. (km/l)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">23%</p>
                <p className="text-sm text-muted-foreground">Efficiency Gain</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Trends
          </CardTitle>
          <CardDescription>Monthly logistics performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
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
                  dataKey="onTime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                  name="On-Time %"
                />
                <Line 
                  type="monotone" 
                  dataKey="fuelEff" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                  name="Fuel Efficiency"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}