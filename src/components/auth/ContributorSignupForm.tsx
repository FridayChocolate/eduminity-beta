import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginMonster } from "./LoginMonster";

// Accept onSuccess prop just in case your Auth.tsx passes it
export function ContributorSignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileType, setProfileType] = useState("creator");
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: profileType } }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Success! Check your email for the confirmation link.");
      if (onSuccess) onSuccess();
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
          <h1 className="text-4xl font-semibold mb-4 leading-tight text-white">Monetize Your Knowledge.</h1>
          <p className="text-indigo-200 text-sm max-w-xs">Upload your premium lecture notes and question banks to start earning 80% commissions.</p>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="flex w-full md:w-[55%] flex-col items-center justify-center p-8 bg-[#1A1A1F]">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center mb-[-10px]">
            <div className="w-32 h-32"><LoginMonster /></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Become a Contributor</h2>
            <p className="text-xs text-gray-400">Start selling your materials today.</p>
          </div>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <Input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
            <div className="flex gap-3">
              <div className="w-1/2">
                <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
              </div>
              <div className="w-1/2">
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-400">I am a</label>
              <select 
                value={profileType} 
                onChange={(e) => setProfileType(e.target.value)}
                className="flex h-10 w-full rounded-md bg-[#2A2A32] border-transparent text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="creator">Creator / Note Seller</option>
                <option value="tutor">Academic Tutor</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-neon-teal hover:bg-teal-400 text-black font-bold" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up as Contributor"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}