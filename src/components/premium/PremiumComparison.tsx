import { Check, X, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  free: string | boolean;
  pro: string | boolean;
  elite: string | boolean;
}

interface PremiumComparisonProps {
  rows: ComparisonRow[];
  userType: "student" | "contributor";
}

export const PremiumComparison = ({ rows, userType }: PremiumComparisonProps) => {
  const renderCell = (value: string | boolean, tier: "free" | "pro" | "elite") => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return (
      <span className={cn(
        "text-sm",
        tier === "elite" && "text-amber-400 font-medium",
        tier === "pro" && userType === "contributor" && "text-creator-primary font-medium",
        tier === "pro" && userType === "student" && "text-cyan-400 font-medium",
        tier === "free" && "text-muted-foreground"
      )}>
        {value}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-medium text-sm">Feature</th>
                <th className="text-center p-4 font-medium text-sm w-28">Free</th>
                <th className={cn(
                  "text-center p-4 font-medium text-sm w-28",
                  userType === "contributor" ? "bg-creator-primary/10" : "bg-primary/10"
                )}>
                  Pro
                </th>
                <th className="text-center p-4 font-medium text-sm w-28 bg-amber-500/10">
                  Elite
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      {row.feature}
                      {row.tooltip && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{row.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {renderCell(row.free, "free")}
                  </td>
                  <td className={cn(
                    "p-4 text-center",
                    userType === "contributor" ? "bg-creator-primary/5" : "bg-primary/5"
                  )}>
                    {renderCell(row.pro, "pro")}
                  </td>
                  <td className="p-4 text-center bg-amber-500/5">
                    {renderCell(row.elite, "elite")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
