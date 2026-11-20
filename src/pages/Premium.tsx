import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  Crown, Zap, Star, Sparkles, Shield, Heart, 
  Upload, Eye, Clock, Rocket, Gift, MessageCircle,
  Coins, Percent, Ban, GraduationCap, BookOpen
} from "lucide-react";
import { Header } from "@/components/Header";
import { PremiumTierCard, PremiumComparison } from "@/components/premium";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { PremiumTier } from "@/components/premium/PremiumTierCard";

// Contributor tiers
const contributorTiers: PremiumTier[] = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    icon: BookOpen,
    color: "from-slate-500 to-slate-600",
    glowColor: "",
    features: [
      { text: "Basic profile", included: true },
      { text: "Up to 10 uploads/month", included: true },
      { text: "Standard approval (3-5 days)", included: true },
      { text: "Basic visibility", included: true },
      { text: "Priority approval", included: false },
      { text: "Boosted search visibility", included: false },
      { text: "Featured placement", included: false },
      { text: "Early feature access", included: false },
    ],
  },
  {
    name: "Pro",
    price: 499,
    period: "month",
    icon: Sparkles,
    color: "from-violet-500 to-fuchsia-500",
    glowColor: "bg-gradient-to-b from-violet-500/10 to-transparent",
    recommended: true,
    badge: "Most Popular",
    features: [
      { text: "Premium profile banner", included: true },
      { text: "Up to 50 uploads/month", included: true },
      { text: "Priority approval (24-48 hrs)", included: true },
      { text: "2x search visibility boost", included: true },
      { text: "Pro badge on profile", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Featured placement", included: false },
      { text: "Early feature access", included: false },
    ],
  },
  {
    name: "Elite",
    price: 999,
    period: "month",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    glowColor: "bg-gradient-to-b from-amber-500/10 to-transparent",
    badge: "Top Creator",
    features: [
      { text: "Animated premium banner", included: true },
      { text: "Unlimited uploads", included: true },
      { text: "Instant approval", included: true },
      { text: "Maximum visibility (5x)", included: true },
      { text: "Elite badge on profile", included: true },
      { text: "Featured creator placement", included: true },
      { text: "Early access to features", included: true },
      { text: "Direct support channel", included: true },
    ],
  },
];

// Student tiers
const studentTiers: PremiumTier[] = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    icon: GraduationCap,
    color: "from-slate-500 to-slate-600",
    glowColor: "",
    features: [
      { text: "Standard note access", included: true },
      { text: "Community Q&A", included: true },
      { text: "Basic search", included: true },
      { text: "Ads supported", included: true },
      { text: "Note discounts", included: false },
      { text: "Monthly free coins", included: false },
      { text: "Priority support", included: false },
      { text: "Ad-free experience", included: false },
    ],
  },
  {
    name: "Pro",
    price: 299,
    period: "month",
    icon: Zap,
    color: "from-cyan-500 to-blue-500",
    glowColor: "bg-gradient-to-b from-cyan-500/10 to-transparent",
    recommended: true,
    badge: "Best Value",
    features: [
      { text: "10% discount on all notes", included: true },
      { text: "100 free coins/month", included: true },
      { text: "Ad-free browsing", included: true },
      { text: "Pro badge on profile", included: true },
      { text: "Priority Q&A responses", included: true },
      { text: "Extended previews", included: true },
      { text: "Highest discounts", included: false },
      { text: "Priority chat access", included: false },
    ],
  },
  {
    name: "Elite",
    price: 599,
    period: "month",
    icon: Star,
    color: "from-amber-500 to-orange-500",
    glowColor: "bg-gradient-to-b from-amber-500/10 to-transparent",
    badge: "Ultimate Learner",
    features: [
      { text: "25% discount on all notes", included: true },
      { text: "300 free coins/month", included: true },
      { text: "Ad-free browsing", included: true },
      { text: "Elite badge on profile", included: true },
      { text: "Priority chat with creators", included: true },
      { text: "Early access to new notes", included: true },
      { text: "Exclusive study groups", included: true },
      { text: "Direct creator messaging", included: true },
    ],
  },
];

// Comparison data
const contributorComparison = [
  { feature: "Profile Type", free: "Basic", pro: "Premium Banner", elite: "Animated Banner" },
  { feature: "Monthly Uploads", free: "10", pro: "50", elite: "Unlimited", tooltip: "Number of notes you can upload per month" },
  { feature: "Approval Speed", free: "3-5 days", pro: "24-48 hours", elite: "Instant", tooltip: "How fast your uploads get reviewed" },
  { feature: "Search Visibility", free: "1x", pro: "2x Boost", elite: "5x Boost", tooltip: "How visible your notes are in search results" },
  { feature: "Pro/Elite Badge", free: false, pro: true, elite: true },
  { feature: "Featured Placement", free: false, pro: false, elite: true, tooltip: "Get featured on the homepage" },
  { feature: "Analytics Dashboard", free: false, pro: true, elite: true },
  { feature: "Early Feature Access", free: false, pro: false, elite: true },
  { feature: "Direct Support", free: false, pro: false, elite: true },
];

