import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePincodes } from '@/contexts/PincodeContext';
import { Pincode, DeliveryShift, DeliveryType } from '@/data/pincodeData';
import { MapPin, Clock, Users } from 'lucide-react';

interface AssignShiftsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignShiftsDialog({ open, onOpenChange }: AssignShiftsDialogProps) {
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<DeliveryType | null>(null);
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { pincodes, shifts, assignShiftsToPincodes } = usePincodes();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedDeliveryType(null);
      setSelectedPincodes([]);
      setSelectedShifts([]);
    }
  }, [open]);

  const availableShifts = shifts.filter(shift => 
    !selectedDeliveryType || shift.deliveryType === selectedDeliveryType
  );

  const handleDeliveryTypeSelect = (deliveryType: DeliveryType) => {
    setSelectedDeliveryType(deliveryType);
    setSelectedShifts([]);
  };

  const handlePincodeToggle = (pincodeId: string) => {
    setSelectedPincodes(prev => 
      prev.includes(pincodeId) 
        ? prev.filter(id => id !== pincodeId)
        : [...prev, pincodeId]
    );
  };

  const handleShiftToggle = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) 
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const handleAssign = () => {
    if (selectedShifts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one shift to assign.",
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

    assignShiftsToPincodes(selectedShifts, selectedPincodes);

    toast({
      title: "Success",
      description: `Assigned ${selectedShifts.length} shift(s) to ${selectedPincodes.length} pincode(s).`,
    });

    onOpenChange(false);
  };

  const getPincodeShiftCount = (pincode: Pincode) => {
    return pincode.assignedShifts.length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Delivery Shifts to Pincodes</DialogTitle>
          <DialogDescription>
            Select delivery shifts and assign them to multiple pincodes at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Delivery Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Select Delivery Type</h3>
            {shifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No delivery shifts available. Please create some shifts first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(new Set(shifts.map(s => s.deliveryType))).map((deliveryType) => (
                  <Card 
                    key={deliveryType}
                    className={`cursor-pointer transition-all ${
                      selectedDeliveryType === deliveryType 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleDeliveryTypeSelect(deliveryType as DeliveryType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{deliveryType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {shifts.filter(s => s.deliveryType === deliveryType).length} shifts available
                          </p>
                        </div>
                        <Badge variant={selectedDeliveryType === deliveryType ? 'default' : 'outline'}>
                          {selectedDeliveryType === deliveryType ? 'Selected' : 'Select'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Select Shifts */}
          {selectedDeliveryType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Select Shifts</h3>
              <div className="grid gap-3">
                {availableShifts.map((shift) => (
                  <Card key={shift.id} className="cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedShifts.includes(shift.id)}
                            onCheckedChange={() => handleShiftToggle(shift.id)}
                          />
                          <div>
                            <h4 className="font-medium">{shift.deliveryType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {shift.slots.length} time slots configured
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={shift.isActive ? 'default' : 'secondary'}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Pincodes */}
          {selectedShifts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Select Pincodes</h3>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {pincodes.map((pincode) => (
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
                              <Badge variant={pincode.status === 'Active' ? 'default' : 'secondary'}>
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
                                {getPincodeShiftCount(pincode)} shifts
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedShifts.length === 0 || selectedPincodes.length === 0}
            >
              Assign Shifts ({selectedShifts.length} shifts to {selectedPincodes.length} pincodes)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}