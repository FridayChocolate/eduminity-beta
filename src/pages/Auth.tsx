import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentSignupForm } from "@/components/auth/StudentSignupForm";
import { ContributorSignupForm } from "@/components/auth/ContributorSignupForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("student");

  // SMART REDIRECT LOGIC
  useEffect(() => {
    const checkProfileAndRoute = async () => {
      if (!loading && user) {
        // We select "*" and use 'as any' to bypass strict TypeScript dictionary checks
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const profileData = data as any;

        // If they have a university saved, they are a returning user. Send to dashboard!
        if (profileData && profileData.university) {
          navigate("/app");
        } else {
          // If university is empty, they are brand new. Send to setup!
          navigate("/complete-profile");
        }
      }
    };

    checkProfileAndRoute();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#1E1E24] font-['Inter'] relative overflow-x-hidden">
      
      {/* THE FIX: CSS injected safely inside the main wrapper to hide the + button */}
      <style>{`button[class*="fixed"], div[class*="fixed bottom-"] { display: none !important; }`}</style>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">

        {/* FLOATING GLASS-MORPHISM TABS */}
        <div className="absolute top-6 right-6 md:right-12 z-50 w-full md:w-auto flex justify-center md:justify-end">
          <TabsList className="grid grid-cols-3 w-[400px] bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-2xl">
            <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-gray-300">Login</TabsTrigger>
            <TabsTrigger value="student" className="rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-gray-300">Student</TabsTrigger>
            <TabsTrigger value="contributor" className="rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-gray-300">Contributor</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB CONTENTS */}
        <div className="w-full h-full">
          <TabsContent value="login" className="m-0 h-full data-[state=active]:flex items-center justify-center pt-24">
            <LoginForm />
          </TabsContent>

          <TabsContent value="student" className="m-0 min-h-screen border-none data-[state=inactive]:hidden flex">
            <StudentSignupForm />
          </TabsContent>

          <TabsContent value="contributor" className="m-0 h-full data-[state=active]:flex items-center justify-center pt-24">
            <ContributorSignupForm onSuccess={() => navigate("/app")} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Auth;