const studentComparison = [
  { feature: "Note Discounts", free: "None", pro: "10% off", elite: "25% off", tooltip: "Discount on all note purchases" },
  { feature: "Monthly Free Coins", free: "0", pro: "100", elite: "300", tooltip: "Free coins added to your wallet each month" },
  { feature: "Ad-Free Experience", free: false, pro: true, elite: true },
  { feature: "Pro/Elite Badge", free: false, pro: true, elite: true },
  { feature: "Q&A Priority", free: "Standard", pro: "Priority", elite: "VIP", tooltip: "How fast your questions get answered" },
  { feature: "Note Previews", free: "Limited", pro: "Extended", elite: "Full Preview" },
  { feature: "Creator Chat Access", free: false, pro: false, elite: true, tooltip: "Direct message creators for help" },
  { feature: "Exclusive Study Groups", free: false, pro: false, elite: true },
];

export default function Premium() {
  const { user } = useAuth();
  const { mode } = useMode();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [activeTab, setActiveTab] = useState<"student" | "contributor">(
    mode === "contributor" ? "contributor" : "student"
  );

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setActiveTab(mode === "contributor" ? "contributor" : "student");
  }, [mode]);

  const fetchSubscriptionData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .single();

      if (data?.tier) setCurrentTier(data.tier);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tierName: string) => {
    toast({
      title: "Coming Soon!",
      description: `${tierName} subscription will be available soon. Payment integration is being set up.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const tiers = activeTab === "contributor" ? contributorTiers : studentTiers;
  const comparison = activeTab === "contributor" ? contributorComparison : studentComparison;

  // Mark current tier
  const tiersWithCurrent = tiers.map(tier => ({
    ...tier,
    current: tier.name.toLowerCase() === currentTier.toLowerCase()
  }));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4",
              activeTab === "contributor" 
                ? "bg-creator-primary/10 border-creator-primary/30" 
                : "bg-primary/10 border-primary/30"
            )}>
              <Crown className={cn(
                "h-4 w-4",
                activeTab === "contributor" ? "text-creator-primary" : "text-primary"
              )} />
              <span className={cn(
                "text-sm font-medium",
                activeTab === "contributor" ? "text-creator-primary" : "text-primary"
              )}>
                Premium Plans
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                Unlock Your Full Potential
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {activeTab === "contributor" 
                ? "Grow your creator profile with premium visibility, faster approvals, and exclusive features"
                : "Get more value with discounts, free coins, and an ad-free learning experience"}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Cancel anytime • Secure payment • Instant activation</span>
            </div>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div 
            className="flex justify-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "student" | "contributor")}>
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                <TabsTrigger value="student" className="gap-2 data-[state=active]:bg-primary/20">
                  <GraduationCap className="h-4 w-4" />
                  For Students
                </TabsTrigger>
                <TabsTrigger value="contributor" className="gap-2 data-[state=active]:bg-creator-primary/20">
                  <Upload className="h-4 w-4" />
                  For Creators
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Current Plan Badge */}
          {currentTier !== "free" && (
            <div className="flex justify-center mb-8">
              <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500">
                <Crown className="h-4 w-4 mr-2" />
                Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </Badge>
            </div>
          )}

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            {tiersWithCurrent.map((tier, index) => (
              <PremiumTierCard
                key={tier.name}
                tier={tier}
                index={index}
                onUpgrade={handleUpgrade}
                userType={activeTab}
              />
            ))}
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">
              Compare All Features
            </h2>
            <PremiumComparison rows={comparison} userType={activeTab} />
          </div>

          {/* Benefits Highlight */}
          <motion.div 
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {activeTab === "contributor" ? (
              <>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20">
                  <Rocket className="h-8 w-8 mx-auto mb-3 text-violet-400" />
                  <h3 className="font-semibold mb-2">Faster Growth</h3>
                  <p className="text-sm text-muted-foreground">Get more visibility and reach more students</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-fuchsia-500/10 to-transparent border border-fuchsia-500/20">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-fuchsia-400" />
                  <h3 className="font-semibold mb-2">Save Time</h3>
                  <p className="text-sm text-muted-foreground">Priority approvals mean faster earnings</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
                  <Eye className="h-8 w-8 mx-auto mb-3 text-amber-400" />
                  <h3 className="font-semibold mb-2">Stand Out</h3>
                  <p className="text-sm text-muted-foreground">Premium badges and featured placement</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20">
                  <Percent className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
                  <h3 className="font-semibold mb-2">Save Money</h3>
                  <p className="text-sm text-muted-foreground">Up to 25% off on all note purchases</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                  <Coins className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                  <h3 className="font-semibold mb-2">Free Coins</h3>
                  <p className="text-sm text-muted-foreground">Get up to 300 coins every month</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
                  <Ban className="h-8 w-8 mx-auto mb-3 text-amber-400" />
                  <h3 className="font-semibold mb-2">No Ads</h3>
                  <p className="text-sm text-muted-foreground">Distraction-free learning experience</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Trust Footer */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Shield className="h-5 w-5 text-green-500" />
              <Heart className="h-5 w-5 text-pink-500" />
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-muted-foreground text-sm">
              Your premium subscription directly supports student creators across Bangladesh
            </p>
            <Button 
              variant="link" 
              className="mt-2 text-primary"
              onClick={() => navigate("/donate")}
            >
              Or donate directly to help students →
            </Button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
