import { CheckCircle, Clock, XCircle, FileText, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadStatus = "submitted" | "under_review" | "approved" | "rejected";

interface TimelineStep {
  id: UploadStatus;
  label: string;
  description: string;
}

const timelineSteps: TimelineStep[] = [
  { id: "submitted", label: "Submitted", description: "Your note has been received" },
  { id: "under_review", label: "Under Review", description: "Our team is reviewing your content" },
  { id: "approved", label: "Approved", description: "Your note is now live!" },
];

const statusColors: Record<UploadStatus, { bg: string; text: string; border: string; glow: string }> = {
  submitted: {
    bg: "bg-creator-cyan/20",
    text: "text-creator-cyan",
    border: "border-creator-cyan/50",
    glow: "shadow-[0_0_10px_hsl(var(--creator-cyan)/0.3)]"
  },
  under_review: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/50",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]"
  },
  approved: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/50",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]"
  },
  rejected: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/50",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]"
  }
};

interface UploadTimelineProps {
  currentStatus: UploadStatus;
  rejectionReason?: string;
  submittedAt?: string;
  className?: string;
}

export const UploadTimeline = ({ 
  currentStatus, 
  rejectionReason,
  submittedAt,
  className 
}: UploadTimelineProps) => {
  const isRejected = currentStatus === "rejected";
  const currentIndex = isRejected 
    ? 1 // Show rejection at review step
    : timelineSteps.findIndex(step => step.id === currentStatus);

  const getStepStatus = (stepIndex: number) => {
    if (isRejected && stepIndex === 1) return "rejected";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getStepIcon = (stepId: UploadStatus, status: string) => {
    if (status === "rejected") return <XCircle className="h-5 w-5" />;
    if (status === "completed") return <CheckCircle className="h-5 w-5" />;
    if (stepId === "submitted") return <FileText className="h-5 w-5" />;
    if (stepId === "under_review") return <Clock className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      {/* Estimated Review Time */}
      <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-creator-border/30">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-creator-primary" />
          <span className="text-muted-foreground">
            Usually reviewed within <span className="text-creator-cyan font-medium">24–48 hours</span>
          </span>
        </div>
        {submittedAt && (
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Submitted {submittedAt}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {timelineSteps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const colors = stepStatus === "rejected" 
            ? statusColors.rejected 
            : stepStatus === "completed" || stepStatus === "current"
              ? statusColors[step.id]
              : { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted", glow: "" };

          const isActive = stepStatus === "current" || stepStatus === "completed" || stepStatus === "rejected";
          const showRejection = isRejected && index === 1;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Connector Line */}
              {index < timelineSteps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[19px] top-10 w-0.5 h-[calc(100%-16px)] transition-colors duration-500",
                    index < currentIndex && !isRejected ? "bg-creator-primary" : "bg-muted/50",
                    isRejected && index === 0 ? "bg-creator-primary" : "",
                    isRejected && index >= 1 ? "bg-red-500/30" : ""
                  )}
                />
              )}

              {/* Step Indicator */}
              <div 
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  colors.bg,
                  colors.text,
                  colors.border,
                  isActive && colors.glow,
                  stepStatus === "current" && "animate-pulse"
                )}
              >
                {getStepIcon(step.id, stepStatus)}
              </div>

              {/* Step Content */}
              <div className={cn(
                "flex-1 pb-6",
                stepStatus === "upcoming" && "opacity-50"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-semibold",
                    colors.text,
                    stepStatus === "upcoming" && "text-muted-foreground"
                  )}>
                    {showRejection ? "Rejected" : step.label}
                  </h4>
                  {stepStatus === "current" && !isRejected && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", colors.bg, colors.text, colors.border)}
                    >
                      Current
                    </Badge>
                  )}
                  {stepStatus === "completed" && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      Complete
                    </Badge>
                  )}
                  {showRejection && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-red-500/20 text-red-400 border-red-500/30"
                    >
                      Action Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {showRejection ? "Your submission needs changes" : step.description}
                </p>

                {/* Rejection Details */}
                {showRejection && rejectionReason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-in fade-in duration-500">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-400 font-medium mb-1">Reviewer Feedback</p>
                        <p className="text-sm text-muted-foreground">{rejectionReason}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-3 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      View Full Feedback
                    </Button>
                  </div>
                )}

                {/* Success Message */}
                {step.id === "approved" && currentStatus === "approved" && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <p className="text-sm text-emerald-400 font-medium">
                        Congratulations! Your note is now available for students.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
