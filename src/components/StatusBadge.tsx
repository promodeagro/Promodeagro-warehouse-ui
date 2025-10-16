import { Badge } from "@/components/ui/badge";

export type OrderStatus = 'Placed' | 'Accepted' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Returned' | 'Failed';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
  'Placed': { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
  'Accepted': { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" },
  'Packed': { variant: "outline", className: "bg-orange-50 text-orange-700 border-orange-200" },
  'Dispatched': { variant: "outline", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  'Delivered': { variant: "default", className: "bg-primary text-primary-foreground" },
  'Cancelled': { variant: "destructive", className: "" },
  'Returned': { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  'Failed': { variant: "destructive", className: "" }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};
