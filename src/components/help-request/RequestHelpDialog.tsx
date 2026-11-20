import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Clock, 
  Coins, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  BookOpen,
  GraduationCap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  HelpType, 
  HELP_TYPES, 
  DURATION_OPTIONS, 
  calculateCost 
} from "./types";
import { COINS_PER_TAKA } from "@/lib/currency";

interface RequestHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contributorName: string;
  contributorId: string;
  prefilledTopic?: string;
}

const helpTypeIcons = {
  "quick-clarification": Lightbulb,
  "notes-help": BookOpen,
  "session": GraduationCap,
};

export function RequestHelpDialog({
  open,
  onOpenChange,
  contributorName,
  contributorId,
  prefilledTopic = "",
}: RequestHelpDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [topic, setTopic] = useState(prefilledTopic);
  const [helpType, setHelpType] = useState<HelpType>("quick-clarification");
  const [duration, setDuration] = useState(15);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { totalCost, commission, contributorEarnings, totalCostInTaka } = calculateCost(helpType, duration);
  
  // Mock user balance in coins
  const userBalance = 24000; // 200 Taka worth
  const hasEnoughCoins = userBalance >= totalCost;

  const handleNext = () => {
    if (step === 1 && !topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async () => {
    if (!hasEnoughCoins) {
      toast.error("Insufficient coins. Please top up your balance.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    toast.success("Request sent successfully!", {
      description: `${contributorName} will be notified of your request.`,
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setTopic(prefilledTopic);
    setHelpType("quick-clarification");
    setDuration(15);
    setMessage("");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Request Help from {contributorName}
          </DialogTitle>
          <DialogDescription>
            Get personalized help through our structured request system
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Topic & Help Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="topic">What do you need help with?</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Understanding wave functions in quantum mechanics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Type of help needed</Label>
                <RadioGroup
                  value={helpType}
                  onValueChange={(v) => setHelpType(v as HelpType)}
                  className="space-y-2"
                >
                  {HELP_TYPES.map((type) => {
                    const Icon = helpTypeIcons[type.value];
                    return (
                      <label
                        key={type.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          helpType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={type.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{type.label}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              From {type.baseRate} coins (৳{(type.baseRate / COINS_PER_TAKA).toFixed(2)})
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>
            </motion.div>
          )}

          {/* Step 2: Duration & Message */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(v) => setDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional details (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Describe what you're struggling with or what specific help you need..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Cost Preview */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Session cost:</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Coins className="h-4 w-4 text-amber-500" />
                    {totalCost.toLocaleString()} coins (≈ ৳{totalCostInTaka.toFixed(2)})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {COINS_PER_TAKA} coins = ৳1 • Coins will be reserved when you submit
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Request Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topic:</span>
                    <span className="font-medium text-right max-w-[200px] truncate">{topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Help Type:</span>
                    <span className="font-medium">
                      {HELP_TYPES.find((h) => h.value === helpType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contributor:</span>
                    <span className="font-medium">{contributorName}</span>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <div className="text-right">
                      <span className="flex items-center gap-1 font-bold text-lg">
                        <Coins className="h-5 w-5 text-amber-500" />
                        {totalCost.toLocaleString()} coins
                      </span>
                      <span className="text-xs text-muted-foreground">≈ ৳{totalCostInTaka.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Platform fee ({Math.round((commission / totalCost) * 100)}%): {commission.toLocaleString()} coins
                  </p>
                </div>
              </div>

              {/* Balance Check */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  hasEnoughCoins ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"
                }`}
              >
                {hasEnoughCoins ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">
                      Your balance: {userBalance.toLocaleString()} coins (≈ ৳{(userBalance / COINS_PER_TAKA).toFixed(2)}) - sufficient
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">
                      Insufficient balance ({userBalance.toLocaleString()} coins). Please top up.
                    </span>
                  </>
                )}
              </div>

              {/* Safety Notice */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  By submitting, you agree to our guidelines. Sharing personal contact 
                  information or attempting off-platform communication is prohibited.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handleBack}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!hasEnoughCoins || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Confirm & Send
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
