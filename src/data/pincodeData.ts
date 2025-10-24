// Pincode Management Data Types and Dummy Data

export type PincodeStatus = 'Active' | 'Inactive';
export type DeliveryType = 'Same Day Delivery' | 'Next Day Delivery';
export type TimeFormat = 'AM' | 'PM';

export interface DeliverySlot {
  id: string;
  name: string;
  deliveryType: DeliveryType; // This is the "shift"
  startTime: string; // 12-hour format like "9:00 AM"
  endTime: string; // 12-hour format like "5:00 PM"
  capacity: number; // Max orders for this slot
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryShift {
  id: string;
  deliveryType: DeliveryType;
  slots: DeliverySlot[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryCharge {
  id: string;
  pincodeId: string;
  minOrderValue: number;
  maxOrderValue?: number;
  charge: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PincodeArea {
  id: string;
  name: string;
  pincodeId: string;
  createdAt: string;
}

export interface Pincode {
  id: string;
  pincodeNumber: string;
  status: PincodeStatus;
  deliveryTypes: DeliveryType[]; // Which delivery types are available for this pincode
  areas: PincodeArea[];
  assignedShifts: DeliveryShift[]; // Delivery shifts assigned to this pincode
  charges: DeliveryCharge[];
  createdAt: string;
  updatedAt: string;
}

export interface SlotAssignment {
  id: string;
  slotId: string;
  pincodeIds: string[];
  createdAt: string;
}

// Mock data - removed to start with empty state
export const mockDeliverySlots: DeliverySlot[] = [];
export const mockDeliveryShifts: DeliveryShift[] = [];
export const mockPincodes: Pincode[] = [];