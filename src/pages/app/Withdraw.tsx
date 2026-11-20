import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wallet } from "lucide-react";

export default function Withdraw() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [grossSales, setGrossSales] = useState(0);
  const [netEarnings, setNetEarnings] = useState(0);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [method, setMethod] = useState("bkash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      // 1. Get total gross sales
      const { data: sales } = await supabase
        .from("purchases")
        .select("study_materials(price)")
        .eq("status", "approved")
        .eq("study_materials.user_id", user.id);
        
      const totalGross = sales?.reduce((sum, item: any) => sum + (item.study_materials?.price || 0), 0) || 0;
      
      // 2. Automatically deduct 20% platform fee
      const creatorNet = Math.round(totalGross * 0.8);
      
      setGrossSales(totalGross);
      setNetEarnings(creatorNet);

      // 3. Get total already withdrawn or pending
      const { data: withdrawals } = await (supabase as any)
        .from("withdrawals")
        .select("amount")
        .eq("user_id", user.id);
        
      const totalWithdrawn = withdrawals?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;

      // 4. Final Available Balance
      setBalance(creatorNet - totalWithdrawn);
    };
    fetchBalance();
  }, [user]);

  const handleWithdraw = async () => {
    if (Number(amount) < 500) return alert("Minimum withdrawal is ৳500");
    if (Number(amount) > balance) return alert("Insufficient balance");
    
    setLoading(true);
    const { error } = await (supabase as any).from("withdrawals").insert({
      user_id: user?.id,
      amount: Number(amount),
      payment_method: method,
      account_number: accountNumber
    });

    if (!error) {
      alert("Withdrawal requested! We will process it shortly.");
      setBalance(prev => prev - Number(amount));
      setAmount("");
    } else {
      alert("Error requesting withdrawal.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-xl mx-auto pt-24 px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5"/> Withdraw Earnings</CardTitle>
            <CardDescription>Minimum withdrawal amount is ৳500.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-secondary/50 p-6 rounded-lg border border-border">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Total Gross Sales:</span>
                <span>৳{grossSales}</span>
              </div>
              <div className="flex justify-between text-sm text-neon-magenta mb-4 pb-4 border-b border-border/50">
                <span>Platform Fee (20%):</span>
                <span>-৳{grossSales - netEarnings}</span>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <p className="text-4xl font-bold text-neon-teal">৳{balance}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1 block">Amount to Withdraw</label>
                <Input type="number" placeholder="৳" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-sm mb-1 block">Method</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="bkash">bKash (Personal)</option>
                  <option value="nagad">Nagad (Personal)</option>
                </select>
              </div>
              <div>
                <label className="text-sm mb-1 block">Account Number</label>
                <Input placeholder="01XXXXXXXXX" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
              <Button className="w-full bg-neon-violet hover:bg-neon-violet/90 text-white" onClick={handleWithdraw} disabled={loading || balance < 500}>
                {loading ? "Processing..." : "Request Payout"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}