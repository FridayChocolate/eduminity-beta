import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Lock, CheckCircle2 } from "lucide-react";

interface CardPaymentSectionProps {
  onSelectMethod: (method: string) => void;
  selectedMethod?: string;
}

const cards = [
  {
    id: "visa",
    name: "Visa",
    logo: "/images/payment/visa.svg",
    description: "Credit or Debit Card",
  },
  {
    id: "mastercard",
    name: "MasterCard",
    logo: "/images/payment/mastercard.svg",
    description: "Credit or Debit Card",
  },
];

export const CardPaymentSection = ({ onSelectMethod, selectedMethod }: CardPaymentSectionProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <CreditCard className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Card Payments</CardTitle>
            <p className="text-sm text-muted-foreground">Secure card transactions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelectMethod(card.id)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all duration-200
                flex items-center justify-between
                hover:scale-[1.01] active:scale-[0.99]
                ${selectedMethod === card.id 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-border/50 bg-background/50 hover:border-border'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1.5">
                  <img src={card.logo} alt={card.name} className="w-full h-full object-contain" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${selectedMethod === card.id ? 'text-blue-400' : 'text-foreground'}`}>
                    {card.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
              {selectedMethod === card.id && (
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Security indicators */}
        <div className="mt-4 flex items-center justify-center gap-6 py-3 px-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs">SSL Secured</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-xs">256-bit Encryption</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
