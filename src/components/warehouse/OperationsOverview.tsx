import { Thermometer, Package, TrendingUp, Clock, Users, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OrderNotificationDemo } from "@/components/OrderNotificationDemo";

export function OperationsOverview() {
  const storageUnits = [
    {
      name: "Cold Storage A",
      capacity: "15 tonnes",
      current: "12.3 tonnes",
      utilization: 82,
      temperature: "2.5°C",
      status: "optimal"
    },
    {
      name: "Cold Storage B", 
      capacity: "15 tonnes",
      current: "14.1 tonnes",
      utilization: 94,
      temperature: "5.2°C",
      status: "warning"
    },
    {
      name: "Dry Storage",
      capacity: "25 tonnes",
      current: "18.7 tonnes", 
      utilization: 75,
      temperature: "22°C",
      status: "optimal"
    },
    {
      name: "Freezer Unit",
      capacity: "8 tonnes",
      current: "0.7 tonnes",
      utilization: 9,
      temperature: "-18°C",
      status: "optimal"
    }
  ];

  const todayOperations = [
    { time: "06:00", operation: "Daily inventory count started", department: "All Sections", status: "completed" },
    { time: "07:30", operation: "Morning shift handover", department: "Operations", status: "completed" },
    { time: "08:15", operation: "Tomato delivery received - 500kg", department: "Receiving", status: "completed" },
    { time: "09:45", operation: "Quality check batch #SP-002", department: "Quality Control", status: "in-progress" },
    { time: "10:30", operation: "Packing 45 orders for delivery", department: "Packing", status: "in-progress" },
    { time: "11:00", operation: "Temperature calibration - Storage B", department: "Maintenance", status: "pending" }
  ];

  const workforceDistribution = [
    { department: "Receiving", staff: 6, shift: "Morning", efficiency: 95 },
    { department: "Quality Control", staff: 4, shift: "Morning", efficiency: 89 },
    { department: "Packing", staff: 8, shift: "Morning", efficiency: 78 },
    { department: "Dispatch", staff: 3, shift: "Morning", efficiency: 96 },
    { department: "Maintenance", staff: 2, shift: "Full Day", efficiency: 92 },
    { department: "Security", staff: 1, shift: "24/7", efficiency: 100 }
  ];

  const getStorageStatusColor = (status: string) => {
    const colors = {
      "optimal": "text-green-500",
      "warning": "text-yellow-500",
      "critical": "text-red-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getOperationStatusColor = (status: string) => {
    const colors = {
      "completed": "bg-green-500/10 text-green-500",
      "in-progress": "bg-blue-500/10 text-blue-500",
      "pending": "bg-yellow-500/10 text-yellow-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-500";
    if (utilization >= 80) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Storage Facility Overview
          </CardTitle>
          <CardDescription>
            Real-time storage capacity and temperature monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {storageUnits.map((unit, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">{unit.name}</h4>
                  <Badge className={getStorageStatusColor(unit.status).replace('text-', 'bg-').replace('-500', '-500/10')}>
                    {unit.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Capacity</span>
                    <span className="font-medium">{unit.current} / {unit.capacity}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Utilization</span>
                      <span className={`font-bold ${getUtilizationColor(unit.utilization)}`}>
                        {unit.utilization}%
                      </span>
                    </div>
                    <Progress value={unit.utilization} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      Temperature
                    </span>
                    <span className={`font-mono font-medium ${getStorageStatusColor(unit.status)}`}>
                      {unit.temperature}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Operations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Today's Operations Timeline
            </CardTitle>
            <CardDescription>Real-time operational activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayOperations.map((operation, index) => (
                <div key={index} className="flex items-start gap-4 border-l-2 border-primary/20 pl-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{operation.operation}</span>
                      <Badge className={getOperationStatusColor(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">{operation.time}</span>
                      <span>{operation.department}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workforce Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Workforce Distribution
            </CardTitle>
            <CardDescription>Current staff allocation and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workforceDistribution.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{dept.department}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {dept.staff} staff
                      </span>
                      <span>{dept.shift}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm">{dept.efficiency}%</span>
                    <p className="text-xs text-muted-foreground">Efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>Today's warehouse performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gradient-primary">98.5%</div>
              <p className="text-sm font-medium">Order Accuracy</p>
              <p className="text-xs text-muted-foreground">1,227 of 1,247 orders</p>
            </div>

            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-500">15min</div>
              <p className="text-sm font-medium">Avg. Processing Time</p>
              <p className="text-xs text-muted-foreground">Target: 20min</p>
            </div>

            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">Zero</div>
              <p className="text-sm font-medium">Safety Incidents</p>
              <p className="text-xs text-muted-foreground">45 days streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notification Demo */}
      <div className="mt-8">
        <OrderNotificationDemo />
      </div>
    </div>
  );
}