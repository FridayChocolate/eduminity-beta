import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MailCheck } from "lucide-react";
import { LoginMonster } from "./LoginMonster"; // <-- The monster stays!

export function StudentSignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // New state for success screen

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match! Please try again.");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'student'
        }
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Show the cool success screen instead of an alert
      setIsSubmitted(true);
      setLoading(false);
    }
  };

  // THE SUCCESS SCREEN (Shows after they click Create Account)
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[#1A1A1F] rounded-xl border border-indigo-500/30">
        <MailCheck className="w-20 h-20 text-indigo-400 mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold text-white mb-4">Verify your email</h2>
        <p className="text-gray-400 max-w-sm mb-6">
          We just sent a secure verification link to <span className="text-white font-semibold">{email}</span>. 
          Click the link in that email to activate your account and start using Eduminity!
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="border-gray-700 text-gray-300 hover:bg-[#2A2A32]"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  // THE SIGNUP FORM
  return (
    <div className="flex w-full bg-[#1A1A1F] text-white font-sans rounded-xl overflow-hidden shadow-2xl">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex md:w-[45%] relative bg-gradient-to-br from-indigo-900 to-[#12121A] flex-col justify-between p-8 overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <div className="text-xl font-black tracking-widest text-white mb-12">EDUMINITY</div>
          <h1 className="text-4xl font-semibold mb-4 leading-tight text-white">
            Empowering Students.
          </h1>
          <p className="text-indigo-200 text-sm max-w-xs">
            Join the ultimate academic marketplace. Buy premium notes, or sell yours and earn.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="flex w-full md:w-[55%] flex-col items-center justify-center p-8 bg-[#1A1A1F]">
        <div className="w-full max-w-sm space-y-6">
          
          <div className="flex justify-center mb-[-10px]">
            <div className="w-32 h-32">
              <LoginMonster /> 
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
            <p className="text-xs text-gray-400">Join as a student today.</p>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1/2">
                <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
              </div>
              <div className="w-1/2">
                <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />
              </div>
            </div>

            <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />

            <Input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />

            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500" />

            <div className="flex items-center space-x-2 py-1">
              <Checkbox id="terms" required className="border-gray-500 data-[state=checked]:bg-indigo-500" />
              <label htmlFor="terms" className="text-[11px] text-gray-400 leading-none">
                I agree to the <a href="#" className="text-white hover:underline">Terms & Conditions</a>
              </label>
            </div>

            <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}