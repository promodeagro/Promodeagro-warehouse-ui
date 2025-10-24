import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePincodes } from '@/contexts/PincodeContext';
import { DeliveryShift, DeliverySlot, DeliveryType, TimeFormat } from '@/data/pincodeData';
import { Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';

interface ManageSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSlotsDialog({ open, onOpenChange }: ManageSlotsDialogProps) {
  const [activeTab, setActiveTab] = useState<'shifts' | 'slots' | 'assign'>('shifts');
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [editingShift, setEditingShift] = useState<DeliveryShift | null>(null);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  
  // Shift form state
  const [shiftDeliveryType, setShiftDeliveryType] = useState<string>('');
  const [shiftIsActive, setShiftIsActive] = useState(true);
  
  // Slot form state
  const [slotDeliveryType, setSlotDeliveryType] = useState<string>('');
  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotStartPeriod, setSlotStartPeriod] = useState<TimeFormat>('AM');
  const [slotEndTime, setSlotEndTime] = useState('');
  const [slotEndPeriod, setSlotEndPeriod] = useState<TimeFormat>('PM');
  const [slotIsActive, setSlotIsActive] = useState(true);
  
  // Filter state
  const [slotFilter, setSlotFilter] = useState<string>('all');
  
  // Assign tab state
  const [selectedDeliveryTypeForAssign, setSelectedDeliveryTypeForAssign] = useState<string>('');
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const [pincodeSearchTerm, setPincodeSearchTerm] = useState<string>('');
  
  const { toast } = useToast();
  const { shifts, slots, pincodes, addShift, updateShift, deleteShift, addSlot, updateSlot, deleteSlot, assignShiftsToPincodes } = usePincodes();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsCreatingShift(false);
      setIsCreatingSlot(false);
      setEditingShift(null);
      setEditingSlot(null);
      resetForms();
    }
  }, [open]);

  const resetForms = () => {
    setShiftDeliveryType('');
    setShiftIsActive(true);
    setSlotDeliveryType('');
    setSlotStartTime('');
    setSlotStartPeriod('AM');
    setSlotEndTime('');
    setSlotEndPeriod('PM');
    setSlotIsActive(true);
    setSlotFilter('all');
    setSelectedDeliveryTypeForAssign('');
    setSelectedPincodes([]);
    setPincodeSearchTerm('');
  };

  const handleCreateShift = () => {
    if (!shiftDeliveryType.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery type for the shift.",
        variant: "destructive",
      });
      return;
    }

    // Check if delivery type already exists
    const trimmedDeliveryType = shiftDeliveryType.trim();
    const existingShift = shifts.find(shift => 
      shift.deliveryType.toLowerCase() === trimmedDeliveryType.toLowerCase()
    );

    if (existingShift) {
      toast({
        title: "Error",
        description: `Delivery type "${trimmedDeliveryType}" already exists. Please choose a different name.`,
        variant: "destructive",
      });
      return;
    }

    addShift({
      deliveryType: trimmedDeliveryType as DeliveryType,
      slots: [],
      isActive: shiftIsActive,
    });

    toast({
      title: "Success",
      description: `${trimmedDeliveryType} delivery type created successfully.`,
    });

    setIsCreatingShift(false);
    resetForms();
  };

  const handleCreateSlot = () => {
    if (!slotStartTime || !slotEndTime || !slotDeliveryType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const startTime = `${slotStartTime} ${slotStartPeriod}`;
    const endTime = `${slotEndTime} ${slotEndPeriod}`;
    const slotName = `${slotStartTime} ${slotStartPeriod} - ${slotEndTime} ${slotEndPeriod}`;

    // Validation: start and end cannot be identical
    if (startTime === endTime) {
      toast({
        title: "Invalid time range",
        description: "Start time and End time cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    // Validation: prevent duplicate slot time ranges for the same delivery type
    const duplicate = slots.some((s) =>
      s.deliveryType === (slotDeliveryType as DeliveryType) &&
      s.startTime === startTime &&
      s.endTime === endTime
    );
    if (duplicate) {
      toast({
        title: "Duplicate slot",
        description: `A slot for ${slotDeliveryType} with the same time already exists: ${startTime} - ${endTime}.`,
        variant: "destructive",
      });
      return;
    }

    addSlot({
      name: slotName,
      deliveryType: slotDeliveryType as DeliveryType,
      startTime,
      endTime,
      capacity: 50, // Default capacity
      isActive: slotIsActive,
    });

    toast({
      title: "Success",
      description: `Slot "${slotName}" created successfully.`,
    });

    setIsCreatingSlot(false);
    resetForms();
  };

  const handleEditShift = (shift: DeliveryShift) => {
    setEditingShift(shift);
    setShiftDeliveryType(shift.deliveryType);
    setShiftIsActive(shift.isActive);
    setIsCreatingShift(true);
  };

  const handleEditSlot = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setSlotDeliveryType(slot.deliveryType);
    setSlotIsActive(slot.isActive);
    
    // Parse time from "9:00 AM" format
    const [startTime, startPeriod] = slot.startTime.split(' ');
    const [endTime, endPeriod] = slot.endTime.split(' ');
    setSlotStartTime(startTime);
    setSlotStartPeriod(startPeriod as TimeFormat);
    setSlotEndTime(endTime);
    setSlotEndPeriod(endPeriod as TimeFormat);
    
    setIsCreatingSlot(true);
  };

  const handleUpdateShift = () => {
    if (!editingShift) return;

    if (!shiftDeliveryType.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery type for the shift.",
        variant: "destructive",
      });
      return;
    }

    // Check if delivery type already exists (excluding current shift being edited)
    const trimmedDeliveryType = shiftDeliveryType.trim();
    const existingShift = shifts.find(shift => 
      shift.id !== editingShift.id && 
      shift.deliveryType.toLowerCase() === trimmedDeliveryType.toLowerCase()
    );

    if (existingShift) {
      toast({
        title: "Error",
        description: `Delivery type "${trimmedDeliveryType}" already exists. Please choose a different name.`,
        variant: "destructive",
      });
      return;
    }

    updateShift(editingShift.id, {
      deliveryType: trimmedDeliveryType as DeliveryType,
      isActive: shiftIsActive,
    });

    toast({
      title: "Success",
      description: "Delivery type updated successfully.",
    });

    setEditingShift(null);
    setIsCreatingShift(false);
    resetForms();
  };

  const handleUpdateSlot = () => {
    if (!editingSlot) return;

    if (!slotStartTime || !slotEndTime || !slotDeliveryType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const startTime = `${slotStartTime} ${slotStartPeriod}`;
    const endTime = `${slotEndTime} ${slotEndPeriod}`;
    const slotName = `${slotStartTime} ${slotStartPeriod} - ${slotEndTime} ${slotEndPeriod}`;

    // Validation: start and end cannot be identical
    if (startTime === endTime) {
      toast({
        title: "Invalid time range",
        description: "Start time and End time cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    // Validation: prevent duplicate slot time ranges for the same delivery type (excluding current)
    const duplicate = slots.some((s) =>
      s.id !== editingSlot.id &&
      s.deliveryType === (slotDeliveryType as DeliveryType) &&
      s.startTime === startTime &&
      s.endTime === endTime
    );
    if (duplicate) {
      toast({
        title: "Duplicate slot",
        description: `A slot for ${slotDeliveryType} with the same time already exists: ${startTime} - ${endTime}.`,
        variant: "destructive",
      });
      return;
    }

    updateSlot(editingSlot.id, {
      name: slotName,
      deliveryType: slotDeliveryType as DeliveryType,
      startTime,
      endTime,
      capacity: 50, // Default capacity
      isActive: slotIsActive,
    });

    toast({
      title: "Success",
      description: "Slot updated successfully.",
    });

    setEditingSlot(null);
    setIsCreatingSlot(false);
    resetForms();
  };

  const handleDeleteShift = (shiftId: string) => {
    // Find the shift to get its delivery type and count associated slots
    const shiftToDelete = shifts.find(shift => shift.id === shiftId);
    const slotsToDelete = shiftToDelete ? slots.filter(slot => slot.deliveryType === shiftToDelete.deliveryType) : [];
    
    // Delete the shift (context will handle cascading delete of slots)
    deleteShift(shiftId);
    
    toast({
      title: "Success",
      description: `Delivery type "${shiftToDelete?.deliveryType || 'Unknown'}" and ${slotsToDelete.length} associated time slot(s) deleted successfully.`,
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSlot(slotId);
    toast({
      title: "Success",
      description: "Slot deleted successfully.",
    });
  };

  const getSlotsForShift = (deliveryType: DeliveryType) => {
    return slots.filter(slot => slot.deliveryType === deliveryType);
  };

  // Filter slots based on selected delivery type
  const filteredSlots = slots.filter(slot => {
    if (slotFilter === 'all') return true;
    return slot.deliveryType === slotFilter;
  });

  // Get unique delivery types from shifts for filter dropdown
  const availableDeliveryTypes = Array.from(new Set(shifts.map(shift => shift.deliveryType)));

  // Assign functions
  const handleDeliveryTypeSelect = (deliveryType: string) => {
    setSelectedDeliveryTypeForAssign(deliveryType);
    setSelectedPincodes([]); // Reset selected pincodes when changing delivery type
  };

  const handlePincodeToggle = (pincodeId: string) => {
    setSelectedPincodes(prev => 
      prev.includes(pincodeId) 
        ? prev.filter(id => id !== pincodeId)
        : [...prev, pincodeId]
    );
  };

  const handleSelectAllPincodes = () => {
    const filtered = filteredPincodesForAssign;
    if (selectedPincodes.length === filtered.length) {
      setSelectedPincodes([]);
    } else {
      setSelectedPincodes(filtered.map(p => p.id));
    }
  };

  // Filter pincodes for Assign tab based on search term
  const filteredPincodesForAssign = pincodes.filter(p => {
    const term = pincodeSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      p.pincodeNumber.toLowerCase().includes(term) ||
      p.areas.some(a => a.name.toLowerCase().includes(term))
    );
  });

  const handleAssignDeliveryType = () => {
    if (!selectedDeliveryTypeForAssign) {
      toast({
        title: "Error",
        description: "Please select a delivery type to assign.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPincodes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one pincode.",
        variant: "destructive",
      });
      return;
    }

    // Find the shift for the selected delivery type
    const shiftToAssign = shifts.find(shift => shift.deliveryType === selectedDeliveryTypeForAssign);
    if (!shiftToAssign) {
      toast({
        title: "Error",
        description: "Selected delivery type not found.",
        variant: "destructive",
      });
      return;
    }

    // Check for existing delivery types and show warning
    const pincodesWithExistingTypes = selectedPincodes.filter(pincodeId => {
      const pincode = pincodes.find(p => p.id === pincodeId);
      return pincode && pincode.assignedShifts.length > 0;
    });

    if (pincodesWithExistingTypes.length > 0) {
      const existingPincodes = pincodesWithExistingTypes.map(id => {
        const pincode = pincodes.find(p => p.id === id);
        return pincode ? pincode.pincodeNumber : id;
      }).join(', ');

      toast({
        title: "Replacing Existing Delivery Types",
        description: `Pincode(s) ${existingPincodes} already have delivery types assigned. The new delivery type "${selectedDeliveryTypeForAssign}" will replace the existing ones.`,
        duration: 5000,
      });
    }

    // Assign the shift to selected pincodes (this will replace existing assignments)
    assignShiftsToPincodes([shiftToAssign.id], selectedPincodes);

    toast({
      title: "Success",
      description: `Delivery type "${selectedDeliveryTypeForAssign}" assigned to ${selectedPincodes.length} pincode(s) successfully.`,
    });

    // Reset form
    setSelectedDeliveryTypeForAssign('');
    setSelectedPincodes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Delivery Shifts & Slots</DialogTitle>
          <DialogDescription>
            Create and manage delivery shifts and their associated time slots.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'shifts' ? 'default' : 'ghost'}
            onClick={() => {
              setActiveTab('shifts');
              // Reset all forms when switching to shifts
              setIsCreatingSlot(false);
              setEditingSlot(null);
              setIsCreatingShift(false);
              setEditingShift(null);
              resetForms();
            }}
            className="flex-1"
          >
            Delivery Type
          </Button>
          <Button
            variant={activeTab === 'slots' ? 'default' : 'ghost'}
            onClick={() => {
              setActiveTab('slots');
              // Reset all forms when switching to slots
              setIsCreatingSlot(false);
              setEditingSlot(null);
              setIsCreatingShift(false);
              setEditingShift(null);
              resetForms();
            }}
            className="flex-1"
          >
            Time Slots
          </Button>
          <Button
            variant={activeTab === 'assign' ? 'default' : 'ghost'}
            onClick={() => {
              setActiveTab('assign');
              // Reset all forms when switching to assign
              setIsCreatingSlot(false);
              setEditingSlot(null);
              setIsCreatingShift(false);
              setEditingShift(null);
              resetForms();
            }}
            className="flex-1"
          >
            Assign to Pincodes
          </Button>
        </div>

        {/* Shifts Tab */}
        {activeTab === 'shifts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Delivery Types</h3>
              {!isCreatingShift && (
                <Button onClick={() => setIsCreatingShift(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Delivery Type
                </Button>
              )}
            </div>

            {/* Create/Edit Shift Form */}
            {isCreatingShift && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingShift ? 'Edit Delivery Type' : 'Create New Delivery Type'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shift-delivery-type">Delivery Type</Label>
                      <Input
                        id="shift-delivery-type"
                        value={shiftDeliveryType}
                        onChange={(e) => setShiftDeliveryType(e.target.value)}
                        placeholder="e.g., Same Day Delivery, Next Day Delivery, Express Delivery"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shift-status">Status</Label>
                      <Select value={shiftIsActive ? 'active' : 'inactive'} onValueChange={(value) => setShiftIsActive(value === 'active')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={editingShift ? handleUpdateShift : handleCreateShift}>
                      {editingShift ? 'Update Delivery Type' : 'Create Delivery Type'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreatingShift(false);
                      setEditingShift(null);
                      resetForms();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shifts List - Hide when creating/editing */}
            {!isCreatingShift && (
              <div className="grid gap-4">
                {shifts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No delivery types created yet. Click "Add Delivery Type" to create your first delivery type.
                  </div>
                ) : (
                  shifts.map((shift) => (
                <Card key={shift.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {shift.deliveryType}
                          <Badge 
                            variant={shift.isActive ? 'default' : 'secondary'}
                            className={shift.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                          >
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {getSlotsForShift(shift.deliveryType).length} time slots configured
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditShift(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteShift(shift.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getSlotsForShift(shift.deliveryType).map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">{slot.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={slot.isActive ? 'default' : 'secondary'}
                              className={slot.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            >
                              {slot.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Time Slots</h3>
              {!isCreatingSlot && (
                <Button onClick={() => setIsCreatingSlot(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              )}
            </div>

            {/* Filter Section */}
            <div className="bg-muted/40 border rounded-md p-3">
              <div className="flex items-center gap-3">
                <Label htmlFor="slot-filter" className="text-sm font-medium">Filter by Delivery Type</Label>
                <Select value={slotFilter} onValueChange={setSlotFilter}>
                  <SelectTrigger className="w-64 bg-card">
                    <SelectValue placeholder="All delivery types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Delivery Types</SelectItem>
                    {availableDeliveryTypes.map((deliveryType) => (
                      <SelectItem key={deliveryType} value={deliveryType}>
                        {deliveryType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create/Edit Slot Form */}
            {isCreatingSlot && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingSlot ? 'Edit Slot' : 'Create New Slot'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slot-delivery-type">Delivery Type</Label>
                      <Select value={slotDeliveryType} onValueChange={(value: string) => setSlotDeliveryType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a delivery type" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.deliveryType}>
                              {shift.deliveryType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="slot-status">Status</Label>
                      <Select value={slotIsActive ? 'active' : 'inactive'} onValueChange={(value: string) => setSlotIsActive(value === 'active')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slot-start-time">Start Time</Label>
                      <div className="flex gap-2">
                        <Select value={slotStartTime} onValueChange={(value: string) => setSlotStartTime(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = i + 1;
                              return (
                                <SelectItem key={`${hour}`} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Select value={slotStartPeriod} onValueChange={(value: TimeFormat) => setSlotStartPeriod(value)}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="slot-end-time">End Time</Label>
                      <div className="flex gap-2">
                        <Select value={slotEndTime} onValueChange={(value: string) => setSlotEndTime(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = i + 1;
                              return (
                                <SelectItem key={`${hour}`} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Select value={slotEndPeriod} onValueChange={(value: TimeFormat) => setSlotEndPeriod(value)}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status toggle replaced by dropdown above */}
                  
                  <div className="flex space-x-2">
                    <Button onClick={editingSlot ? handleUpdateSlot : handleCreateSlot}>
                      {editingSlot ? 'Update Slot' : 'Create Slot'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreatingSlot(false);
                      setEditingSlot(null);
                      resetForms();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Slots List - Hide when editing */}
            {!isCreatingSlot && (
              <div className="space-y-2">
                {filteredSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {slotFilter === 'all' 
                      ? 'No time slots created yet. Click "Add Slot" to create your first slot.'
                      : `No slots found for "${slotFilter}". Try selecting a different delivery type.`
                    }
                  </div>
                ) : (
                  filteredSlots.map((slot) => (
                    <Card key={slot.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium">{slot.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {slot.deliveryType} • {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={slot.isActive ? 'default' : 'secondary'}
                              className={slot.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            >
                              {slot.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSlot(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Assign to Pincodes Tab */}
        {activeTab === 'assign' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assign Delivery Types to Pincodes</h3>
            </div>

            {/* Step 1: Select Delivery Type */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Step 1: Select Delivery Type</h4>
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No delivery types available. Please create some delivery types first.
                </div>
              ) : (
                <Select value={selectedDeliveryTypeForAssign} onValueChange={handleDeliveryTypeSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a delivery type to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDeliveryTypes.map((deliveryType) => (
                      <SelectItem key={deliveryType} value={deliveryType}>
                        {deliveryType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Step 2: Select Pincodes */}
            {selectedDeliveryTypeForAssign && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">Step 2: Select Pincodes</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllPincodes}
                    >
                      {selectedPincodes.length === filteredPincodesForAssign.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedPincodes.length} of {filteredPincodesForAssign.length} selected
                    </span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="bg-muted/30 border rounded-lg p-3">
                  <Input
                    placeholder="Search by pincode or area name"
                    value={pincodeSearchTerm}
                    onChange={(e) => setPincodeSearchTerm(e.target.value)}
                    className="w-full bg-card border-muted-foreground/20"
                  />
                </div>

                {filteredPincodesForAssign.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {pincodes.length === 0 
                      ? 'No pincodes available. Please create some pincodes first.'
                      : 'No pincodes match your search.'
                    }
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {filteredPincodesForAssign.map((pincode) => (
                      <Card key={pincode.id} className="cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={selectedPincodes.includes(pincode.id)}
                                onCheckedChange={() => handlePincodeToggle(pincode.id)}
                              />
                              <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{pincode.pincodeNumber}</h4>
                                <Badge 
                                  variant={pincode.status === 'Active' ? 'default' : 'secondary'}
                                  className={pincode.status === 'Active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                                >
                                  {pincode.status}
                                </Badge>
                              </div>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {pincode.areas.length} areas
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {pincode.assignedShifts.length} delivery types
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {selectedDeliveryTypeForAssign && selectedPincodes.length > 0 && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  onClick={handleAssignDeliveryType}
                  disabled={selectedPincodes.length === 0}
                >
                  Assign to {selectedPincodes.length} Pincode{selectedPincodes.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}