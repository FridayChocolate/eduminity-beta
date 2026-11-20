import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { LoginMonster } from "./LoginMonster";

export function ProfileCompletion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    // Update the public profile in the database
    const { error } = await supabase
      .from("profiles")
      .update({ 
        university: university,
        bio: bio,
        // If your database has an 'is_setup' or similar flag, you'd flip it here
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Something went wrong saving your profile.");
      setLoading(false);
    } else {
      // Boom! Profile saved, send them to the dashboard
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#12121A] to-[#1A1A24] flex items-center justify-center p-6 font-['Inter'] relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-[#1A1A1F]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        
        <div className="flex justify-center mb-2">
          <div className="w-28 h-28">
            <LoginMonster />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Almost there!</h2>
          <p className="text-gray-400 text-sm">
            Let's personalize your Eduminity experience. What are you studying?
          </p>
        </div>

        <form onSubmit={handleCompleteProfile} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">University / Institution</label>
            <Input 
              type="text" 
              placeholder="e.g. Daffodil International University" 
              value={university} 
              onChange={(e) => setUniversity(e.target.value)} 
              required 
              className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-12" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Short Bio</label>
            <textarea 
              placeholder="I'm an EEE student who loves circuits and coffee..." 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              required 
              className="flex w-full rounded-md bg-[#2A2A32] border border-transparent text-white px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 min-h-[100px] resize-none" 
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-neon-teal hover:bg-teal-400 text-black font-bold mt-4" disabled={loading}>
            {loading ? "Saving..." : "Complete Profile & Enter Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}