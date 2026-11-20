import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Play, Gift, Upload, Trophy, Info, ArrowRightLeft } from "lucide-react";
import { COINS_PER_AD, COINS_PER_TAKA, CONVERSION_FEE_RATE, coinsToTaka } from "@/lib/currency";

interface CoinsWalletSectionProps {
  balance: number;
  onWatchAd: () => void;
}

const earningMethods = [
  {
    id: "ads",
    icon: Play,
    title: "Watch Ads",
    description: `Earn ${COINS_PER_AD} coins per ad`,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    available: true,
  },
  {
    id: "daily",
    icon: Gift,
    title: "Daily Login",
    description: "Claim 60 coins daily",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    available: true,
  },
  {
    id: "upload",
    icon: Upload,
    title: "Upload Notes",
    description: "Earn from sales",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    available: true,
  },
  {
    id: "challenges",
    icon: Trophy,
    title: "Challenges",
    description: "Coming soon",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    available: false,
  },
];

export const CoinsWalletSection = ({ balance, onWatchAd }: CoinsWalletSectionProps) => {
  const takaEquivalent = coinsToTaka(balance);
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Coins className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Coins Wallet</CardTitle>
            <p className="text-sm text-muted-foreground">Internal currency</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Balance Display */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent border border-yellow-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this week
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{balance.toLocaleString()}</span>
            <span className="text-lg text-muted-foreground">coins</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <ArrowRightLeft className="h-3 w-3" />
            <span>≈ ৳{takaEquivalent.toFixed(2)} (before fees)</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{COINS_PER_TAKA} Coins = ৳1</span> — Use coins to purchase notes
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <ArrowRightLeft className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-amber-400">{CONVERSION_FEE_RATE * 100}% fee</span> when converting coins to Taka for withdrawal
            </p>
          </div>
        </div>

        {/* Earning Methods */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Ways to Earn</h4>
          <div className="grid grid-cols-2 gap-2">
            {earningMethods.map((method) => (
              <button
                key={method.id}
                onClick={method.id === "ads" ? onWatchAd : undefined}
                disabled={!method.available}
                className={`
                  p-3 rounded-xl border border-border/50 text-left
                  transition-all duration-200
                  ${method.available 
                    ? 'hover:border-border hover:bg-muted/30 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className={`w-8 h-8 rounded-lg ${method.bgColor} flex items-center justify-center mb-2`}>
                  <method.icon className={`h-4 w-4 ${method.color}`} />
                </div>
                <p className="text-sm font-medium text-foreground">{method.title}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
