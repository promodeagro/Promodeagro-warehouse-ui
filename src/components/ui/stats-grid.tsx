import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className = "" }: StatsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3", 
    4: "md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`glass-card hover-scale transition-all ${
            stat.onClick ? 'cursor-pointer hover:shadow-glow' : ''
          }`}
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color || 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gradient-primary">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              )}
            </div>
            {stat.change && (
              <Badge 
                variant="secondary" 
                className={`mt-2 text-xs ${
                  stat.change.startsWith('+') ? 'text-success' : 
                  stat.change.startsWith('-') ? 'text-destructive' : ''
                }`}
              >
                {stat.change}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}