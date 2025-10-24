import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  Search,
  Filter,
  Package
} from 'lucide-react';

interface AdjustmentItem {
  id: string;
  itemName: string;
  stockQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  adjustmentQuantity: number;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  unit: string;
  stockQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  image: string;
}

const NewStockAdjustment = () => {
  const navigate = useNavigate();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [adjustmentNo] = useState('ADJ-001'); // Auto-generated, not editable
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjustmentType, setAdjustmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<StockItem[]>([]);
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for stock items with photos and categories
  const stockItems: StockItem[] = [
    { 
      id: '1', 
      name: 'Tomatoes', 
      category: 'Vegetable', 
      subCategory: 'Fresh Vegetables', 
      unit: 'kg', 
      stockQuantity: 100, 
      purchasePrice: 50, 
      sellingPrice: 80,
      image: '🍅'
    },
    { 
      id: '2', 
      name: 'Onions', 
      category: 'Vegetable', 
      subCategory: 'Fresh Vegetables', 
      unit: 'kg', 
      stockQuantity: 200, 
      purchasePrice: 30, 
      sellingPrice: 45,
      image: '🧅'
    },
    { 
      id: '3', 
      name: 'Potatoes', 
      category: 'Vegetable', 
      subCategory: 'Fresh Vegetables', 
      unit: 'kg', 
      stockQuantity: 150, 
      purchasePrice: 25, 
      sellingPrice: 40,
      image: '🥔'
    },
    { 
      id: '4', 
      name: 'Carrots', 
      category: 'Vegetable', 
      subCategory: 'Fresh Vegetables', 
      unit: 'kg', 
      stockQuantity: 80, 
      purchasePrice: 40, 
      sellingPrice: 60,
      image: '🥕'
    },
    { 
      id: '5', 
      name: 'Ghee', 
      category: 'Dairy', 
      subCategory: 'Milk Products', 
      unit: 'box', 
      stockQuantity: 50, 
      purchasePrice: 400, 
      sellingPrice: 500,
      image: '🧈'
    },
    { 
      id: '6', 
      name: 'Butter', 
      category: 'Dairy', 
      subCategory: 'Milk Products', 
      unit: 'box', 
      stockQuantity: 30, 
      purchasePrice: 250, 
      sellingPrice: 300,
      image: '🧈'
    },
    { 
      id: '7', 
      name: 'Cucumber', 
      category: 'Vegetable', 
      subCategory: 'Fresh Vegetables', 
      unit: 'kg', 
      stockQuantity: 60, 
      purchasePrice: 20, 
      sellingPrice: 30,
      image: '🥒'
    },
  ];

  const adjustmentTypes = [
    { value: 'cart-stock', label: 'Cart Stock', description: 'Stock moved to cart' },
    { value: 'return', label: 'Return', description: 'Returned stock' },
    { value: 'damage', label: 'Damage', description: 'Damaged/spoiled stock' },
    { value: 'internal-consumption', label: 'Internal Consumption', description: 'Used internally' },
    { value: 'extra-given', label: 'Extra Given', description: 'Extra weight given to customers' },
  ];

  const handleItemSelect = (item: StockItem, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    }
  };

  const handleAddSelectedItems = () => {
    const newAdjustmentItems = selectedItems.map(item => ({
      id: item.id,
      itemName: item.name,
      stockQuantity: item.stockQuantity,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      adjustmentQuantity: 0,
    }));
    setAdjustmentItems([...adjustmentItems, ...newAdjustmentItems]);
    setSelectedItems([]);
    setIsAddItemOpen(false);
  };

  const handleCreateAdjustment = () => {
    // Create adjustment object
    const newAdjustment = {
      id: adjustmentNo,
      date: adjustmentDate,
      type: adjustmentTypes.find(t => t.value === adjustmentType)?.label || adjustmentType,
      notes: notes,
      items: adjustmentItems,
      totalPrice: calculateTotalPrice()
    };

    // Save to localStorage (you can replace this with API call)
    const existingAdjustments = JSON.parse(localStorage.getItem('stockAdjustments') || '[]');
    const updatedAdjustments = [newAdjustment, ...existingAdjustments];
    localStorage.setItem('stockAdjustments', JSON.stringify(updatedAdjustments));

    // Trigger storage event to notify other components
    window.dispatchEvent(new Event('storage'));

    // Navigate back to main page
    navigate('/stock-adjustment');
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setAdjustmentItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, adjustmentQuantity: quantity || 0 } : item
      )
    );
  };

  const calculateTotalPrice = () => {
    return adjustmentItems.reduce((total, item) => {
      return total + (item.purchasePrice * item.adjustmentQuantity);
    }, 0);
  };

  // Filter items based on search, category, and subcategory
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === 'All' || item.subCategory === subCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const categories = ['All', ...Array.from(new Set(stockItems.map(item => item.category)))];
  const subCategories = categoryFilter === 'All' 
    ? ['All'] 
    : ['All', ...Array.from(new Set(stockItems.filter(item => item.category === categoryFilter).map(item => item.subCategory)))];

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setSubCategoryFilter('All'); // Reset subcategory when category changes
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Stock Adjustment</h1>
        <p className="text-muted-foreground">
          Create a new stock adjustment with items and quantities
        </p>
      </div>

      {/* Adjustment Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
          <CardDescription>
            Enter the basic information for this adjustment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="adjustment-no">Adjustment No</Label>
              <Input
                id="adjustment-no"
                value={adjustmentNo}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="adjustment-date">Date *</Label>
              <Input
                id="adjustment-date"
                type="date"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="adjustment-type">Adjustment Type *</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select adjustment type" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-sm text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter adjustment notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Select items for this adjustment
              </CardDescription>
            </div>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Items</DialogTitle>
                </DialogHeader>
                
                {/* Search and Filter */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={subCategoryFilter} 
                    onValueChange={setSubCategoryFilter}
                    disabled={categoryFilter === 'All'}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sub Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory} value={subCategory}>
                          {subCategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Items Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub Category</TableHead>
                      <TableHead>Stock in Quantity</TableHead>
                      <TableHead>Purchasing Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow 
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleItemSelect(item, !selectedItems.some(i => i.id === item.id))}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.some(i => i.id === item.id)}
                            onCheckedChange={(checked) => handleItemSelect(item, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.image}</span>
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.subCategory}</TableCell>
                        <TableCell>{item.stockQuantity} {item.unit}</TableCell>
                        <TableCell>₹{item.purchasePrice}</TableCell>
                        <TableCell>₹{item.sellingPrice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.length} items selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSelectedItems}>
                      Done ({selectedItems.length} items selected)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {adjustmentItems.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Stock Qty</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Adjustment Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustmentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{stockItems.find(si => si.id === item.id)?.image}</span>
                          <span>{item.itemName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.stockQuantity} {stockItems.find(si => si.id === item.id)?.unit}</TableCell>
                      <TableCell>₹{item.purchasePrice}</TableCell>
                      <TableCell>₹{item.sellingPrice}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.adjustmentQuantity === 0 ? '' : item.adjustmentQuantity}
                          onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Price:</span>
                  <span>₹{calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items selected</p>
              <p className="text-sm">Click "Add Item" to select items for adjustment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => navigate('/stock-adjustment')}>
          Cancel
        </Button>
        <Button onClick={handleCreateAdjustment}>
          Create Adjustment
        </Button>
      </div>
    </div>
  );
};

export default NewStockAdjustment;