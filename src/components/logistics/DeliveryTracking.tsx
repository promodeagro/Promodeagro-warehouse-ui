import { MapPin, Clock, CheckCircle, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function DeliveryTracking() {
  const activeDeliveries = [
    {
      id: "RT-001", 
      driver: "Rajesh Kumar",
      vehicle: "DLV-001",
      progress: 75,
      currentLocation: "Jubilee Hills",
      nextStop: "Banjara Hills",
      eta: "15 mins",
      status: "on-time"
    },
    {
      id: "RT-002",
      driver: "Priya Sharma", 
      vehicle: "DLV-002",
      progress: 60,
      currentLocation: "Gachibowli",
      nextStop: "Hitech City",
      eta: "25 mins", 
      status: "delayed"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Live Delivery Tracking
        </CardTitle>
        <CardDescription>Real-time delivery status and locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{delivery.id}</Badge>
                  <Badge className={delivery.status === 'on-time' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                    {delivery.status}
                  </Badge>
                </div>
                <span className="text-sm font-medium">ETA: {delivery.eta}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{delivery.driver}</span>
                  <span className="text-sm text-muted-foreground">{delivery.vehicle}</span>
                </div>
                <Progress value={delivery.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Current: {delivery.currentLocation}</span>
                  <span>Next: {delivery.nextStop}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}