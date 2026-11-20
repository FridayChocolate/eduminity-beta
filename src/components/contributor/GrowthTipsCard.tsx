import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Image, Tags, Clock, Zap } from "lucide-react";

interface Tip {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  impact: "high" | "medium";
}

const tips: Tip[] = [
  {
    id: "1",
    icon: Image,
    title: "Add Preview Images",
    description: "Notes with previews get 3x more clicks",
    impact: "high"
  },
  {
    id: "2",
    icon: Tags,
    title: "Use Descriptive Titles",
    description: "Include subject, topic, and year for better discovery",
    impact: "high"
  },
  {
    id: "3",
    icon: Clock,
    title: "Upload During Peak Hours",
    description: "6-9 PM gets the most student traffic",
    impact: "medium"
  },
  {
    id: "4",
    icon: TrendingUp,
    title: "Optimize Pricing",
    description: "৳50-70 range converts best for HSC notes",
    impact: "medium"
  }
];

export const GrowthTipsCard = () => {
  return (
    <Card className="creator-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          Tips to Increase Sales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip) => (
          <div 
            key={tip.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-creator-border/50 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              tip.impact === "high" 
                ? "bg-gradient-to-br from-creator-primary/20 to-creator-cyan/20" 
                : "bg-muted"
            }`}>
              <tip.icon className={`h-5 w-5 ${
                tip.impact === "high" ? "text-creator-primary" : "text-muted-foreground"
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium group-hover:text-creator-primary transition-colors">
                  {tip.title}
                </h4>
                {tip.impact === "high" && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-creator-primary/20 text-creator-primary">
                    <Zap className="h-2.5 w-2.5" /> HIGH IMPACT
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
