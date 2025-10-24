import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function Purchases() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this_month");

  const purchases = useMemo(() => {
    try {
      const stored = localStorage.getItem("purchases");
      const parsed = stored ? JSON.parse(stored) : [];
      return parsed;
    } catch (_) {
      return [];
    }
  }, []);

  // Filter purchases based on search and filters
  const filteredPurchases = useMemo(() => {
    let filtered = purchases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(purchase => 
        purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    // Time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (timeFilter === "today") {
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= today;
      });
    } else if (timeFilter === "this_week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= weekAgo;
      });
    } else if (timeFilter === "this_month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= monthAgo;
      });
    } else if (timeFilter === "last_month") {
      const twoMonthsAgo = new Date(today);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= twoMonthsAgo && purchaseDate < oneMonthAgo;
      });
    }

    return filtered;
  }, [purchases, searchTerm, statusFilter, timeFilter]);

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || purchase.amount), 0);
    const pendingPayments = filteredPurchases
      .filter(purchase => purchase.status === "pending")
      .reduce((sum, purchase) => sum + (purchase.totalAmount || purchase.amount), 0);
    const paidThisMonth = filteredPurchases
      .filter(purchase => purchase.status === "paid")
      .reduce((sum, purchase) => sum + (purchase.totalAmount || purchase.amount), 0);

    return {
      totalPurchases,
      pendingPayments,
      paidThisMonth,
    };
  }, [filteredPurchases]);

  const handleCancel = (purchaseId: string) => {
    try {
      const stored = localStorage.getItem("purchases");
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = list.map((purchase: any) =>
        purchase.id === purchaseId
          ? { ...purchase, status: "cancelled" }
          : purchase
      );
      localStorage.setItem("purchases", JSON.stringify(updatedList));
      
      toast({
        title: "Purchase Cancelled",
        description: "Purchase order has been cancelled successfully.",
      });
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling purchase:", error);
      toast({
        title: "Error",
        description: "Failed to cancel purchase order.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground">Track purchase orders and vendor payments</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/purchases/new')}>
          <Plus className="h-4 w-4" />
          New Purchase Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Purchases (Month)</p>
            <h3 className="text-2xl font-bold mt-2">₹{stats.totalPurchases.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <h3 className="text-2xl font-bold mt-2 text-warning">₹{stats.pendingPayments.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Paid This Month</p>
            <h3 className="text-2xl font-bold mt-2 text-success">₹{stats.paidThisMonth.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number or vendor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases List */}
      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{purchase.id}</h3>
                    <Badge variant={purchase.status === "paid" ? "default" : purchase.status === "cancelled" ? "destructive" : "secondary"}>
                      {purchase.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Vendor: {purchase.vendor}</p>
                  <p className="text-sm text-muted-foreground">Date: {purchase.date} | Items: {purchase.itemsCount || purchase.items}</p>
                  <p className="text-sm text-muted-foreground">Payment: {purchase.paymentMode} | Due: {purchase.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{(purchase.totalAmount || purchase.amount).toLocaleString()}</p>
                  <div className="mt-3 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/purchases/${purchase.id}`)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/purchases/${purchase.id}/edit`)}>Edit</Button>
                    {purchase.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(purchase.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
                      >
                        Cancel Purchase
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}