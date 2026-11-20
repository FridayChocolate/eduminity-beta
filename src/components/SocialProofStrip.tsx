import { useEffect, useState } from "react";
import { FileText, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  index: number;
  isLive?: boolean;
}

const StatCard = ({ icon: Icon, value, label, color, index, isLive }: StatCardProps) => {
  return (
    <div
      className="group bg-card/50 dark:bg-card/80 backdrop-blur-sm rounded-xl p-3 md:p-5 text-center border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-teal/20 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Icon
        className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 ${color} transition-transform duration-300 group-hover:scale-110`}
      />
      <div className={`text-xl md:text-3xl font-bold ${color} tabular-nums flex items-center justify-center gap-2`}>
        {isLive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
        <span>{value}</span>
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
};

export const SocialProofStrip = () => {
  const [notesCount, setNotesCount] = useState<number>(0);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLiveStats = async () => {
      try {
        // 1. Live count of uploaded study materials
        const { count: matCount } = await (supabase as any)
          .from("materials")
          .select("*", { count: "exact", head: true });

        // 2. Live sum of contributor earnings (80% shares credited)
        const { data: earningsData } = await (supabase as any)
          .from("withdrawals")
          .select("amount")
          .eq("status", "available");

        if (cancelled) return;

        setNotesCount(matCount || 0);
        const earnedSum = (earningsData || []).reduce(
          (sum: number, row: any) => sum + Number(row.amount || 0),
          0
        );
        setTotalEarned(earnedSum);
      } catch (err) {
        console.error("Failed to fetch live stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLiveStats();

    // 3. Real-time Online Students via Supabase Presence
    const sessionKey = `visitor-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel("eduminity-online-students", {
      config: {
        presence: {
          key: sessionKey,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).length;
        setOnlineCount(Math.max(1, activeUsers));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = [
    {
      icon: FileText,
      value: loading ? "..." : notesCount.toLocaleString(),
      label: "Notes Shared",
      color: "text-neon-teal",
      isLive: false,
    },
    {
      icon: Users,
      value: onlineCount.toLocaleString(),
      label: "Students Online",
      color: "text-neon-violet",
      isLive: true,
    },
    {
      icon: Wallet,
      value: loading ? "..." : `৳${totalEarned.toLocaleString()}`,
      label: "Earned by Contributors",
      color: "text-neon-magenta",
      isLive: false,
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          color={stat.color}
          index={index}
          isLive={stat.isLive}
        />
      ))}
    </section>
  );
};