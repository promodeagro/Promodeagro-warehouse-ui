import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  description?: string;
  variant?: "default" | "glass" | "gradient";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  variant = "default",
  className,
}: StatCardProps) {
  const getCardClass = () => {
    switch (variant) {
      case "glass":
        return "glass-card hover-scale";
      case "gradient":
        return "bg-gradient-muted hover-glow border-card-border";
      default:
        return "bg-card hover-scale border-card-border";
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn(getCardClass(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground mb-1">
          {value}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={cn("font-medium", getChangeColor())}>
              {change}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}