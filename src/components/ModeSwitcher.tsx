import { useState } from "react";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Megaphone, GraduationCap, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const ModeSwitcher = () => {
  const { mode, setMode } = useMode();
  const { user, canSwitchModes } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Strict portal rule: hide switcher completely for single-role accounts
  if (!user || !canSwitchModes) return null;

  const isContributorMode = mode === "contributor";

  const handleConfirmSwitch = () => {
    const newMode = isContributorMode ? "student" : "contributor";
    setMode(newMode);

    toast({
      title: `Switched to ${newMode === "contributor" ? "Creator" : "Learning"} Mode`,
      description:
        newMode === "contributor"
          ? "Welcome to Creator Studio!"
          : "Welcome back to Learning Mode!",
    });

    if (newMode === "contributor") {
      navigate("/app/creator-studio");
    } else {
      navigate("/app/student-dashboard");
    }

    setShowConfirmDialog(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className={cn(
              "relative h-9 px-4 rounded-full transition-all duration-500 ease-out overflow-hidden group",
              "border-2",
              isContributorMode
                ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                : "bg-primary/10 border-primary/50 hover:bg-primary/20 text-primary hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            )}
          >
            {/* Animated background */}
            <div
              className={cn(
                "absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-100",
                isContributorMode
                  ? "bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10"
                  : "bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10"
              )}
            />

            {/* Icon with animation */}
            <div className="relative z-10 flex items-center gap-2">
              {isContributorMode ? (
                <Megaphone className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <GraduationCap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              )}

              <span
                className={cn(
                  "text-xs font-semibold transition-all duration-300",
                  "group-hover:tracking-wider"
                )}
              >
                {isContributorMode ? "Creator" : "Learning"}
              </span>

              <ArrowLeftRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-180" />
            </div>

            {/* Pulse ring on active */}
            <span
              className={cn(
                "absolute inset-0 rounded-full ring-2 animate-pulse-soft transition-colors duration-300",
                isContributorMode ? "ring-emerald-500/30" : "ring-primary/30"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isContributorMode ? "Switch to Learning Mode" : "Switch to Creator Mode"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isContributorMode ? (
                <>
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Switch to Learning Mode?
                </>
              ) : (
                <>
                  <Megaphone className="h-5 w-5 text-emerald-400" />
                  Switch to Creator Mode?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isContributorMode
                ? "You'll be redirected to the Student Dashboard where you can browse study materials and access your library."
                : "You'll be redirected to Creator Studio where you can upload notes, track earnings, and manage your content."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch}
              className={cn(
                isContributorMode
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              )}
            >
              {isContributorMode ? "Go to Learning" : "Go to Creator Studio"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};