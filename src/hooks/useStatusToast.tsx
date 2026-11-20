import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type StatusType = "approved" | "rejected" | "pending" | "submitted" | "under_review";

interface StatusChange {
  noteTitle: string;
  previousStatus?: StatusType;
  newStatus: StatusType;
}

const statusMessages: Record<StatusType, { title: string; description: (noteTitle: string) => string; variant: "default" | "destructive" }> = {
  approved: {
    title: "Note Approved! 🎉",
    description: (title) => `Your "${title}" is now live and available for purchase.`,
    variant: "default"
  },
  rejected: {
    title: "Revision Needed",
    description: (title) => `Your "${title}" needs some updates. Check the feedback.`,
    variant: "destructive"
  },
  pending: {
    title: "Under Review",
    description: (title) => `Your "${title}" is being reviewed by our team.`,
    variant: "default"
  },
  submitted: {
    title: "Note Submitted!",
    description: (title) => `Your "${title}" has been submitted for review.`,
    variant: "default"
  },
  under_review: {
    title: "Review Started",
    description: (title) => `Your "${title}" is now being reviewed.`,
    variant: "default"
  }
};

export const showStatusToast = (change: StatusChange) => {
  const config = statusMessages[change.newStatus];
  
  toast({
    title: config.title,
    description: config.description(change.noteTitle),
    variant: config.variant,
    duration: 5000,
  });
};

// Hook to monitor status changes and show toasts
export const useStatusToast = () => {
  const previousStatuses = useRef<Map<string, StatusType>>(new Map());

  const checkStatusChange = (noteId: string, noteTitle: string, currentStatus: StatusType) => {
    const previousStatus = previousStatuses.current.get(noteId);
    
    if (previousStatus && previousStatus !== currentStatus) {
      showStatusToast({
        noteTitle,
        previousStatus,
        newStatus: currentStatus
      });
    }
    
    previousStatuses.current.set(noteId, currentStatus);
  };

  return { checkStatusChange, showStatusToast };
};
