import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Grabs the currently logged-in user
  
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check: Make sure we actually know who is logged in
    if (!user) {
      alert("No user found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      // THE FIX: Actually send the data to the Supabase 'profiles' table
      const { error } = await supabase
        .from("profiles" as any)
        .update({ 
          university: university,
          bio: bio 
        })
        .eq("id", user.id); // Ensures we only update THIS user's row

      if (error) throw error;

      // Success! Teleport them to the main app
      navigate("/app");
      
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12121A] flex items-center justify-center p-6 font-['Inter'] relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#1A1A1F]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Almost there</h1>
          <p className="text-gray-400 text-sm">Tell us about yourself to personalize your Eduminity experience.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">University / Institution</label>
            <Input 
              required 
              value={university} 
              onChange={(e) => setUniversity(e.target.value)} 
              placeholder="e.g., Daffodil International University" 
              className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-11" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Short Bio (Optional)</label>
            <Textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="What are you studying? What are your goals?" 
              className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 min-h-[100px] resize-none" 
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 mt-4 transition-all"
          >
            {loading ? "Saving Profile..." : "Complete Profile & Enter Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}