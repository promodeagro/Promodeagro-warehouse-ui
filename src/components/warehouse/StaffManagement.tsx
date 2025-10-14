import { useState } from "react";
import { Users, Clock, Award, AlertCircle, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StaffManagement() {
  const [filterDepartment, setFilterDepartment] = useState("all");

  const staffMembers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Receiving Supervisor",
      department: "Receiving",
      shift: "Morning (6AM-2PM)",
      status: "active",
      performance: 95,
      hoursToday: 6.5,
      overtimeWeek: 2.5,
      tasksCompleted: 28,
      tasksTotal: 30,
      avatar: "RK"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Quality Control Lead",
      department: "Quality Control", 
      shift: "Morning (7AM-3PM)",
      status: "active",
      performance: 89,
      hoursToday: 5.2,
      overtimeWeek: 0,
      tasksCompleted: 17,
      tasksTotal: 20,
      avatar: "PS"
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Packing Team Leader",
      department: "Packing",
      shift: "Morning (8AM-4PM)",
      status: "break",
      performance: 78,
      hoursToday: 4.0,
      overtimeWeek: 8.5,
      tasksCompleted: 23,
      tasksTotal: 32,
      avatar: "AP"
    },
    {
      id: 4,
      name: "Sunita Reddy",
      role: "Dispatch Coordinator",
      department: "Dispatch",
      shift: "Morning (9AM-5PM)",
      status: "active",
      performance: 96,
      hoursToday: 3.5,
      overtimeWeek: 1.0,
      tasksCompleted: 45,
      tasksTotal: 46,
      avatar: "SR"
    },
    {
      id: 5,
      name: "Vikram Singh",
      role: "Maintenance Technician",
      department: "Maintenance",
      shift: "Full Day (8AM-5PM)",
      status: "active",
      performance: 92,
      hoursToday: 4.5,
      overtimeWeek: 3.0,  
      tasksCompleted: 8,
      tasksTotal: 10,
      avatar: "VS"
    },
    {
      id: 6,
      name: "Kavya Reddy",
      role: "Inventory Clerk",
      department: "Receiving",
      shift: "Evening (2PM-10PM)",
      status: "off-duty",
      performance: 87,
      hoursToday: 0,
      overtimeWeek: 0,
      tasksCompleted: 15,
      tasksTotal: 18,
      avatar: "KR"
    }
  ];

  const shifts = [
    {
      name: "Morning Shift",
      time: "6:00 AM - 2:00 PM",
      staff: 18,
      capacity: 20,
      efficiency: 94
    },
    {
      name: "Afternoon Shift", 
      time: "2:00 PM - 10:00 PM",
      staff: 6,
      capacity: 8,
      efficiency: 87
    },
    {
      name: "Night Shift",
      time: "10:00 PM - 6:00 AM", 
      staff: 0,
      capacity: 2,
      efficiency: 0
    }
  ];

  const departmentStats = [
    { department: "Receiving", staff: 6, efficiency: 94, target: 90 },
    { department: "Quality Control", staff: 4, efficiency: 89, target: 85 },
    { department: "Packing", staff: 8, efficiency: 78, target: 80 },
    { department: "Dispatch", staff: 3, efficiency: 96, target: 85 },
    { department: "Maintenance", staff: 2, efficiency: 92, target: 90 },
    { department: "Security", staff: 1, efficiency: 100, target: 95 }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      "active": "bg-green-500/10 text-green-500",
      "break": "bg-yellow-500/10 text-yellow-500",
      "off-duty": "bg-gray-500/10 text-gray-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-500";
    if (performance >= 80) return "text-blue-500";
    if (performance >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getEfficiencyColor = (efficiency: number, target: number) => {
    if (efficiency >= target) return "text-green-500";
    if (efficiency >= target * 0.9) return "text-yellow-500";
    return "text-red-500";
  };

  const filteredStaff = staffMembers.filter(staff => 
    filterDepartment === "all" || staff.department === filterDepartment
  );

  return (
    <div className="space-y-6">
      {/* Staff Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">18</p>
                <p className="text-sm text-muted-foreground">On Duty</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">3</p>
                <p className="text-sm text-muted-foreground">Overtime Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Directory */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Staff Directory
              </CardTitle>
              <CardDescription>
                Current staff status and performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Receiving">Receiving</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                  <SelectItem value="Packing">Packing</SelectItem>
                  <SelectItem value="Dispatch">Dispatch</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <div className="h-full w-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                        {staff.avatar}
                      </div>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {staff.department}
                        </Badge>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getPerformanceColor(staff.performance)}`}>
                      {staff.performance}%
                    </span>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Shift</p>
                    <p className="font-medium">{staff.shift}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours Today</p>
                    <p className="font-medium">{staff.hoursToday}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overtime (Week)</p>
                    <p className={`font-medium ${staff.overtimeWeek > 5 ? 'text-orange-500' : ''}`}>
                      {staff.overtimeWeek}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tasks Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(staff.tasksCompleted / staff.tasksTotal) * 100} 
                        className="h-2 flex-1" 
                      />
                      <span className="text-xs font-mono">
                        {staff.tasksCompleted}/{staff.tasksTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shift Management */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Shift Management
            </CardTitle>
            <CardDescription>Current shift allocation and capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shifts.map((shift, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{shift.name}</h4>
                      <p className="text-sm text-muted-foreground">{shift.time}</p>
                    </div>
                    <Badge variant={shift.staff > 0 ? "default" : "secondary"}>
                      {shift.staff > 0 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Staff Allocation</span>
                      <span className="font-medium">{shift.staff}/{shift.capacity}</span>
                    </div>
                    <Progress value={(shift.staff / shift.capacity) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span>Efficiency</span>
                      <span className="font-bold">{shift.efficiency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Department Performance
            </CardTitle>
            <CardDescription>Team efficiency by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">{dept.staff} staff members</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getEfficiencyColor(dept.efficiency, dept.target)}`}>
                        {dept.efficiency}%
                      </span>
                      <p className="text-xs text-muted-foreground">Target: {dept.target}%</p>
                    </div>
                  </div>
                  <Progress value={dept.efficiency} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}