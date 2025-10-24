import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pincode, PincodeArea, DeliveryType } from '@/data/pincodeData';
import { usePincodes } from '@/contexts/PincodeContext';

interface CreatePincodeDialogProps {
  pincode?: Pincode;
  onSave: (pincodeData: any) => void;
  onClose: () => void;
}

export function CreatePincodeDialog({ pincode, onSave, onClose }: CreatePincodeDialogProps) {
  const [pincodeNumber, setPincodeNumber] = useState('');
  const [areas, setAreas] = useState<PincodeArea[]>([]);
  const [newArea, setNewArea] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string | null>(null);
  const [minOrderValue, setMinOrderValue] = useState<string>('');
  const [deliveryCharge, setDeliveryCharge] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  const { shifts } = usePincodes();

  useEffect(() => {
    if (pincode) {
      setPincodeNumber(pincode.pincodeNumber);
      setAreas(pincode.areas);
      setSelectedDeliveryType(pincode.assignedShifts.length > 0 ? pincode.assignedShifts[0].deliveryType : null);
      setStatus(pincode.status);
      
      // Load existing charges if available
      if (pincode.charges && pincode.charges.length > 0) {
        const latestCharge = pincode.charges[pincode.charges.length - 1];
        setMinOrderValue(latestCharge.minOrderValue.toString());
        setDeliveryCharge(latestCharge.charge.toString());
      }
    }
  }, [pincode]);

  const handleAddArea = () => {
    if (newArea.trim() && !areas.some(area => area.name.toLowerCase() === newArea.toLowerCase())) {
      const newAreaObj: PincodeArea = {
        id: `area-${Date.now()}`,
        name: newArea.trim(),
        pincodeId: pincode?.id || '',
        createdAt: new Date().toISOString(),
      };
      setAreas(prev => [...prev, newAreaObj]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (areaId: string) => {
    setAreas(prev => prev.filter(area => area.id !== areaId));
  };

  const handleDeliveryTypeChange = (type: string) => {
    setSelectedDeliveryType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pincodeNumber.trim()) {
      return;
    }

    // Validate that minimum order value is greater than delivery charges
    if (minOrderValue && deliveryCharge) {
      const minValue = parseFloat(minOrderValue);
      const chargeValue = parseFloat(deliveryCharge);
      
      if (minValue <= chargeValue) {
        alert('Minimum order value must be greater than delivery charges.');
        return;
      }
    }

    const pincodeData = {
      pincodeNumber: pincodeNumber.trim(),
      areas: areas.map(area => ({
        ...area,
        pincodeId: pincode?.id || `pin-${Date.now()}`,
      })),
      deliveryTypes: selectedDeliveryType ? [selectedDeliveryType] : [],
      status,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : undefined,
      deliveryCharge: deliveryCharge ? parseFloat(deliveryCharge) : undefined,
    };

    onSave(pincodeData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pincode ? 'Edit Pincode' : 'Create New Pincode'}
          </DialogTitle>
          <DialogDescription>
            {pincode 
              ? 'Update pincode details and associated areas'
              : 'Enter pincode number and associated areas'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pincode Number */}
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode Number</Label>
            <Input
              id="pincode"
              placeholder="e.g., 560001"
              value={pincodeNumber}
              onChange={(e) => setPincodeNumber(e.target.value)}
              className="text-lg"
              required
            />
          </div>

          {/* Areas / Localities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Areas / Localities</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddArea}
                disabled={!newArea.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Area
              </Button>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="e.g., Koramangala"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
              />
              
              {areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <Badge key={area.id} variant="secondary" className="flex items-center gap-1">
                      {area.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleRemoveArea(area.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Types */}
          <div className="space-y-3">
            <Label>Delivery Types</Label>
            {shifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delivery types available. Create some delivery types first.</p>
            ) : (
              <div className="space-y-2">
                {shifts.map((shift) => (
                  <div key={shift.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={shift.id}
                      name="deliveryType"
                      checked={selectedDeliveryType === shift.deliveryType}
                      onChange={() => handleDeliveryTypeChange(shift.deliveryType)}
                      className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <Label htmlFor={shift.id} className="text-sm font-normal cursor-pointer">
                      {shift.deliveryType}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Charges */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-order-value">Minimum Order Value (₹)</Label>
                <Input
                  id="min-order-value"
                  type="number"
                  placeholder="e.g., 500"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className={`mt-1 ${minOrderValue && deliveryCharge && parseFloat(minOrderValue) <= parseFloat(deliveryCharge) ? 'border-red-500' : ''}`}
                />
              </div>
              <div>
                <Label htmlFor="delivery-charge">Delivery Charges (₹)</Label>
                <Input
                  id="delivery-charge"
                  type="number"
                  placeholder="e.g., 50"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  className={`mt-1 ${minOrderValue && deliveryCharge && parseFloat(minOrderValue) <= parseFloat(deliveryCharge) ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Applied if order is below minimum value
                </p>
                {minOrderValue && deliveryCharge && parseFloat(minOrderValue) <= parseFloat(deliveryCharge) && (
                  <p className="text-xs text-red-500 mt-1">
                    Minimum order value must be greater than delivery charges
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: 'Active' | 'Inactive') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !pincodeNumber.trim() || 
                (minOrderValue && deliveryCharge && parseFloat(minOrderValue) <= parseFloat(deliveryCharge))
              }
            >
              {pincode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}