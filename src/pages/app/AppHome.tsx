import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrendingSection } from "@/components/TrendingSection";
import { MaterialCard } from "@/components/MaterialCard";
import { CommunitySection } from "@/components/CommunitySection";
import { Footer } from "@/components/Footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/hooks/useScrollReveal";
import { AppLayout } from "@/layouts/AppLayout";
import { supabase } from "@/integrations/supabase/client";

interface LiveMaterial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  class_level: string | null;
  price: number;
}

const AppHome = () => {
  const navigate = useNavigate();
  const [liveMaterials, setLiveMaterials] = useState<LiveMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    const fetchLatestMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from("materials" as any)
          .select("id, title, description, category, class_level, price")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data) {
          setLiveMaterials(data as unknown as LiveMaterial[]);
        }
      } catch {
        // Ignore fetch errors on home preview
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchLatestMaterials();
  }, []);

  const featureCards = [
    {
      icon: BookOpen,
      title: "Study Hub",
      description: "Browse verified lecture notes, guides & past papers",
      iconClass: "text-teal-400",
      borderClass: "hover:border-teal-500/50",
      route: "/app/materials",
    },
    {
      icon: HelpCircle,
      title: "Q&A Help",
      description: "Ask academic questions and get peer answers",
      iconClass: "text-indigo-400",
      borderClass: "hover:border-indigo-500/50",
      route: "/app/questions",
    },
    {
      icon: Users,
      title: "Community",
      description: "Join study discussions with students across Bangladesh",
      iconClass: "text-cyan-400",
      borderClass: "hover:border-cyan-500/50",
      route: "/app/community",
    },
    {
      icon: Sparkles,
      title: "Creator Studio",
      description: "Upload your notes and earn 80% on every sale",
      iconClass: "text-purple-400",
      borderClass: "hover:border-purple-500/50",
      route: "/app/profile",
    },
  ];

  return (
    <AppLayout>
      <ScrollReveal>
        <HeroSection />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <SocialProofStrip />
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <TrendingSection />
      </ScrollReveal>

      {/* Core Working Feature Cards */}
      <ScrollReveal delay={200}>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 ${card.borderClass} hover:-translate-y-1 group`}
              onClick={() => navigate(card.route)}
            >
              <CardHeader className="p-3.5 md:p-5">
                <card.icon
                  className={`h-6 w-6 md:h-7 md:w-7 ${card.iconClass} mb-1.5 transition-transform duration-300 group-hover:scale-110`}
                />
                <CardTitle className="text-sm md:text-base">{card.title}</CardTitle>
                <CardDescription className="text-xs">{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </ScrollReveal>

      {/* Live Study Materials from Database */}
      <ScrollReveal>
        <section id="sheets" className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold dark:text-neon-teal">
              Latest Study Materials
            </h2>
            <button
              onClick={() => navigate("/app/materials")}
              className="text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              View All →
            </button>
          </div>

          {loadingMaterials ? (
            <p className="text-sm text-muted-foreground py-6">Loading latest notes...</p>
          ) : liveMaterials.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No materials uploaded yet. Be the first to publish in Creator Studio!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {liveMaterials.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/app/materials/${item.id}`)}
                  className="cursor-pointer"
                >
                  <MaterialCard
                    title={item.title}
                    author={item.class_level || "Eduminity Creator"}
                    description={item.description || "Verified study material"}
                    subject={item.category}
                    rating={5.0}
                    price={item.price === 0 ? "Free" : `৳${item.price}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <CommunitySection />
      </ScrollReveal>

      <Footer />
    </AppLayout>
  );
};

export default AppHome;