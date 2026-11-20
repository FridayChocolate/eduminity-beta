import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SubjectCardProps {
  icon: LucideIcon;
  name: string;
  count: number;
  color: string;
  onClick?: () => void;
}

export const SubjectCard = ({ icon: Icon, name, count, color, onClick }: SubjectCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-student-card border border-student-border",
        "hover:border-student-accent/30 hover:bg-student-hover transition-all duration-200",
        "group text-left w-full"
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground group-hover:text-student-accent transition-colors truncate">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground">{count} notes</p>
      </div>
    </button>
  );
};
