import { Coins, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CoinBalanceProps {
  balance: number;
  onWatchAd?: () => void;
  onBuyCoins?: () => void;
}

export const CoinBalance = ({ balance, onWatchAd, onBuyCoins }: CoinBalanceProps) => {
  const navigate = useNavigate();
  
  const handleBuyCoins = () => {
    if (onBuyCoins) {
      onBuyCoins();
    } else {
      navigate("/app/payment");
    }
  };

  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-student-accent/10 via-student-card to-student-card border border-student-accent/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-student-accent/20 flex items-center justify-center">
            <Coins className="h-6 w-6 text-student-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Balance</p>
            <p className="text-2xl font-bold text-foreground">{balance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">coins</span></p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-student-accent/30 text-student-accent hover:bg-student-accent/10 hover:text-student-accent"
          onClick={onWatchAd}
        >
          <Play className="h-4 w-4 mr-2" />
          Watch Ad
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-student-accent text-student-bg hover:bg-student-accent/90"
          onClick={handleBuyCoins}
        >
          <Plus className="h-4 w-4 mr-2" />
          Buy Coins
        </Button>
      </div>
    </div>
  );
};
