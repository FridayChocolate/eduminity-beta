import { Check, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TierFeature {
  text: string;
  included: boolean;
}

export interface PremiumTier {
  name: string;
  price: number;
  period: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  features: TierFeature[];
  badge?: string;
  recommended?: boolean;
  current?: boolean;
}

interface PremiumTierCardProps {
  tier: PremiumTier;
  index: number;
  onUpgrade: (tierName: string) => void;
  userType: "student" | "contributor";
}

export const PremiumTierCard = ({ tier, index, onUpgrade, userType }: PremiumTierCardProps) => {
  const isElite = tier.name === "Elite";
  const isPro = tier.name === "Pro";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "relative h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] group",
          tier.recommended && "border-2 shadow-lg",
          tier.recommended && userType === "contributor" && "border-creator-primary shadow-creator-primary/20",
          tier.recommended && userType === "student" && "border-primary shadow-primary/20",
          !tier.recommended && "border-border/50 hover:border-primary/30",
          isElite && "bg-gradient-to-b from-amber-950/20 to-background",
          isPro && userType === "contributor" && "bg-gradient-to-b from-violet-950/20 to-background",
          isPro && userType === "student" && "bg-gradient-to-b from-cyan-950/20 to-background"
        )}
      >
        {/* Top gradient bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", tier.color)} />
        
        {/* Glow effect for premium tiers */}
        {(isPro || isElite) && (
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
            tier.glowColor
          )} />
        )}

        {tier.recommended && (
          <Badge className={cn(
            "absolute top-4 right-4 animate-pulse",
            userType === "contributor" 
              ? "bg-gradient-to-r from-creator-primary to-creator-cyan" 
              : "bg-gradient-to-r from-primary to-cyan-500"
          )}>
            Best Value
          </Badge>
        )}

        {tier.current && (
          <Badge variant="outline" className="absolute top-4 right-4 border-green-500 text-green-500">
            Current Plan
          </Badge>
        )}

        <CardHeader className="text-center pt-8 pb-4">
          <motion.div 
            className={cn(
              "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
              tier.color
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <tier.icon className="h-8 w-8 text-white" />
          </motion.div>
          
          <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
          
          {tier.badge && (
            <Badge variant="secondary" className="mt-2 w-fit mx-auto">
              {tier.badge}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="text-center pb-6">
          <div className="mb-6">
            {tier.price === 0 ? (
              <span className="text-4xl font-bold">Free</span>
            ) : (
              <>
                <span className="text-4xl font-bold">৳{tier.price}</span>
                <span className="text-muted-foreground">/{tier.period}</span>
              </>
            )}
          </div>

          <ul className="space-y-3 text-sm text-left">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  feature.included ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button 
            className={cn(
              "w-full transition-all duration-300",
              tier.recommended && "shadow-lg",
              tier.recommended && userType === "contributor" && "bg-gradient-to-r from-creator-primary to-creator-cyan hover:opacity-90",
              tier.recommended && userType === "student" && "bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90",
              isElite && "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
            )}
            variant={tier.recommended || isElite ? "default" : "outline"}
            onClick={() => onUpgrade(tier.name)}
            disabled={tier.current || tier.price === 0}
          >
            {tier.current ? "Current Plan" : tier.price === 0 ? "Free Forever" : `Upgrade to ${tier.name}`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
