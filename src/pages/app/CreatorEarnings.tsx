import { useEffect, useState } from "react";
import { ContributorLayout } from "@/layouts/ContributorLayout";
import { TrustSection } from "@/components/earnings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageBackButton } from "@/components/ui/page-back-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Wallet,
  Shield,
  Clock,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

type PayoutMethod = "bkash" | "nagad" | "rocket";

interface WithdrawalRow {
  id: string;
  user_id: string;
  amount: number;
  status: "available" | "pending" | "approved" | string;
  payment_method: string;
  account_number: string;
  created_at: string;
}

const PROVIDERS: Record<
  PayoutMethod,
  { name: string; activeClasses: string; buttonClasses: string }
> = {
  bkash: {
    name: "bKash",
    activeClasses: "bg-[#E2136E]/15 border-[#E2136E]/50 text-[#ff4d94]",
    buttonClasses: "bg-[#E2136E] hover:bg-[#c91061] text-white",
  },
  nagad: {
    name: "Nagad",
    activeClasses: "bg-[#F6921E]/15 border-[#F6921E]/50 text-[#ffae42]",
    buttonClasses: "bg-[#F6921E] hover:bg-[#d97e16] text-black",
  },
  rocket: {
    name: "Rocket",
    activeClasses: "bg-[#8C3494]/20 border-[#8C3494]/50 text-[#d075d9]",
    buttonClasses: "bg-[#8C3494] hover:bg-[#752a7c] text-white",
  },
};

const MIN_WITHDRAWAL = 50;

const CreatorEarnings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal form state
  const [method, setMethod] = useState<PayoutMethod>("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLedger = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows(data || []);
    } catch (err: any) {
      console.error("Failed to load earnings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [user?.id]);

  // Real balance math
  const totalEarned = rows
    .filter((r) => r.status === "available")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const pendingPayout = rows
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalWithdrawn = rows
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const availableBalance = Math.max(0, totalEarned - pendingPayout - totalWithdrawn);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const numericAmount = Math.floor(Number(amount));
    const cleanedNumber = accountNumber.trim();

    if (!cleanedNumber || cleanedNumber.length < 11) {
      toast({
        title: "Invalid account number",
        description: `Enter a valid ${PROVIDERS[method].name} number (e.g., 01XXXXXXXXX).`,
        variant: "destructive",
      });
      return;
    }

    if (isNaN(numericAmount) || numericAmount < MIN_WITHDRAWAL) {
      toast({
        title: "Amount too low",
        description: `Minimum withdrawal amount is ৳${MIN_WITHDRAWAL}.`,
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > availableBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ৳${availableBalance} available to withdraw.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("withdrawals").insert({
        user_id: user.id,
        amount: numericAmount,
        status: "pending",
        payment_method: method,
        account_number: cleanedNumber,
      });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested!",
        description: `৳${numericAmount} via ${PROVIDERS[method].name} (${cleanedNumber}) is now pending admin payout.`,
      });

      setAmount("");
      setAccountNumber("");
      await fetchLedger();
    } catch (err: any) {
      console.error("Withdrawal error:", err.message);
      toast({
        title: "Request failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContributorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <PageBackButton />
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-creator-primary via-creator-violet to-creator-cyan bg-clip-text text-transparent">
              Earnings & Payouts
            </h1>
            <p className="text-muted-foreground">
              Track your real-time balance, sales credits, and mobile banking payouts
            </p>
          </div>
        </div>

        {/* Live Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span>Available Balance</span>
              <Wallet className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-3xl font-black text-teal-400">
              {loading ? "..." : `৳${availableBalance}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span>Pending Payout</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-amber-400">
              {loading ? "..." : `৳${pendingPayout}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin transfer</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span>Total Withdrawn</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">
              {loading ? "..." : `৳${totalWithdrawn}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Paid to your account</p>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span>Lifetime Earned</span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-foreground">
              {loading ? "..." : `৳${totalEarned}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">80% creator share</p>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="withdraw" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/30 p-1 h-auto">
            <TabsTrigger
              value="withdraw"
              className="data-[state=active]:bg-creator-primary data-[state=active]:text-background gap-2 py-2.5 px-4"
            >
              <Wallet className="h-4 w-4" />
              <span>Withdraw</span>
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="data-[state=active]:bg-creator-primary data-[state=active]:text-background gap-2 py-2.5 px-4"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Ledger & Payout History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="trust"
              className="data-[state=active]:bg-creator-primary data-[state=active]:text-background gap-2 py-2.5 px-4"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Trust & FAQ</span>
              <span className="sm:hidden">FAQ</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: WITHDRAWAL FORM */}
          <TabsContent value="withdraw" className="mt-6 animate-fade-in">
            <div className="max-w-xl rounded-2xl bg-card border border-border/50 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Request a Payout</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your mobile banking provider. Minimum withdrawal is ৳{MIN_WITHDRAWAL}.
                </p>
              </div>

              {/* Provider Selector */}
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(PROVIDERS) as PayoutMethod[]).map((key) => {
                  const provider = PROVIDERS[key];
                  const isSelected = method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={`py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                        isSelected
                          ? provider.activeClasses
                          : "bg-background/60 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {provider.name}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {PROVIDERS[method].name} Personal Number
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount (BDT)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmount(String(availableBalance))}
                      className="text-xs text-teal-400 hover:underline font-medium"
                    >
                      Max: ৳{availableBalance}
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={MIN_WITHDRAWAL}
                    max={availableBalance > 0 ? availableBalance : undefined}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min ৳${MIN_WITHDRAWAL}`}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || availableBalance < MIN_WITHDRAWAL}
                  className={`w-full h-12 rounded-xl font-bold ${PROVIDERS[method].buttonClasses}`}
                >
                  {submitting
                    ? "Submitting Request..."
                    : availableBalance < MIN_WITHDRAWAL
                    ? `Need at least ৳${MIN_WITHDRAWAL} to withdraw`
                    : `Request ${PROVIDERS[method].name} Payout`}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* TAB 2: LIVE LEDGER & PAYOUT HISTORY */}
          <TabsContent value="earnings" className="mt-6 animate-fade-in">
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading ledger...
                </div>
              ) : rows.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No earnings or payout requests yet. Once a student buys your notes, your 80%
                  share will appear here.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {rows.map((row) => {
                    const isCredit = row.status === "available";
                    const isPending = row.status === "pending";
                    const isPaid = row.status === "approved";

                    return (
                      <div
                        key={row.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              isCredit
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                                : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-sm">
                              {isCredit
                                ? "Sale Credit (80% Creator Share)"
                                : `Withdrawal via ${row.payment_method?.toUpperCase()}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isCredit
                                ? "Credited to wallet escrow"
                                : `Account: ${row.account_number}`}{" "}
                              • {new Date(row.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span
                            className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
                              isCredit
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                                : isPending
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : isPaid
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {isCredit ? "Credited" : isPending ? "Pending" : "Paid"}
                          </span>

                          <p
                            className={`font-mono font-bold text-base ${
                              isCredit ? "text-teal-400" : "text-foreground"
                            }`}
                          >
                            {isCredit ? `+৳${row.amount}` : `-৳${row.amount}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: TRUST & FAQ */}
          <TabsContent value="trust" className="mt-6 animate-fade-in">
            <TrustSection />
          </TabsContent>
        </Tabs>
      </div>
    </ContributorLayout>
  );
};

export default CreatorEarnings;