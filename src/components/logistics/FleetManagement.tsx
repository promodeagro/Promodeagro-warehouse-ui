import { useState } from "react";
import { Truck, Fuel, Wrench, Calendar, AlertTriangle, CheckCircle, Clock, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function FleetManagement() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([
    {
      id: "DLV-001",
      make: "Tata Ace",
      year: "2022",
      driver: "Rajesh Kumar",
      status: "active",
      location: "Gachibowli",
      fuelLevel: 78,
      mileage: 15432,
      nextService: "2 weeks",
      efficiency: 12.5,
      temperature: 3.2,
      deliveriesToday: 8,
      lastMaintenance: "2024-01-10"
    },
    {
      id: "DLV-002", 
      make: "Mahindra Bolero",
      year: "2023",
      driver: "Priya Sharma",
      status: "active",
      location: "Jubilee Hills",
      fuelLevel: 65,
      mileage: 8945,
      nextService: "1 month",
      efficiency: 11.8,
      temperature: 2.8,
      deliveriesToday: 12,
      lastMaintenance: "2024-01-15"
    },
    {
      id: "DLV-003",
      make: "Tata Ace",
      year: "2021", 
      driver: "Amit Patel",
      status: "maintenance",
      location: "Service Center",
      fuelLevel: 45,
      mileage: 25678,
      nextService: "In Progress",
      efficiency: 10.2,
      temperature: null,
      deliveriesToday: 0,
      lastMaintenance: "2024-01-20"
    },
    {
      id: "DLV-004",
      make: "Ashok Leyland Dost",
      year: "2022",
      driver: "Sunita Reddy", 
      status: "active",
      location: "Kondapur",
      fuelLevel: 92,
      mileage: 12234,
      nextService: "3 weeks",
      efficiency: 13.1,
      temperature: 4.1,
      deliveriesToday: 6,
      lastMaintenance: "2024-01-08"
    },
    {
      id: "DLV-005",
      make: "Tata Ace",
      year: "2020",
      driver: "Vikram Singh",
      status: "idle",
      location: "Warehouse",
      fuelLevel: 88,
      mileage: 34567,
      nextService: "Overdue",
      efficiency: 9.8,
      temperature: 6.2,
      deliveriesToday: 0,
      lastMaintenance: "2023-12-15"
    }
  ]);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    id: "",
    make: "",
    year: "",
    driver: "",
    fuelCapacity: "",
    registrationNumber: "",
    insuranceExpiry: "",
    pucExpiry: ""
  });

  const handleAddVehicle = () => {
    if (!vehicleForm.id || !vehicleForm.make || !vehicleForm.year || !vehicleForm.driver) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const newVehicle = {
      id: vehicleForm.id,
      make: vehicleForm.make,
      year: vehicleForm.year,
      driver: vehicleForm.driver,
      status: "idle" as const,
      location: "Warehouse",
      fuelLevel: 100,
      mileage: 0,
      nextService: "3 months",
      efficiency: 12.0,
      temperature: null,
      deliveriesToday: 0,
      lastMaintenance: new Date().toISOString().split('T')[0]
    };

    setVehicles([...vehicles, newVehicle]);
    setVehicleForm({
      id: "",
      make: "",
      year: "",
      driver: "",
      fuelCapacity: "",
      registrationNumber: "",
      insuranceExpiry: "",
      pucExpiry: ""
    });
    setIsAddVehicleOpen(false);
    
    toast({
      title: "Success",
      description: "Vehicle added successfully",
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    toast({
      title: "Success",
      description: "Vehicle removed from fleet",
    });
  };

  const maintenanceSchedule = [
    {
      vehicle: "DLV-003",
      type: "Brake Service",
      status: "in-progress",
      technician: "Service Center A",
      cost: "₹8,500",
      eta: "2 hours"
    },
    {
      vehicle: "DLV-005",
      type: "Engine Service",
      status: "scheduled",
      technician: "Service Center B", 
      cost: "₹12,000",
      eta: "Tomorrow"
    },
    {
      vehicle: "DLV-001",
      type: "Tire Rotation",
      status: "scheduled",
      technician: "Service Center A",
      cost: "₹2,500",
      eta: "Next Week"
    }
  ];

  const fleetAnalytics = [
    { metric: "Fleet Utilization", current: 85, target: 80, unit: "%" },
    { metric: "Avg Fuel Efficiency", current: 12.3, target: 12.0, unit: "km/l" },
    { metric: "Maintenance Cost", current: 15.2, target: 18.0, unit: "₹/km" },
    { metric: "Vehicle Uptime", current: 94, target: 90, unit: "%" }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      "active": "bg-green-500/10 text-green-500",
      "idle": "bg-yellow-500/10 text-yellow-500",
      "maintenance": "bg-red-500/10 text-red-500",
      "out-of-service": "bg-gray-500/10 text-gray-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getMaintenanceStatusColor = (status: string) => {
    const colors = {
      "scheduled": "bg-blue-500/10 text-blue-500",
      "in-progress": "bg-yellow-500/10 text-yellow-500",
      "completed": "bg-green-500/10 text-green-500",
      "overdue": "bg-red-500/10 text-red-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getFuelLevelColor = (level: number) => {
    if (level >= 70) return "text-green-500";
    if (level >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getTemperatureStatus = (temp: number | null) => {
    if (temp === null) return { color: "text-gray-500", status: "N/A" };
    if (temp <= 4) return { color: "text-green-500", status: "Normal" };
    if (temp <= 6) return { color: "text-yellow-500", status: "Warm" };
    return { color: "text-red-500", status: "Critical" };
  };

  return (
    <div className="space-y-6">
      {/* Fleet Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {fleetAnalytics.map((metric, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <span className="text-xs text-muted-foreground">
                    Target: {metric.target}{metric.unit}
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {metric.current}{metric.unit}
                </div>
                <Progress 
                  value={metric.unit === "₹/km" ? 
                    ((metric.target - metric.current) / metric.target) * 100 :
                    (metric.current / metric.target) * 100
                  } 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicle Fleet */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Fleet Status Overview
              </CardTitle>
              <CardDescription>
                Real-time status and performance of all delivery vehicles
              </CardDescription>
            </div>
            
            <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Register a new vehicle to the fleet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vehicle ID</label>
                    <Input
                      placeholder="e.g., DLV-006"
                      value={vehicleForm.id}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Make & Model</label>
                    <Select value={vehicleForm.make} onValueChange={(value) => setVehicleForm({ ...vehicleForm, make: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle make" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tata Ace">Tata Ace</SelectItem>
                        <SelectItem value="Mahindra Bolero">Mahindra Bolero</SelectItem>
                        <SelectItem value="Ashok Leyland Dost">Ashok Leyland Dost</SelectItem>
                        <SelectItem value="Maruti Suzuki Super Carry">Maruti Suzuki Super Carry</SelectItem>
                        <SelectItem value="Piaggio Porter">Piaggio Porter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Year</label>
                      <Input
                        placeholder="2024"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Fuel Capacity (L)</label>
                      <Input
                        placeholder="45"
                        value={vehicleForm.fuelCapacity}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, fuelCapacity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assigned Driver</label>
                    <Input
                      placeholder="Driver name"
                      value={vehicleForm.driver}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driver: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Registration Number</label>
                    <Input
                      placeholder="TS09EA1234"
                      value={vehicleForm.registrationNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddVehicle} className="flex-1">
                    Add Vehicle
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const tempStatus = getTemperatureStatus(vehicle.temperature);
              return (
                <div key={vehicle.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{vehicle.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.make} ({vehicle.year})
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(vehicle.status)}>
                            {vehicle.status}
                          </Badge>
                          {vehicle.temperature && (
                            <Badge variant="outline" className={`text-xs ${tempStatus.color}`}>
                              {vehicle.temperature}°C
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <div className="h-full w-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {vehicle.driver.split(' ').map(n => n[0]).join('')}
                          </div>
                        </Avatar>
                        <span className="text-sm font-medium">{vehicle.driver}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {vehicle.location}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-5 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Fuel Level</p>
                      <div className="flex items-center gap-2">
                        <Progress value={vehicle.fuelLevel} className="h-2 flex-1" />
                        <span className={`font-bold ${getFuelLevelColor(vehicle.fuelLevel)}`}>
                          {vehicle.fuelLevel}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Mileage</p>
                      <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Efficiency</p>
                      <p className="font-medium">{vehicle.efficiency} km/l</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Deliveries Today</p>
                      <p className="font-medium">{vehicle.deliveriesToday}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Next Service</p>
                      <p className={`font-medium ${
                        vehicle.nextService.includes('Overdue') ? 'text-red-500' : 
                        vehicle.nextService.includes('Progress') ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {vehicle.nextService}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maintenance Schedule */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-accent" />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>Upcoming and ongoing maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceSchedule.map((maintenance, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {maintenance.vehicle}
                      </Badge>
                      <Badge className={getMaintenanceStatusColor(maintenance.status)}>
                        {maintenance.status}
                      </Badge>
                    </div>
                    <span className="font-bold text-primary">{maintenance.cost}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-medium">{maintenance.type}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{maintenance.technician}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>ETA: {maintenance.eta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Health Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-secondary" />
              Fleet Health Summary
            </CardTitle>
            <CardDescription>Overall fleet condition and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-500">12</div>
                  <p className="text-sm text-muted-foreground">Operational</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-500">2</div>
                  <p className="text-sm text-muted-foreground">In Service</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-500">1</div>
                  <p className="text-sm text-muted-foreground">Attention Needed</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Fleet Health</span>
                    <span className="text-sm font-bold text-green-500">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Priority Actions</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Schedule service for DLV-005 (overdue)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>Monitor temperature for DLV-005</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fleet performing above targets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Schedule Maintenance</h3>
            <p className="text-sm text-muted-foreground">Plan vehicle service</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
              <Fuel className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Fuel Management</h3>
            <p className="text-sm text-muted-foreground">Track fuel consumption</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
              <Truck className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Add Vehicle</h3>
            <p className="text-sm text-muted-foreground">Register new vehicle</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold mb-2">Incident Report</h3>
            <p className="text-sm text-muted-foreground">Log vehicle issues</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}