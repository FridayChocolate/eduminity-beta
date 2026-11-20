import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Eye, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const weeklyData = [
  { day: "Mon", views: 120, sales: 8 },
  { day: "Tue", views: 145, sales: 12 },
  { day: "Wed", views: 180, sales: 15 },
  { day: "Thu", views: 165, sales: 11 },
  { day: "Fri", views: 210, sales: 18 },
  { day: "Sat", views: 280, sales: 24 },
  { day: "Sun", views: 190, sales: 14 },
];

const monthlyData = [
  { day: "W1", views: 850, sales: 52 },
  { day: "W2", views: 1200, sales: 78 },
  { day: "W3", views: 980, sales: 61 },
  { day: "W4", views: 1450, sales: 95 },
];

export const AnalyticsCard = () => {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const data = period === "weekly" ? weeklyData : monthlyData;
  const maxViews = Math.max(...data.map(d => d.views));
  const maxSales = Math.max(...data.map(d => d.sales));

  const totalViews = data.reduce((acc, d) => acc + d.views, 0);
  const totalSales = data.reduce((acc, d) => acc + d.sales, 0);

  return (
    <TooltipProvider>
      <Card className="creator-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-creator-cyan" />
              Views & Sales Analytics
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
              <TabsList className="h-8 bg-creator-hover">
                <TabsTrigger value="weekly" className="text-xs px-3 h-6 data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-3 h-6 data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary">
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-creator-primary to-creator-violet" />
              <span className="text-sm text-muted-foreground">Views</span>
              <span className="text-sm font-semibold text-creator-primary">{totalViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-creator-cyan" />
              <span className="text-sm text-muted-foreground">Sales</span>
              <span className="text-sm font-semibold text-creator-cyan">{totalSales}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 flex items-end justify-between gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full flex flex-col items-center gap-1 cursor-pointer">
                      {/* Views Bar */}
                      <div 
                        className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ 
                          height: `${(item.views / maxViews) * 120}px`,
                          background: 'linear-gradient(to top, hsl(var(--creator-primary)), hsl(var(--creator-violet)))'
                        }}
                      />
                      {/* Sales Bar */}
                      <div 
                        className="w-3/4 rounded-t transition-all duration-500 hover:opacity-80 bg-creator-cyan"
                        style={{ 
                          height: `${(item.sales / maxSales) * 40}px`,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border-creator-border">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{item.day}</p>
                      <p className="text-xs flex items-center gap-1">
                        <Eye className="h-3 w-3 text-creator-primary" /> {item.views} views
                      </p>
                      <p className="text-xs flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3 text-creator-cyan" /> {item.sales} sales
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
