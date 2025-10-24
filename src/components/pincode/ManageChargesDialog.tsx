import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { usePincodes } from '@/contexts/PincodeContext';
import { IndianRupee, MapPin, Package, Clock } from 'lucide-react';

interface ManageChargesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageChargesDialog({ open, onOpenChange }: ManageChargesDialogProps) {
  const [minOrderValue, setMinOrderValue] = useState<string>('');
  const [deliveryCharge, setDeliveryCharge] = useState<string>('');
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const [pincodeSearchTerm, setPincodeSearchTerm] = useState<string>('');
  
  const { toast } = useToast();
  const { pincodes, addChargeToPincode } = usePincodes();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setMinOrderValue('');
      setDeliveryCharge('');
      setSelectedPincodes([]);
      setPincodeSearchTerm('');
    }
  }, [open]);

  // Filter pincodes based on search term
  const filteredPincodes = pincodes.filter(p => {
    const term = pincodeSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      p.pincodeNumber.toLowerCase().includes(term) ||
      p.areas.some(a => a.name.toLowerCase().includes(term))
    );
  });

  const handleSelectAllPincodes = () => {
    if (selectedPincodes.length === filteredPincodes.length) {
      setSelectedPincodes([]);
    } else {
      setSelectedPincodes(filteredPincodes.map(p => p.id));
    }
  };

  const handlePincodeToggle = (pincodeId: string) => {
    setSelectedPincodes(prev => 
      prev.includes(pincodeId) 
        ? prev.filter(id => id !== pincodeId)
        : [...prev, pincodeId]
    );
  };

  const handleApplyCharges = () => {
    if (!minOrderValue || !deliveryCharge) {
      toast({
        title: "Error",
        description: "Please fill in both minimum order value and delivery charges.",
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

    const minValue = parseFloat(minOrderValue);
    const chargeValue = parseFloat(deliveryCharge);

    if (isNaN(minValue) || isNaN(chargeValue) || minValue < 0 || chargeValue < 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers for minimum order value and delivery charges.",
        variant: "destructive",
      });
      return;
    }

    if (minValue <= chargeValue) {
      toast({
        title: "Error",
        description: "Minimum order value must be greater than delivery charges.",
        variant: "destructive",
      });
      return;
    }

    // Apply charges to selected pincodes
    selectedPincodes.forEach(pincodeId => {
      addChargeToPincode(pincodeId, {
        minOrderValue: minValue,
        maxOrderValue: undefined, // No maximum for now
        charge: chargeValue,
        isActive: true,
      });
    });

    toast({
      title: "Success",
      description: `Delivery charges applied to ${selectedPincodes.length} pincode(s) successfully.`,
    });

    // Reset form and close modal
    setMinOrderValue('');
    setDeliveryCharge('');
    setSelectedPincodes([]);
    setPincodeSearchTerm('');
    onOpenChange(false);
  };

  const getCurrentCharges = (pincodeId: string) => {
    const pincode = pincodes.find(p => p.id === pincodeId);
    if (!pincode || pincode.charges.length === 0) {
      return { min: 'Not set', charge: 'Not set' };
    }
    const latestCharge = pincode.charges[pincode.charges.length - 1];
    return {
      min: `₹${latestCharge.minOrderValue}`,
      charge: `₹${latestCharge.charge}`
    };
  };

  const getAssignedDeliveryType = (pincodeId: string) => {
    const pincode = pincodes.find(p => p.id === pincodeId);
    if (!pincode || pincode.assignedShifts.length === 0) {
      return 'No delivery type assigned';
    }
    return pincode.assignedShifts[0].deliveryType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            Apply Delivery Charges
          </DialogTitle>
          <DialogDescription>
            Set minimum order value and delivery charges for multiple pincodes at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Charges Configuration */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Package className="h-4 w-4" />
                Delivery Charges Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-order-value">Minimum Order Value (₹)</Label>
                  <Input
                    id="min-order-value"
                    type="number"
                    placeholder="e.g., 500"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders below this value will incur delivery charges
                  </p>
                </div>
                <div>
                  <Label htmlFor="delivery-charge">Delivery Charges (₹)</Label>
                  <Input
                    id="delivery-charge"
                    type="number"
                    placeholder="e.g., 50"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Flat fee applied when minimum is not met
                  </p>
                </div>
              </div>
              
              {/* Preview */}
              {minOrderValue && deliveryCharge && (
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <strong>Preview:</strong> Orders below ₹{minOrderValue} will have ₹{deliveryCharge} delivery charges added.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select Pincodes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Pincodes</h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedPincodes.length === filteredPincodes.length && filteredPincodes.length > 0}
                  onCheckedChange={handleSelectAllPincodes}
                />
                <Label className="text-sm">Select All ({filteredPincodes.length})</Label>
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

            {/* Pincode List */}
            {filteredPincodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {pincodes.length === 0 
                  ? 'No pincodes available. Please create some pincodes first.'
                  : 'No pincodes match your search.'
                }
              </div>
            ) : (
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {filteredPincodes.map((pincode) => {
                  const currentCharges = getCurrentCharges(pincode.id);
                  return (
                    <Card key={pincode.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                  {pincode.areas.length > 0 ? pincode.areas[0].name : 'No area'}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getAssignedDeliveryType(pincode.id)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Min: {currentCharges.min} Charges: {currentCharges.charge}
                </div>
              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedPincodes.length} pincodes selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApplyCharges}
                disabled={selectedPincodes.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <IndianRupee className="h-4 w-4 mr-2" />
                Apply to {selectedPincodes.length} Pincode{selectedPincodes.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}