import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginMonster } from "./LoginMonster";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/"; 
    }
    setLoading(false);
  };

  return (
    <div className="flex w-full bg-[#1A1A1F] text-white font-sans overflow-hidden min-h-screen">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex md:w-[45%] relative bg-gradient-to-br from-indigo-900 to-[#12121A] flex-col justify-between p-8 overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="text-xl font-black tracking-widest text-white mb-12">EDUMINITY</div>
          <h1 className="text-4xl font-semibold mb-4 leading-tight text-white">Welcome Back.</h1>
          <p className="text-indigo-200 text-sm max-w-xs">Log in to access your premium study materials and dashboard.</p>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="flex w-full md:w-[55%] flex-col items-center justify-center p-8 bg-[#1A1A1F]">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center mb-[-10px]">
            <div className="w-32 h-32"><LoginMonster /></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Log In</h2>
            <p className="text-xs text-gray-400">Welcome back to Eduminity.</p>
          </div>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
            <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}