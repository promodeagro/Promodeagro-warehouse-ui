import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package,
  Search,
  User,
  MapPin,
  Phone,
  Eye,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Users,
  Award,
  Zap,
  MoreVertical,
  UserPlus,
  Ban,
  Smartphone,
  AlertTriangle,
  PackagePlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { packers } from "@/data/packerData";
import { useOrders } from "@/contexts/OrderContext";

type FilterTab = 'all' | 'assigned' | 'pending' | 'packed';

export default function PackerOverview() {
  const { orders, updateOrder, addOrder, updateOrderStatus, simulateMobileAppUpdate } = useOrders();
  const [activePackerId, setActivePackerId] = useState<string>(packers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [autoAssign, setAutoAssign] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsPerPage = 12;
  
  // Pagination for orders table
  const [ordersCurrentPage, setOrdersCurrentPage] = useState<number>(1);
  const ordersPerPage = 10;
  
  // Selection and assignment states
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showAssignDialog, setShowAssignDialog] = useState<boolean>(false);
  const [selectedPacker, setSelectedPacker] = useState<string>('');
  const [packerSearchQuery, setPackerSearchQuery] = useState<string>('');

  const activePacker = useMemo(() => packers.find(p => p.id === activePackerId) || packers[0], [activePackerId]);


  // Mock orders data for testing - 20 orders
  const mockOrders = [
    {
      id: 'ORD-20251010-0001',
      order_number: 'ORD-20251010-0001',
      customer: { name: 'Rajesh Kumar', phone: '+91 98765 43210' },
      items: [{}, {}, {}, {}], // 4 items
      pincode: '110001',
      assigned_packer_id: 'PKR-001',
      assigned_packer_name: 'Ravi Kumar',
      packing_status: 'packed',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0002',
      order_number: 'ORD-20251010-0002',
      customer: { name: 'Priya Sharma', phone: '+91 98765 43211' },
      items: [{}, {}, {}], // 3 items
      pincode: '110016',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'in_process',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0003',
      order_number: 'ORD-20251010-0003',
      customer: { name: 'Amit Patel', phone: '+91 98765 43212' },
      items: [{}, {}], // 2 items
      pincode: '110075',
      assigned_packer_id: 'PKR-003',
      assigned_packer_name: 'Amit Verma',
      packing_status: 'out_of_stock',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0004',
      order_number: 'ORD-20251010-0004',
      customer: { name: 'Sneha Reddy', phone: '+91 98765 43213' },
      items: [{}, {}, {}], // 3 items
      pincode: '110016',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'pending',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0005',
      order_number: 'ORD-20251010-0005',
      customer: { name: 'Vikram Singh', phone: '+91 98765 43214' },
      items: [{}, {}, {}], // 3 items
      pincode: '110001',
      assigned_packer_id: 'PKR-005',
      assigned_packer_name: 'Rajesh Patel',
      packing_status: 'pending',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0006',
      order_number: 'ORD-20251010-0006',
      customer: { name: 'Anita Desai', phone: '+91 98765 43215' },
      items: [{}, {}, {}, {}, {}], // 5 items
      pincode: '110024',
      assigned_packer_id: 'PKR-002',
      assigned_packer_name: 'Priya Sharma',
      packing_status: 'packed',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0007',
      order_number: 'ORD-20251010-0007',
      customer: { name: 'Rohit Gupta', phone: '+91 98765 43216' },
      items: [{}, {}], // 2 items
      pincode: '110005',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'pending',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0008',
      order_number: 'ORD-20251010-0008',
      customer: { name: 'Meera Joshi', phone: '+91 98765 43217' },
      items: [{}, {}, {}], // 3 items
      pincode: '110017',
      assigned_packer_id: 'PKR-004',
      assigned_packer_name: 'Sneha Gupta',
      packing_status: 'in_process',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0009',
      order_number: 'ORD-20251010-0009',
      customer: { name: 'Karan Malhotra', phone: '+91 98765 43218' },
      items: [{}, {}, {}, {}], // 4 items
      pincode: '110034',
      assigned_packer_id: 'PKR-001',
      assigned_packer_name: 'Ravi Kumar',
      packing_status: 'packed',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0010',
      order_number: 'ORD-20251010-0010',
      customer: { name: 'Pooja Agarwal', phone: '+91 98765 43219' },
      items: [{}, {}], // 2 items
      pincode: '110048',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'out_of_stock',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0011',
      order_number: 'ORD-20251010-0011',
      customer: { name: 'Arjun Singh', phone: '+91 98765 43220' },
      items: [{}, {}, {}, {}, {}], // 5 items
      pincode: '110058',
      assigned_packer_id: 'PKR-005',
      assigned_packer_name: 'Rajesh Patel',
      packing_status: 'in_process',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0012',
      order_number: 'ORD-20251010-0012',
      customer: { name: 'Deepika Nair', phone: '+91 98765 43221' },
      items: [{}, {}, {}], // 3 items
      pincode: '110001',
      assigned_packer_id: 'PKR-003',
      assigned_packer_name: 'Amit Verma',
      packing_status: 'pending',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0013',
      order_number: 'ORD-20251010-0013',
      customer: { name: 'Suresh Kumar', phone: '+91 98765 43222' },
      items: [{}, {}], // 2 items
      pincode: '110016',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'packed',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0014',
      order_number: 'ORD-20251010-0014',
      customer: { name: 'Neha Sharma', phone: '+91 98765 43223' },
      items: [{}, {}, {}, {}], // 4 items
      pincode: '110075',
      assigned_packer_id: 'PKR-002',
      assigned_packer_name: 'Priya Sharma',
      packing_status: 'out_of_stock',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0015',
      order_number: 'ORD-20251010-0015',
      customer: { name: 'Manoj Tiwari', phone: '+91 98765 43224' },
      items: [{}, {}, {}], // 3 items
      pincode: '110024',
      assigned_packer_id: 'PKR-004',
      assigned_packer_name: 'Sneha Gupta',
      packing_status: 'in_process',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0016',
      order_number: 'ORD-20251010-0016',
      customer: { name: 'Sunita Reddy', phone: '+91 98765 43225' },
      items: [{}, {}], // 2 items
      pincode: '110005',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'pending',
      sync_status: 'not_synced'
    },
    {
      id: 'ORD-20251010-0017',
      order_number: 'ORD-20251010-0017',
      customer: { name: 'Rajesh Verma', phone: '+91 98765 43226' },
      items: [{}, {}, {}, {}, {}], // 5 items
      pincode: '110017',
      assigned_packer_id: 'PKR-001',
      assigned_packer_name: 'Ravi Kumar',
      packing_status: 'packed',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0018',
      order_number: 'ORD-20251010-0018',
      customer: { name: 'Kavita Patel', phone: '+91 98765 43227' },
      items: [{}, {}, {}], // 3 items
      pincode: '110034',
      assigned_packer_id: 'PKR-005',
      assigned_packer_name: 'Rajesh Patel',
      packing_status: 'in_process',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0019',
      order_number: 'ORD-20251010-0019',
      customer: { name: 'Vikash Kumar', phone: '+91 98765 43228' },
      items: [{}, {}, {}, {}], // 4 items
      pincode: '110048',
      assigned_packer_id: 'PKR-003',
      assigned_packer_name: 'Amit Verma',
      packing_status: 'out_of_stock',
      sync_status: 'synced'
    },
    {
      id: 'ORD-20251010-0020',
      order_number: 'ORD-20251010-0020',
      customer: { name: 'Ritu Agarwal', phone: '+91 98765 43229' },
      items: [{}, {}], // 2 items
      pincode: '110058',
      assigned_packer_id: null,
      assigned_packer_name: null,
      packing_status: 'pending',
      sync_status: 'not_synced'
    }
  ];

  const enrichedOrders = useMemo(() => {
    // Use real orders from OrderContext, but add packing status if missing
    const base = orders || [];
    return base.map(order => {
      // If order already has packing status, use it; otherwise assign default pending
      if (order.packing_status) {
        return order;
      }
      
      // For orders without packing status, set as pending and unassigned
      return {
        ...order,
        packing_status: 'pending',
        assigned_packer_id: undefined,
        assigned_packer_name: undefined,
      } as any;
    });
  }, [orders]);

  // Calculate packer workloads for smart assignment
  const packerWorkloads = useMemo(() => {
    return packers.map(packer => {
      const pendingCount = enrichedOrders.filter(order => 
        order.assigned_packer_id === packer.id && 
        (order.packing_status === 'pending' || order.packing_status === 'assigned')
      ).length;
      const inProcessCount = enrichedOrders.filter(order => 
        order.assigned_packer_id === packer.id && order.packing_status === 'in_process'
      ).length;
      const totalWorkload = pendingCount + inProcessCount;
      
      return {
        ...packer,
        pendingCount,
        inProcessCount,
        totalWorkload
      };
    });
  }, [enrichedOrders, packers]);

  const packerOrders = useMemo(() => enrichedOrders.filter(o => o.assigned_packer_id === activePacker?.id), [enrichedOrders, activePacker?.id]);

  const counts = useMemo(() => ({
    all: enrichedOrders.length,
    assigned: enrichedOrders.filter(o => o.packing_status === 'assigned' || o.packing_status === 'in_process').length,
    pending: enrichedOrders.filter(o => o.packing_status === 'pending').length,
    packed: enrichedOrders.filter(o => o.packing_status === 'packed').length,
  }), [enrichedOrders]);

  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter(order => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone?.includes(searchQuery) ||
        order.assigned_packer_name?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (activeFilter === 'assigned') matchesFilter = order.packing_status === 'assigned' || order.packing_status === 'in_process';
      else if (activeFilter === 'pending') matchesFilter = order.packing_status === 'pending';
      else if (activeFilter === 'packed') matchesFilter = order.packing_status === 'packed';

      const matchesPincode = zoneFilter === 'all' || order.pincode === zoneFilter;
      const matchesStatus = statusFilter === 'all' || order.packing_status === statusFilter;

      return matchesSearch && matchesFilter && matchesPincode && matchesStatus;
    });
  }, [packerOrders, activeFilter, searchQuery, zoneFilter, statusFilter]);

  // Pagination for orders table
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const ordersStartIndex = (ordersCurrentPage - 1) * ordersPerPage;
  const ordersEndIndex = ordersStartIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(ordersStartIndex, ordersEndIndex);

  // Pagination logic for packer cards
  const totalPages = Math.ceil(packers.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const paginatedPackers = packers.slice(startIndex, endIndex);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'packed': return 'bg-success/10 text-success border-success/20';
      case 'in_process':
      case 'assigned': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'out_of_stock': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-success/10 text-success border-success/20';
      case 'active': return 'bg-warning/10 text-warning border-warning/20';
      case 'offline': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced': return '🟢';
      case 'active': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  // Handle auto assign toggle change
  const handleAutoAssignChange = (checked: boolean) => {
    setAutoAssign(checked);
    setShowNotification(true);
    
    if (checked) {
      toast.success("Auto-assignment enabled", {
        duration: 3000,
      });
    } else {
      toast.info("Manual assignment mode", {
        duration: 3000,
      });
    }
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Show initial notification on component mount
  useEffect(() => {
    if (autoAssign) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setOrdersCurrentPage(1);
  }, [searchQuery, activeFilter, zoneFilter, statusFilter]);

  // Real-time sync effect - show notification when new orders arrive
  useEffect(() => {
    if (enrichedOrders.length > 0) {
      const latestOrder = enrichedOrders[0];
      const isNewOrder = new Date(latestOrder.created_at).getTime() > Date.now() - 5000; // Within last 5 seconds
      
      if (isNewOrder && latestOrder.packing_status === 'pending') {
        toast.success(`New order ${latestOrder.order_number} received and ${latestOrder.assigned_packer_name ? 'auto-assigned' : 'pending assignment'}!`);
      }
    }
  }, [enrichedOrders]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(paginatedOrders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
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

  const handleUnassign = () => {
    // Update each selected order to remove packer assignment
    selectedOrders.forEach(orderId => {
      updateOrder(orderId, {
        assigned_packer_id: undefined,
        assigned_packer_name: undefined,
        packing_status: 'pending'
      });
    });
    
    toast.success(`Unassigned ${selectedOrders.size} orders`);
    setSelectedOrders(new Set());
  };

  const handleAssign = () => {
    setShowAssignDialog(true);
  };

  const handlePackerSelect = (packerId: string) => {
    setSelectedPacker(packerId);
  };

  const handleConfirmAssignment = () => {
    if (selectedPacker) {
      const packer = packers.find(p => p.id === selectedPacker);
      
      // Update each selected order with the assigned packer
      selectedOrders.forEach(orderId => {
        updateOrder(orderId, {
          assigned_packer_id: selectedPacker,
          assigned_packer_name: packer?.name,
          packing_status: 'assigned'
        });
      });
      
      toast.success(`Assigned ${selectedOrders.size} orders to ${packer?.name}`);
      setSelectedOrders(new Set());
      setShowAssignDialog(false);
      setSelectedPacker('');
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: 'pending' | 'assigned' | 'in_process' | 'packed' | 'out_of_stock') => {
    // Map packing status to order status
    let orderStatus: 'Placed' | 'Accepted' | 'Packed' | 'Dispatched' | 'Delivered' | 'Out of Stock' | 'Cancelled' | 'Returned' | 'Failed';
    
    switch (newStatus) {
      case 'pending':
      case 'assigned':
        orderStatus = 'Accepted'; // In Process
        break;
      case 'in_process':
        orderStatus = 'Accepted'; // In Process
        break;
      case 'packed':
        orderStatus = 'Packed';
        break;
      case 'out_of_stock':
        orderStatus = 'Out of Stock';
        break;
      default:
        orderStatus = 'Accepted';
    }
    
    updateOrderStatus(orderId, orderStatus, newStatus);
    toast.success(`Order status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    
    // Show special notification for out of stock
    if (newStatus === 'out_of_stock') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        toast.error(`🚨 OUT OF STOCK: Order ${order.order_number} - Product not available in warehouse`);
      }
    }
  };


  const filteredPackers = useMemo(() => {
    return packerWorkloads.filter(packer => 
      packer.name.toLowerCase().includes(packerSearchQuery.toLowerCase()) ||
      packer.id.toLowerCase().includes(packerSearchQuery.toLowerCase()) ||
      packer.zone?.toLowerCase().includes(packerSearchQuery.toLowerCase())
    ).sort((a, b) => a.totalWorkload - b.totalWorkload); // Sort by workload (least first)
  }, [packerWorkloads, packerSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Packer Management</h1>
          <p className="text-sm text-muted-foreground">Warehouse packer assignment & order tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className="text-sm">Auto Assign</span>
            <Switch checked={autoAssign} onCheckedChange={handleAutoAssignChange} />
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              // Simulate a mobile app order
              const testOrder = {
                customer_id: `C${Date.now()}`,
                customer_name: 'Mobile Customer',
                customer_phone: '+91 98765 43299',
                address: '123 Mobile Street, Test Area, Test City, 110001',
                lat: 28.4595,
                lng: 77.0266,
                zone: 'Zone A',
                total_amount: 299,
                payment_mode: 'Online' as const,
                status: 'Placed' as const,
                items: [
                  {
                    id: `OI${Date.now()}-1`,
                    product_id: 'P001',
                    product_name: 'Test Product',
                    quantity: 2,
                    price: 149.5,
                    subtotal: 299,
                    is_substituted: false
                  }
                ],
                delivery_slot: '11:00 AM - 1:00 PM',
                notes: 'Mobile app order',
                discount: 0,
                shipping_charges: 0,
                pincode: '110001'
              };
              addOrder(testOrder);
              toast.success('📱 Mobile app order created and auto-assigned!');
            }}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            📱 Simulate Mobile Order
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Manual Assignment Banner */}
      {!autoAssign && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Manual Assignment Active</p>
            <p className="text-sm text-blue-700">Select orders and assign to packers manually using the 'Assign to Packer' button.</p>
          </div>
        </div>
      )}

      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Active Packers</p>
          <p className="text-3xl font-bold">
            {packers.filter(p => 
              p.sync_status !== 'offline' && 
              enrichedOrders.some(o => o.assigned_packer_id === p.id)
            ).length}
          </p>
          <p className="text-xs text-muted-foreground">of {packers.length} total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold">{enrichedOrders.filter(o => o.packing_status === 'pending').length}</p>
          <p className="text-xs text-muted-foreground">awaiting assignment</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">In Process</p>
          <p className="text-3xl font-bold">{enrichedOrders.filter(o => o.packing_status === 'in_process').length}</p>
          <p className="text-xs text-muted-foreground">being packed</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Packed</p>
          <p className="text-3xl font-bold">{enrichedOrders.filter(o => o.packing_status === 'packed').length}</p>
          <p className="text-xs text-muted-foreground">completed today</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Out of Stock</p>
          <p className="text-3xl font-bold">{enrichedOrders.filter(o => o.packing_status === 'out_of_stock').length}</p>
          <p className="text-xs text-muted-foreground">needs attention</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Completion %</p>
          <p className="text-3xl font-bold text-primary">
            {enrichedOrders.length > 0 
              ? Math.round((enrichedOrders.filter(o => o.packing_status === 'packed').length / enrichedOrders.length) * 100)
              : 0}%
          </p>
          <p className="text-xs text-muted-foreground">overall rate</p>
        </CardContent></Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders Management ({filteredOrders.length})</h2>
            {!autoAssign && selectedOrders.size > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleUnassign}>
                  Unassign ({selectedOrders.size})
                </Button>
                <Button size="sm" onClick={handleAssign}>
                  Assign to Packer
                </Button>
              </div>
            )}
          </div>

          {/* Search Bar and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders, customers, or packers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10" />
            </div>
            <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterTab)}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">In Process</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="All Pincode Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pincode Zone</SelectItem>
                <SelectItem value="110001">110001</SelectItem>
                <SelectItem value="110016">110016</SelectItem>
                <SelectItem value="110075">110075</SelectItem>
                <SelectItem value="110024">110024</SelectItem>
                <SelectItem value="110005">110005</SelectItem>
                <SelectItem value="110017">110017</SelectItem>
                <SelectItem value="110034">110034</SelectItem>
                <SelectItem value="110048">110048</SelectItem>
                <SelectItem value="110058">110058</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="All Packers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packers</SelectItem>
                {packers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrdersCurrentPage(Math.max(1, ordersCurrentPage - 1))}
                disabled={ordersCurrentPage === 1}
                className="h-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {ordersCurrentPage} of {totalOrdersPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrdersCurrentPage(Math.min(totalOrdersPages, ordersCurrentPage + 1))}
                disabled={ordersCurrentPage === totalOrdersPages}
                className="h-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>


          {/* Orders Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {!autoAssign && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Packer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={!autoAssign ? 10 : 9} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      {!autoAssign && (
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell className="text-sm">{order.customer_phone}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.items?.length || 0} items</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.pincode || 
                           (order.address ? order.address.split(',').pop()?.trim() : 'N/A') || 
                           'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.assigned_packer_name ? (
                            <>
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{order.assigned_packer_name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.packing_status)}>
                          {order.packing_status === 'packed' && '✅ '}
                          {order.packing_status === 'in_process' && '🔄 '}
                          {order.packing_status === 'assigned' && '📋 '}
                          {order.packing_status === 'out_of_stock' && '🔴 '}
                          {order.packing_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            order.sync_status === 'synced' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="text-sm">{order.sync_status === 'synced' ? 'Synced' : 'Not Synced'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          {order.packing_status === 'pending' && order.assigned_packer_name && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'assigned')}
                              className="h-7 text-xs"
                            >
                              Assign
                            </Button>
                          )}
                          {order.packing_status === 'assigned' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'in_process')}
                              className="h-7 text-xs"
                            >
                              Start
                            </Button>
                          )}
                          {order.packing_status === 'in_process' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'packed')}
                              className="h-7 text-xs"
                            >
                              Complete
                            </Button>
                          )}
                          {order.packing_status === 'packed' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'out_of_stock')}
                              className="h-7 text-xs"
                            >
                              Out of Stock
                            </Button>
                          )}
                          
                          {/* Mobile App Simulation Buttons */}
                          {order.packing_status === 'pending' && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => simulateMobileAppUpdate(order.id, 'started')}
                              className="h-7 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              📱 Start
                            </Button>
                          )}
                          {order.packing_status === 'in_process' && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => simulateMobileAppUpdate(order.id, 'completed')}
                              className="h-7 text-xs bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              📱 Complete
                            </Button>
                          )}
                          {order.packing_status === 'in_process' && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => simulateMobileAppUpdate(order.id, 'out_of_stock')}
                              className="h-7 text-xs bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              📱 Out of Stock
                            </Button>
                          )}
                          
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Packer Overview cards */}
      <div className="grid grid-cols-3 gap-5">
        {paginatedPackers.map(p => {
          const workload = packerWorkloads.find(w => w.id === p.id);
          return (
          <Card key={p.id} className="w-[377px] h-[335px] flex-shrink-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.id}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone: {p.zone} ({p.pincode_range})</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</span>
                  </div>
                </div>
                <Badge className={getSyncStatusColor(p.sync_status)}>
                  {getSyncIcon(p.sync_status)} {p.sync_status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted border border-border">
                  <p className="text-2xl font-bold text-foreground">{workload?.pendingCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-100 border border-orange-200">
                  <p className="text-2xl font-bold text-orange-600">{workload?.inProcessCount || 0}</p>
                  <p className="text-xs text-muted-foreground">In Process</p>
                </div>
                <div className={`text-center p-3 rounded-lg border ${
                  (workload?.totalWorkload || 0) === 0 ? 'bg-green-100 border-green-200' :
                  (workload?.totalWorkload || 0) <= 2 ? 'bg-yellow-100 border-yellow-200' :
                  'bg-red-100 border-red-200'
                }`}>
                  <p className={`text-2xl font-bold ${
                    (workload?.totalWorkload || 0) === 0 ? 'text-green-600' :
                    (workload?.totalWorkload || 0) <= 2 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{workload?.totalWorkload || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Load</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-semibold text-foreground">{p.completion_percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${p.completion_percentage}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last active: {Math.floor(Math.random() * 60)}m ago</span>
                <span className="text-xs text-muted-foreground">Zone: {p.zone}</span>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}


      {/* Assign to Packer Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign to Packer</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Assigning {selectedOrders.size} orders to a packer
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or zone..."
                value={packerSearchQuery}
                onChange={(e) => setPackerSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Packer List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {filteredPackers.map((packer) => (
                <div
                  key={packer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPacker === packer.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handlePackerSelect(packer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          packer.sync_status === 'synced' ? 'bg-green-500' :
                          packer.sync_status === 'active' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="font-medium">{packer.name}</span>
                        <span className="text-sm text-muted-foreground">({packer.id})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        <div>Pending: {packer.pendingCount}</div>
                        <div>In Process: {packer.inProcessCount}</div>
                        <div className="font-semibold text-foreground">Total: {packer.totalWorkload}</div>
                      </div>
                      <Badge variant="outline">{packer.zone}</Badge>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                packer.totalWorkload === 0 ? 'bg-green-500' :
                                packer.totalWorkload <= 2 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(packer.totalWorkload * 20, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">
                            {packer.totalWorkload === 0 ? 'Free' :
                             packer.totalWorkload <= 2 ? 'Light' :
                             packer.totalWorkload <= 4 ? 'Medium' : 'Heavy'}
                          </span>
                        </div>
                      </div>
                      {selectedPacker === packer.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                  {packer.sync_status === 'offline' && (
                    <div className="mt-2 text-sm text-red-600">
                      Packer is offline - cannot assign orders.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAssignment}
                disabled={!selectedPacker || packers.find(p => p.id === selectedPacker)?.sync_status === 'offline'}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">
            {autoAssign ? "Auto-assignment enabled" : "Manual assignment mode"}
          </span>
        </div>
      )}
    </div>
  );
}
