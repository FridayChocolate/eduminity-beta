import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, openContributorOnboarding } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Download,
  Clock,
  CheckCircle2,
  Upload,
  Wallet,
  Banknote,
  ShieldCheck,
  BadgeCheck,
  AlertCircle,
  ArrowUpRight,
  Star,
  Zap,
  Loader2,
  ExternalLink,
  FileText,
  Lock,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { computeProfileGamification } from "@/lib/gamification";
import { ROUTES } from "@/lib/routes";

export default function Dashboard() {
  const {
    user,
    activeMode,
    canAccessCreator,
    hasCompletedCreatorProfile,
    refreshUser,
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isInitiatedCreator = Boolean(canAccessCreator && hasCompletedCreatorProfile);

  const [viewMode, setViewMode] = useState<"student" | "contributor">(
    activeMode === "contributor" ? "contributor" : "student"
  );

  // Sync with top navbar mode toggle without forcing route changes
  useEffect(() => {
    setViewMode(activeMode === "contributor" ? "contributor" : "student");
  }, [activeMode]);

  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Student Workspace Data
  const [unlockedItems, setUnlockedItems] = useState<any[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [reviewsWrittenCount, setReviewsWrittenCount] = useState(0);

  // Creator Workspace Data
  const [publishedNotes, setPublishedNotes] = useState<any[]>([]);
  const [salesRows, setSalesRows] = useState<any[]>([]);
  const [withdrawalRows, setWithdrawalRows] = useState<any[]>([]);
  const [profileRecord, setProfileRecord] = useState<any | null>(null);
  const [averageRating, setAverageRating] = useState(5.0);
  const [noteStatsMap, setNoteStatsMap] = useState<
    Record<string, { sales: number; earned: number; rating: string | null }>
  >({});

  // Payout Drawer State
  const [showPayoutDrawer, setShowPayoutDrawer] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPayoutAccount(user.user_metadata?.payout_number || "");

    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [
          myPurchasesRes,
          myUploadsRes,
          myWithdrawalsRes,
          myReviewsRes,
          profileRes,
        ] = await Promise.all([
          (supabase as any)
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("materials")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("withdrawals")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("material_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        const purchases = myPurchasesRes.data || [];
        const uploads = myUploadsRes.data || [];
        const withdrawals = myWithdrawalsRes.data || [];

        // Fetch material details for all student purchases
        const purchasedMatIds = [
          ...new Set(purchases.map((p: any) => p.material_id).filter(Boolean)),
        ] as string[];

        const purchasedMatMap = new Map<string, any>();
        if (purchasedMatIds.length > 0) {
          const { data: pMats } = await (supabase as any)
            .from("materials")
            .select("id, title, category, class_level, price, file_path, page_count")
            .in("id", purchasedMatIds);

          for (const m of pMats || []) {
            purchasedMatMap.set(m.id, m);
          }
        }

        const approvedList: any[] = [];
        const pendingList: any[] = [];

        for (const p of purchases) {
          const status = String(p.status || "").toLowerCase();
          const enriched = {
            ...p,
            material: purchasedMatMap.get(p.material_id) || null,
          };
          if (status === "approved") {
            approvedList.push(enriched);
          } else if (status === "pending") {
            pendingList.push(enriched);
          }
        }

        // Fetch sales & ratings for Creator's uploaded notes
        const uploadIds = uploads.map((u: any) => u.id);
        let creatorSales: any[] = [];
        let creatorReviews: any[] = [];

        if (uploadIds.length > 0) {
          const [salesRes, revRes] = await Promise.all([
            (supabase as any)
              .from("purchases")
              .select("*")
              .in("material_id", uploadIds)
              .order("created_at", { ascending: false }),
            (supabase as any)
              .from("material_reviews")
              .select("material_id, rating")
              .in("material_id", uploadIds),
          ]);
          creatorSales = salesRes.data || [];
          creatorReviews = revRes.data || [];
        }

        // Per-note stats
        const perNote: Record<
          string,
          { sales: number; earned: number; rating: string | null }
        > = {};

        for (const u of uploads) {
          const approvedForNote = creatorSales.filter(
            (s) =>
              s.material_id === u.id &&
              String(s.status || "").toLowerCase() === "approved"
          );
          const revsForNote = creatorReviews.filter((r) => r.material_id === u.id);
          const avgNoteRating =
            revsForNote.length > 0
              ? (
                  revsForNote.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                  revsForNote.length
                ).toFixed(1)
              : null;

          const totalEarned = approvedForNote.reduce((sum, s) => {
            const gross = Number(s.amount ?? u.price ?? 0);
            return sum + Math.round(gross * 0.8);
          }, 0);

          perNote[u.id] = {
            sales: approvedForNote.length,
            earned: totalEarned,
            rating: avgNoteRating,
          };
        }

        const overallAvg =
          creatorReviews.length > 0
            ? creatorReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
              creatorReviews.length
            : 5.0;

        if (cancelled) return;
        setUnlockedItems(approvedList);
        setPendingPurchases(pendingList);
        setReviewsWrittenCount(myReviewsRes.count || 0);
        setPublishedNotes(uploads);
        setSalesRows(creatorSales);
        setWithdrawalRows(withdrawals);
        setProfileRecord(profileRes.data || null);
        setNoteStatsMap(perNote);
        setAverageRating(overallAvg);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const gamification = computeProfileGamification({
    meta: user?.user_metadata || {},
    email: user?.email,
    publishedMaterials: publishedNotes,
    salesRows,
    unlockedPurchases: unlockedItems,
    reviewsWrittenCount,
    averageRating,
  });

  // Wallet & Payout Calculations
  const escrowCredits = withdrawalRows
    .filter((w) => w.payment_method === "wallet" && w.status === "available")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const lifetimeNetEarnings = Math.max(
    gamification.totalCreatorEarnings,
    escrowCredits
  );

  const payoutRequests = withdrawalRows.filter((w) => w.payment_method !== "wallet");

  const pendingPayoutAmount = payoutRequests
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const paidPayoutAmount = payoutRequests
    .filter((w) => w.status === "approved")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const availableWithdrawBalance = Math.max(
    0,
    lifetimeNetEarnings - pendingPayoutAmount - paidPayoutAmount
  );

  // Instant 1-Click PDF Download from Student Library
  const handleDirectDownload = async (purchaseItem: any) => {
    const mat = purchaseItem.material;
    if (!mat?.file_path) {
      navigate(ROUTES.materialDetail(purchaseItem.material_id));
      return;
    }

    setDownloadingId(purchaseItem.id);
    try {
      const { data, error } = await supabase.storage
        .from("study_materials")
        .createSignedUrl(mat.file_path, 60);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast({
        title: "Download error",
        description: err.message || "Opening material page instead.",
        variant: "destructive",
      });
      navigate(ROUTES.materialDetail(purchaseItem.material_id));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanAccount = payoutAccount.trim();
    const numericAmount = Math.floor(Number(payoutAmount));

    if (!cleanAccount || cleanAccount.length < 11) {
      toast({
        title: "Invalid phone number",
        description: "Enter a valid 11-digit bKash, Nagad, or Rocket number.",
        variant: "destructive",
      });
      return;
    }

    if (!numericAmount || numericAmount < 50) {
      toast({
        title: "Minimum withdrawal is ৳50",
        description: "Enter an amount of at least ৳50.",
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > availableWithdrawBalance) {
      toast({
        title: "Insufficient available balance",
        description: `You can withdraw up to ৳${availableWithdrawBalance}.`,
        variant: "destructive",
      });
      return;
    }

    setSubmittingPayout(true);
    try {
      const { data: insertedRow, error } = await (supabase as any)
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: numericAmount,
          status: "pending",
          payment_method: payoutMethod,
          account_number: cleanAccount,
        })
        .select("*")
        .single();

      if (error) throw error;

      if (!user.user_metadata?.payout_number) {
        await supabase.auth.updateUser({
          data: { ...user.user_metadata, payout_number: cleanAccount },
        });
        await refreshUser();
      }

      setWithdrawalRows((prev) => [insertedRow, ...prev]);
      setShowPayoutDrawer(false);
      setPayoutAmount("");

      toast({
        title: "Payout Request Submitted!",
        description: `৳${numericAmount} via ${payoutMethod.toUpperCase()} sent to Admin Payout Queue.`,
      });
    } catch (err: any) {
      toast({
        title: "Payout request failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const isCreatorSlide = viewMode === "contributor";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Eduminity Member";

  const verificationStatus =
    profileRecord?.verification_status ||
    (user?.user_metadata?.student_id_card_url ||
    user?.user_metadata?.academic_proof_url
      ? "pending"
      : "unsubmitted");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Command Header + Interchangeable Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={
                  isCreatorSlide
                    ? "border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs"
                    : "border-teal-500/40 text-teal-400 bg-teal-500/10 text-xs"
                }
              >
                <Zap className="h-3 w-3 mr-1" />
                Lv.{gamification.levelInfo.level} • {gamification.levelInfo.xp} XP
              </Badge>
              <button
                type="button"
                onClick={() => navigate(ROUTES.PROFILE)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Customize Profile &amp; Badges →
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {displayName}
            </h1>
          </div>

          {/* Interchangeable Learning <-> Creator Pill Switch */}
          <div className="relative inline-flex self-start md:self-auto rounded-2xl bg-muted/70 p-1 border border-border/80 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("student")}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                !isCreatorSlide
                  ? "text-slate-950"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {!isCreatorSlide && (
                <motion.div
                  layoutId="unifiedDashboardModePill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-300 shadow-md -z-10"
                />
              )}
              <GraduationCap className="h-4 w-4" />
              Learning Library
            </button>

            <button
              type="button"
              onClick={() => setViewMode("contributor")}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
                isCreatorSlide
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isCreatorSlide && (
                <motion.div
                  layoutId="unifiedDashboardModePill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-md -z-10"
                />
              )}
              <Sparkles className="h-4 w-4" />
              Creator Studio
              {!isInitiatedCreator && (
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-white/15 text-purple-200">
                  80% Cut
                </span>
              )}
            </button>
          </div>
        </div>

        {/* BODY TRANSITION */}
        <AnimatePresence mode="wait">
          {!isCreatorSlide ? (
            /* ============================================================= */
            /* MODE 1: STUDENT LEARNING WORKSPACE                            */
            /* ============================================================= */
            <motion.div
              key="student-dashboard-mode"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Quick Action & KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Unlocked Notes</p>
                      <p className="text-2xl font-bold text-teal-400 mt-0.5">
                        {loading ? "..." : unlockedItems.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-teal-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pending Verifications</p>
                      <p className="text-2xl font-bold text-amber-400 mt-0.5">
                        {loading ? "..." : pendingPurchases.length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate(ROUTES.MATERIALS)}
                  className="bg-gradient-to-r from-teal-500/15 to-indigo-500/15 border-teal-500/35 hover:border-teal-400 cursor-pointer transition-all"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-teal-300">Study Hub</p>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        Browse New Notes
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-teal-400" />
                  </CardContent>
                </Card>
              </div>

              {/* Pending Payment Verification Tracker */}
              {pendingPurchases.length > 0 && (
                <Card className="border-amber-500/35 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-300">
                      <Clock className="h-4 w-4" />
                      Payments Awaiting Admin Verification ({pendingPurchases.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Once verified by an admin, your PDF download unlocks automatically below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {pendingPurchases.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-background/70 border border-amber-500/20 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {item.material?.title || "Study Material"}
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            Method:{" "}
                            <span className="uppercase font-medium">
                              {item.payment_method}
                            </span>{" "}
                            • TrxID:{" "}
                            <span className="font-mono text-amber-300">
                              {item.trx_id || "Pending"}
                            </span>
                          </p>
                        </div>
                        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 self-start sm:self-center">
                          Pending Check • ৳{item.amount ?? item.material?.price ?? 0}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Unlocked Library with 1-Click PDF Downloads */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-400" />
                      My Unlocked Study Library
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Instant 1-click access to every note and past paper you have unlocked
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(ROUTES.MATERIALS)}
                    className="text-xs"
                  >
                    Explore More
                  </Button>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                    </div>
                  ) : unlockedItems.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-3">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto opacity-60" />
                      <p className="text-sm font-medium text-foreground">
                        Your library is empty
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Unlock verified lecture notes and solved past papers from top campus creators in the Study Hub.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate(ROUTES.MATERIALS)}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                      >
                        Browse Study Hub
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unlockedItems.map((item) => {
                        const mat = item.material;
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:border-teal-500/40 transition-all flex flex-col justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge variant="secondary" className="text-[11px]">
                                  {mat?.category || "Study Material"}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  Unlocked{" "}
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="font-bold text-base text-foreground line-clamp-2">
                                {mat?.title || "Unlocked Study Material"}
                              </h3>
                              {mat?.page_count && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {mat.page_count} Pages • PDF Document
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                              <Button
                                size="sm"
                                disabled={downloadingId === item.id}
                                onClick={() => handleDirectDownload(item)}
                                className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                              >
                                {downloadingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download PDF
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  navigate(ROUTES.materialDetail(item.material_id))
                                }
                                className="text-xs"
                              >
                                Details &amp; Rate
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : !isInitiatedCreator ? (
            /* ============================================================= */
            /* MODE 2A: MANDATORY CREATOR ONBOARDING GATE                    */
            /* ============================================================= */
            <motion.div
              key="creator-mandatory-gate"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-purple-500/45 bg-gradient-to-br from-purple-950/40 via-card to-teal-950/25 shadow-2xl">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="max-w-2xl space-y-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/35 text-xs">
                      <Lock className="h-3 w-3 mr-1.5" />
                      Mandatory Creator Onboarding Required
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      Complete 2 Mandatory Steps to Unlock Creator Studio
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To keep Eduminity trustworthy for buyers, every creator must complete their academic identity and attach verification credentials before publishing notes or withdrawing{" "}
                      <span className="text-emerald-400 font-semibold">
                        80% royalties
                      </span>
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-background/60 border border-purple-500/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                        <UserCheck className="h-4 w-4" />
                        Step 1: Academic Identity &amp; Payout Account
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Verify your University/Institution, Student ID number, core subjects, and bKash/Nagad payout number.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/60 border border-teal-500/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
                        <ShieldCheck className="h-4 w-4" />
                        Step 2: Proof Vault Credentials
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload your University ID Card or Academic Merit/Grade proof so students can verify your standing before buying.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={() => openContributorOnboarding()}
                      className="bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-95 text-white font-bold shadow-lg"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Complete Mandatory Setup Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setViewMode("student")}
                      className="text-xs text-muted-foreground"
                    >
                      Stay in Learning Library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* ============================================================= */
            /* MODE 2B: ACTIVE CREATOR STUDIO WORKSPACE                      */
            /* ============================================================= */
            <motion.div
              key="creator-dashboard-mode"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Credential Verification Status Strip */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  verificationStatus === "verified"
                    ? "bg-teal-500/10 border-teal-500/35"
                    : verificationStatus === "pending"
                    ? "bg-amber-500/10 border-amber-500/35"
                    : "bg-rose-500/10 border-rose-500/35"
                }`}
              >
                <div className="flex items-center gap-3">
                  {verificationStatus === "verified" ? (
                    <BadgeCheck className="h-5 w-5 text-teal-400 shrink-0" />
                  ) : verificationStatus === "pending" ? (
                    <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-bold">
                      {verificationStatus === "verified"
                        ? "Verified Creator Credentials Active"
                        : verificationStatus === "pending"
                        ? "Creator Documents Under Admin Review"
                        : "Mandatory Proof Vault Incomplete"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {verificationStatus === "verified"
                        ? "Your Verified badge is live across the Study Hub and your Public Showcase."
                        : verificationStatus === "pending"
                        ? "Your University ID / Merit proof is in the Admin queue."
                        : "Upload your University ID Card or Merit Sheet in your Profile to earn +100 XP and your Verified badge."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {verificationStatus !== "verified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(ROUTES.PROFILE)}
                      className="text-xs"
                    >
                      Manage Proofs
                    </Button>
                  )}
                  {user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(ROUTES.creatorShowcase(user.id))}
                      className="text-xs border-teal-500/35 text-teal-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Showcase
                    </Button>
                  )}
                </div>
              </div>

              {/* Creator Earnings & Instant Withdrawal Card */}
              <Card className="bg-card border-emerald-500/30">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-400" />
                      80% Royalty Wallet &amp; Payouts
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Withdraw your verified note sales directly to bKash, Nagad, or Rocket
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPayoutAmount(
                          availableWithdrawBalance > 0
                            ? String(availableWithdrawBalance)
                            : ""
                        );
                        setShowPayoutDrawer((prev) => !prev);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      <Wallet className="h-3.5 w-3.5 mr-1.5" />
                      {showPayoutDrawer ? "Close Form" : "Withdraw Funds"}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(ROUTES.UPLOAD_NOTES)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload Note
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">
                        Available Balance
                      </p>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                        {loading ? "..." : `৳${availableWithdrawBalance.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <p className="text-[11px] uppercase tracking-wider text-amber-300/80 font-semibold">
                        Pending Payout
                      </p>
                      <p className="text-2xl font-extrabold text-amber-400 mt-1">
                        {loading ? "..." : `৳${pendingPayoutAmount.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Lifetime 80% Earnings
                      </p>
                      <p className="text-2xl font-extrabold text-foreground mt-1">
                        {loading ? "..." : `৳${lifetimeNetEarnings.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  {showPayoutDrawer && (
                    <form
                      onSubmit={handleRequestPayout}
                      className="p-4 rounded-2xl bg-muted/35 border border-emerald-500/30 space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Method</Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["bkash", "nagad", "rocket"] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPayoutMethod(method)}
                                className={`py-2 rounded-lg text-xs font-bold uppercase border transition-colors ${
                                  payoutMethod === method
                                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="dashPayoutAcc" className="text-xs">
                            {payoutMethod.toUpperCase()} Number
                          </Label>
                          <Input
                            id="dashPayoutAcc"
                            placeholder="01XXXXXXXXX"
                            value={payoutAccount}
                            onChange={(e) => setPayoutAccount(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="dashPayoutAmt" className="text-xs">
                            Amount (Max ৳{availableWithdrawBalance})
                          </Label>
                          <Input
                            id="dashPayoutAmt"
                            type="number"
                            min={50}
                            max={Math.max(50, availableWithdrawBalance)}
                            placeholder="e.g. 200"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPayoutDrawer(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingPayout || availableWithdrawBalance < 50}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                        >
                          {submittingPayout ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Submit Payout Request"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* My Published Notes Manager */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-400" />
                      My Published Notes ({publishedNotes.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live sales performance and ratings across your study materials
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate(ROUTES.UPLOAD_NOTES)}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                  >
                    + New Note
                  </Button>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    </div>
                  ) : publishedNotes.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-3">
                      <Upload className="h-8 w-8 text-purple-400 mx-auto opacity-70" />
                      <p className="text-sm font-medium text-foreground">
                        No notes published yet
                      </p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Upload your first semester guide or solved past paper to earn +120 XP and start generating 80% royalties.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate(ROUTES.UPLOAD_NOTES)}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                      >
                        Upload Your First Note
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {publishedNotes.map((note) => {
                        const stats = noteStatsMap[note.id] || {
                          sales: 0,
                          earned: 0,
                          rating: null,
                        };

                        return (
                          <div
                            key={note.id}
                            onClick={() => navigate(ROUTES.materialDetail(note.id))}
                            className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/55 border border-border/60 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px]">
                                  {note.category}
                                </Badge>
                                <span className="text-xs font-bold text-teal-400">
                                  {Number(note.price) === 0 ? "Free" : `৳${note.price}`}
                                </span>
                                {stats.rating && (
                                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold">
                                    <Star className="h-3 w-3 fill-amber-400" />
                                    {stats.rating}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                                {note.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {stats.sales} {stats.sales === 1 ? "sale" : "sales"}
                                </p>
                                <p className="text-sm font-bold text-emerald-400">
                                  ৳{stats.earned.toLocaleString()} earned
                                </p>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}