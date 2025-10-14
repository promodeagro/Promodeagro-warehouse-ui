import { useState } from "react";
import { Plus, Package, Truck, Users, ClipboardList, Tag, ShoppingCart, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    supplier: "",
    priority: "",
  });

  const quickActions = [
    {
      id: "product",
      title: "Add Product",
      description: "Create new product",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: "category",
      title: "Add Category", 
      description: "Create product category",
      icon: Tag,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      id: "supplier",
      title: "Add Supplier",
      description: "Register new supplier",
      icon: Truck,
      color: "text-blue-500", 
      bgColor: "bg-blue-500/10"
    },
    {
      id: "staff",
      title: "Add Staff",
      description: "Register new employee",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "order",
      title: "Create Order",
      description: "New purchase order",
      icon: ShoppingCart,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "task",
      title: "Add Task",
      description: "Create priority task",
      icon: ClipboardList,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: "report",
      title: "Generate Report",
      description: "Create custom report",
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    }
  ];

  const handleSubmit = (actionType: string) => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `${actionType} created successfully`,
    });

    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      quantity: "",
      supplier: "",
      priority: "",
    });
    setActiveDialog(null);
  };

  const renderDialogContent = (action: any) => {
    switch (action.id) {
      case "product":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name</label>
              <Input
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leafy">Leafy Greens</SelectItem>
                  <SelectItem value="root">Root Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="herbs">Herbs & Spices</SelectItem>
                  <SelectItem value="grains">Grains & Pulses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Price (₹/kg)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Initial Stock (kg)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );

      case "supplier":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Supplier Name</label>
              <Input
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Supplier Type</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farm">Local Farm</SelectItem>
                  <SelectItem value="wholesale">Wholesale Market</SelectItem>
                  <SelectItem value="organic">Organic Producer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Contact Details</label>
              <Textarea
                placeholder="Address, phone, email etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );

      case "task":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Title</label>
              <Input
                placeholder="Enter task title"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned To</label>
              <Select value={formData.supplier} onValueChange={(value) => setFormData({ ...formData, supplier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff1">Rajesh Kumar - Inventory</SelectItem>
                  <SelectItem value="staff2">Priya Sharma - Quality</SelectItem>
                  <SelectItem value="staff3">Amit Patel - Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Task description and requirements"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Quickly create new items and perform common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Dialog 
              key={action.id} 
              open={activeDialog === action.id} 
              onOpenChange={(open) => setActiveDialog(open ? action.id : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 hover:scale-105 transition-transform"
                >
                  <div className={`p-3 rounded-full ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    {action.title}
                  </DialogTitle>
                  <DialogDescription>
                    {action.description}
                  </DialogDescription>
                </DialogHeader>
                
                {renderDialogContent(action)}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleSubmit(action.title)} 
                    className="flex-1"
                  >
                    Create {action.title.split(' ')[1] || action.title}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveDialog(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};