import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContinueLearningCardProps {
  title: string;
  subject: string;
  progress: number;
  thumbnail: string;
  lastAccessed: string;
  onClick?: () => void;
}

export const ContinueLearningCard = ({ 
  title, 
  subject, 
  progress, 
  thumbnail, 
  lastAccessed,
  onClick 
}: ContinueLearningCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-student-card border border-student-border w-full text-left",
        "hover:border-student-accent/30 hover:bg-student-hover transition-all duration-200 group"
      )}
    >
      <div className="w-14 h-14 rounded-lg bg-student-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
        {thumbnail}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground group-hover:text-student-accent transition-colors truncate mb-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-[10px] bg-student-accent/10 text-student-accent border-0">
            {subject}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastAccessed}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1 bg-student-border" />
          <span className="text-xs font-medium text-student-accent">{progress}%</span>
        </div>
      </div>
    </button>
  );
};
