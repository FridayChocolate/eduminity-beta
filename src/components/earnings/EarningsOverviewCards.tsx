import { motion } from "framer-motion";
import { Wallet, TrendingUp, Clock, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";

interface EarningCardData {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
  colorClass: string;
  bgClass: string;
  prefix?: string;
  suffix?: string;
}

const earningsData: EarningCardData[] = [
  {
    label: "Total Earnings",
    value: 12450,
    icon: TrendingUp,
    description: "Lifetime earnings",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    suffix: " ৳",
  },
  {
    label: "Available Balance",
    value: 3250,
    icon: Wallet,
    description: "Ready to withdraw",
    colorClass: "text-creator-primary",
    bgClass: "bg-creator-primary/10",
    suffix: " ৳",
  },
  {
    label: "Pending Balance",
    value: 580,
    icon: Clock,
    description: "Processing (7-day hold)",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    suffix: " ৳",
  },
  {
    label: "Total Withdrawn",
    value: 8620,
    icon: ArrowDownRight,
    description: "Successfully paid out",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
    suffix: " ৳",
  },
];

function EarningCard({ data, index }: { data: EarningCardData; index: number }) {
  const { count, ref } = useCountUp({ end: data.value, duration: 1500, delay: index * 150 });
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="creator-card border-creator-border/30 hover:border-creator-border/60 transition-all duration-300 overflow-hidden group">
        <CardContent className="p-5" ref={ref}>
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${data.bgClass} transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`h-5 w-5 ${data.colorClass}`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{data.label}</p>
            <div className="flex items-baseline gap-1">
              <motion.span 
                className={`text-2xl md:text-3xl font-bold tracking-tight ${data.colorClass}`}
                key={count}
              >
                {data.prefix}
                {count.toLocaleString()}
                {data.suffix}
              </motion.span>
            </div>
            <p className="text-xs text-muted-foreground/70">{data.description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EarningsOverviewCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {earningsData.map((data, index) => (
        <EarningCard key={data.label} data={data} index={index} />
      ))}
    </div>
  );
}
