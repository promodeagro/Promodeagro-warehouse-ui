import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Bell, Volume2, VolumeX } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export const OrderNotificationDemo = () => {
  const { addNotification, playNotificationSound } = useNotifications();
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderCounter, setOrderCounter] = useState(1);

  // Simulate random order arrivals
  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      const orderTypes = [
        {
          type: 'new_order' as const,
          title: 'New Order Received!',
          message: `Order #ORD-${String(orderCounter).padStart(4, '0')} has been placed by a customer.`,
          priority: 'high' as const,
          orderId: `ORD-${String(orderCounter).padStart(4, '0')}`,
        },
        {
          type: 'new_order' as const,
          title: 'Urgent Order!',
          message: `Priority order #ORD-${String(orderCounter).padStart(4, '0')} requires immediate attention.`,
          priority: 'urgent' as const,
          orderId: `ORD-${String(orderCounter).padStart(4, '0')}`,
        },
        {
          type: 'order_update' as const,
          title: 'Order Status Updated',
          message: `Order #ORD-${String(orderCounter).padStart(4, '0')} status changed to "Ready for Pickup".`,
          priority: 'medium' as const,
          orderId: `ORD-${String(orderCounter).padStart(4, '0')}`,
        },
      ];

      const randomOrder = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      
      addNotification({
        ...randomOrder,
        message: randomOrder.message.replace('ORD-0000', `ORD-${String(orderCounter).padStart(4, '0')}`),
      });

      setOrderCounter(prev => prev + 1);
    }, Math.random() * 10000 + 5000); // Random interval between 5-15 seconds

    return () => clearInterval(interval);
  }, [isAutoMode, orderCounter, addNotification]);

  const handleManualOrder = () => {
    addNotification({
      type: 'new_order',
      title: 'New Order Received!',
      message: `Order #ORD-${String(orderCounter).padStart(4, '0')} has been placed by a customer.`,
      priority: 'high',
      orderId: `ORD-${String(orderCounter).padStart(4, '0')}`,
    });
    setOrderCounter(prev => prev + 1);
  };

  const handleUrgentOrder = () => {
    addNotification({
      type: 'new_order',
      title: 'Urgent Order!',
      message: `Priority order #ORD-${String(orderCounter).padStart(4, '0')} requires immediate attention.`,
      priority: 'urgent',
      orderId: `ORD-${String(orderCounter).padStart(4, '0')}`,
    });
    setOrderCounter(prev => prev + 1);
  };

  const handleTestSound = () => {
    if (soundEnabled) {
      playNotificationSound();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Order Notification Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Test the notification system for new customer orders. Notifications will appear in the top-right corner with sound alerts.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Button
            onClick={handleManualOrder}
            className="flex items-center gap-2"
            variant="default"
          >
            <ShoppingCart className="h-4 w-4" />
            Simulate New Order
          </Button>

          <Button
            onClick={handleUrgentOrder}
            className="flex items-center gap-2"
            variant="destructive"
          >
            <ShoppingCart className="h-4 w-4" />
            Simulate Urgent Order
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button
            onClick={() => setIsAutoMode(!isAutoMode)}
            variant={isAutoMode ? "destructive" : "outline"}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {isAutoMode ? 'Stop Auto Mode' : 'Start Auto Mode'}
          </Button>

          <Button
            onClick={handleTestSound}
            variant="outline"
            className="flex items-center gap-2"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Test Sound
          </Button>
        </div>

        {isAutoMode && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Auto Mode Active</Badge>
            <span className="text-sm text-gray-600">
              Random orders will be generated every 5-15 seconds
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>• Notifications appear in the top-right corner</div>
          <div>• Sound alerts play for new orders</div>
          <div>• Browser notifications will also appear (if permitted)</div>
          <div>• Click notifications to mark as read</div>
        </div>
      </CardContent>
    </Card>
  );
};
