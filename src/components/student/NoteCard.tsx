import { Badge } from "@/components/ui/badge";
import { Star, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  title: string;
  author: string;
  subject: string;
  rating: number;
  downloads: number;
  price: number | "Free";
  thumbnail: string;
  onClick?: () => void;
}

export const NoteCard = ({ 
  title, 
  author, 
  subject, 
  rating, 
  downloads, 
  price, 
  thumbnail,
  onClick 
}: NoteCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col p-4 rounded-xl bg-student-card border border-student-border w-full text-left",
        "hover:border-student-accent/30 hover:bg-student-hover transition-all duration-200 group"
      )}
    >
      <div className="w-full h-24 rounded-lg bg-student-accent/5 flex items-center justify-center text-4xl mb-3">
        {thumbnail}
      </div>
      
      <h3 className="text-sm font-medium text-foreground group-hover:text-student-accent transition-colors line-clamp-2 mb-1.5">
        {title}
      </h3>
      
      <p className="text-xs text-muted-foreground mb-2">by {author}</p>
      
      <Badge variant="secondary" className="w-fit text-[10px] bg-muted text-muted-foreground mb-3">
        {subject}
      </Badge>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-student-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            {rating}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            {downloads}
          </span>
        </div>
        <span className={cn(
          "text-sm font-semibold",
          price === "Free" ? "text-emerald-400" : "text-student-accent"
        )}>
          {price === "Free" ? "Free" : `${price} coins`}
        </span>
      </div>
    </button>
  );
};
