import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { orders, type OrderStatus, type PaymentMode } from "@/data/orderData";
import { ArrowLeft, Search, Package, CheckCircle, XCircle, Clock, Calendar, MapPin, User, Phone, Filter, ChevronDown, ChevronUp, IndianRupee, Plus, Printer, CreditCard, CheckCircle2, XCircle as XCircleIcon, Truck, RotateCcw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useMemo } from "react";

const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMode | "all">("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false);
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.payment_mode === paymentFilter;
    const matchesZone = zoneFilter === "all" || order.zone === zoneFilter;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesZone;
  });

  const zones = Array.from(new Set(orders.map(o => o.zone)));

  const orderStats = useMemo(() => ({
    total: orders.length,
    placed: orders.filter(o => o.status === 'Placed').length,
    accepted: orders.filter(o => o.status === 'Accepted').length,
    packed: orders.filter(o => o.status === 'Packed').length,
    dispatched: orders.filter(o => o.status === 'Dispatched').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    returned: orders.filter(o => o.status === 'Returned').length,
  }), []);

  const getPaymentStatus = (order: typeof orders[0]): 'Paid' | 'Pending' | 'Failed' => {
    if (order.payment_mode === 'Online') {
      // Check if payment failed
      if (order.status === 'Failed') return 'Failed';
      // Online payment successful
      return 'Paid';
    }
    // COD orders - always Pending until delivered
    if (order.status === 'Delivered') return 'Paid';
    return 'Pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Placed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'Accepted':
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      case 'Packed':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'Dispatched':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'Returned':
        return <RotateCcw className="h-4 w-4 text-yellow-600" />;
      case 'Failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/operations">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Orders</h1>
                <p className="text-sm text-muted-foreground">{filteredOrders.length} orders found</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Multiple Print
              </Button>
              <Dialog open={showAddOrderDialog} onOpenChange={setShowAddOrderDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-success hover:bg-success/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Customer Name</label>
                      <Input placeholder="Enter customer name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Invoice Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Due Date (Optional)</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Payment Status</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Payment Mode</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Cash On Hand (₹5,000)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">Cash On Hand (₹5,000)</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Income Account</label>
                    <Input placeholder="Direct Sales (₹5,430)" disabled />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Invoice Items</label>
                      <Button variant="link" size="sm" className="text-success">
                        + Add Item
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                      No items added. Click "+ Add Item" to add items to the invoice.
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                    <textarea 
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md" 
                      placeholder="Add any notes for this invoice..."
                    />
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping Charge:</span>
                      <Input type="number" defaultValue="0" className="w-24 h-8 text-right" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount (%):</span>
                      <Input type="number" defaultValue="0" className="w-24 h-8 text-right" />
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>₹0.00</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddOrderDialog(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-success hover:bg-success/90">
                      Create Invoice
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{orderStats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Placed</p>
              <p className="text-2xl font-bold text-blue-600">{orderStats.placed}</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Accepted</p>
              <p className="text-2xl font-bold text-cyan-600">{orderStats.accepted}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Returned</p>
              <p className="text-2xl font-bold text-orange-600">{orderStats.returned}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Checkbox 
            id="select-all"
            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium text-foreground cursor-pointer">
            Total Selected Items: {selectedOrders.size}
          </label>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or customer name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 min-w-[120px]"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {showFilters && (
            <Card className="animate-fade-in">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Placed">Placed</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment</SelectItem>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      {zones.map(zone => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const isSelected = selectedOrders.has(order.id);
            return (
            <Card
              key={order.id}
              className={`transition-all border-l-4 hover:border-l-\[#16a249\]`}
              style={{ borderLeftColor: isSelected ? '#16a249' : 'hsl(var(--muted))' }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Checkbox 
                    checked={selectedOrders.has(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Link to={`/order-management/orders/${order.id}`} className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-foreground">{order.order_number}</h3>
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 h-6 text-xs font-medium leading-none ${
                              order.payment_mode === 'Online'
                                ? 'bg-[#16a249] text-white'
                                : 'bg-[#000000] text-white'
                            }`}
                          >
                            {order.payment_mode === 'Online' ? 'Prepaid' : 'COD'}
                          </span>
                        </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{order.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{order.customer_phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Oct 10, 2025</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="font-bold text-lg text-foreground">₹{order.total_amount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex text-sm py-3 border-t border-b mt-[10px] my-0.5">
                        <div className="flex items-center gap-2 flex-1 pr-3 border-r border-gray-200">
                          <div className="rounded-full p-2 bg-orange-100">
                            <Package className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Items</p>
                            <p className="font-semibold text-foreground mt-1">{order.items.length} Items</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 px-3 border-r border-gray-200">
                          <div className="rounded-full p-2 bg-blue-100">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Delivery Slot</p>
                            <p className="font-semibold text-foreground truncate mt-1">{order.delivery_slot}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 px-3 border-r border-gray-200">
                          <div className="rounded-full p-2 bg-green-100">
                            <CreditCard className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Status</p>
                            <div className="mt-1">
                              <Badge variant={getPaymentStatus(order) === 'Paid' ? 'default' : getPaymentStatus(order) === 'Failed' ? 'destructive' : 'secondary'}
                                className={getPaymentStatus(order) === 'Paid' ? 'bg-green-100 text-green-700' : ''}
                              >
                                {getPaymentStatus(order)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 pl-3">
                          <div className="rounded-full p-2 bg-purple-100">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="mt-1">
                              <StatusBadge status={order.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {order.address}
                        </p>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
          )})}
        </div>
      </main>
    </div>
  );
};

export default OrdersList;
