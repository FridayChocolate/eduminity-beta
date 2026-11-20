import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  Flag,
  X,
  CheckCircle,
  Coins,
  User,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  HelpRequest, 
  ChatMessage, 
  mockActiveSession, 
  mockChatMessages,
  HELP_TYPES 
} from "./types";
import { formatDistanceToNow } from "date-fns";

interface HelpSessionChatProps {
  request?: HelpRequest;
  isContributor?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export function HelpSessionChat({ 
  request = mockActiveSession, 
  isContributor = false,
  onClose,
  onComplete 
}: HelpSessionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = isContributor ? "contributor-1" : "student-3";

  // Calculate remaining time (mock)
  const sessionStartTime = new Date(request.acceptedAt || request.createdAt);
  const expectedEndTime = new Date(sessionStartTime.getTime() + request.estimatedDuration * 60 * 1000);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expectedEndTime.getTime() - now.getTime()) / 1000 / 60));
      setRemainingTime(remaining);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [expectedEndTime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: request.id,
      senderId: currentUserId,
      senderName: isContributor ? request.contributorName : request.studentName,
      content: newMessage,
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleEndSession = () => {
    setShowEndDialog(false);
    
    // Add system message
    const systemMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: request.id,
      senderId: "system",
      senderName: "System",
      content: "This session has ended. Thank you for using our help service!",
      isSystemMessage: true,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, systemMessage]);
    
    // Show summary after a delay
    setTimeout(() => {
      setShowSummary(true);
    }, 500);
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for the report");
      return;
    }
    toast.success("Report submitted", {
      description: "Our team will review this session.",
    });
    setShowReportDialog(false);
    setReportReason("");
  };

  const helpTypeLabel = HELP_TYPES.find(h => h.value === request.helpType)?.label || request.helpType;

  return (
    <>
      <Card className="flex flex-col h-[600px] max-h-[80vh]">
        {/* Header */}
        <CardHeader className="border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {isContributor ? request.studentName.charAt(0) : request.contributorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {isContributor ? request.studentName : request.contributorName}
                </p>
                <p className="text-xs text-muted-foreground">{request.topic}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {remainingTime > 0 ? `${remainingTime} min left` : "Time's up"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.isSystemMessage ? "justify-center" : msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                {msg.isSystemMessage ? (
                  <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-2 rounded-lg max-w-[80%] text-center flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.senderId === currentUserId
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4 flex-shrink-0">
          {/* Safety reminder */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3 w-3" />
            <span>Remember: Do not share personal contact information</span>
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowEndDialog(true)}
              className="text-green-600 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </Card>

      {/* End Session Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this help session? 
              {isContributor 
                ? ` You will receive ${request.contributorEarnings} coins.`
                : " The contributor will receive their payment."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Session</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndSession}>
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Report an Issue
            </DialogTitle>
            <DialogDescription>
              If you're experiencing problems with this session, please let us know.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the issue..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReport}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Session Complete!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Topic:</span>
                <span className="font-medium">{request.topic}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session Type:</span>
                <span className="font-medium">{helpTypeLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{request.estimatedDuration} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages Exchanged:</span>
                <span className="font-medium">{messages.length}</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 dark:text-green-400">
                  {isContributor ? "You earned:" : "Session cost:"}
                </span>
                <span className="flex items-center gap-1 text-lg font-bold text-green-600">
                  <Coins className="h-5 w-5" />
                  {isContributor ? request.contributorEarnings : request.coinCost} coins
                </span>
              </div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                1 Coin = 1 BDT
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => { setShowSummary(false); onComplete?.(); }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
