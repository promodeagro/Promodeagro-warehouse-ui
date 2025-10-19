import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderItem, OrderStatus, PaymentMode, orders as dummyOrders } from '@/data/orderData';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  resetOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(dummyOrders);

  // Utility function to remove duplicates based on order ID
  const removeDuplicates = (ordersList: Order[]): Order[] => {
    const seen = new Set();
    return ordersList.filter(order => {
      if (seen.has(order.id)) {
        return false;
      }
      seen.add(order.id);
      return true;
    });
  };

  // Load orders from localStorage on mount, merge with dummy data
  useEffect(() => {
    const savedOrders = localStorage.getItem('warehouse-orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        // Create a map to track existing order IDs
        const orderMap = new Map();
        
        // Add dummy orders first
        dummyOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        // Add saved orders (these will override dummy orders if same ID)
        parsedOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        // Convert map back to array and remove any duplicates
        const allOrders = removeDuplicates(Array.from(orderMap.values()));
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        // Clear corrupted localStorage and use dummy orders
        localStorage.removeItem('warehouse-orders');
        setOrders(dummyOrders);
      }
    } else {
      // If no saved orders, use dummy orders
      setOrders(dummyOrders);
    }
  }, []);

  // Note: localStorage saving is handled manually in addOrder, updateOrder, and deleteOrder functions

  const addOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const orderNumber = `ORD-${Date.now()}`;
    
    const newOrder: Order = {
      ...orderData,
      id: `ORD${Date.now()}`,
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
    };

    setOrders(prev => {
      // Add new order at the beginning, keep existing orders
      const newOrders = [newOrder, ...prev];
      // Remove duplicates and save only the new orders (excluding dummy data) to localStorage
      const uniqueOrders = removeDuplicates(newOrders);
      const savedOrders = uniqueOrders.filter(order => !dummyOrders.some(dummy => dummy.id === order.id));
      localStorage.setItem('warehouse-orders', JSON.stringify(savedOrders));
      return uniqueOrders;
    });
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => {
      const updatedOrders = prev.map(order => 
        order.id === id 
          ? { ...order, ...updates, updated_at: new Date().toISOString() }
          : order
      );
      // Save only the new orders (excluding dummy data) to localStorage
      const savedOrders = updatedOrders.filter(order => !dummyOrders.some(dummy => dummy.id === order.id));
      localStorage.setItem('warehouse-orders', JSON.stringify(savedOrders));
      return updatedOrders;
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => {
      const filteredOrders = prev.filter(order => order.id !== id);
      // Save only the new orders (excluding dummy data) to localStorage
      const savedOrders = filteredOrders.filter(order => !dummyOrders.some(dummy => dummy.id === order.id));
      localStorage.setItem('warehouse-orders', JSON.stringify(savedOrders));
      return filteredOrders;
    });
  };

  const resetOrders = () => {
    // Clear localStorage and reset to dummy orders only
    localStorage.removeItem('warehouse-orders');
    setOrders(dummyOrders);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, resetOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
