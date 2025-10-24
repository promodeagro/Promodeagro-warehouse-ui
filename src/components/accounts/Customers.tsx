import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";

export default function Customers() {
  const [query, setQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all_time");
  const [segment, setSegment] = useState("all");

  const customers = useMemo(() => [
    { id: "CUS-001", registeredAt: "2025-06-10 10:45", name: "Rajesh Kumar", mobile: "+91 9876543210", email: "rajesh.kumar@email.com", address: "123 MG Road", pincode: "500006", orders: 3, aov: 450, revenue: 1350, cod: 2, prepaid: 1, timing: "Morning", returns: 0, cancelled: 0, firstOrder: "2025-06-12 11:10", lastOrder: "2025-10-10 09:20", daysSince: 5, health: "Good", segment: "regular", categorySize: 5, products: 18, status: "Active" },
    { id: "CUS-002", registeredAt: "2025-07-02 14:22", name: "Priya Sharma", mobile: "+91 9876543211", email: "priya.sharma@email.com", address: "56 Park Street", pincode: "500032", orders: 0, aov: 0, revenue: 0, cod: 0, prepaid: 0, timing: "Evening", returns: 0, cancelled: 0, firstOrder: "-", lastOrder: "-", daysSince: 0, health: "Dormant", segment: "budget", categorySize: 0, products: 0, status: "Active" },
    { id: "CUS-003", registeredAt: "2025-05-28 09:10", name: "Amit Patel", mobile: "+91 7654321098", email: "amit.patel@email.com", address: "DLF Phase 2", pincode: "500081", orders: 5, aov: 520, revenue: 2600, cod: 1, prepaid: 4, timing: "Afternoon", returns: 1, cancelled: 0, firstOrder: "2025-06-01 16:05", lastOrder: "2025-10-09 18:30", daysSince: 6, health: "Great", segment: "premium", categorySize: 9, products: 24, status: "Active" },
  ], []);

  const filtered = useMemo(() => customers.filter(c => {
    const q = query.trim().toLowerCase();
    const matches = !q || [c.id, c.name, c.mobile, c.email].some(v => v.toLowerCase().includes(q));
    const segOk = segment === "all" || c.segment === segment;
    return matches && segOk;
  }), [customers, query, segment]);

  const totalCustomers = customers.length;
  const zeroOrders = customers.filter(c => c.orders === 0).length;
  const activeCustomers = customers.filter(c => c.status === "Active").length;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground">Manage registered customers and data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Customers" value={totalCustomers} icon={Users} variant="info" filled />
        <StatCard title="Customers with 0 Orders" value={zeroOrders} icon={UserPlus} variant="default" filled />
        <StatCard title="Active Customers" value={activeCustomers} icon={Activity} variant="success" filled />
      </div>

      <div className="flex items-center gap-4">
        <Input placeholder="Search by name, mobile, or email..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-lg" />
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Time" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Segment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Customer Database</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pr-6">Customer ID</TableHead>
                  <TableHead className="pr-6">Registered</TableHead>
                  <TableHead className="pr-6">Customer Name</TableHead>
                  <TableHead className="pr-6">Mobile No</TableHead>
                  <TableHead className="pr-6">Email</TableHead>
                  <TableHead className="pr-6">Address</TableHead>
                  <TableHead className="pr-6">Pincode</TableHead>
                  <TableHead className="pr-6 text-right">Orders</TableHead>
                  <TableHead className="pr-6 text-right">Avg Order Value</TableHead>
                  <TableHead className="pr-6 text-right">Revenue Generated</TableHead>
                  <TableHead className="pr-6 text-right">COD</TableHead>
                  <TableHead className="pr-6 text-right">Prepaid</TableHead>
                  <TableHead className="pr-6">Order Timings</TableHead>
                  <TableHead className="pr-6 text-right">Return Orders</TableHead>
                  <TableHead className="pr-6 text-right">Cancelled Orders</TableHead>
                  <TableHead className="pr-6">First Order</TableHead>
                  <TableHead className="pr-6">Last Purchase</TableHead>
                  <TableHead className="pr-6 text-right">Days Since Last</TableHead>
                  <TableHead className="pr-6">Customer Health</TableHead>
                  <TableHead className="pr-6">Segmentation</TableHead>
                  <TableHead className="pr-6 text-right">Category Size</TableHead>
                  <TableHead className="pr-6 text-right">Products</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pr-6">{c.id}</TableCell>
                    <TableCell className="pr-6">{c.registeredAt}</TableCell>
                    <TableCell className="pr-6">{c.name}</TableCell>
                    <TableCell className="pr-6">{c.mobile}</TableCell>
                    <TableCell className="pr-6">{c.email}</TableCell>
                    <TableCell className="pr-6">{c.address}</TableCell>
                    <TableCell className="pr-6">{c.pincode}</TableCell>
                    <TableCell className="pr-6 text-right">{c.orders}</TableCell>
                    <TableCell className="pr-6 text-right">₹{c.aov.toLocaleString()}</TableCell>
                    <TableCell className="pr-6 text-right">₹{c.revenue.toLocaleString()}</TableCell>
                    <TableCell className="pr-6 text-right">{c.cod}</TableCell>
                    <TableCell className="pr-6 text-right">{c.prepaid}</TableCell>
                    <TableCell className="pr-6">{c.timing}</TableCell>
                    <TableCell className="pr-6 text-right">{c.returns}</TableCell>
                    <TableCell className="pr-6 text-right">{c.cancelled}</TableCell>
                    <TableCell className="pr-6">{c.firstOrder}</TableCell>
                    <TableCell className="pr-6">{c.lastOrder}</TableCell>
                    <TableCell className="pr-6 text-right">{c.daysSince}</TableCell>
                    <TableCell className="pr-6">{c.health}</TableCell>
                    <TableCell className="pr-6 capitalize">{c.segment}</TableCell>
                    <TableCell className="pr-6 text-right">{c.categorySize}</TableCell>
                    <TableCell className="pr-6 text-right">{c.products}</TableCell>
                    <TableCell className="pr-6">{c.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}