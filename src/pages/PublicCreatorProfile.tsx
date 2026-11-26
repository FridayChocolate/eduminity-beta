import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Star,
  ShieldCheck,
  Sparkles,
  Flame,
  Trophy,
  BookOpen,
  GraduationCap,
  Award,
  Zap,
  Crown,
  Shield,
  FileCheck2,
  BadgeCheck,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestHelpDialog } from "@/components/help-request";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  BANNER_PRESETS,
  computeProfileGamification,
  AchievementBadge,
  BadgeRarity,
} from "@/lib/gamification";
import { InteractiveCoverBanner } from "@/components/InteractiveCoverBanner";

const RARITY_STYLES: Record<BadgeRarity, string> = {
  common: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  rare: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  epic: "border-purple-500/40 bg-purple-500/15 text-purple-300",
  legendary:
    "border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  mythic:
    "border-fuchsia-500/60 bg-gradient-to-r from-purple-500/20 via-teal-500/20 to-rose-500/20 text-white shadow-[0_0_25px_rgba(168,85,247,0.25)]",
};

const renderBadgeIcon = (icon: AchievementBadge["icon"]) => {
  const cls = "h-4 w-4";
  switch (icon) {
    case "shield":
      return <Shield className={cls} />;
    case "zap":
      return <Zap className={cls} />;
    case "flame":
      return <Flame className={cls} />;
    case "crown":
      return <Crown className={cls} />;
    case "star":
      return <Star className={cls} />;
    case "book":
      return <BookOpen className={cls} />;
    case "award":
      return <Award className={cls} />;
    case "trophy":
      return <Trophy className={cls} />;
    case "fileCheck":
      return <FileCheck2 className={cls} />;
  }
};

