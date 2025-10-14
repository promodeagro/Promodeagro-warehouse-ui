import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function NotificationBadge({ 
  count, 
  max = 99, 
  variant = 'destructive',
  size = 'default',
  className,
  onClick 
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();
  
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs min-w-4',
    default: 'h-5 w-5 text-xs min-w-5', 
    lg: 'h-6 w-6 text-sm min-w-6'
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'absolute -right-1 -top-1 rounded-full p-0 flex items-center justify-center font-medium cursor-pointer hover:scale-110 transition-transform',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {displayCount}
    </Badge>
  );
}