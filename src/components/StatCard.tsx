import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "purple";
  subtitle?: string;
  filled?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  subtitle,
  filled = false
}: StatCardProps) {
  const iconBgClass = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    destructive: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
    purple: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  }[variant];

  const cardBgClass = !filled
    ? ""
    : {
        default: "bg-primary/5 border-primary/20",
        success: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800",
        warning: "bg-amber-50 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-800",
        destructive: "bg-red-50 dark:bg-red-900/10 border-red-200/60 dark:border-red-800",
        info: "bg-sky-50 dark:bg-sky-900/10 border-sky-200/60 dark:border-sky-800",
        purple: "bg-violet-50 dark:bg-violet-900/10 border-violet-200/60 dark:border-violet-800",
      }[variant];

  return (
    <Card className={cn("border-border", cardBgClass)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-full flex-shrink-0 self-start", iconBgClass)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}