export default function PublicCreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profileRecord, setProfileRecord] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [salesRows, setSalesRows] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCreator = async () => {
      setLoading(true);
      try {
        const slug = decodeURIComponent(username || "").toLowerCase().trim();

        const { data: allProfiles } = await (supabase as any)
          .from("profiles")
          .select("*");

        const matched = (allProfiles || []).find((p: any) => {
          const pId = String(p.id || "").toLowerCase();
          const pUser = String(p.username || "").toLowerCase();
          const pNameSlug = String(p.full_name || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");
          return pId === slug || pUser === slug || pNameSlug === slug;
        });

        if (cancelled) return;

        if (!matched) {
          setProfileRecord(null);
          setLoading(false);
          return;
        }

        setProfileRecord(matched);

        const { data: matsData } = await (supabase as any)
          .from("materials")
          .select("*")
          .eq("user_id", matched.id)
          .order("created_at", { ascending: false });

        const creatorMats = matsData || [];
        const matIds = creatorMats.map((m: any) => m.id);

        let creatorSales: any[] = [];
        let creatorReviews: any[] = [];

        if (matIds.length > 0) {
          const [salesRes, reviewsRes] = await Promise.all([
            (supabase as any)
              .from("purchases")
              .select("*")
              .in("material_id", matIds),
            (supabase as any)
              .from("material_reviews")
              .select("*")
              .in("material_id", matIds),
          ]);
          creatorSales = salesRes.data || [];
          creatorReviews = reviewsRes.data || [];
        }

        if (cancelled) return;
        setNotes(creatorMats);
        setSalesRows(creatorSales);
        setReviews(creatorReviews);
      } catch (err) {
        console.error("Failed to load public creator profile:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCreator();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleSubmitRating = () => {
    if (ratingValue === 0) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Thank you for your feedback!");
    setRateDialogOpen(false);
    setRatingValue(0);
    setReviewText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading creator showcase...</p>
        </div>
      </div>
    );
  }

  if (!profileRecord) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          This creator profile link may have changed or hasn&apos;t been set up yet.
        </p>
        <Button onClick={() => navigate("/app/materials")}>Browse Study Hub</Button>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
      : 5.0;

  const syntheticMeta = {
    ...profileRecord,
    student_id_card_url: profileRecord.has_id_proof ? "verified" : "",
    academic_proof_url: profileRecord.has_merit_proof ? "verified" : "",
  };

  const gamification = computeProfileGamification({
    meta: syntheticMeta,
    email: profileRecord.email,
    publishedMaterials: notes,
    salesRows,
    unlockedPurchases: [],
    reviewsWrittenCount: 0,
    averageRating: avgRating,
  });

  const unlockedBadges = gamification.badges.filter((b) => b.unlocked);
  const selectedBanner =
    BANNER_PRESETS.find((b) => b.id === profileRecord.banner_preset) ||
    BANNER_PRESETS[0];
  const customBannerUrl = profileRecord.custom_banner_url;
  const displayName = profileRecord.full_name || "Eduminity Creator";

  return (
    <>
      <Seo>
        <title>{displayName} — Creator Showcase | Eduminity</title>
        <meta
          name="description"
          content={
            profileRecord.bio ||
            `Explore verified study notes and academic guides published by ${displayName} on Eduminity.`
          }
        />
      </Seo>

      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold leading-tight">{displayName}</h1>
                <p className="text-xs text-muted-foreground">
                  Level {gamification.levelInfo.level} • {gamification.levelInfo.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRateDialogOpen(true)}
              >
                <Star className="h-4 w-4 mr-1.5 text-amber-400" />
                Rate
              </Button>
              <Button
                size="sm"
                onClick={() => setHelpDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                Request Notes
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
          {/* Hero Banner + Avatar + Verified Proof Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-2xl"
          >
            <InteractiveCoverBanner
              customBannerUrl={customBannerUrl}
              presetClassName={selectedBanner.className}
              posX={profileRecord.banner_pos_x ?? 50}
              posY={profileRecord.banner_pos_y ?? 35}
              zoom={profileRecord.banner_zoom ?? 1}
              heightClass="h-44 sm:h-56"
              topRightSlot={
                <Badge className="bg-black/65 backdrop-blur-md text-white border-white/15 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
                  Level {gamification.levelInfo.level} • {gamification.levelInfo.xp} XP
                </Badge>
              }
            />

            {/* Creator Identity & Metrics */}
            <div className="px-6 pb-6 -mt-14 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div
                    className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card bg-gradient-to-br from-purple-600 to-teal-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shrink-0 ${gamification.levelInfo.avatarFrame.ringClass} ${gamification.levelInfo.avatarFrame.glowClass}`}
                  >
                    {profileRecord.avatar_url ? (
                      <img
                        src={profileRecord.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                      {(profileRecord.has_id_proof || profileRecord.has_merit_proof) && (
                        <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/30">
                          <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                          Verified Credentials
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                      {profileRecord.institution && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {profileRecord.institution}
                        </span>
                      )}
                      {profileRecord.department && <span>• {profileRecord.department}</span>}
                    </p>
                  </div>
                </div>

                {/* Quick Metric Pills */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border/60 text-center">
                    <p className="text-base font-bold text-foreground">{notes.length}</p>
                    <p className="text-[11px] text-muted-foreground">Notes</p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border/60 text-center">
                    <p className="text-base font-bold text-amber-400">
                      {avgRating.toFixed(1)} ★
                    </p>
                    <p className="text-[11px] text-muted-foreground">Rating</p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border/60 text-center">
                    <p className="text-base font-bold text-orange-400 flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4" />
                      {gamification.weeklyStreak}w
                    </p>
                    <p className="text-[11px] text-muted-foreground">Streak</p>
                  </div>
                </div>
              </div>

              {profileRecord.bio && (
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-3xl">
                  {profileRecord.bio}
                </p>
              )}

              {/* Public Creator Proof & Academic Verification Strip */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Academic Standing
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {profileRecord.cgpa ? `CGPA: ${profileRecord.cgpa}` : "Verified Student"}
                  </p>
                  {profileRecord.honors && (
                    <p className="text-xs text-amber-300">{profileRecord.honors}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Document Verification
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {profileRecord.has_id_proof && (
                      <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px]">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Student ID Verified
                      </Badge>
                    )}
                    {profileRecord.has_merit_proof && (
                      <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/30 text-[10px]">
                        <FileCheck2 className="h-3 w-3 mr-1" />
                        Merit Sheet Verified
                      </Badge>
                    )}
                    {!profileRecord.has_id_proof && !profileRecord.has_merit_proof && (
                      <span className="text-xs text-muted-foreground">Standard Member</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    External Portfolio
                  </p>
                  {profileRecord.portfolio_url ? (
                    <a
                      href={profileRecord.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:underline font-medium"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      View Creator Portfolio
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">No external link attached</p>
                  )}
                </div>
              </div>

              {/* Earned Badges Showcase */}
              {unlockedBadges.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Unlocked Achievements ({unlockedBadges.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unlockedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${RARITY_STYLES[badge.rarity]}`}
                      >
                        {renderBadgeIcon(badge.icon)}
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Published Notes Grid */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold">
              Published Study Materials ({notes.length})
            </h3>

            {notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {displayName} hasn&apos;t published any study notes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/app/materials/${note.id}`)}
                    className="cursor-pointer rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {note.category || "General"}
                        </Badge>
                        <span className="text-sm font-bold text-teal-400">
                          {Number(note.price) === 0 ? "Free" : `৳${note.price}`}
                        </span>
                      </div>
                      <h4 className="font-semibold text-base text-foreground line-clamp-2">
                        {note.title}
                      </h4>
                      {note.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                          {note.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{note.class_level || "University"}</span>
                      <span>{note.page_count ? `${note.page_count} pages` : "PDF Note"}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>

      <RequestHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        contributorName={displayName}
        contributorId={profileRecord.id}
      />

      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate {displayName}</DialogTitle>
            <DialogDescription>
              Share your experience with this creator&apos;s study materials
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= ratingValue
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="review">Your Review (optional)</Label>
              <Textarea
                id="review"
                placeholder="Tell others about your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleSubmitRating}
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}