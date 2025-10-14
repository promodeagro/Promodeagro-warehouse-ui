import { useState } from "react";
import { CheckCircle, XCircle, Clock, Filter, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function DeliveryHistory() {
  const [filterPeriod, setFilterPeriod] = useState("today");
  const [filterStatus, setFilterStatus] = useState("all");

  const deliveryHistory = [
    {
      id: "ORD-045",
      customer: "Sunita Reddy",
      address: "Kondapur, Hyderabad",
      timestamp: "14:30",
      date: "Today",
      status: "delivered",
      amount: "₹1,250",
      items: 6,
      rating: 5,
      paymentMode: "Online"
    },
    {
      id: "ORD-044", 
      customer: "Vikram Singh",
      address: "Banjara Hills, Hyderabad",
      timestamp: "13:45",
      date: "Today",
      status: "delivered",
      amount: "₹890",
      items: 4,
      rating: 4,
      paymentMode: "COD"
    },
    {
      id: "ORD-043",
      customer: "Kavya Sharma",
      address: "Hitech City, Hyderabad", 
      timestamp: "12:20",
      date: "Today",
      status: "failed",
      amount: "₹560",
      items: 3,
      rating: null,
      paymentMode: "COD",
      failureReason: "Customer not available"
    },
    {
      id: "ORD-042",
      customer: "Ravi Kumar",
      address: "Secunderabad",
      timestamp: "11:15",
      date: "Today", 
      status: "delivered",
      amount: "₹2,100",
      items: 8,
      rating: 5,
      paymentMode: "Online"
    },
    {
      id: "ORD-038",
      customer: "Meera Patel",
      address: "Begumpet, Hyderabad",
      timestamp: "16:30",
      date: "Yesterday",
      status: "delivered", 
      amount: "₹750",
      items: 5,
      rating: 4,
      paymentMode: "COD"
    },
    {
      id: "ORD-037",
      customer: "Arjun Reddy", 
      address: "Madhapur, Hyderabad",
      timestamp: "15:45",
      date: "Yesterday",
      status: "delivered",
      amount: "₹1,480",
      items: 7,
      rating: 5,
      paymentMode: "Online"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      "delivered": "bg-green-500/10 text-green-500",
      "failed": "bg-red-500/10 text-red-500", 
      "rescheduled": "bg-yellow-500/10 text-yellow-500"
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      "delivered": CheckCircle,
      "failed": XCircle,
      "rescheduled": Clock
    };
    return icons[status as keyof typeof icons];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const filteredHistory = deliveryHistory.filter(delivery => {
    if (filterStatus !== "all" && delivery.status !== filterStatus) return false;
    
    if (filterPeriod === "today" && delivery.date !== "Today") return false;
    if (filterPeriod === "yesterday" && delivery.date !== "Yesterday") return false;
    
    return true;
  });

  // Calculate stats
  const totalDeliveries = filteredHistory.length;
  const successfulDeliveries = filteredHistory.filter(d => d.status === "delivered").length;
  const failedDeliveries = filteredHistory.filter(d => d.status === "failed").length;
  const successRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0;
  const totalEarnings = filteredHistory
    .filter(d => d.status === "delivered")
    .reduce((sum, d) => sum + parseInt(d.amount.replace("₹", "").replace(",", "")), 0);

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalDeliveries}</p>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{successfulDeliveries}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{failedDeliveries}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-primary rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Delivery History
              </CardTitle>
              <CardDescription>
                Your recent delivery performance and records
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((delivery) => {
              const StatusIcon = getStatusIcon(delivery.status);
              return (
                <div key={delivery.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {delivery.id}
                      </Badge>
                      <Badge className={getStatusColor(delivery.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {delivery.status === "delivered" ? "Delivered" : 
                         delivery.status === "failed" ? "Failed" : "Rescheduled"}
                      </Badge>
                      {delivery.paymentMode && (
                        <Badge variant="outline" className="text-xs">
                          {delivery.paymentMode}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{delivery.amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {delivery.date} {delivery.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="font-medium">{delivery.customer}</p>
                      <p className="text-sm text-muted-foreground">{delivery.address}</p>
                    </div>
                    
                    <div className="text-sm">
                      <p><span className="font-medium">Items:</span> {delivery.items}</p>
                      {delivery.failureReason && (
                        <p className="text-red-500">
                          <span className="font-medium">Reason:</span> {delivery.failureReason}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      {delivery.rating && (
                        <div className="flex items-center justify-end gap-1">
                          {renderStars(delivery.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({delivery.rating}/5)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Your delivery performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="font-bold text-green-500">{successRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Today's Achievements</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>On-time Deliveries</span>
                  <Badge className="bg-green-500/10 text-green-500">95%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Customer Satisfaction</span>
                  <Badge className="bg-blue-500/10 text-blue-500">4.8/5</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Distance Covered</span>
                  <Badge variant="outline">45.2 km</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}