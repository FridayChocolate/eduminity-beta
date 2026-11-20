import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { WatchAdDialog } from "@/components/premium/WatchAdDialog";
import { ArrowLeft, Coins, ShieldCheck } from "lucide-react";
import {
  MobileWalletSection,
  CardPaymentSection,
  CoinsWalletSection,
  CoinTopUpSection,
  PaymentConfirmation,
} from "@/components/payment";

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
}

const Payment = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedMethod, setSelectedMethod] = useState<string>();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePaymentConfirm = async () => {
    if (!selectedMethod || !selectedPackage) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Payment Successful!",
      description: `${selectedPackage.coins + (selectedPackage.bonus || 0)} coins have been added to your wallet.`,
    });
    
    setIsProcessing(false);
    setSelectedMethod(undefined);
    setSelectedPackage(undefined);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please login to continue</h2>
          <Button onClick={() => navigate("/auth")}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Payment & Coins</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-foreground">{wallet?.balance || 0}</span>
              <span className="text-muted-foreground text-sm">coins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Trust Banner */}
        <div className="mb-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-green-500/20">
            <ShieldCheck className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Secure & Transparent Payments</p>
            <p className="text-sm text-muted-foreground">
              No hidden fees. 1 Coin = 1 BDT. Instant coin delivery after payment.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Methods & Coins Wallet */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Coins Wallet */}
            <CoinsWalletSection 
              balance={wallet?.balance || 0} 
              onWatchAd={() => setShowAdDialog(true)}
            />

            {/* Section 2: Mobile Wallets */}
            <MobileWalletSection 
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />

            {/* Section 3: Card Payments */}
            <CardPaymentSection 
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />
          </div>

          {/* Right Column - Top Up & Confirmation */}
          <div className="space-y-6">
            {/* Coin Packages */}
            <CoinTopUpSection 
              selectedPackage={selectedPackage?.id}
              onSelectPackage={setSelectedPackage}
            />

            {/* Payment Confirmation */}
            <PaymentConfirmation 
              selectedMethod={selectedMethod}
              selectedPackage={selectedPackage}
              onConfirm={handlePaymentConfirm}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>

      <WatchAdDialog 
        open={showAdDialog} 
        onOpenChange={setShowAdDialog}
      />
    </div>
  );
};

export default Payment;
