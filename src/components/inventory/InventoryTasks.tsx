import { useState } from "react";
import { CheckSquare, Clock, AlertTriangle, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InventoryTasks() {
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Quality check for tomato batch #TB-001",
      description: "Inspect 150kg tomato shipment from Green Farm",
      priority: "High",
      dueTime: "10:30 AM",
      category: "Quality Control",
      completed: false,
      estimatedTime: "30 min"
    },
    {
      id: 2,
      title: "Receive spinach delivery from Organic Farm", 
      description: "Process incoming spinach delivery and update inventory",
      priority: "Medium",
      dueTime: "11:00 AM",
      category: "Receiving",
      completed: false,
      estimatedTime: "45 min"
    },
    {
      id: 3,
      title: "Update inventory for yesterday's sales",
      description: "Reconcile sold items with physical stock count",
      priority: "Low", 
      dueTime: "2:00 PM",
      category: "Inventory Update",
      completed: true,
      estimatedTime: "1 hour"
    },
    {
      id: 4,
      title: "Pack orders for cold chain delivery",
      description: "Prepare 45 orders for temperature-controlled transport",
      priority: "High",
      dueTime: "3:30 PM", 
      category: "Packing",
      completed: false,
      estimatedTime: "2 hours"
    },
    {
      id: 5,
      title: "Temperature log maintenance",
      description: "Record and verify cold storage temperature readings",
      priority: "Medium",
      dueTime: "4:00 PM",
      category: "Maintenance",
      completed: false,
      estimatedTime: "15 min"
    },
    {
      id: 6,
      title: "Sanitize work area and equipment",
      description: "Daily cleaning and sanitization protocol",
      priority: "Medium",
      dueTime: "5:00 PM",
      category: "Cleaning",
      completed: false,
      estimatedTime: "30 min"
    }
  ]);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-500/10 text-red-500 border-red-200",
      "Medium": "bg-yellow-500/10 text-yellow-500 border-yellow-200",
      "Low": "bg-green-500/10 text-green-500 border-green-200"
    };
    return colors[priority as keyof typeof colors];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Quality Control": "bg-blue-500/10 text-blue-500",
      "Receiving": "bg-purple-500/10 text-purple-500", 
      "Inventory Update": "bg-cyan-500/10 text-cyan-500",
      "Packing": "bg-orange-500/10 text-orange-500",
      "Maintenance": "bg-indigo-500/10 text-indigo-500",
      "Cleaning": "bg-teal-500/10 text-teal-500"
    };
    return colors[category as keyof typeof colors];
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "high-priority") return task.priority === "High" && !task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
                <p className="text-sm text-muted-foreground">Tasks Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.priority === "High" && !t.completed).length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Management */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Daily Tasks
              </CardTitle>
              <CardDescription>
                Your assigned warehouse tasks for today
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="high-priority">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  task.completed 
                    ? "bg-muted/50 opacity-75" 
                    : "bg-card/50 hover:bg-card/70"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getCategoryColor(task.category)}>
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${task.completed ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Due: {task.dueTime}
                        </span>
                        <span>Est: {task.estimatedTime}</span>
                      </div>
                      
                      {!task.completed && (
                        <Button size="sm" variant="outline">
                          Start Task
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Quality Check</h3>
            <p className="text-sm text-muted-foreground">Start quality assessment</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Receive Stock</h3>
            <p className="text-sm text-muted-foreground">Process new delivery</p>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer hover:shadow-glow transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Temperature Log</h3>
            <p className="text-sm text-muted-foreground">Record readings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}