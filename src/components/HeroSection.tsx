import { Button } from "@/components/ui/button";
import { Upload, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user, canAccessCreator } = useAuth();
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const sessionKey = `hero-visitor-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel("eduminity-hero-online", {
      config: {
        presence: {
          key: sessionKey,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).length;
        setOnlineCount(Math.max(1, activeUsers));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUploadClick = () => {
    if (!user) {
      navigate("/auth");
    } else if (canAccessCreator) {
      navigate("/app/upload-notes");
    } else {
      navigate("/app/profile");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl mb-6 md:mb-8 border border-border bg-[#071120] shadow-lg">
      {/* Full Hero Banner Image */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] overflow-hidden">
        <img
          src="/eduminity-hero.jpg"
          alt="Eduminity - Learn. Connect. Share."
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
        {/* Subtle bottom fade so buttons stay readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071120] via-[#071120]/25 to-transparent" />
      </div>

      {/* Action Bar & Live Counter */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5 bg-[#071120]/95 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-neon-teal to-neon-violet hover:shadow-glow-teal transition-all duration-300 text-primary-foreground font-semibold px-6 hover:-translate-y-0.5"
            onClick={handleUploadClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Notes
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-neon-violet transition-all duration-300 font-semibold px-6 hover:-translate-y-0.5"
            onClick={() => navigate("/app/materials")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Study Hub
          </Button>
        </div>

        {/* Live Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-green-400 font-medium">
            {onlineCount} {onlineCount === 1 ? "student" : "students"} online right now
          </span>
        </div>
      </div>
    </section>
  );
};