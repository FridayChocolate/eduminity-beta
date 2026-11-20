import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2 } from "lucide-react";

interface MobileWalletSectionProps {
  onSelectMethod: (method: string) => void;
  selectedMethod?: string;
}

const wallets = [
  {
    id: "bkash",
    name: "bKash",
    logo: "/images/payment/bkash.svg",
    textColor: "text-pink-500",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-500/10",
    description: "Pay with bKash mobile wallet",
  },
  {
    id: "nagad",
    name: "Nagad",
    logo: "/images/payment/nagad.svg",
    textColor: "text-orange-500",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
    description: "Pay with Nagad mobile wallet",
  },
  {
    id: "rocket",
    name: "Rocket",
    logo: "/images/payment/rocket.png",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    description: "Pay with Rocket mobile wallet",
  },
];

export const MobileWalletSection = ({ onSelectMethod, selectedMethod }: MobileWalletSectionProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mobile Wallets</CardTitle>
              <p className="text-sm text-muted-foreground">Bangladesh mobile payment</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            Most Popular
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelectMethod(wallet.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all duration-200
                flex items-center justify-between
                hover:scale-[1.01] active:scale-[0.99]
                ${selectedMethod === wallet.id 
                  ? `${wallet.borderColor} ${wallet.bgColor}` 
                  : 'border-border/50 bg-background/50 hover:border-border'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1">
                  <img src={wallet.logo} alt={wallet.name} className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${selectedMethod === wallet.id ? wallet.textColor : 'text-foreground'}`}>
                    {wallet.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                </div>
              </div>
              {selectedMethod === wallet.id && (
                <CheckCircle2 className={`h-5 w-5 ${wallet.textColor}`} />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            You'll receive a payment request on your mobile wallet app
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
