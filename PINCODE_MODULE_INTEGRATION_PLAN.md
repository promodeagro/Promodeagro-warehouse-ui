# Pincode Module Integration Plan

## Overview
This document outlines the integration plan for the future Pincode Module with the Warehouse Manager Portal UI, specifically focusing on the Orders Management system.

## Current Implementation
- **Pincode Zone Filter**: Currently extracts pincodes from order addresses
- **Filter Location**: Orders List screen (`OrdersList.tsx`)
- **Data Source**: Static extraction from existing order addresses

## Future Pincode Module Integration

### 1. Pincode Data Management
```typescript
// Future pincode module interface
interface PincodeModule {
  // Core pincode operations
  getAllPincodes(): Promise<Pincode[]>;
  getActivePincodes(): Promise<Pincode[]>;
  getInactivePincodes(): Promise<Pincode[]>;
  addPincode(pincode: PincodeData): Promise<Pincode>;
  updatePincode(id: string, updates: Partial<Pincode>): Promise<Pincode>;
  removePincode(id: string): Promise<void>;
  
  // Statistics and analytics
  getPincodeStats(): Promise<PincodeStats>;
  getPincodeUsage(pincode: string): Promise<PincodeUsage>;
}

interface Pincode {
  id: string;
  pincode: string;
  status: 'active' | 'inactive' | 'pending';
  addedDate: string;
  removedDate?: string;
  zone: string;
  city: string;
  state: string;
  deliveryAvailable: boolean;
  notes?: string;
}

interface PincodeStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  recentlyAdded: number;
  recentlyRemoved: number;
}
```

### 2. Enhanced Pincode Zone Filter

#### Current Filter (Static)
```typescript
// Current implementation
const pincodes = Array.from(new Set((orders || []).map(o => extractPincode(o.address)))).filter(Boolean);
```

#### Future Filter (Dynamic)
```typescript
// Future implementation with pincode module
const [pincodes, setPincodes] = useState<Pincode[]>([]);
const [pincodeStats, setPincodeStats] = useState<PincodeStats | null>(null);

useEffect(() => {
  // Fetch pincodes from pincode module
  const fetchPincodes = async () => {
    try {
      const activePincodes = await pincodeModule.getActivePincodes();
      setPincodes(activePincodes);
      
      const stats = await pincodeModule.getPincodeStats();
      setPincodeStats(stats);
    } catch (error) {
      console.error('Failed to fetch pincodes:', error);
    }
  };
  
  fetchPincodes();
}, []);
```

### 3. Enhanced Filter UI

#### Current UI
- Simple dropdown with pincode numbers
- Basic search functionality

#### Future UI
```typescript
// Enhanced pincode filter with statistics
<div className="space-y-2">
  <label className="text-sm font-medium text-muted-foreground">
    Pincode Zone
    {pincodeStats && (
      <span className="ml-2 text-xs text-muted-foreground">
        ({pincodeStats.active} active, {pincodeStats.inactive} inactive)
      </span>
    )}
  </label>
  <Select value={pincodeFilter} onValueChange={setPincodeFilter}>
    <SelectTrigger className="h-10">
      <SelectValue placeholder="All Pincode Zones" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Pincode Zones</SelectItem>
      
      {/* Active Pincodes */}
      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
        Active Pincodes ({pincodes.filter(p => p.status === 'active').length})
      </div>
      {pincodes
        .filter(p => p.status === 'active')
        .map(pincode => (
          <SelectItem key={pincode.id} value={pincode.pincode}>
            <div className="flex items-center justify-between w-full">
              <span>{pincode.pincode}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {pincode.city}, {pincode.state}
              </span>
            </div>
          </SelectItem>
        ))}
      
      {/* Inactive Pincodes */}
      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
        Inactive Pincodes ({pincodes.filter(p => p.status === 'inactive').length})
      </div>
      {pincodes
        .filter(p => p.status === 'inactive')
        .map(pincode => (
          <SelectItem key={pincode.id} value={pincode.pincode}>
            <div className="flex items-center justify-between w-full">
              <span className="line-through text-muted-foreground">{pincode.pincode}</span>
              <span className="text-xs text-muted-foreground ml-2">
                Removed: {new Date(pincode.removedDate).toLocaleDateString()}
              </span>
            </div>
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>
```

### 4. Pincode Management Integration

#### Add Pincode Management Button
```typescript
// Add to Orders List header
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" onClick={() => setShowPincodeManagement(true)}>
    <MapPin className="h-4 w-4 mr-2" />
    Manage Pincodes
  </Button>
  <Button onClick={() => setShowAddOrderDialog(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Add New Order
  </Button>
</div>
```

#### Pincode Management Dialog
```typescript
// Pincode management dialog component
const PincodeManagementDialog = () => {
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [stats, setStats] = useState<PincodeStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pincode Management</DialogTitle>
        </DialogHeader>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
              <p className="text-sm text-muted-foreground">Active Pincodes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats?.inactive || 0}</div>
              <p className="text-sm text-muted-foreground">Inactive Pincodes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats?.recentlyAdded || 0}</div>
              <p className="text-sm text-muted-foreground">Recently Added</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats?.recentlyRemoved || 0}</div>
              <p className="text-sm text-muted-foreground">Recently Removed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search pincodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pincode List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPincodes.map(pincode => (
            <Card key={pincode.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{pincode.pincode}</div>
                    <div className="text-sm text-muted-foreground">
                      {pincode.city}, {pincode.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={pincode.status === 'active' ? 'default' : 'destructive'}>
                      {pincode.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePincodeStatus(pincode.id)}
                    >
                      {pincode.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 5. Integration Steps

#### Phase 1: Basic Integration
1. Create pincode module API endpoints
2. Update OrdersList to fetch pincodes from API
3. Enhance filter UI with pincode status indicators

#### Phase 2: Management Features
1. Add pincode management dialog
2. Implement add/edit/remove pincode functionality
3. Add pincode statistics dashboard

#### Phase 3: Advanced Features
1. Bulk pincode operations
2. Pincode usage analytics
3. Delivery zone optimization
4. Pincode-based order routing

### 6. API Endpoints (Future)

```typescript
// Pincode Module API Endpoints
GET    /api/pincodes                    // Get all pincodes
GET    /api/pincodes/active             // Get active pincodes
GET    /api/pincodes/stats              // Get pincode statistics
POST   /api/pincodes                    // Add new pincode
PUT    /api/pincodes/:id                // Update pincode
DELETE /api/pincodes/:id                // Remove pincode
POST   /api/pincodes/bulk               // Bulk operations
GET    /api/pincodes/usage/:pincode     // Get pincode usage stats
```

### 7. Database Schema (Future)

```sql
-- Pincodes table
CREATE TABLE pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode VARCHAR(6) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  zone VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(100),
  delivery_available BOOLEAN DEFAULT true,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  removed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pincode usage tracking
CREATE TABLE pincode_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode_id UUID REFERENCES pincodes(id),
  order_id UUID REFERENCES orders(id),
  usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Current Status
- ✅ Basic pincode extraction from orders
- ✅ Pincode Zone filter implementation
- ✅ Filter UI with search functionality
- 🔄 Ready for pincode module integration
- ⏳ Pincode management features (planned)
- ⏳ Advanced analytics (planned)

## Next Steps
1. Implement pincode module backend
2. Create pincode management API
3. Update frontend to use dynamic pincode data
4. Add pincode management UI components
5. Implement pincode statistics and analytics
