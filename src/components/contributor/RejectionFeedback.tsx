import { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  FileWarning, 
  Scale, 
  FileText, 
  Lightbulb,
  RefreshCw,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type RejectionReason = 
  | "low_quality" 
  | "incomplete_content" 
  | "poor_formatting" 
  | "copyright_risk"
  | "duplicate_content"
  | "incorrect_info";

interface RejectionDetails {
  reasons: RejectionReason[];
  reviewerFeedback?: string;
  rejectedAt: string;
  submissionAttempts: number;
  lastModified?: string;
}

interface RejectionFeedbackProps {
  noteId: string;
  noteTitle: string;
  details: RejectionDetails;
  onResubmit: (noteId: string) => void;
  className?: string;
}

const rejectionReasonConfig: Record<RejectionReason, { 
  icon: typeof AlertTriangle; 
  label: string; 
  description: string;
  tips: string[];
}> = {
  low_quality: {
    icon: AlertTriangle,
    label: "Quality Standards",
    description: "The content doesn't meet our quality guidelines",
    tips: [
      "Ensure text is clear and readable",
      "Use proper grammar and spelling",
      "Include detailed explanations",
      "Add visual aids where helpful"
    ]
  },
  incomplete_content: {
    icon: FileWarning,
    label: "Incomplete Content",
    description: "Some sections or topics are missing",
    tips: [
      "Review the syllabus/topic outline",
      "Add all missing chapters or sections",
      "Include practice problems if applicable",
      "Ensure all diagrams are present"
    ]
  },
  poor_formatting: {
    icon: FileText,
    label: "Formatting Issues",
    description: "The document structure needs improvement",
    tips: [
      "Use consistent headings and fonts",
      "Add a table of contents",
      "Number pages properly",
      "Use adequate spacing and margins"
    ]
  },
  copyright_risk: {
    icon: Scale,
    label: "Copyright Concerns",
    description: "Content may contain copyrighted material",
    tips: [
      "Use only original content",
      "Cite sources properly",
      "Replace copyrighted images",
      "Paraphrase instead of copying"
    ]
  },
  duplicate_content: {
    icon: FileWarning,
    label: "Duplicate Content",
    description: "Similar content already exists on the platform",
    tips: [
      "Add unique insights or perspectives",
      "Include additional practice materials",
      "Focus on a different approach",
      "Add supplementary content"
    ]
  },
  incorrect_info: {
    icon: AlertTriangle,
    label: "Accuracy Issues",
    description: "Some information may be incorrect",
    tips: [
      "Verify facts with reliable sources",
      "Double-check formulas and equations",
      "Review dates and statistics",
      "Cross-reference with textbooks"
    ]
  }
};

export const RejectionFeedback = ({
  noteId,
  noteTitle,
  details,
  onResubmit,
  className
}: RejectionFeedbackProps) => {
  const { toast } = useToast();
  const [showTips, setShowTips] = useState(false);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const hasMultipleAttempts = details.submissionAttempts > 1;

  const handleResubmit = async () => {
    // Check if changes were made
    if (!details.lastModified || details.lastModified === details.rejectedAt) {
      toast({
        title: "Please make changes first",
        description: "Review the feedback and update your note before resubmitting.",
        variant: "destructive"
      });
      setShowResubmitDialog(false);
      return;
    }

    setIsResubmitting(true);
    
    // Simulate resubmission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onResubmit(noteId);
    
    toast({
      title: "Note Resubmitted! 🎉",
      description: "Your updated note is now pending review. We'll notify you once it's reviewed.",
    });
    
    setIsResubmitting(false);
    setShowResubmitDialog(false);
  };

  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-500", className)}>
      {/* Rejection Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-red-400">Revision Required</h3>
          <p className="text-xs text-muted-foreground">
            Don't worry! Most notes get approved after revisions.
          </p>
        </div>
        {hasMultipleAttempts && (
          <Badge variant="outline" className="ml-auto text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
            Attempt {details.submissionAttempts}
          </Badge>
        )}
      </div>

      {/* Rejection Reasons */}
      <Card className="border-red-500/20 bg-red-500/5 mb-4">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            What needs to be improved
          </h4>
          
          <div className="space-y-3">
            {details.reasons.map((reason) => {
              const config = rejectionReasonConfig[reason];
              const Icon = config.icon;
              
              return (
                <div 
                  key={reason}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-red-500/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reviewer Feedback */}
          {details.reviewerFeedback && (
            <div className="mt-4 p-3 rounded-lg bg-background/80 border border-creator-border/30">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-creator-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-creator-primary mb-1">Reviewer Notes</p>
                  <p className="text-sm text-foreground">{details.reviewerFeedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Date */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Rejected on {details.rejectedAt}</span>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips - Collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-creator-primary/10 border border-creator-primary/20 hover:bg-creator-primary/15 transition-all"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-creator-cyan" />
            <span className="text-sm font-medium text-creator-primary">View Improvement Tips</span>
          </div>
          {showTips ? (
            <ChevronUp className="h-4 w-4 text-creator-primary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-creator-primary" />
          )}
        </button>
        
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          showTips ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}>
          <div className="p-4 rounded-lg bg-gradient-to-br from-creator-primary/5 to-creator-cyan/5 border border-creator-border/30">
            {details.reasons.map((reason) => {
              const config = rejectionReasonConfig[reason];
              
              return (
                <div key={reason} className="mb-4 last:mb-0">
                  <h5 className="text-sm font-medium text-creator-primary mb-2 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Tips for {config.label}
                  </h5>
                  <ul className="space-y-1.5">
                    {config.tips.map((tip, index) => (
                      <li 
                        key={index}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Warning for multiple attempts */}
      {hasMultipleAttempts && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in fade-in duration-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Multiple Submission Attempts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please ensure you've addressed all feedback before resubmitting. 
                Consider reviewing the improvement tips above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 border-creator-border/50 hover:bg-creator-primary/10 hover:border-creator-primary/50"
          onClick={() => {
            toast({
              title: "Edit Mode",
              description: "You can now update your note. Remember to save your changes!"
            });
          }}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Note
        </Button>
        
        <Button
          className="flex-1 bg-gradient-to-r from-creator-primary to-creator-violet hover:opacity-90"
          onClick={() => setShowResubmitDialog(true)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Fix & Resubmit
        </Button>
      </div>

      {/* Resubmit Confirmation Dialog */}
      <AlertDialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-creator-primary" />
              Resubmit for Review?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You're about to resubmit <span className="font-medium text-foreground">"{noteTitle}"</span> for review.
              </p>
              <p className="text-amber-400 text-sm">
                ⚠️ Make sure you've addressed all the feedback before resubmitting.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResubmit}
              disabled={isResubmitting}
              className="bg-gradient-to-r from-creator-primary to-creator-violet hover:opacity-90"
            >
              {isResubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resubmitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Resubmit
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
