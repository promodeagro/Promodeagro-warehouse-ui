import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  ShoppingCart, 
  RotateCcw, 
  AlertTriangle, 
  Gift, 
  Plus
} from 'lucide-react';

interface Adjustment {
  id: string;
  date: string;
  type: string;
  notes: string;
  items?: any[];
  totalPrice?: number;
}

const StockAdjustment = () => {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  // Load adjustments from localStorage
  useEffect(() => {
    const loadAdjustments = () => {
      const savedAdjustments = JSON.parse(localStorage.getItem('stockAdjustments') || '[]');
      setAdjustments(savedAdjustments);
    };
    
    loadAdjustments();
    
    // Listen for storage changes (when new adjustments are added)
    const handleStorageChange = () => {
      loadAdjustments();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAdjustments();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Calculate today's totals for each adjustment type
  const today = new Date().toISOString().split('T')[0];
  const todayAdjustments = adjustments.filter(adj => adj.date === today);

  const cartSalesTotal = todayAdjustments
    .filter(adj => adj.type === 'Cart Stock')
    .reduce((sum, adj) => sum + (adj.totalPrice || 0), 0);

  const returnsTotal = todayAdjustments
    .filter(adj => adj.type === 'Return')
    .reduce((sum, adj) => sum + (adj.totalPrice || 0), 0);

  const damageTotal = todayAdjustments
    .filter(adj => adj.type === 'Damage')
    .reduce((sum, adj) => sum + (adj.totalPrice || 0), 0);

  const extraGivenTotal = todayAdjustments
    .filter(adj => adj.type === 'Extra Given')
    .reduce((sum, adj) => sum + (adj.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Adjustment</h1>
            <p className="text-muted-foreground">
              Track inventory changes, damages, and sales.
            </p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate('/stock-adjustment/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      {/* Four Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cart Sales */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div>
                <CardTitle className="text-lg mb-1">Cart Sales</CardTitle>
                <CardDescription className="mb-2">
                  Stock moved to cart
                </CardDescription>
                <div className="text-2xl font-bold">₹{cartSalesTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Returns */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div>
                <CardTitle className="text-lg mb-1">Returns</CardTitle>
                <CardDescription className="mb-2">
                  Returned stock
                </CardDescription>
                <div className="text-2xl font-bold">₹{returnsTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Damage */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div>
                <CardTitle className="text-lg mb-1">Damage</CardTitle>
                <CardDescription className="mb-2">
                  Damaged/spoiled
                </CardDescription>
                <div className="text-2xl font-bold">₹{damageTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Extra Given */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between h-full">
              <div>
                <CardTitle className="text-lg mb-1">Extra Given</CardTitle>
                <CardDescription className="mb-2">
                  Extra weight to customers
                </CardDescription>
                <div className="text-2xl font-bold">₹{extraGivenTotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Adjustments Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adjustment No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell className="font-medium">{adjustment.id}</TableCell>
                  <TableCell>{adjustment.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {adjustment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{(adjustment.totalPrice || 0).toFixed(2)}</TableCell>
                  <TableCell>{adjustment.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAdjustment;