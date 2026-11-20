import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Banknote } from "lucide-react";

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
  const { user } = useAuth();
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "business.neurovane@gmail.com";

  useEffect(() => {
    const fetchData = async () => {
      if (user?.email !== ADMIN_EMAIL) {
        setLoading(false);
        return;
      }

      // 1. Fetch Pending Purchases
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

        const enriched = purchases.map((p: any) => ({
          ...p,
          material: matMap.get(p.material_id) || null,
        }));

        setPendingPurchases(enriched);
      }

      // 2. Fetch Pending Withdrawals
      const { data: withdrawals } = await (supabase as any)
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (withdrawals) setPendingWithdrawals(withdrawals);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleApprovePurchase = async (purchase: any) => {
    try {
      // 1. Mark purchase as approved
      const { error: updateError } = await (supabase as any)
        .from("purchases")
        .update({ status: "approved" })
        .eq("id", purchase.id);

      if (updateError) throw updateError;

      const itemPrice = purchase.material?.price ?? purchase.amount ?? 0;
      const creatorId = purchase.material?.user_id;
      const itemTitle = purchase.material?.title || "Study Material";

      // 2. Notify the BUYER (Learning Portal)
      if (purchase.user_id) {
        await (supabase as any).from("notifications").insert({
          user_id: purchase.user_id,
          title: "✅ Payment Approved!",
          message: `Your payment for "${itemTitle}" was verified. Click here to download your material.`,
          portal: "learning",
          link: `/app/materials/${purchase.material_id}`,
        });
      }

      // 3. Calculate 80% Creator Cut + Notify CREATOR (Contributor Portal)
      if (creatorId && itemPrice > 0) {
        const creatorCut = Math.round(itemPrice * 0.8);

        const { error: balanceError } = await (supabase as any)
          .from("withdrawals")
          .insert({
            user_id: creatorId,
            amount: creatorCut,
            status: "available",
            payment_method: "wallet",
            account_number: "system_escrow",
          });

        if (balanceError) console.error("Balance error:", balanceError);

        const { error: notifError } = await (supabase as any)
          .from("notifications")
          .insert({
            user_id: creatorId,
            title: "🎉 Material Sold!",
            message: `Someone bought "${itemTitle}" for ৳${itemPrice}! ৳${creatorCut} (80% cut) has been added to your balance.`,
            portal: "contributor",
            link: `/app/materials/${purchase.material_id}`,
          });

        if (notifError) console.error("Notification error:", notifError);
      }

      setPendingPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
      alert("Payment Approved! Both buyer and creator have been notified.");
    } catch (error) {
      console.error("Error approving purchase:", error);
      alert("Something went wrong. Check the console.");
    }
  };

  const handleReject = async (purchase: any) => {
    if (!confirm("Are you sure you want to reject and delete this request?")) return;

    const itemTitle = purchase.material?.title || "Study Material";

    // Notify buyer before deleting so they know why it reset
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

    if (!error) {
      setPendingPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
    }
  };

  const handleApproveWithdrawal = async (withdrawal: any) => {
    if (!confirm("Did you send the money via bKash/Nagad/Rocket? Click OK to mark as Paid.")) return;

    const { error } = await (supabase as any)
      .from("withdrawals")
      .update({ status: "approved" })
      .eq("id", withdrawal.id);

    if (!error) {
      if (withdrawal.user_id) {
        await (supabase as any).from("notifications").insert({
          user_id: withdrawal.user_id,
          title: "💸 Payout Sent!",
          message: `Your withdrawal of ৳${withdrawal.amount} to ${withdrawal.payment_method?.toUpperCase()} (${withdrawal.account_number}) has been paid.`,
          portal: "contributor",
        });
      }

      setPendingWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id));
      alert("Withdrawal marked as paid and creator notified!");
    }
  };

  if (loading) return <div className="min-h-screen bg-background pt-24 text-center">Loading...</div>;

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto pt-24 px-4 pb-12 space-y-12">
        {/* SECTION 1: PURCHASES */}
        <section>
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard: Pending Payments</h1>

          {pendingPurchases.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
              No pending student payments to review.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPurchases.map((purchase) => {
                const methodKey = (purchase.payment_method || "bkash").toLowerCase();
                const badge = PROVIDER_BADGES[methodKey] || {
                  label: purchase.payment_method || "Mobile Banking",
                  classes: "bg-white/10 text-gray-300 border-white/20",
                };

                return (
                  <div
                    key={purchase.id}
                    className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
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
                      <p className="text-sm text-neon-teal font-semibold">
                        Price: ৳{purchase.material?.price ?? purchase.amount ?? 0}
                      </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                      <Button
                        onClick={() => handleApprovePurchase(purchase)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(purchase)}
                        variant="destructive"
                        className="flex-1 md:flex-none"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: WITHDRAWALS */}
        <section>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Banknote className="text-neon-teal" /> Creator Payout Requests
          </h1>

          {pendingWithdrawals.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
              No pending withdrawals.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Method:{" "}
                      <span className="uppercase font-bold text-foreground">
                        {withdrawal.payment_method}
                      </span>
                    </p>
                    <p className="font-mono text-xl font-bold text-neon-teal">
                      {withdrawal.account_number}
                    </p>
                    <p className="text-sm mt-2">
                      Amount to pay:{" "}
                      <span className="font-bold text-neon-magenta">৳{withdrawal.amount}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApproveWithdrawal(withdrawal)}
                    className="bg-neon-teal hover:bg-neon-teal/90 text-black font-bold"
                  >
                    Mark as Paid
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}