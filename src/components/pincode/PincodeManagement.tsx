import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Clock, IndianRupee, Edit, Trash2, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePincodes } from '@/contexts/PincodeContext';
import { Pincode, PincodeStatus, DeliveryType, DeliveryShift } from '@/data/pincodeData';
import { CreatePincodeDialog } from './CreatePincodeDialog';
import { ManageSlotsDialog } from './ManageSlotsDialog';
import { ManageChargesDialog } from './ManageChargesDialog';

export function PincodeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSlotsDialogOpen, setIsSlotsDialogOpen] = useState(false);
  const [isChargesDialogOpen, setIsChargesDialogOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState<Pincode | null>(null);
  const { toast } = useToast();
  const { pincodes, updatePincode, deletePincode, addPincode, addChargeToPincode, assignShiftsToPincodes, shifts } = usePincodes();

  const filteredPincodes = pincodes.filter(pincode => {
    const matchesSearch = pincode.pincodeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pincode.areas.some(area => area.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || pincode.status === statusFilter;
    const matchesDeliveryType = deliveryTypeFilter === 'all' || 
                               pincode.assignedShifts.some(shift => shift.deliveryType === deliveryTypeFilter);
    
    return matchesSearch && matchesStatus && matchesDeliveryType;
  });

  const handleStatusToggle = (pincodeId: string, newStatus: PincodeStatus) => {
    updatePincode(pincodeId, { status: newStatus });
    toast({
      title: "Status Updated",
      description: `Pincode status changed to ${newStatus}`,
    });
  };

  const handleDeletePincode = (pincodeId: string) => {
    deletePincode(pincodeId);
    toast({
      title: "Pincode Deleted",
      description: "Pincode has been successfully deleted",
    });
  };

  const handleCreatePincode = (pincodeData: any) => {
    const { minOrderValue, deliveryCharge, deliveryTypes, ...restData } = pincodeData;
    
    // Create the pincode with charges and delivery type if provided
    const charges = (minOrderValue && deliveryCharge) ? {
      minOrderValue: parseFloat(minOrderValue),
      deliveryCharge: parseFloat(deliveryCharge)
    } : undefined;
    
    const deliveryType = deliveryTypes && deliveryTypes.length > 0 ? deliveryTypes[0] : undefined;
    
    addPincode(restData, charges, deliveryType);
    
    setIsCreateDialogOpen(false);
    toast({
      title: "Pincode Created",
      description: `Pincode ${pincodeData.pincodeNumber} has been created successfully`,
    });
  };

  const handleEditPincode = (pincodeData: any) => {
    if (!editingPincode) return;
    
    const { minOrderValue, deliveryCharge, deliveryTypes, ...restData } = pincodeData;
    
    // Update the pincode
    updatePincode(editingPincode.id, restData);
    
    // If delivery charges are provided, update them
    if (minOrderValue && deliveryCharge) {
      addChargeToPincode(editingPincode.id, {
        minOrderValue,
        maxOrderValue: undefined,
        charge: deliveryCharge,
        isActive: true,
      });
    }
    
    // If delivery type is provided, assign it
    if (deliveryTypes && deliveryTypes.length > 0) {
      const selectedShift = shifts.find(shift => shift.deliveryType === deliveryTypes[0]);
      if (selectedShift) {
        assignShiftsToPincodes([selectedShift.id], [editingPincode.id]);
      }
    }
    
    setEditingPincode(null);
    toast({
      title: "Pincode Updated",
      description: "Pincode has been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Pincode Management
              </CardTitle>
              <CardDescription>
                Manage delivery pincodes, areas, slots, and charges
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSlotsDialogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Manage Slots
              </Button>
              <Button variant="outline" onClick={() => setIsChargesDialogOpen(true)}>
                <IndianRupee className="h-4 w-4 mr-2" />
                Manage Delivery Charges
              </Button>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-primary hover:bg-gradient-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pincode
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by pincode or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
              <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Delivery Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Delivery Types</SelectItem>
                  <SelectItem value="Same Day Delivery">Same Day Delivery</SelectItem>
                  <SelectItem value="Next Day Delivery">Next Day Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pincode Table */}
          {filteredPincodes.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Pincode</TableHead>
                    <TableHead className="w-[200px]">Area Name</TableHead>
                    <TableHead className="w-[150px]">Delivery Type</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px]">Minimum Order Value</TableHead>
                    <TableHead className="w-[150px]">Delivery Charges</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPincodes.map((pincode) => (
                    <TableRow key={pincode.id}>
                      <TableCell className="font-medium">
                        {pincode.pincodeNumber}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {pincode.areas.map((area) => (
                            <div key={area.id} className="text-sm">
                              {area.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {pincode.assignedShifts.length > 0 ? (
                        pincode.assignedShifts.map((shift, index) => (
                          <Badge key={index} variant="outline" className="text-[10px] px-2 py-1">
                            {shift.deliveryType}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No delivery type assigned</span>
                      )}
                    </div>
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pincode.status === 'Active'}
                            onCheckedChange={(checked) => 
                              handleStatusToggle(pincode.id, checked ? 'Active' : 'Inactive')
                            }
                          />
                          <Badge 
                            variant={pincode.status === 'Active' ? 'default' : 'secondary'}
                            className={pincode.status === 'Active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                          >
                            {pincode.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pincode.charges.length > 0 ? (
                          <div className="space-y-1">
                            {pincode.charges.map((charge) => (
                              <div key={charge.id} className="text-sm">
                                ₹{charge.minOrderValue}
                                {charge.maxOrderValue && ` - ₹${charge.maxOrderValue}`}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pincode.charges.length > 0 ? (
                          <div className="space-y-1">
                            {pincode.charges.map((charge) => (
                              <div key={charge.id} className="text-sm">
                                ₹{charge.charge}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPincode(pincode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePincode(pincode.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pincodes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || deliveryTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first pincode'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && deliveryTypeFilter === 'all' && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-primary hover:bg-gradient-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pincode
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {isCreateDialogOpen && (
        <CreatePincodeDialog
          onSave={handleCreatePincode}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      )}
      
      {editingPincode && (
        <CreatePincodeDialog
          pincode={editingPincode}
          onSave={handleEditPincode}
          onClose={() => setEditingPincode(null)}
        />
      )}
      
      <ManageSlotsDialog
        open={isSlotsDialogOpen}
        onOpenChange={setIsSlotsDialogOpen}
        pincodes={pincodes}
        onUpdatePincodes={() => {}} // Context handles updates
      />
      
      <ManageChargesDialog
        open={isChargesDialogOpen}
        onOpenChange={setIsChargesDialogOpen}
      />
      
    </div>
  );
}