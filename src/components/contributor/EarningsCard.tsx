import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EarningData {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export const EarningsOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    today: 0,
    week: 0,
    month: 0,
    lifetime: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const fetchEarnings = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("withdrawals")
          .select("amount, created_at")
          .eq("user_id", user.id)
          .eq("status", "available");

        if (error) throw error;
        if (cancelled) return;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let today = 0;
        let week = 0;
        let month = 0;
        let lifetime = 0;

        for (const row of data || []) {
          const amt = Number(row.amount || 0);
          const ts = new Date(row.created_at).getTime();

          lifetime += amt;
          if (ts >= startOfToday) today += amt;
          if (ts >= sevenDaysAgo) week += amt;
          if (ts >= startOfMonth) month += amt;
        }

        setTotals({ today, week, month, lifetime });
      } catch (err: any) {
        console.error("Failed to load earnings overview:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEarnings();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const earningsData: EarningData[] = [
    {
      label: "Today",
      value: totals.today,
      icon: Wallet,
      color: "text-creator-cyan",
      bgColor: "bg-creator-cyan/20",
    },
    {
      label: "This Week",
      value: totals.week,
      icon: TrendingUp,
      color: "text-creator-primary",
      bgColor: "bg-creator-primary/20",
    },
    {
      label: "This Month",
      value: totals.month,
      icon: Calendar,
      color: "text-creator-violet",
      bgColor: "bg-creator-violet/20",
    },
    {
      label: "Lifetime",
      value: totals.lifetime,
      icon: Crown,
      color: "text-amber-400",
      bgColor: "bg-amber-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {earningsData.map((data, index) => (
        <Card
          key={data.label}
          className="creator-card hover:-translate-y-1 transition-all duration-300 group cursor-default"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-11 h-11 rounded-xl ${data.bgColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
              >
                <data.icon className={`h-5 w-5 ${data.color}`} />
              </div>
            </div>
            <div className={`text-2xl md:text-3xl font-bold ${data.color} tabular-nums`}>
              {loading ? "..." : `৳${data.value.toLocaleString()}`}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{data.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};