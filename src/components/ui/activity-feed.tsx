import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Clock, User } from "lucide-react";

interface ActivityItem {
  id?: string | number;
  time: string | Date;
  action: string;
  user?: string;
  details?: Record<string, any>;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  showUser?: boolean;
  maxItems?: number;
  title?: string;
  description?: string;
}

export function ActivityFeed({ 
  activities, 
  showUser = false, 
  maxItems = 10,
  title = "Recent Activity",
  description = "Latest system activities"
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const getTimeDisplay = (time: string | Date) => {
    if (typeof time === 'string') {
      // If it's a time string like "09:30", return as is
      if (time.match(/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i)) {
        return time;
      }
      // Otherwise try to parse as date
      try {
        const date = new Date(time);
        return formatDistanceToNow(date, { addSuffix: true });
      } catch {
        return time;
      }
    }
    return formatDistanceToNow(time, { addSuffix: true });
  };

  const getTypeColor = (type?: string) => {
    const colors = {
      success: 'border-success',
      warning: 'border-warning',
      error: 'border-destructive',
      info: 'border-primary'
    };
    return colors[type as keyof typeof colors] || 'border-primary';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No recent activity
            </div>
          ) : (
            displayActivities.map((activity, index) => (
              <div 
                key={activity.id || index} 
                className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${getTypeColor(activity.type)} bg-card/50`}
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeDisplay(activity.time)}
                    </span>
                    
                    {showUser && activity.user && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.user}
                      </span>
                    )}
                  </div>

                  {activity.details && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(activity.details).map(([key, value]) => (
                        value && (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
