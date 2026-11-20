import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Eye, Info, ArrowRight, AlertCircle, CheckCircle2, Clock, XCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UploadLimits {
  used: number;
  total: number;
  pendingCount: number;
  rejectedCount: number;
  profileComplete: boolean;
}

// Mock data - replace with real data from your backend
const mockLimits: UploadLimits = {
  used: 4,
  total: 5,
  pendingCount: 2,
  rejectedCount: 1,
  profileComplete: false,
};

export const UploadCard = () => {
  const navigate = useNavigate();
  const limits = mockLimits; // Replace with real hook/query
  
  const isAtLimit = limits.used >= limits.total;
  const hasBlockingIssues = limits.pendingCount > 0 || limits.rejectedCount > 0;
  const canUpload = !isAtLimit && !hasBlockingIssues;
  const progressPercentage = (limits.used / limits.total) * 100;

  const getRestrictionMessage = () => {
    if (isAtLimit) {
      return {
        icon: AlertCircle,
        title: "Upload limit reached",
        message: `You've used all ${limits.total} upload slots. Get notes approved or complete your profile to unlock more.`,
        type: "limit" as const,
      };
    }
    if (limits.rejectedCount > 0) {
      return {
        icon: XCircle,
        title: "Action needed on rejected notes",
        message: `You have ${limits.rejectedCount} rejected note${limits.rejectedCount > 1 ? 's' : ''}. Review the feedback and resubmit to continue uploading.`,
        type: "rejected" as const,
      };
    }
    if (limits.pendingCount >= 3) {
      return {
        icon: Clock,
        title: "Too many pending reviews",
        message: `You have ${limits.pendingCount} notes awaiting review. New uploads are paused until some are approved.`,
        type: "pending" as const,
      };
    }
    return null;
  };

  const restriction = getRestrictionMessage();

  return (
    <Card className="creator-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-creator-primary" />
          Upload New Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Upload slots</span>
            <span className={cn(
              "font-medium",
              isAtLimit ? "text-red-400" : "text-creator-cyan"
            )}>
              {limits.used} / {limits.total} used
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-creator-hover"
          />
          {limits.used < limits.total && (
            <p className="text-xs text-muted-foreground">
              {limits.total - limits.used} upload{limits.total - limits.used !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>

        {/* Restriction Message */}
        {restriction && (
          <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <restriction.icon className="h-4 w-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-400">{restriction.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {restriction.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status indicators when not blocked */}
        {!restriction && (
          <>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-creator-hover/50 border border-creator-border/30">
              <div className="w-10 h-10 rounded-lg bg-creator-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-creator-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">PDF Notes</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload study notes, guides, or revision sheets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-creator-hover/50 border border-creator-border/30">
              <div className="w-10 h-10 rounded-lg bg-creator-cyan/20 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-creator-cyan" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Preview Pages</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  First 2 pages shown as preview to buyers
                </p>
              </div>
            </div>
          </>
        )}

        {/* Helpful tip */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-creator-primary/5 border border-creator-primary/20">
          <Info className="h-4 w-4 text-creator-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {restriction 
              ? "Complete actions above to unlock more uploads"
              : <>Notes with previews get <span className="text-creator-cyan font-medium">3x more views</span></>
            }
          </p>
        </div>

        {/* CTA Buttons */}
        {restriction ? (
          <div className="space-y-2">
            {restriction.type === "limit" && !limits.profileComplete && (
              <Button 
                className="w-full bg-gradient-to-r from-creator-primary to-creator-cyan hover:opacity-90 text-background font-semibold"
                onClick={() => navigate("/app/creator-studio/profile")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Complete Profile to Unlock More
              </Button>
            )}
            {restriction.type === "rejected" && (
              <Button 
                className="w-full bg-gradient-to-r from-creator-primary to-creator-cyan hover:opacity-90 text-background font-semibold"
                onClick={() => navigate("/app/creator-studio/uploads?filter=rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Review Rejected Notes
              </Button>
            )}
            {restriction.type === "pending" && (
              <Button 
                className="w-full bg-gradient-to-r from-creator-primary to-creator-cyan hover:opacity-90 text-background font-semibold"
                onClick={() => navigate("/app/creator-studio/uploads?filter=pending")}
              >
                <Clock className="h-4 w-4 mr-2" />
                View Pending Reviews
              </Button>
            )}
            <Button 
              variant="outline"
              className="w-full border-creator-border/50 hover:bg-creator-hover/50"
              onClick={() => navigate("/app/creator-studio/tips")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Learn How to Get Approved Faster
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-creator-primary to-creator-cyan hover:opacity-90 text-background font-semibold"
            onClick={() => navigate("/app/upload-notes")}
            disabled={!canUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Start Uploading
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
