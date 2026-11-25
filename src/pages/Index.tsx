import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrendingSection } from "@/components/TrendingSection";
import { MaterialCard } from "@/components/MaterialCard";
import { CommunitySection } from "@/components/CommunitySection";
import { Footer } from "@/components/Footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/hooks/useScrollReveal";

type StudyMaterialCard = {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  rating: number;
  price: string;
};

const Index = () => {
  const navigate = useNavigate();
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialCard[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStudyMaterials = async () => {
      const { data, error } = await (supabase as any)
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (cancelled) return;

      if (error || !data) {
        setStudyMaterials([]);
        setMaterialsLoading(false);
        return;
      }

      const userIds = [
        ...new Set(data.map((row: any) => row.user_id).filter(Boolean)),
      ] as string[];

      const { data: profiles } = userIds.length
        ? await (supabase as any)
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)
        : { data: [] };

      if (cancelled) return;

      const authorById = new Map<string, string>(
        (profiles || []).map((profile: any): [string, string] => [
          profile.id,
          profile.full_name || "Creator",
        ])
      );

      setStudyMaterials(
        data.map((row: any) => ({
          id: row.id,
          title: row.title || "Untitled Material",
          author: authorById.get(row.user_id) || row.class_level || "Eduminity Creator",
          description: row.description ?? "",
          subject: row.category || row.subject || "General",
          rating: row.rating ?? 5,
          price: !row.price || Number(row.price) === 0 ? "Free" : `৳${row.price}`,
        }))
      );
      setMaterialsLoading(false);
    };

    fetchStudyMaterials();

    return () => {
      cancelled = true;
    };
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
      description: "Get peer answers to your academic questions",
      iconClass: "text-indigo-400",
      borderClass: "hover:border-indigo-500/50",
      route: "/app/questions",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with students and share study resources",
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
    <div className="min-h-screen bg-background font-['Inter']">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-3 md:p-6 min-w-0">
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

          {/* Latest Study Materials */}
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

              {materialsLoading ? (
                <p className="text-sm text-muted-foreground mb-6">Loading study materials...</p>
              ) : studyMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-6">No study materials yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {studyMaterials.map((material, index) => (
                    <ScrollReveal key={material.id} delay={index * 80}>
                      <div
                        onClick={() => navigate(`/app/materials/${material.id}`)}
                        className="cursor-pointer"
                      >
                        <MaterialCard
                          title={material.title}
                          author={material.author}
                          description={material.description}
                          subject={material.subject}
                          rating={material.rating}
                          price={material.price}
                        />
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <CommunitySection />
          </ScrollReveal>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Index;