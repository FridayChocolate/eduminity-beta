import { ContributorLayout } from "@/layouts/ContributorLayout";
import { AnalyticsCard } from "@/components/contributor/AnalyticsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, ShoppingCart } from "lucide-react";
import { PageBackButton } from "@/components/ui/page-back-button";

const CreatorAnalytics = () => {
  return (
    <ContributorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PageBackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-creator-primary via-creator-violet to-creator-cyan bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your content performance and growth
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Views", value: "12,450", icon: Eye, color: "text-creator-primary" },
            { label: "Total Sales", value: "234", icon: ShoppingCart, color: "text-creator-cyan" },
            { label: "Conversion Rate", value: "1.88%", icon: TrendingUp, color: "text-emerald-400" },
            { label: "Avg. Rating", value: "4.8", icon: BarChart3, color: "text-amber-400" },
          ].map((stat) => (
            <Card key={stat.label} className="creator-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Chart */}
        <AnalyticsCard />
      </div>
    </ContributorLayout>
  );
};

export default CreatorAnalytics;
