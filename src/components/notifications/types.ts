export type NotificationType = 
  | "system"
  | "purchase_confirmation"
  | "saved_note_alert"
  | "recommendation"
  | "new_sale"
  | "upload_approved"
  | "upload_rejected"
  | "review_received"
  | "earnings_milestone";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
  actionUrl?: string;
}

export const notificationConfig: Record<NotificationType, {
  icon: string;
  color: string;
  mode: "student" | "contributor" | "both";
}> = {
  system: {
    icon: "Bell",
    color: "text-muted-foreground",
    mode: "both",
  },
  purchase_confirmation: {
    icon: "CheckCircle",
    color: "text-green-500",
    mode: "student",
  },
  saved_note_alert: {
    icon: "Bookmark",
    color: "text-blue-500",
    mode: "student",
  },
  recommendation: {
    icon: "Sparkles",
    color: "text-cyan-500",
    mode: "student",
  },
  new_sale: {
    icon: "DollarSign",
    color: "text-green-500",
    mode: "contributor",
  },
  upload_approved: {
    icon: "CheckCircle",
    color: "text-green-500",
    mode: "contributor",
  },
  upload_rejected: {
    icon: "XCircle",
    color: "text-red-500",
    mode: "contributor",
  },
  review_received: {
    icon: "Star",
    color: "text-yellow-500",
    mode: "contributor",
  },
  earnings_milestone: {
    icon: "Trophy",
    color: "text-purple-500",
    mode: "contributor",
  },
};
