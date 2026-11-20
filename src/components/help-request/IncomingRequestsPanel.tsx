import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Clock, 
  Coins, 
  CheckCircle, 
  XCircle, 
  User,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { HelpRequest, HELP_TYPES, mockIncomingRequests } from "./types";
import { formatDistanceToNow } from "date-fns";
import { COINS_PER_TAKA } from "@/lib/currency";

interface IncomingRequestsPanelProps {
  onAcceptRequest?: (request: HelpRequest) => void;
}

export function IncomingRequestsPanel({ onAcceptRequest }: IncomingRequestsPanelProps) {
  const [requests, setRequests] = useState<HelpRequest[]>(mockIncomingRequests);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [actionType, setActionType] = useState<"accept" | "decline" | null>(null);

  const handleAction = (request: HelpRequest, action: "accept" | "decline") => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "accept") {
      setRequests(requests.filter((r) => r.id !== selectedRequest.id));
      toast.success("Request accepted!", {
        description: "You can now start the help session.",
      });
      onAcceptRequest?.(selectedRequest);
    } else {
      setRequests(requests.filter((r) => r.id !== selectedRequest.id));
      toast.info("Request declined", {
        description: "The student will be notified.",
      });
    }

    setSelectedRequest(null);
    setActionType(null);
  };

  const getHelpTypeLabel = (type: string) => {
    return HELP_TYPES.find((h) => h.value === type)?.label || type;
  };

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No pending requests</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            When students request your help, their requests will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Incoming Requests
            <Badge variant="secondary">{requests.length}</Badge>
          </h3>
        </div>

        <AnimatePresence>
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.studentAvatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.studentName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {getHelpTypeLabel(request.helpType)}
                      </Badge>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="mb-3">
                    <p className="font-medium text-sm">{request.topic}</p>
                    {request.message && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        "{request.message}"
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{request.estimatedDuration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        +{request.contributorEarnings.toLocaleString()} coins
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (≈ ৳{(request.contributorEarnings / COINS_PER_TAKA).toFixed(2)} after {Math.round((request.platformCommission / request.coinCost) * 100)}% fee)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction(request, "decline")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAction(request, "accept")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedRequest && !!actionType} onOpenChange={() => setSelectedRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "accept" ? "Accept this request?" : "Decline this request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "accept" ? (
                <>
                  You're about to accept help request from{" "}
                  <strong>{selectedRequest?.studentName}</strong>. A chat session will be 
                  opened and you'll earn{" "}
                  <strong>{selectedRequest?.contributorEarnings.toLocaleString()} coins (≈ ৳{((selectedRequest?.contributorEarnings || 0) / COINS_PER_TAKA).toFixed(2)})</strong> upon completion.
                </>
              ) : (
                <>
                  The student will be notified that their request was declined. 
                  Their coins will be refunded automatically.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === "decline" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionType === "accept" ? "Accept Request" : "Decline Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
