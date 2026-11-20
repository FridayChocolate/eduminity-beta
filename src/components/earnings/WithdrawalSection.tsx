import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Info,
  Building2,
  Coins,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  COINS_PER_TAKA, 
  CONVERSION_FEE_RATE, 
  coinsToTaka, 
  coinsToTakaAfterFee 
} from "@/lib/currency";

type PayoutStatus = "pending" | "processing" | "completed" | "failed";

interface PayoutMethod {
  id: string;
  name: string;
  logo: string;
  available: boolean;
  comingSoon?: boolean;
}

const payoutMethods: PayoutMethod[] = [
  { id: "bkash", name: "bKash", logo: "/images/payment/bkash.svg", available: true },
  { id: "nagad", name: "Nagad", logo: "/images/payment/nagad.svg", available: true },
  { id: "rocket", name: "Rocket", logo: "/images/payment/rocket.png", available: true },
  { id: "bank", name: "Bank Transfer", logo: "", available: false, comingSoon: true },
];

const recentPayouts: { id: string; amount: number; method: string; date: string; status: PayoutStatus }[] = [
  { id: "1", amount: 500, method: "bKash", date: "Dec 25, 2024", status: "completed" },
  { id: "2", amount: 1200, method: "Nagad", date: "Dec 20, 2024", status: "completed" },
  { id: "3", amount: 800, method: "bKash", date: "Dec 28, 2024", status: "processing" },
];

function StatusBadge({ status }: { status: PayoutStatus }) {
  const config = {
    pending: { icon: Clock, label: "Pending", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    processing: { icon: Loader2, label: "Processing", class: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    completed: { icon: CheckCircle2, label: "Completed", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    failed: { icon: XCircle, label: "Failed", class: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  
  const { icon: Icon, label, class: className } = config[status];
  
  return (
    <Badge variant="outline" className={cn("text-xs font-medium gap-1.5", className)}>
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} />
      {label}
    </Badge>
  );
}

export function WithdrawalSection() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  // Mock data in coins
  const coinBalance = 390000; // 390,000 coins
  const availableTaka = coinsToTakaAfterFee(coinBalance);
  const minWithdrawalTaka = 100;
  const processingTime = "1-3 business days";

  // Calculate current input conversion
  const currentInputTaka = parseInt(amount) || 0;
  const currentInputCoins = currentInputTaka * COINS_PER_TAKA;
  const currentFee = currentInputTaka * CONVERSION_FEE_RATE;
  const currentFinalAmount = currentInputTaka - currentFee;

  const handleWithdraw = () => {
    const withdrawAmount = parseInt(amount);
    const withdrawCoins = withdrawAmount * COINS_PER_TAKA;
    
    if (!selectedMethod) {
      toast.error("Please select a payout method");
      return;
    }
    if (!amount || withdrawAmount < minWithdrawalTaka) {
      toast.error(`Minimum withdrawal amount is ৳${minWithdrawalTaka}`);
      return;
    }
    if (withdrawCoins > coinBalance) {
      toast.error("Insufficient coin balance");
      return;
    }
    if (!accountNumber || accountNumber.length < 11) {
      toast.error("Please enter a valid account number");
      return;
    }
    
    const fee = withdrawAmount * CONVERSION_FEE_RATE;
    const finalAmount = withdrawAmount - fee;
    
    toast.success(`Withdrawal request submitted! You will receive ৳${finalAmount.toFixed(2)} after ${CONVERSION_FEE_RATE * 100}% fee.`);
    setAmount("");
    setAccountNumber("");
    setSelectedMethod(null);
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal Form */}
      <Card className="creator-card border-creator-border/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-creator-primary/10">
              <Wallet className="h-5 w-5 text-creator-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Withdraw Funds</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Balance: <span className="text-yellow-400 font-semibold">{coinBalance.toLocaleString()} coins</span>
                {" "}≈{" "}
                <span className="text-emerald-400 font-semibold">৳{availableTaka.toFixed(2)}</span> (after fee)
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Rules Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <Info className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-400">Withdrawal Rules</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="font-medium text-foreground">{COINS_PER_TAKA} coins = ৳1</span></li>
                <li>• Minimum withdrawal: <span className="font-medium text-foreground">৳{minWithdrawalTaka}</span></li>
                <li>• Conversion fee: <span className="font-medium text-foreground">{CONVERSION_FEE_RATE * 100}%</span></li>
                <li>• Processing time: <span className="font-medium text-foreground">{processingTime}</span></li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Select Payout Method</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {payoutMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: method.available ? 1.02 : 1 }}
                  whileTap={{ scale: method.available ? 0.98 : 1 }}
                  onClick={() => method.available && setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                    method.available
                      ? selectedMethod === method.id
                        ? "border-creator-primary bg-creator-primary/10"
                        : "border-border/50 hover:border-border bg-muted/30 hover:bg-muted/50"
                      : "border-border/30 bg-muted/20 opacity-60 cursor-not-allowed"
                  )}
                >
                  {method.comingSoon && (
                    <Badge className="absolute -top-2 -right-2 text-[10px] bg-muted text-muted-foreground border-border">
                      Soon
                    </Badge>
                  )}
                  {method.logo ? (
                    <img 
                      src={method.logo} 
                      alt={method.name} 
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium">{method.name}</span>
                  {selectedMethod === method.id && (
                    <motion.div
                      layoutId="selected-method"
                      className="absolute inset-0 border-2 border-creator-primary rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount & Account */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Withdraw (৳)</label>
              <Input
                type="number"
                placeholder={`Min ৳${minWithdrawalTaka}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-creator-primary"
              />
              {currentInputTaka > 0 && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Coins: {currentInputCoins.toLocaleString()} • Fee: ৳{currentFee.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-emerald-400">
                    You'll receive: ৳{currentFinalAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <Input
                type="text"
                placeholder="Enter your account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-creator-primary"
              />
            </div>
          </div>

          <Button 
            onClick={handleWithdraw}
            className="w-full bg-gradient-to-r from-creator-primary to-creator-secondary text-background hover:opacity-90"
            size="lg"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Request Withdrawal
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card className="creator-card border-creator-border/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <Clock className="h-5 w-5 text-sky-400" />
            </div>
            <CardTitle className="text-lg">Recent Payouts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPayouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Wallet className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">৳{payout.amount} via {payout.method}</p>
                    <p className="text-xs text-muted-foreground">{payout.date}</p>
                  </div>
                </div>
                <StatusBadge status={payout.status} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
