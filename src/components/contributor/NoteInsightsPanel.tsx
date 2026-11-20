import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, TrendingUp, DollarSign, Search, Tag, AlertCircle, 
  Lightbulb, ChevronDown, ChevronUp, BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface NoteInsightsData {
  noteId: string;
  noteTitle: string;
  salesOverTime: { date: string; sales: number; revenue: number }[];
  revenueBreakdown: {
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
  topTags: { tag: string; performance: number }[];
  searchKeywords: { keyword: string; count: number }[];
  dropOffRate: number;
  viewsWithoutPurchase: number;
  tips: string[];
}

interface NoteInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: NoteInsightsData;
}

export const NoteInsightsPanel = ({ isOpen, onClose, data }: NoteInsightsPanelProps) => {
  const [showAllTips, setShowAllTips] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  const filteredSalesData = data.salesOverTime.slice(
    timeRange === "7d" ? -7 : timeRange === "30d" ? -30 : 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-creator-border/50 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-creator-border/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-creator-primary" />
                    Note Insights
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">
                    {data.noteTitle}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Revenue Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-creator-border/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-creator-cyan" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-creator-primary/10 border border-creator-primary/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">This Week</p>
                        <p className="text-xl font-bold text-creator-primary">৳{data.revenueBreakdown.thisWeek.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-creator-cyan/10 border border-creator-cyan/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">This Month</p>
                        <p className="text-xl font-bold text-creator-cyan">৳{data.revenueBreakdown.thisMonth.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-creator-violet/10 border border-creator-violet/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">All Time</p>
                        <p className="text-xl font-bold text-creator-violet">৳{data.revenueBreakdown.allTime.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sales Over Time Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-creator-border/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        Sales Over Time
                      </CardTitle>
                      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                        <TabsList className="h-7">
                          <TabsTrigger value="7d" className="text-xs px-2 h-6">7D</TabsTrigger>
                          <TabsTrigger value="30d" className="text-xs px-2 h-6">30D</TabsTrigger>
                          <TabsTrigger value="all" className="text-xs px-2 h-6">All</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredSalesData}>
                          <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--creator-primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--creator-primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="hsl(var(--creator-primary))"
                            fill="url(#salesGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Tags & Search Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Top Tags */}
                <Card className="border-creator-border/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4 text-amber-400" />
                      Top Performing Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.topTags.map((tag, index) => (
                      <div key={tag.tag} className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {tag.tag}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-creator-primary to-creator-cyan rounded-full"
                              style={{ width: `${tag.performance}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{tag.performance}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Search Keywords */}
                <Card className="border-creator-border/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-400" />
                      Search Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.searchKeywords.map((kw, index) => (
                      <div key={kw.keyword} className="flex items-center justify-between text-sm">
                        <span className="text-foreground truncate max-w-[120px]">{kw.keyword}</span>
                        <span className="text-muted-foreground">{kw.count} searches</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Drop-off Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-creator-border/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                      Drop-off Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{data.dropOffRate}%</p>
                        <p className="text-xs text-muted-foreground">Views without purchase</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-orange-400">{data.viewsWithoutPurchase}</p>
                        <p className="text-xs text-muted-foreground">Potential customers</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-orange-400 rounded-full"
                        style={{ width: `${100 - data.dropOffRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Converted: {100 - data.dropOffRate}%</span>
                      <span>Lost: {data.dropOffRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actionable Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-creator-primary/30 bg-gradient-to-br from-creator-primary/5 to-creator-cyan/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-creator-cyan" />
                      Tips to Improve Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(showAllTips ? data.tips : data.tips.slice(0, 3)).map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-2 p-2 rounded-lg bg-background/50 border border-creator-border/20"
                      >
                        <span className="text-creator-primary text-lg">💡</span>
                        <p className="text-sm text-foreground">{tip}</p>
                      </motion.div>
                    ))}
                    {data.tips.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-creator-primary hover:text-creator-cyan"
                        onClick={() => setShowAllTips(!showAllTips)}
                      >
                        {showAllTips ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show {data.tips.length - 3} More Tips
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
