import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMode } from "@/contexts/ModeContext";
import { 
  CheckCircle, Upload, UserCheck, Filter, 
  RefreshCw, Sparkles, DollarSign, Star 
} from "lucide-react";

type FeedbackType = 
  | "upload_success"
  | "profile_updated"
  | "filter_applied"
  | "mode_switched"
  | "note_saved"
  | "purchase_complete"
  | "review_submitted"
  | "earnings_withdrawn";

interface FeedbackConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive";
}

export const useActivityFeedback = () => {
  const { toast } = useToast();
  const { mode } = useMode();

  const triggerFeedback = useCallback((type: FeedbackType, customMessage?: string) => {
    const configs: Record<FeedbackType, FeedbackConfig> = {
      upload_success: {
        title: "Upload Successful! 🎉",
        description: customMessage || "Your notes have been submitted for review.",
        icon: <Upload className="h-5 w-5 text-green-500" />,
      },
      profile_updated: {
        title: "Profile Updated",
        description: customMessage || "Your changes have been saved.",
        icon: <UserCheck className="h-5 w-5 text-blue-500" />,
      },
      filter_applied: {
        title: "Filters Applied",
        description: customMessage || "Showing filtered results.",
        icon: <Filter className="h-5 w-5 text-purple-500" />,
      },
      mode_switched: {
        title: mode === "contributor" ? "Creator Mode Active" : "Learning Mode Active",
        description: mode === "contributor" 
          ? "Welcome to your Creator Studio!" 
          : "Ready to learn something new!",
        icon: <RefreshCw className="h-5 w-5 text-cyan-500" />,
      },
      note_saved: {
        title: "Note Saved",
        description: customMessage || "Added to your saved collection.",
        icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      },
      purchase_complete: {
        title: "Purchase Complete! ✨",
        description: customMessage || "Your notes are ready to download.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      },
      review_submitted: {
        title: "Review Submitted",
        description: customMessage || "Thank you for your feedback!",
        icon: <Star className="h-5 w-5 text-yellow-500" />,
      },
      earnings_withdrawn: {
        title: "Withdrawal Initiated",
        description: customMessage || "Your earnings are on the way!",
        icon: <DollarSign className="h-5 w-5 text-green-500" />,
      },
    };

    const config = configs[type];

    toast({
      title: config.title,
      description: config.description,
      variant: config.variant,
    });
  }, [toast, mode]);

  return { triggerFeedback };
};
