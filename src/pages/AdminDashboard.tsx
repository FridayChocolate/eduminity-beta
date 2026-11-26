import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isAdminEmail } from "@/lib/gamification";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Banknote,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  GraduationCap,
  BadgeCheck,
  Clock,
  CreditCard,
  Loader2,
  UserCheck,
} from "lucide-react";

const PROVIDER_BADGES: Record<string, { label: string; classes: string }> = {
  bkash: {
    label: "bKash",
    classes: "bg-[#E2136E]/15 text-[#ff4d94] border-[#E2136E]/40",
  },
  nagad: {
    label: "Nagad",
    classes: "bg-[#F6921E]/15 text-[#ffae42] border-[#F6921E]/40",
  },
  rocket: {
    label: "Rocket",
    classes: "bg-[#8C3494]/20 text-[#d075d9] border-[#8C3494]/50",
  },
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("payments");
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [creatorProfiles, setCreatorProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = isAdminEmail(user?.email);

  const fetchData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch all profiles so we can enrich withdrawals AND populate the Verification Queue
      const { data: allProfiles } = await (supabase as any)
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      const profileMap = new Map<string, any>(
        (allProfiles || []).map((p: any) => [p.id, p])
      );

      // Filter profiles that have submitted ID or Merit proofs
      const withProofs = (allProfiles || []).filter(
        (p: any) =>
          Boolean(p.student_id_card_url) ||
          Boolean(p.academic_proof_url) ||
          Boolean(p.has_id_proof) ||
          Boolean(p.has_merit_proof)
      );
      setCreatorProfiles(withProofs);

      // 2. Fetch Pending Purchases
      const { data: purchases, error: purchaseError } = await (supabase as any)
        .from("purchases")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (purchaseError) {
        console.error("Error fetching purchases:", purchaseError);
      } else if (purchases && purchases.length > 0) {
        const materialIds = purchases.map((p: any) => p.material_id).filter(Boolean);
        const { data: mats } = await (supabase as any)
          .from("materials")
          .select("id, title, price, user_id")
          .in("id", materialIds);

        const matMap = new Map((mats || []).map((m: any) => [m.id, m]));

        const enrichedPurchases = purchases.map((p: any) => ({
          ...p,
          material: matMap.get(p.material_id) || null,
          buyer: profileMap.get(p.user_id) || null,
        }));

        setPendingPurchases(enrichedPurchases);
      } else {
        setPendingPurchases([]);
      }

      // 3. Fetch Pending Withdrawals enriched with Creator info
      const { data: withdrawals } = await (supabase as any)
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const enrichedWithdrawals = (withdrawals || []).map((w: any) => ({
        ...w,
        creator: profileMap.get(w.user_id) || null,
      }));
      setPendingWithdrawals(enrichedWithdrawals);
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  // =========================================================================
  // HANDLER 1: APPROVE / REJECT STUDENT PAYMENT
  // =========================================================================
  const handleApprovePurchase = async (purchase: any) => {
    setProcessingId(purchase.id);
    try {
      const { error: updateError } = await (supabase as any)
        .from("purchases")
        .update({ status: "approved" })
        .eq("id", purchase.id);

      if (updateError) throw updateError;

      const itemPrice = purchase.material?.price ?? purchase.amount ?? 0;
      const creatorId = purchase.material?.user_id;
      const itemTitle = purchase.material?.title || "Study Material";

      // Notify BUYER (Learning Portal)
      if (purchase.user_id) {
        await (supabase as any).from("notifications").insert({
          user_id: purchase.user_id,
          title: "✅ Payment Approved!",
          message: `Your payment for "${itemTitle}" was verified. Click here to download your material.`,
          portal: "learning",
          link: `/app/materials/${purchase.material_id}`,
        });
      }

      // Credit 80% Creator Cut + Notify CREATOR (Contributor Portal)
      if (creatorId && itemPrice > 0) {
        const creatorCut = Math.round(itemPrice * 0.8);

        await (supabase as any).from("withdrawals").insert({
          user_id: creatorId,
          amount: creatorCut,
          status: "available",
          payment_method: "wallet",
          account_number: "system_escrow",
        });

        await (supabase as any).from("notifications").insert({
          user_id: creatorId,
          title: "🎉 Material Sold!",
          message: `Someone bought "${itemTitle}" for ৳${itemPrice}! ৳${creatorCut} (80% cut) has been added to your balance.`,
          portal: "contributor",
          link: `/app/materials/${purchase.material_id}`,
        });
      }

      setPendingPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
      toast({
        title: "Payment Approved!",
        description: "Buyer unlocked and creator credited 80%.",
      });
    } catch (error: any) {
      console.error("Error approving purchase:", error);
      toast({
        title: "Approval failed",
        description: error.message || "Check console for details.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPurchase = async (purchase: any) => {
    if (!confirm("Are you sure you want to reject and delete this payment request?")) return;

    setProcessingId(purchase.id);
    try {
      const itemTitle = purchase.material?.title || "Study Material";

      if (purchase.user_id) {
        await (supabase as any).from("notifications").insert({
          user_id: purchase.user_id,
          title: "❌ Payment Rejected",
          message: `Your payment (TrxID: ${purchase.trx_id || "N/A"}) for "${itemTitle}" could not be verified. Please double-check and try again.`,
          portal: "learning",
          link: `/app/materials/${purchase.material_id}`,
        });
      }

      const { error } = await (supabase as any)
        .from("purchases")
        .delete()
        .eq("id", purchase.id);

      if (error) throw error;

      setPendingPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
      toast({ title: "Payment rejected and buyer notified." });
    } catch (err: any) {
      toast({
        title: "Reject failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================================
  // HANDLER 2: APPROVE / REJECT CREATOR CREDENTIAL PROOFS
  // =========================================================================
  const handleVerifyCreator = async (profile: any) => {
    setProcessingId(profile.id);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          verification_status: "verified",
          has_id_proof: Boolean(profile.student_id_card_url || profile.has_id_proof),
          has_merit_proof: Boolean(profile.academic_proof_url || profile.has_merit_proof),
        })
        .eq("id", profile.id);

      if (error) throw error;

      await (supabase as any).from("notifications").insert({
        user_id: profile.id,
        title: "✅ Creator Credentials Verified!",
        message:
          "Your University ID / Academic Merit documents have been verified by Eduminity Admin. Your Verified Credentials badge is now live!",
        portal: "contributor",
        link: `/creator/${profile.id}`,
      });

      setCreatorProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, verification_status: "verified" } : p
        )
      );

      toast({
        title: "Creator Verified!",
        description: `${profile.full_name || "Creator"} now displays the Verified Credentials badge.`,
      });
    } catch (err: any) {
      toast({
        title: "Verification update failed",
        description: err.message || "Make sure you ran the Step 1 SQL in Supabase.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectCreatorProof = async (profile: any) => {
    if (
      !confirm(
        `Mark ${profile.full_name || "this creator"}'s documents as rejected and ask them to re-upload?`
      )
    )
      return;

    setProcessingId(profile.id);
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          verification_status: "rejected",
          has_id_proof: false,
          has_merit_proof: false,
        })
        .eq("id", profile.id);

      if (error) throw error;

      await (supabase as any).from("notifications").insert({
        user_id: profile.id,
        title: "⚠️ Verification Document Update Needed",
        message:
          "Admin could not verify your uploaded University ID or Merit document. Please upload a clearer photo/PDF in your Creator Profile.",
        portal: "contributor",
        link: "/app/profile",
      });

      setCreatorProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id
            ? {
                ...p,
                verification_status: "rejected",
                has_id_proof: false,
                has_merit_proof: false,
              }
            : p
        )
      );

      toast({ title: "Proof rejected and creator notified." });
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================================
  // HANDLER 3: APPROVE CREATOR WITHDRAWAL PAYOUT
  // =========================================================================
  const handleApproveWithdrawal = async (withdrawal: any) => {
    if (
      !confirm(
        `Did you send ৳${withdrawal.amount} via ${withdrawal.payment_method?.toUpperCase()} to ${withdrawal.account_number}? Click OK to mark as Paid.`
      )
    )
      return;

    setProcessingId(withdrawal.id);
    try {
      const { error } = await (supabase as any)
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", withdrawal.id);

      if (error) throw error;

      if (withdrawal.user_id) {
        await (supabase as any).from("notifications").insert({
          user_id: withdrawal.user_id,
          title: "💸 Payout Sent!",
          message: `Your withdrawal of ৳${withdrawal.amount} to ${withdrawal.payment_method?.toUpperCase()} (${withdrawal.account_number}) has been paid.`,
          portal: "contributor",
        });
      }

      setPendingWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id));
      toast({
        title: "Payout Marked as Paid!",
        description: "Creator has been notified.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to update withdrawal",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-28 flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm">Loading Admin Command Center...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
      </div>
    );
  }

  const awaitingVerification = creatorProfiles.filter(
    (p) => p.verification_status !== "verified"
  );
  const verifiedCreators = creatorProfiles.filter(
    (p) => p.verification_status === "verified"
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto pt-24 px-4 pb-16 space-y-8">
        {/* Top Command Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs mb-2">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Eduminity Admin Command Center
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Payments, Creator Proofs &amp; Payouts
            </h1>
          </div>

          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh Queues
          </Button>
        </div>

        {/* 3-Tab Queue Switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="payments" className="gap-2 text-xs sm:text-sm">
              <CreditCard className="h-4 w-4 text-purple-400" />
              <span>Student Payments</span>
              {pendingPurchases.length > 0 && (
                <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0">
                  {pendingPurchases.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="verification" className="gap-2 text-xs sm:text-sm">
              <UserCheck className="h-4 w-4 text-teal-400" />
              <span>Creator Proofs</span>
              {awaitingVerification.length > 0 && (
                <Badge className="bg-teal-500 text-slate-950 font-bold text-[10px] px-1.5 py-0">
                  {awaitingVerification.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="payouts" className="gap-2 text-xs sm:text-sm">
              <Banknote className="h-4 w-4 text-emerald-400" />
              <span>Payouts</span>
              {pendingWithdrawals.length > 0 && (
                <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-1.5 py-0">
                  {pendingWithdrawals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* =============================================================== */}
          {/* TAB 1: STUDENT PAYMENTS                                         */}
          {/* =============================================================== */}
          <TabsContent value="payments" className="space-y-4">
            {pendingPurchases.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No pending student payments to review.
              </div>
            ) : (
              pendingPurchases.map((purchase) => {
                const methodKey = (purchase.payment_method || "bkash").toLowerCase();
                const badge = PROVIDER_BADGES[methodKey] || {
                  label: purchase.payment_method || "Mobile Banking",
                  classes: "bg-white/10 text-gray-300 border-white/20",
                };

                return (
                  <div
                    key={purchase.id}
                    className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs text-muted-foreground">TrxID / Ref</span>
                      </div>

                      <p className="font-mono text-xl font-bold text-neon-violet">
                        {purchase.trx_id || `BETA-${purchase.id.slice(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-sm mt-2">
                        Item:{" "}
                        <span className="font-semibold">
                          {purchase.material?.title || "Unknown Material"}
                        </span>
                      </p>
                      {purchase.buyer && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Buyer: {purchase.buyer.full_name || purchase.buyer.email}
                        </p>
                      )}
                      <p className="text-sm text-neon-teal font-semibold mt-1">
                        Price: ৳{purchase.material?.price ?? purchase.amount ?? 0}
                      </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                      <Button
                        disabled={processingId === purchase.id}
                        onClick={() => handleApprovePurchase(purchase)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        disabled={processingId === purchase.id}
                        onClick={() => handleRejectPurchase(purchase)}
                        variant="destructive"
                        className="flex-1 md:flex-none"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 2: CREATOR CREDENTIAL VERIFICATION QUEUE                    */}
          {/* =============================================================== */}
          <TabsContent value="verification" className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Awaiting Document Review ({awaitingVerification.length})
                </h2>
              </div>

              {awaitingVerification.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                  All submitted creator ID cards and merit sheets have been reviewed!
                </div>
              ) : (
                awaitingVerification.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-card border border-teal-500/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">
                            {creator.full_name || "Unnamed Creator"}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              creator.verification_status === "rejected"
                                ? "border-rose-500/40 text-rose-400 text-[11px]"
                                : "border-amber-500/40 text-amber-400 text-[11px]"
                            }
                          >
                            {creator.verification_status === "rejected"
                              ? "Previously Rejected"
                              : "Pending Review"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {creator.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-foreground/90">
                          {creator.institution && (
                            <span className="inline-flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-teal-400" />
                              {creator.institution}
                            </span>
                          )}
                          {creator.student_id && <span>• ID: {creator.student_id}</span>}
                          {creator.cgpa && <span>• CGPA: {creator.cgpa}</span>}
                          {creator.honors && (
                            <span className="text-purple-300">• {creator.honors}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/creator/${creator.id}`)}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Profile
                        </Button>
                        <Button
                          size="sm"
                          disabled={processingId === creator.id}
                          onClick={() => handleVerifyCreator(creator)}
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                        >
                          <BadgeCheck className="h-4 w-4 mr-1.5" />
                          Approve Verified Badge
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processingId === creator.id}
                          onClick={() => handleRejectCreatorProof(creator)}
                          className="text-xs"
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Uploaded Document Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
                      <div className="p-3 rounded-lg bg-muted/35 border border-border/50 flex items-center justify-between">
                        <span className="text-xs font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-purple-400" />
                          University ID Card
                        </span>
                        {creator.student_id_card_url ? (
                          <a
                            href={creator.student_id_card_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-teal-400 hover:underline inline-flex items-center gap-1"
                          >
                            Open Document <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not uploaded</span>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-muted/35 border border-border/50 flex items-center justify-between">
                        <span className="text-xs font-semibold flex items-center gap-1.5">
                          <FileCheck2 className="h-4 w-4 text-teal-400" />
                          Academic Merit / Grade Sheet
                        </span>
                        {creator.academic_proof_url ? (
                          <a
                            href={creator.academic_proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-teal-400 hover:underline inline-flex items-center gap-1"
                          >
                            Open Document <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Already Verified Creators Roster */}
            {verifiedCreators.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Creators ({verifiedCreators.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {verifiedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="p-4 rounded-xl bg-card border border-emerald-500/25 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {creator.full_name || creator.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {creator.institution || "Verified Student Creator"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/creator/${creator.id}`)}
                        className="text-xs text-teal-400 shrink-0"
                      >
                        Showcase →
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* =============================================================== */}
          {/* TAB 3: CREATOR PAYOUT REQUESTS                                  */}
          {/* =============================================================== */}
          <TabsContent value="payouts" className="space-y-4">
            {pendingWithdrawals.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No pending creator withdrawals.
              </div>
            ) : (
              pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 uppercase text-xs">
                        {withdrawal.payment_method}
                      </Badge>
                      {withdrawal.creator && (
                        <button
                          type="button"
                          onClick={() => navigate(`/creator/${withdrawal.user_id}`)}
                          className="text-xs text-teal-400 hover:underline font-medium"
                        >
                          {withdrawal.creator.full_name || withdrawal.creator.email} →
                        </button>
                      )}
                    </div>
                    <p className="font-mono text-xl font-bold text-neon-teal">
                      {withdrawal.account_number}
                    </p>
                    <p className="text-sm mt-2">
                      Amount to pay:{" "}
                      <span className="font-bold text-neon-magenta">
                        ৳{withdrawal.amount}
                      </span>
                    </p>
                  </div>
                  <Button
                    disabled={processingId === withdrawal.id}
                    onClick={() => handleApproveWithdrawal(withdrawal)}
                    className="bg-neon-teal hover:bg-neon-teal/90 text-black font-bold"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}