import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pincode, PincodeStatus, DeliveryType } from '@/data/pincodeData';
import { usePincodes } from '@/contexts/PincodeContext';

interface PincodeListViewProps {
  pincodes: Pincode[];
  onUpdatePincodes: (pincodes: Pincode[]) => void;
  onCreatePincode: () => void;
}

export function PincodeListView({ pincodes, onUpdatePincodes, onCreatePincode }: PincodeListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('all');
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const { pincodes: contextPincodes } = usePincodes();
  
  // Use context pincodes if available, otherwise use props
  const displayPincodes = contextPincodes.length > 0 ? contextPincodes : pincodes;

  const filteredPincodes = displayPincodes.filter(pincode => {
    const matchesSearch = pincode.pincodeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pincode.areas.some(area => area.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || pincode.status === statusFilter;
    const matchesDeliveryType = deliveryTypeFilter === 'all' || 
                               pincode.deliveryTypes.includes(deliveryTypeFilter as DeliveryType);
    
    return matchesSearch && matchesStatus && matchesDeliveryType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPincodes(filteredPincodes.map(p => p.id));
    } else {
      setSelectedPincodes([]);
    }
  };

  const handleSelectPincode = (pincodeId: string, checked: boolean) => {
    if (checked) {
      setSelectedPincodes(prev => [...prev, pincodeId]);
    } else {
      setSelectedPincodes(prev => prev.filter(id => id !== pincodeId));
    }
  };

  const getDeliveryTypesText = (types: DeliveryType[]) => {
    if (types.includes('Same Day Delivery') && types.includes('Next Day Delivery')) {
      return 'same day, next day';
    } else if (types.includes('Same Day Delivery')) {
      return 'same day';
    } else if (types.includes('Next Day Delivery')) {
      return 'next day';
    }
    return 'none';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-600">Pincodes</h1>
        <Button onClick={onCreatePincode} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Pincode
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search Pincodes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Delivery Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery Types</SelectItem>
              <SelectItem value="Same Day">Same Day</SelectItem>
              <SelectItem value="Next Day">Next Day</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary and Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredPincodes.length} Pincodes
          </span>
          {selectedPincodes.length > 0 && (
            <span className="text-sm text-primary">
              {selectedPincodes.length} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pagination</span>
          <Button variant="outline" size="sm" disabled>
            &lt;
          </Button>
          <span className="text-sm">1</span>
          <Button variant="outline" size="sm" disabled>
            &gt;
          </Button>
        </div>
      </div>

      {/* Pincode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPincodes.map((pincode) => (
          <Card key={pincode.id} className="hover-scale transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPincodes.includes(pincode.id)}
                    onCheckedChange={(checked) => handleSelectPincode(pincode.id, checked as boolean)}
                  />
                  <h3 className="text-xl font-bold text-green-600">{pincode.pincodeNumber}</h3>
                </div>
                <Badge variant={pincode.status === 'Active' ? 'default' : 'secondary'}>
                  {pincode.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>

              {/* Delivery Types */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Delivery Types</span>
                <p className="text-sm text-muted-foreground">
                  {getDeliveryTypesText(pincode.deliveryTypes)}
                </p>
              </div>

              {/* Shifts */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Shifts</span>
                <p className="text-sm text-muted-foreground">
                  {pincode.shifts} Shifts
                </p>
              </div>

              {/* Slots */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Slots</span>
                <p className="text-sm text-muted-foreground">
                  {pincode.totalSlots} Slots
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPincodes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No pincodes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || deliveryTypeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first pincode'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && deliveryTypeFilter === 'all' && (
            <Button onClick={onCreatePincode} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Pincode
            </Button>
          )}
        </div>
      )}
    </div>
  );
}