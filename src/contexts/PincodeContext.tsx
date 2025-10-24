import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pincode, DeliverySlot, DeliveryCharge, PincodeArea, DeliveryShift, DeliveryType } from '@/data/pincodeData';

interface PincodeContextType {
  pincodes: Pincode[];
  slots: DeliverySlot[];
  shifts: DeliveryShift[];
  addPincode: (pincode: Omit<Pincode, 'id' | 'createdAt' | 'updatedAt' | 'assignedShifts' | 'charges'>, charges?: { minOrderValue: number; deliveryCharge: number }, deliveryType?: string) => void;
  updatePincode: (id: string, updates: Partial<Pincode>) => void;
  deletePincode: (id: string) => void;
  addSlot: (slot: Omit<DeliverySlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSlot: (id: string, updates: Partial<DeliverySlot>) => void;
  deleteSlot: (id: string) => void;
  addShift: (shift: Omit<DeliveryShift, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShift: (id: string, updates: Partial<DeliveryShift>) => void;
  deleteShift: (id: string) => void;
  assignShiftsToPincodes: (shiftIds: string[], pincodeIds: string[]) => void;
  removeShiftFromPincode: (shiftId: string, pincodeId: string) => void;
  addChargeToPincode: (pincodeId: string, charge: Omit<DeliveryCharge, 'id' | 'pincodeId' | 'createdAt' | 'updatedAt'>) => void;
  updateCharge: (chargeId: string, updates: Partial<DeliveryCharge>) => void;
  deleteCharge: (chargeId: string) => void;
}

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export const usePincodes = () => {
  const context = useContext(PincodeContext);
  if (!context) {
    throw new Error('usePincodes must be used within a PincodeProvider');
  }
  return context;
};

export const PincodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [shifts, setShifts] = useState<DeliveryShift[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPincodes = localStorage.getItem('warehouse-pincodes');
    const savedSlots = localStorage.getItem('warehouse-delivery-slots');
    const savedShifts = localStorage.getItem('warehouse-delivery-shifts');
    
    if (savedPincodes) {
      try {
        setPincodes(JSON.parse(savedPincodes));
      } catch (error) {
        console.error('Error loading pincodes from localStorage:', error);
      }
    } else {
      // Add some mock data for testing
      const mockPincodes: Pincode[] = [
        {
          id: '1',
          pincodeNumber: '122002',
          status: 'Active',
          deliveryTypes: ['Same Day Delivery'],
          areas: [
            { id: '1', name: 'DLF Phase 2, Gurugram', pincodeId: '1', createdAt: new Date().toISOString() }
          ],
          assignedShifts: [],
          charges: [
            { id: '1', pincodeId: '1', minOrderValue: 500, maxOrderValue: 1000, charge: 40, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          pincodeNumber: '122017',
          status: 'Active',
          deliveryTypes: ['Next Day Delivery'],
          areas: [
            { id: '2', name: 'Sohna Road, Sector 49', pincodeId: '2', createdAt: new Date().toISOString() }
          ],
          assignedShifts: [],
          charges: [
            { id: '2', pincodeId: '2', minOrderValue: 300, maxOrderValue: 800, charge: 50, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          pincodeNumber: '122018',
          status: 'Active',
          deliveryTypes: ['Same Day Delivery'],
          areas: [
            { id: '3', name: 'Golf Course Road', pincodeId: '3', createdAt: new Date().toISOString() }
          ],
          assignedShifts: [],
          charges: [
            { id: '3', pincodeId: '3', minOrderValue: 400, maxOrderValue: 1200, charge: 35, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          pincodeNumber: '122022',
          status: 'Active',
          deliveryTypes: ['Same Day Delivery'],
          areas: [
            { id: '4', name: 'Cyber City, DLF Phase 3', pincodeId: '4', createdAt: new Date().toISOString() }
          ],
          assignedShifts: [],
          charges: [
            { id: '4', pincodeId: '4', minOrderValue: 600, maxOrderValue: 1500, charge: 45, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          pincodeNumber: '500086',
          status: 'Active',
          deliveryTypes: ['Next Day Delivery'],
          areas: [
            { id: '5', name: 'Sector 15, Gurugram', pincodeId: '5', createdAt: new Date().toISOString() }
          ],
          assignedShifts: [],
          charges: [
            { id: '5', pincodeId: '5', minOrderValue: 250, maxOrderValue: 600, charge: 60, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setPincodes(mockPincodes);
    }
    
    if (savedSlots) {
      try {
        setSlots(JSON.parse(savedSlots));
      } catch (error) {
        console.error('Error loading slots from localStorage:', error);
      }
    }
    
    if (savedShifts) {
      try {
        setShifts(JSON.parse(savedShifts));
      } catch (error) {
        console.error('Error loading shifts from localStorage:', error);
      }
    }
  }, []);

  // Save pincodes to localStorage whenever pincodes change
  useEffect(() => {
    localStorage.setItem('warehouse-pincodes', JSON.stringify(pincodes));
  }, [pincodes]);

  // Save slots to localStorage whenever slots change
  useEffect(() => {
    localStorage.setItem('warehouse-delivery-slots', JSON.stringify(slots));
  }, [slots]);

  // Save shifts to localStorage whenever shifts change
  useEffect(() => {
    localStorage.setItem('warehouse-delivery-shifts', JSON.stringify(shifts));
  }, [shifts]);

  const addPincode = (pincodeData: Omit<Pincode, 'id' | 'createdAt' | 'updatedAt' | 'assignedShifts' | 'charges'>, charges?: { minOrderValue: number; deliveryCharge: number }, deliveryType?: string) => {
    const newPincodeId = `pin-${Date.now()}`;
    
    // Find the shift that matches the delivery type
    const assignedShift = deliveryType ? shifts.find(shift => shift.deliveryType === deliveryType) : null;
    
    const newPincode: Pincode = {
      ...pincodeData,
      id: newPincodeId,
      assignedShifts: assignedShift ? [assignedShift] : [],
      charges: charges ? [{
        id: `charge-${Date.now()}`,
        pincodeId: newPincodeId,
        minOrderValue: charges.minOrderValue,
        maxOrderValue: undefined,
        charge: charges.deliveryCharge,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPincodes(prev => [...prev, newPincode]);
  };

  const updatePincode = (id: string, updates: Partial<Pincode>) => {
    setPincodes(prev => 
      prev.map(pincode => 
        pincode.id === id 
          ? { ...pincode, ...updates, updatedAt: new Date().toISOString() }
          : pincode
      )
    );
  };

  const deletePincode = (id: string) => {
    setPincodes(prev => prev.filter(pincode => pincode.id !== id));
  };

  const addSlot = (slotData: Omit<DeliverySlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSlot: DeliverySlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const updateSlot = (id: string, updates: Partial<DeliverySlot>) => {
    setSlots(prev => 
      prev.map(slot => 
        slot.id === id 
          ? { ...slot, ...updates, updatedAt: new Date().toISOString() }
          : slot
      )
    );
  };

  const deleteSlot = (id: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
    
    // Remove slot from all pincodes
    setPincodes(prev => 
      prev.map(pincode => ({
        ...pincode,
        slots: pincode.slots.filter(slot => slot.id !== id),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  const assignSlotsToPincodes = (slotIds: string[], pincodeIds: string[]) => {
    const slotsToAssign = slots.filter(slot => slotIds.includes(slot.id));
    
    setPincodes(prev => 
      prev.map(pincode => {
        if (pincodeIds.includes(pincode.id)) {
          // Add slots that aren't already assigned
          const existingSlotIds = pincode.slots.map(s => s.id);
          const newSlots = slotsToAssign.filter(slot => !existingSlotIds.includes(slot.id));
          return {
            ...pincode,
            slots: [...pincode.slots, ...newSlots],
            updatedAt: new Date().toISOString(),
          };
        }
        return pincode;
      })
    );
  };

  const removeSlotFromPincode = (slotId: string, pincodeId: string) => {
    setPincodes(prev => 
      prev.map(pincode => 
        pincode.id === pincodeId 
          ? {
              ...pincode,
              slots: pincode.slots.filter(slot => slot.id !== slotId),
              updatedAt: new Date().toISOString(),
            }
          : pincode
      )
    );
  };

  const addChargeToPincode = (pincodeId: string, chargeData: Omit<DeliveryCharge, 'id' | 'pincodeId' | 'createdAt' | 'updatedAt'>) => {
    const newCharge: DeliveryCharge = {
      ...chargeData,
      id: `charge-${Date.now()}`,
      pincodeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPincodes(prev => 
      prev.map(pincode => 
        pincode.id === pincodeId 
          ? {
              ...pincode,
              charges: [newCharge], // Replace existing charges instead of adding
              updatedAt: new Date().toISOString(),
            }
          : pincode
      )
    );
  };

  const updateCharge = (chargeId: string, updates: Partial<DeliveryCharge>) => {
    setPincodes(prev => 
      prev.map(pincode => ({
        ...pincode,
        charges: pincode.charges.map(charge => 
          charge.id === chargeId 
            ? { ...charge, ...updates, updatedAt: new Date().toISOString() }
            : charge
        ),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  const deleteCharge = (chargeId: string) => {
    setPincodes(prev => 
      prev.map(pincode => ({
        ...pincode,
        charges: pincode.charges.filter(charge => charge.id !== chargeId),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  // Shift management functions
  const addShift = (shiftData: Omit<DeliveryShift, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newShift: DeliveryShift = {
      ...shiftData,
      id: `shift-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setShifts(prev => [...prev, newShift]);
  };

  const updateShift = (id: string, updates: Partial<DeliveryShift>) => {
    const oldShift = shifts.find(shift => shift.id === id);
    
    setShifts(prev => 
      prev.map(shift => 
        shift.id === id 
          ? { ...shift, ...updates, updatedAt: new Date().toISOString() }
          : shift
      )
    );

    // If delivery type changed, update all associated slots and pincode assignments
    if (oldShift && updates.deliveryType && updates.deliveryType !== oldShift.deliveryType) {
      const newDeliveryType = updates.deliveryType;
      
      // Update all slots with the old delivery type to use the new one
      setSlots(prev => 
        prev.map(slot => 
          slot.deliveryType === oldShift.deliveryType
            ? { ...slot, deliveryType: newDeliveryType, updatedAt: new Date().toISOString() }
            : slot
        )
      );

      // Update all pincodes that have this shift assigned
      setPincodes(prev => 
        prev.map(pincode => {
          const updatedShifts = pincode.assignedShifts.map(assignedShift => 
            assignedShift.id === id 
              ? { ...assignedShift, deliveryType: newDeliveryType, updatedAt: new Date().toISOString() }
              : assignedShift
          );
          const deliveryTypes = updatedShifts.map(shift => shift.deliveryType);
          
          return {
            ...pincode,
            assignedShifts: updatedShifts,
            deliveryTypes: deliveryTypes,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    }
  };

  const deleteShift = (id: string) => {
    // Find the shift to get its delivery type
    const shiftToDelete = shifts.find(shift => shift.id === id);
    
    setShifts(prev => prev.filter(shift => shift.id !== id));
    
    // Delete all slots associated with this delivery type
    if (shiftToDelete) {
      setSlots(prev => prev.filter(slot => slot.deliveryType !== shiftToDelete.deliveryType));
    }
    
    // Also remove from all pincodes
    setPincodes(prev => 
      prev.map(pincode => ({
        ...pincode,
        assignedShifts: pincode.assignedShifts.filter(shift => shift.id !== id),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  const assignShiftsToPincodes = (shiftIds: string[], pincodeIds: string[]) => {
    const shiftsToAssign = shifts.filter(shift => shiftIds.includes(shift.id));
    
    setPincodes(prev => 
      prev.map(pincode => {
        if (pincodeIds.includes(pincode.id)) {
          // Replace all existing shifts with the new ones (only one delivery type per pincode)
          const deliveryTypes = shiftsToAssign.map(shift => shift.deliveryType);
          return {
            ...pincode,
            assignedShifts: shiftsToAssign,
            deliveryTypes: deliveryTypes,
            updatedAt: new Date().toISOString(),
          };
        }
        return pincode;
      })
    );
  };

  const removeShiftFromPincode = (shiftId: string, pincodeId: string) => {
    setPincodes(prev => 
      prev.map(pincode => 
        pincode.id === pincodeId 
          ? {
              ...pincode,
              assignedShifts: pincode.assignedShifts.filter(shift => shift.id !== shiftId),
              deliveryTypes: pincode.assignedShifts
                .filter(shift => shift.id !== shiftId)
                .map(shift => shift.deliveryType),
              updatedAt: new Date().toISOString(),
            }
          : pincode
      )
    );
  };

  return (
    <PincodeContext.Provider value={{
      pincodes,
      slots,
      shifts,
      addPincode,
      updatePincode,
      deletePincode,
      addSlot,
      updateSlot,
      deleteSlot,
      addShift,
      updateShift,
      deleteShift,
      assignShiftsToPincodes,
      removeShiftFromPincode,
      addChargeToPincode,
      updateCharge,
      deleteCharge,
    }}>
      {children}
    </PincodeContext.Provider>
  );
};