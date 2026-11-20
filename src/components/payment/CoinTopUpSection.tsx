import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Check, Sparkles } from "lucide-react";

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

interface CoinTopUpSectionProps {
  onSelectPackage: (pkg: CoinPackage) => void;
  selectedPackage?: string;
}

const packages: CoinPackage[] = [
  { id: "pack-1", coins: 120, price: 1 },
  { id: "pack-5", coins: 600, price: 5, bonus: 30 },
  { id: "pack-10", coins: 1200, price: 10, bonus: 120, popular: true },
  { id: "pack-50", coins: 6000, price: 50, bonus: 600 },
];

export const CoinTopUpSection = ({ onSelectPackage, selectedPackage }: CoinTopUpSectionProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Top Up Coins</CardTitle>
            <p className="text-sm text-muted-foreground">Choose a package</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className={`
                relative w-full p-4 rounded-xl border-2 transition-all duration-200
                flex items-center justify-between
                hover:scale-[1.01] active:scale-[0.99]
                ${selectedPackage === pkg.id 
                  ? 'border-primary/50 bg-primary/10' 
                  : 'border-border/50 bg-background/50 hover:border-border'}
                ${pkg.popular ? 'ring-2 ring-primary/20' : ''}
              `}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs">
                  Best Value
                </Badge>
              )}
              
              <div className="flex items-center gap-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  ${selectedPackage === pkg.id 
                    ? 'bg-primary/20' 
                    : 'bg-yellow-500/10'}
                `}>
                  <Coins className={`h-6 w-6 ${selectedPackage === pkg.id ? 'text-primary' : 'text-yellow-400'}`} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">{pkg.coins}</span>
                    <span className="text-muted-foreground">coins</span>
                    {pkg.bonus && (
                      <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                        +{pkg.bonus} bonus
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pkg.bonus ? `Get ${pkg.coins + pkg.bonus} coins total` : 'Standard package'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">৳{pkg.price}</p>
                  <p className="text-xs text-muted-foreground">BDT</p>
                </div>
                {selectedPackage === pkg.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* No hidden fees message */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            ✓ No hidden fees • ✓ Instant delivery • ✓ Secure payment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
