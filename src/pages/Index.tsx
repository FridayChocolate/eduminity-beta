import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrendingSection } from "@/components/TrendingSection";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { MaterialCard } from "@/components/MaterialCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { CommunitySection } from "@/components/CommunitySection";
import { Footer } from "@/components/Footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Users, Award, Heart, Crown } from "lucide-react";
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
        console.log(error);
        setStudyMaterials([]);
        setMaterialsLoading(false);
        return;
      }

      const userIds = [
        ...new Set(data.map((row: any) => row.user_id).filter(Boolean)),
      ] as string[];

      const { data: profiles, error: profilesError } = userIds.length
        ? await (supabase as any)
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)
        : { data: [], error: null };

      if (profilesError) {
        console.log(profilesError);
      }

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
          author: authorById.get(row.user_id) || "Creator",
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
    { icon: HelpCircle, title: "Q&A Help", description: "Get expert answers to your academic questions", color: "neon-teal", route: "/app/questions" },
    { icon: BookOpen, title: "Study Hub", description: "Quick summaries, notes & study guides", color: "neon-violet", route: "/app/materials" },
    { icon: Users, title: "Community", description: "Connect with students and share knowledge", color: "neon-magenta", route: "/app/community" },
    { icon: Award, title: "Achievements", description: "Earn badges and climb the leaderboard", color: "yellow-500", route: null },
    { icon: Heart, title: "Donate", description: "Support students with free study materials", color: "red-500", route: "/app/donate" },
    { icon: Crown, title: "Premium", description: "Upgrade for ad-free and premium features", color: "purple-500", route: "/app/premium" },
  ];

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-3 md:p-6">
          <ScrollReveal>
            <HeroSection />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <SocialProofStrip />
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <TrendingSection />
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <SuccessStoryCard />
          </ScrollReveal>

          {/* Feature Cards */}
          <ScrollReveal delay={250}>
            <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {featureCards.map((card, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-${card.color}/50 hover:-translate-y-1 group`}
                  onClick={() => card.route && navigate(card.route)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <CardHeader className="p-3 md:p-6">
                    <card.icon className={`h-6 w-6 md:h-8 md:w-8 text-${card.color} mb-1 md:mb-2 transition-transform duration-300 group-hover:scale-110`} />
                    <CardTitle className="text-sm md:text-base">{card.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </section>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <ScrollReveal>
                <section id="sheets" className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 dark:text-neon-teal">Study Materials</h2>
                  {materialsLoading ? (
                    <p className="text-sm text-muted-foreground mb-6">Loading study materials...</p>
                  ) : studyMaterials.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-6">No study materials yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {studyMaterials.map((material, index) => (
                        <ScrollReveal key={material.id} delay={index * 100}>
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
            </div>

            <aside className="hidden xl:block w-80">
              <ScrollReveal direction="left">
                <LeaderboardCard />
              </ScrollReveal>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;