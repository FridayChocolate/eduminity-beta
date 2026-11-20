import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentConfirmationProps {
  selectedMethod?: string;
  selectedPackage?: { coins: number; price: number; bonus?: number };
  onConfirm: () => void;
  isProcessing?: boolean;
}

const methodNames: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  visa: "Visa Card",
  mastercard: "MasterCard",
};

export const PaymentConfirmation = ({ 
  selectedMethod, 
  selectedPackage, 
  onConfirm,
  isProcessing 
}: PaymentConfirmationProps) => {
  if (!selectedMethod || !selectedPackage) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Coins className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Select a payment method and coin package to continue
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalCoins = selectedPackage.coins + (selectedPackage.bonus || 0);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" />
          Confirm Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium text-foreground">{methodNames[selectedMethod]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Coins</span>
            <span className="font-medium text-foreground">{selectedPackage.coins}</span>
          </div>
          {selectedPackage.bonus && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bonus</span>
              <span className="font-medium text-green-400">+{selectedPackage.bonus}</span>
            </div>
          )}
          <div className="border-t border-border/50 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Coins</span>
              <span className="text-xl font-bold text-foreground">{totalCoins}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-foreground font-medium">Amount to Pay</span>
          <span className="text-2xl font-bold text-primary">৳{selectedPackage.price}</span>
        </div>

        {/* Confirm Button */}
        <Button 
          className="w-full h-12 text-lg"
          onClick={onConfirm}
          disabled={isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              Confirm & Pay
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* Trust message */}
        <p className="text-xs text-center text-muted-foreground">
          Your payment is protected by 256-bit SSL encryption
        </p>
      </CardContent>
    </Card>
  );
};
