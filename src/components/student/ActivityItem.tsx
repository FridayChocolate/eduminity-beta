import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  iconColor?: string;
}

export const ActivityItem = ({ icon: Icon, title, description, time, iconColor = "text-student-accent" }: ActivityItemProps) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-student-border last:border-0">
      <div className={cn("w-8 h-8 rounded-lg bg-student-hover flex items-center justify-center flex-shrink-0", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
    </div>
  );
};
