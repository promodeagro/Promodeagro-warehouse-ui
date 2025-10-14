import { useState } from "react";
import { Route, MapPin, Clock, Fuel, Navigation, Zap, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RouteOptimization() {
  const [optimizationMode, setOptimizationMode] = useState("distance");

  const routeOptions = [
    {
      id: "opt-1",
      name: "Distance Optimized",
      totalDistance: "127.8 km",
      estimatedTime: "6h 45m",
      fuelCost: "₹890",
      deliveries: 45,
      efficiency: 92,
      co2Saved: "12.3 kg",
      recommended: true
    },
    {
      id: "opt-2", 
      name: "Time Optimized",
      totalDistance: "142.1 km",
      estimatedTime: "5h 30m",
      fuelCost: "₹980",
      deliveries: 45,
      efficiency: 87,
      co2Saved: "8.7 kg",
      recommended: false
    },
    {
      id: "opt-3",
      name: "Fuel Optimized",
      totalDistance: "134.5 km",
      estimatedTime: "6h 15m",
      fuelCost: "₹820",
      deliveries: 45,
      efficiency: 95,
      co2Saved: "15.2 kg",
      recommended: false
    }
  ];

  const deliveryZones = [
    {
      zone: "Gachibowli",
      orders: 12,
      priority: "high",
      avgDistance: "2.3 km",
      timeWindow: "10:00-12:00",
      driver: "Rajesh Kumar",
      vehicle: "DLV-001"
    },
    {
      zone: "Jubilee Hills",
      orders: 8,
      priority: "medium",
      avgDistance: "3.1 km", 
      timeWindow: "12:00-14:00",
      driver: "Priya Sharma",
      vehicle: "DLV-002"
    },
    {
      zone: "Hitech City",
      orders: 15,
      priority: "high",
      avgDistance: "1.8 km",
      timeWindow: "14:00-16:00",
      driver: "Amit Patel", 
      vehicle: "DLV-003"
    },
    {
      zone: "Banjara Hills",
      orders: 6,
      priority: "low",
      avgDistance: "2.7 km",
      timeWindow: "16:00-18:00",
      driver: "Sunita Reddy",
      vehicle: "DLV-004"
    },
    {
      zone: "Kondapur",
      orders: 4,
      priority: "medium",
      avgDistance: "4.2 km",
      timeWindow: "18:00-20:00",
      driver: "Vikram Singh",
      vehicle: "DLV-005"
    }
  ];

  const optimizationFactors = [
    { factor: "Traffic Conditions", weight: 25, current: "Medium", impact: "moderate" },
    { factor: "Delivery Windows", weight: 30, current: "Strict", impact: "high" },
    { factor: "Vehicle Capacity", weight: 20, current: "85%", impact: "good" },
    { factor: "Cold Chain Priority", weight: 15, current: "High", impact: "critical" },
    { factor: "Driver Availability", weight: 10, current: "Full", impact: "optimal" }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      "high": "bg-red-500/10 text-red-500",
      "medium": "bg-yellow-500/10 text-yellow-500",
      "low": "bg-green-500/10 text-green-500"
    };
    return colors[priority as keyof typeof colors];
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      "critical": "text-red-500",
      "high": "text-orange-500",
      "moderate": "text-yellow-500",
      "good": "text-blue-500",
      "optimal": "text-green-500"
    };
    return colors[impact as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Route Optimization Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Intelligent Route Optimization
              </CardTitle>
              <CardDescription>
                AI-powered route planning for maximum efficiency and customer satisfaction
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={optimizationMode} onValueChange={setOptimizationMode}>
                <SelectTrigger className="w-40">
                  <Settings className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance Priority</SelectItem>
                  <SelectItem value="time">Time Priority</SelectItem>
                  <SelectItem value="fuel">Fuel Priority</SelectItem>
                  <SelectItem value="hybrid">Hybrid Optimization</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
                <Zap className="h-4 w-4 mr-2" />
                Optimize Now
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Route Options */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
          <CardDescription>
            Compare different routing strategies for today's deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {routeOptions.map((option) => (
              <div 
                key={option.id} 
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  option.recommended 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border bg-card/50 hover:bg-card/70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{option.name}</h4>
                  {option.recommended && (
                    <Badge className="bg-primary/10 text-primary">
                      Recommended
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{option.totalDistance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{option.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>{option.fuelCost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <span>{option.deliveries} stops</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Efficiency Score</span>
                      <span className="font-bold text-primary">{option.efficiency}%</span>
                    </div>
                    <Progress value={option.efficiency} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>CO₂ Saved</span>
                      <span className="text-green-500 font-medium">{option.co2Saved}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Zones */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Delivery Zone Planning
            </CardTitle>
            <CardDescription>Optimized delivery zones with time windows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveryZones.map((zone, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{zone.zone}</h4>
                      <Badge className={getPriorityColor(zone.priority)}>
                        {zone.priority}
                      </Badge>
                    </div>
                    <span className="font-bold text-primary">{zone.orders} orders</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Time Window:</span>
                      <p className="font-medium">{zone.timeWindow}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Distance:</span>
                      <p className="font-medium">{zone.avgDistance}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm border-t pt-2">
                    <div>
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium ml-1">{zone.driver}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="font-medium ml-1">{zone.vehicle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Factors */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Optimization Factors
            </CardTitle>
            <CardDescription>Key variables affecting route planning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{factor.factor}</span>
                      <Badge variant="outline" className="text-xs">
                        {factor.weight}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{factor.current}</span>
                      <span className={`text-xs font-medium ${getImpactColor(factor.impact)}`}>
                        {factor.impact}
                      </span>
                    </div>
                  </div>
                  <Progress value={factor.weight * 3} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Comparison */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Route Performance Comparison
          </CardTitle>
          <CardDescription>
            Compare optimized routes vs manual planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-500">23%</div>
              <p className="text-sm font-medium">Distance Reduction</p>
              <p className="text-xs text-muted-foreground">vs manual routing</p>
            </div>

            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-500">35min</div>
              <p className="text-sm font-medium">Time Saved</p>
              <p className="text-xs text-muted-foreground">per route on average</p>
            </div>

            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">₹2,340</div>
              <p className="text-sm font-medium">Fuel Cost Savings</p>
              <p className="text-xs text-muted-foreground">monthly optimization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}