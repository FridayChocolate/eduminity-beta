import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Coins, ArrowUpDown, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TimeFilter = "7days" | "30days" | "all";

interface EarningRecord {
  id: string;
  noteTitle: string;
  date: string;
  coinsEarned: number;
  bdtEquivalent: number;
  type: "sale" | "tip" | "bonus";
}

const mockEarnings: EarningRecord[] = [
  { id: "1", noteTitle: "HSC Physics Complete Guide", date: "2024-12-28", coinsEarned: 45, bdtEquivalent: 45, type: "sale" },
  { id: "2", noteTitle: "Organic Chemistry Notes", date: "2024-12-27", coinsEarned: 30, bdtEquivalent: 30, type: "sale" },
  { id: "3", noteTitle: "HSC Physics Complete Guide", date: "2024-12-26", coinsEarned: 45, bdtEquivalent: 45, type: "sale" },
  { id: "4", noteTitle: "Monthly Bonus", date: "2024-12-25", coinsEarned: 100, bdtEquivalent: 100, type: "bonus" },
  { id: "5", noteTitle: "Mathematics Integration Chapter", date: "2024-12-24", coinsEarned: 25, bdtEquivalent: 25, type: "sale" },
  { id: "6", noteTitle: "Tip from @student_101", date: "2024-12-23", coinsEarned: 10, bdtEquivalent: 10, type: "tip" },
  { id: "7", noteTitle: "Biology Cell Division", date: "2024-12-22", coinsEarned: 35, bdtEquivalent: 35, type: "sale" },
  { id: "8", noteTitle: "English Grammar Notes", date: "2024-12-20", coinsEarned: 20, bdtEquivalent: 20, type: "sale" },
];

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

function getTypeBadge(type: EarningRecord["type"]) {
  const styles = {
    sale: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    tip: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bonus: "bg-creator-primary/10 text-creator-primary border-creator-primary/20",
  };
  const labels = { sale: "Sale", tip: "Tip", bonus: "Bonus" };
  
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", styles[type])}>
      {labels[type]}
    </Badge>
  );
}

export function EarningsTable() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Mock filtering logic
  const filteredEarnings = mockEarnings.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalCoins = filteredEarnings.reduce((sum, e) => sum + e.coinsEarned, 0);

  return (
    <Card className="creator-card border-creator-border/30">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-creator-primary/10">
              <FileText className="h-5 w-5 text-creator-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your earning history by note
              </p>
            </div>
          </div>
          
          {/* Time Filter Pills */}
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
                className={cn(
                  "text-xs h-8 px-3 rounded-md transition-all",
                  timeFilter === filter.value
                    ? "bg-creator-primary text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Note Title</TableHead>
                <TableHead className="font-semibold">
                  <button 
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="text-right font-semibold">
                  <span className="flex items-center justify-end gap-1.5">
                    <Coins className="h-3.5 w-3.5" />
                    Coins
                  </span>
                </TableHead>
                <TableHead className="text-right font-semibold">BDT (৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredEarnings.map((earning, index) => (
                  <motion.tr
                    key={earning.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">
                      {earning.noteTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(earning.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{getTypeBadge(earning.type)}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-400">
                      +{earning.coinsEarned}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ৳{earning.bdtEquivalent}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Footer */}
        <div className="mt-4 flex items-center justify-between px-2 py-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Showing {filteredEarnings.length} transactions
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-emerald-400">{totalCoins} coins</span>
            <span className="font-bold">= ৳{totalCoins}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
