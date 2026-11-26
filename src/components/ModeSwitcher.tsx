import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, GraduationCap, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const ModeSwitcher = () => {
  const { mode, setMode } = useMode();
  const { user, canSwitchModes, toggleMode } = useAuth();
  const { toast } = useToast();

  if (!user || !canSwitchModes) return null;

  const isContributorMode = mode === "contributor";

  const handleToggle = () => {
    const newMode = isContributorMode ? "student" : "contributor";
    setMode(newMode);
    toggleMode();

    toast({
      title: `Switched to ${newMode === "contributor" ? "Creator" : "Learning"} Mode`,
      description:
        newMode === "contributor"
          ? "Creator tools unlocked across the navbar."
          : "Viewing Eduminity in Student Learning mode.",
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn(
            "relative h-9 px-4 rounded-full transition-all duration-300 overflow-hidden group border-2",
            isContributorMode
              ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
              : "bg-primary/10 border-primary/50 hover:bg-primary/20 text-primary"
          )}
        >
          <div className="relative z-10 flex items-center gap-2">
            {isContributorMode ? (
              <Megaphone className="h-4 w-4" />
            ) : (
              <GraduationCap className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold">
              {isContributorMode ? "Creator" : "Learning"}
            </span>
            <ArrowLeftRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180" />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isContributorMode ? "Switch to Learning Mode" : "Switch to Creator Mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
};