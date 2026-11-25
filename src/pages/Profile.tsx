import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth, openContributorOnboarding } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Mail,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  Save,
  BookOpen,
  Star,
  Wallet,
  Trophy,
  Flame,
  TrendingUp,
  Image as ImageIcon,
  Lock,
  CheckCircle2,
  ExternalLink,
  Zap,
  Crown,
  Shield,
  Award,
  Upload,
  UserCheck,
  ArrowUpRight,
  Camera,
  FileCheck2,
  Link2,
  Calculator,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import {
  BANNER_PRESETS,
  computeProfileGamification,
  AchievementBadge,
  BadgeRarity,
  BuyoutActivity,
  isAdminEmail,
} from "@/lib/gamification";
import { uploadProfileAsset } from "@/lib/profileMedia";

type HubTab = "showcase" | "achievements" | "banners" | "details";

const RARITY_CARD_STYLES: Record<BadgeRarity, string> = {
  common: "border-slate-500/30 bg-slate-500/5",
  rare: "border-cyan-500/40 bg-cyan-500/10",
  epic: "border-purple-500/45 bg-purple-500/10",
  legendary:
    "border-amber-500/50 bg-amber-500/10 shadow-[0_0_24px_rgba(245,158,11,0.16)]",
  mythic:
    "border-fuchsia-500/60 bg-gradient-to-br from-purple-500/15 via-teal-500/15 to-rose-500/15 shadow-[0_0_32px_rgba(168,85,247,0.25)]",
};

const RARITY_PILL_STYLES: Record<BadgeRarity, string> = {
  common: "bg-slate-500/20 text-slate-300",
  rare: "bg-cyan-500/20 text-cyan-300",
  epic: "bg-purple-500/20 text-purple-300",
  legendary: "bg-amber-500/20 text-amber-300",
  mythic: "bg-gradient-to-r from-purple-500 to-teal-500 text-white",
};

const renderBadgeIcon = (icon: AchievementBadge["icon"], unlocked: boolean) => {
  const cls = `h-5 w-5 ${unlocked ? "" : "opacity-40"}`;
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

export default function Profile() {
  const {
    user,
    canAccessCreator,
    hasCompletedCreatorProfile,
    activeMode,
    refreshUser,
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sliding view between Student Mode and Creator Mode (always available!)
  const [profileRoleView, setProfileRoleView] = useState<"student" | "contributor">(
    activeMode === "contributor" ? "contributor" : "student"
  );
  const [activeTab, setActiveTab] = useState<HubTab>("showcase");

  // Media URLs
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedBannerId, setSelectedBannerId] = useState("academic-slate");
  const [customBannerUrl, setCustomBannerUrl] = useState<string | null>(null);
  const [idCardUrl, setIdCardUrl] = useState<string>("");
  const [meritProofUrl, setMeritProofUrl] = useState<string>("");

  // Upload loaders
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingMerit, setUploadingMerit] = useState(false);

  // Shared & Student fields
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [bio, setBio] = useState("");

  // Creator-only fields
  const [studentId, setStudentId] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [honors, setHonors] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [creatorTagline, setCreatorTagline] = useState("");
  const [expertise, setExpertise] = useState("");
  const [payoutNumber, setPayoutNumber] = useState("");

  // Interactive Royalty Calculator (shown when sliding to Creator before initiation)
  const [simPrice, setSimPrice] = useState(120);
  const [simBuyers, setSimBuyers] = useState(25);

  // Real database collections
  const [publishedMaterials, setPublishedMaterials] = useState<any[]>([]);
  const [salesRows, setSalesRows] = useState<any[]>([]);
  const [unlockedPurchases, setUnlockedPurchases] = useState<any[]>([]);
  const [latestBuyouts, setLatestBuyouts] = useState<BuyoutActivity[]>([]);
  const [reviewsWrittenCount, setReviewsWrittenCount] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [saving, setSaving] = useState(false);

  const isAdmin = isAdminEmail(user?.email);
  const isInitiatedCreator = Boolean(canAccessCreator && hasCompletedCreatorProfile);
  const isCreatorSlide = profileRoleView === "contributor";

  useEffect(() => {
    setProfileRoleView(activeMode === "contributor" ? "contributor" : "student");
  }, [activeMode]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    setAvatarUrl(meta.avatar_url || "");
    setFullName(meta.full_name || "");
    setInstitution(meta.institution || "");
    setDepartment(meta.department || "");
    setSemester(meta.semester || "");
    setBio(meta.bio || "");
    setStudentId(meta.student_id || "");
    setCgpa(meta.cgpa || "");
    setHonors(meta.honors || "");
    setPortfolioUrl(meta.portfolio_url || "");
    setCreatorTagline(meta.creator_tagline || "");
    setExpertise(meta.expertise || "");
    setPayoutNumber(meta.payout_number || "");
    setSelectedBannerId(meta.banner_preset || "academic-slate");
    setCustomBannerUrl(meta.custom_banner_url || null);
    setIdCardUrl(meta.student_id_card_url || "");
    setMeritProofUrl(meta.academic_proof_url || "");

    let cancelled = false;

    const fetchGamificationData = async () => {
      setLoadingStats(true);
      try {
        const [materialsRes, myPurchasesRes, myReviewsRes] = await Promise.all([
          (supabase as any)
            .from("materials")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("material_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        const myMaterials = materialsRes.data || [];
        const myPurchases = myPurchasesRes.data || [];
        const myMatIds = myMaterials.map((m: any) => m.id);

        let mySales: any[] = [];
        let receivedReviews: any[] = [];

        if (myMatIds.length > 0) {
          const [salesRes, recRevRes] = await Promise.all([
            (supabase as any)
              .from("purchases")
              .select("*")
              .in("material_id", myMatIds)
              .order("created_at", { ascending: false }),
            (supabase as any)
              .from("material_reviews")
              .select("rating")
              .in("material_id", myMatIds),
          ]);
          mySales = salesRes.data || [];
          receivedReviews = recRevRes.data || [];
        }

        const purchasedMatIds = [
          ...new Set(myPurchases.map((p: any) => p.material_id).filter(Boolean)),
        ] as string[];
        const allMatMap = new Map<string, any>(
          myMaterials.map((m: any) => [m.id, m])
        );

        if (purchasedMatIds.length > 0) {
          const { data: extraMats } = await (supabase as any)
            .from("materials")
            .select("id, title, price")
            .in("id", purchasedMatIds);
          for (const em of extraMats || []) {
            allMatMap.set(em.id, em);
          }
        }

        const buyoutFeed: BuyoutActivity[] = [];

        for (const s of mySales) {
          if (String(s.status || "").toLowerCase() !== "approved") continue;
          const mat = allMatMap.get(s.material_id);
          const gross = Number(s.amount ?? mat?.price ?? 0);
          buyoutFeed.push({
            id: `sale-${s.id}`,
            type: "sale",
            materialId: s.material_id,
            title: mat?.title || "Study Material",
            amount: Math.round(gross * 0.8),
            createdAt: s.created_at,
          });
        }

        for (const p of myPurchases) {
          if (String(p.status || "").toLowerCase() !== "approved") continue;
          const mat = allMatMap.get(p.material_id);
          buyoutFeed.push({
            id: `unlock-${p.id}`,
            type: "unlocked",
            materialId: p.material_id,
            title: mat?.title || "Study Material",
            amount: Number(p.amount ?? mat?.price ?? 0),
            createdAt: p.created_at,
          });
        }

        buyoutFeed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const avg =
          receivedReviews.length > 0
            ? receivedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
              receivedReviews.length
            : 5.0;

        if (cancelled) return;
        setPublishedMaterials(myMaterials);
        setSalesRows(mySales);
        setUnlockedPurchases(myPurchases);
        setLatestBuyouts(buyoutFeed.slice(0, 6));
        setReviewsWrittenCount(myReviewsRes.count || 0);
        setAverageRating(avg);
      } catch (err) {
        console.error("Profile stats load error:", err);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    fetchGamificationData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const currentMeta = {
    ...(user?.user_metadata || {}),
    avatar_url: avatarUrl,
    full_name: fullName,
    institution,
    department,
    semester,
    cgpa,
    honors,
    portfolio_url: portfolioUrl,
    bio,
    student_id: studentId,
    creator_tagline: creatorTagline,
    expertise,
    payout_number: payoutNumber,
    banner_preset: selectedBannerId,
    custom_banner_url: customBannerUrl,
    student_id_card_url: idCardUrl,
    academic_proof_url: meritProofUrl,
  };

  const gamification = computeProfileGamification({
    meta: currentMeta,
    email: user?.email,
    publishedMaterials,
    salesRows,
    unlockedPurchases,
    reviewsWrittenCount,
    averageRating,
  });

  const syncProfileUpdate = async (extraData: Record<string, any> = {}) => {
    if (!user) return;
    const merged = {
      avatar_url: avatarUrl,
      full_name: fullName.trim(),
      institution: institution.trim(),
      department: department.trim(),
      semester: semester.trim(),
      cgpa: cgpa.trim(),
      honors: honors.trim(),
      portfolio_url: portfolioUrl.trim(),
      bio: bio.trim(),
      student_id: studentId.trim(),
      creator_tagline: creatorTagline.trim(),
      expertise: expertise.trim(),
      payout_number: payoutNumber.trim(),
      banner_preset: selectedBannerId,
      custom_banner_url: customBannerUrl,
      student_id_card_url: idCardUrl,
      academic_proof_url: meritProofUrl,
      ...extraData,
    };

    const { error } = await supabase.auth.updateUser({ data: merged });
    if (error) throw error;

    try {
      await (supabase as any).from("profiles").upsert({
        id: user.id,
        full_name: merged.full_name,
        email: user.email,
        avatar_url: merged.avatar_url,
        institution: merged.institution,
        department: merged.department,
        cgpa: merged.cgpa,
        honors: merged.honors,
        portfolio_url: merged.portfolio_url,
        bio: merged.bio,
        banner_preset: merged.banner_preset,
        custom_banner_url: merged.custom_banner_url,
        has_id_proof: Boolean(merged.student_id_card_url),
        has_merit_proof: Boolean(merged.academic_proof_url),
      });
    } catch {
      // Ignore optional column mismatches in profiles table
    }

    await refreshUser();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadProfileAsset(user.id, "avatars", file);
      setAvatarUrl(publicUrl);
      await syncProfileUpdate({ avatar_url: publicUrl });

      toast({
        title: "Profile photo updated!",
        description: "Your new avatar is live across Eduminity.",
      });
    } catch (err: any) {
      toast({
        title: "Photo upload failed",
        description: err.message || "Could not upload profile photo.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "id" | "merit"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (kind === "id") setUploadingId(true);
    else setUploadingMerit(true);

    try {
      const publicUrl = await uploadProfileAsset(user.id, "proofs", file);
      if (kind === "id") {
        setIdCardUrl(publicUrl);
        await syncProfileUpdate({ student_id_card_url: publicUrl });
        toast({
          title: "University ID Card Attached!",
          description: "+50 XP earned toward your Authenticated Creator badge.",
        });
      } else {
        setMeritProofUrl(publicUrl);
        await syncProfileUpdate({ academic_proof_url: publicUrl });
        toast({
          title: "Academic Merit Proof Attached!",
          description: "+50 XP earned! Your Creator Proof Score just increased.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Proof upload failed",
        description: err.message || "Could not upload proof file.",
        variant: "destructive",
      });
    } finally {
      if (kind === "id") setUploadingId(false);
      else setUploadingMerit(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await syncProfileUpdate();
      toast({
        title: isCreatorSlide ? "Creator profile saved" : "Student profile saved",
        description: "Your XP and completion meter have been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectBannerPreset = async (presetId: string) => {
    setSelectedBannerId(presetId);
    setCustomBannerUrl(null);
    try {
      await syncProfileUpdate({ banner_preset: presetId, custom_banner_url: null });
      toast({
        title: "Banner equipped!",
        description: "Your new profile cover banner is now active.",
      });
    } catch (err: any) {
      toast({
        title: "Could not equip banner",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCustomBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!gamification.levelInfo.canUploadCustomBanner) {
      toast({
        title: "Level 5 Required",
        description: "Reach Level 5 (1,500 XP) to unlock custom cover banner uploads.",
        variant: "destructive",
      });
      return;
    }

    setUploadingBanner(true);
    try {
      const publicUrl = await uploadProfileAsset(user.id, "banners", file);
      setCustomBannerUrl(publicUrl);
      await syncProfileUpdate({ custom_banner_url: publicUrl });

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      toast({
        title: "Custom Cover Banner Live!",
        description: "Your custom artwork has been uploaded and equipped.",
      });
    } catch (err: any) {
      toast({
        title: "Banner upload failed",
        description: err.message || "Could not upload banner image.",
        variant: "destructive",
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const activePreset =
    BANNER_PRESETS.find((b) => b.id === selectedBannerId) || BANNER_PRESETS[0];

  const getInitials = () => {
    if (fullName.trim()) {
      return fullName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return (user?.email?.[0] || "U").toUpperCase();
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const activeCompletion = isCreatorSlide
    ? gamification.creatorComp
    : gamification.studentComp;

  const unlockedBadgesCount = gamification.badges.filter((b) => b.unlocked).length;
  const projectedMonthlyEarnings = Math.round(simPrice * simBuyers * 0.8);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Subtle Ambient Aura Glow */}
      <div
        className={`pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[42rem] rounded-full blur-3xl transition-colors duration-700 ${
          isCreatorSlide
            ? "bg-gradient-to-r from-purple-600/20 via-fuchsia-500/15 to-teal-500/15"
            : "bg-gradient-to-r from-teal-500/15 via-cyan-500/10 to-indigo-600/15"
        }`}
      />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative">
        {/* Top Bar with Prominent Student <-> Creator Sliding Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(
                activeMode === "contributor"
                  ? "/app/creator-studio"
                  : "/app/student-dashboard"
              )
            }
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {activeMode === "contributor" ? "Creator Studio" : "Dashboard"}
          </Button>

          {/* Animated Sliding Mode Pill (Always available so students can preview Creator Mode!) */}
          <div className="relative inline-flex rounded-2xl bg-muted/70 p-1 border border-border/80 shadow-inner">
            <button
              type="button"
              onClick={() => setProfileRoleView("student")}
              className={`relative z-10 px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                !isCreatorSlide
                  ? "text-slate-950"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {!isCreatorSlide && (
                <motion.div
                  layoutId="profileModeSliderPill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-300 shadow-md -z-10"
                />
              )}
              <GraduationCap className="h-3.5 w-3.5" />
              Student Profile
            </button>

            <button
              type="button"
              onClick={() => setProfileRoleView("contributor")}
              className={`relative z-10 px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isCreatorSlide
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isCreatorSlide && (
                <motion.div
                  layoutId="profileModeSliderPill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-md -z-10"
                />
              )}
              <Sparkles className="h-3.5 w-3.5" />
              Creator Studio
              {!isInitiatedCreator && (
                <span className="ml-1 text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-white/15 text-purple-200">
                  Earn 80%
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isInitiatedCreator && user?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/creator/${user.id}`)}
                className="gap-1.5 text-xs border-teal-500/30 hover:border-teal-400"
              >
                <ExternalLink className="h-3.5 w-3.5 text-teal-400" />
                Public Showcase
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-1.5 text-xs border-rose-500/40 text-rose-400"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </Button>
            )}
          </div>
        </div>

        {/* Cinema Hero Banner + Click-to-Upload Avatar + Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="bg-card/90 backdrop-blur-xl border-border/80 overflow-hidden shadow-2xl">
            {/* Cover Banner */}
            <div
              className={`h-44 sm:h-52 w-full relative transition-all duration-700 ${
                !customBannerUrl ? activePreset.className : "bg-slate-900"
              }`}
              style={
                customBannerUrl
                  ? {
                      backgroundImage: `url(${customBannerUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

              <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                <Badge className="bg-black/65 backdrop-blur-md text-white border-white/15 px-3 py-1 text-xs shadow-lg">
                  <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  Level {gamification.levelInfo.level} • {gamification.levelInfo.title}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setProfileRoleView("student");
                    setActiveTab("banners");
                  }}
                  className="h-7 px-2.5 text-xs bg-black/65 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md"
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1" />
                  Banner
                </Button>
              </div>
            </div>

            <CardContent className="pt-0 px-5 sm:px-7 pb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 relative">
                {/* Click-to-Upload Avatar + Identity */}
                <div className="flex items-end gap-4">
                  <div className="relative group shrink-0">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingAvatar}
                      onChange={handleAvatarUpload}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => avatarInputRef.current?.click()}
                      title="Click to upload profile picture"
                      className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-card bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-500 text-white overflow-hidden relative ${gamification.levelInfo.avatarFrame.ringClass} ${gamification.levelInfo.avatarFrame.glowClass}`}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName || "Profile photo"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials()
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                        {uploadingAvatar ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Camera className="h-5 w-5 text-teal-300" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                              {avatarUrl ? "Change" : "Upload"}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Upload profile photo"
                      className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-card transition-transform hover:scale-110"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {fullName || "Eduminity Member"}
                      </h1>
                      {isInitiatedCreator && gamification.proofStatus.isFullyProven && (
                        <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/35 text-xs gap-1">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified Credentials
                        </Badge>
                      )}
                    </div>

                    {isCreatorSlide && creatorTagline ? (
                      <p className="text-xs sm:text-sm text-purple-400 font-medium mt-0.5">
                        {creatorTagline}
                      </p>
                    ) : institution ? (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {institution}
                        {department ? ` • ${department}` : ""}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[11px] gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </Badge>
                      {isInitiatedCreator && (
                        <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[11px] gap-1">
                          <Sparkles className="h-3 w-3" />
                          Creator
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {joinedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role-Aware Quick Counters */}
                <div className="flex items-center gap-2 self-start md:self-end">
                  {isCreatorSlide && isInitiatedCreator && (
                    <div className="px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/25 text-center">
                      <p className="text-base font-bold text-teal-400">
                        {gamification.proofStatus.scorePercent}%
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Proof Score
                      </p>
                    </div>
                  )}

                  {isInitiatedCreator && (
                    <div className="px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/25 text-center">
                      <p className="text-base font-bold text-orange-400 flex items-center justify-center gap-1">
                        <Flame className="h-4 w-4" />
                        {gamification.weeklyStreak}w
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Streak
                      </p>
                    </div>
                  )}

                  <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-center">
                    <p className="text-base font-bold text-purple-400 flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {unlockedBadgesCount}/{gamification.badges.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Badges
                    </p>
                  </div>
                </div>
              </div>

              {/* XP Bar + Role-Specific Completion Bar */}
              <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-teal-400" />
                      {gamification.levelInfo.xp} XP •{" "}
                      <span className="text-purple-400">
                        {gamification.levelInfo.avatarFrame.name}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {gamification.levelInfo.nextLevelXp
                        ? `${gamification.levelInfo.nextLevelXp - gamification.levelInfo.xp} XP to Lv.${gamification.levelInfo.level + 1}`
                        : "Max Level Reached"}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gamification.levelInfo.progressPercent}%` }}
                      transition={{ duration: 0.85, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* Only show completion bar for Student OR Initiated Creator */}
                {(!isCreatorSlide || isInitiatedCreator) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                        {isCreatorSlide ? "Creator Dossier" : "Student Profile"} Completion:{" "}
                        {activeCompletion.percent}%
                      </span>
                      {!activeCompletion.isComplete ? (
                        <button
                          onClick={() => setActiveTab("details")}
                          className="text-teal-400 hover:underline font-medium"
                        >
                          Complete for bonus XP →
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-medium">100% Complete</span>
                      )}
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeCompletion.percent}%` }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SLIDE BODY: Switches smoothly between Student Mode and Creator Mode */}
        <AnimatePresence mode="wait">
          {/* ===================================================================== */}
          {/* VIEW A: CREATOR MODE SLIDE FOR UN-INITIATED STUDENTS (MARKETING HOOK) */}
          {/* ===================================================================== */}
          {isCreatorSlide && !isInitiatedCreator ? (
            <motion.div
              key="creator-marketing-pitch"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-purple-500/45 bg-gradient-to-br from-purple-950/45 via-card to-teal-950/30 overflow-hidden shadow-2xl">
                <CardContent className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                  <div className="lg:col-span-3 space-y-4">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/35 text-xs px-3 py-1">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Eduminity Creator Program • 80% Royalty
                    </Badge>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                      Monetize Your Lecture Notes &amp; Build Campus Authority
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You already take great notes and solve tough semester papers. Complete a quick 2-step Creator Initiation to unlock your public showcase, earn{" "}
                      <span className="text-emerald-400 font-semibold">80% on every sale</span>{" "}
                      directly to bKash/Nagad, and unlock custom cover banners.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Wallet className="h-4 w-4 text-emerald-400 mb-1" />
                        <p className="text-xs font-bold">80% Instant Share</p>
                        <p className="text-[11px] text-muted-foreground">
                          Direct bKash &amp; Nagad withdrawals
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <ShieldCheck className="h-4 w-4 text-teal-400 mb-1" />
                        <p className="text-xs font-bold">Proof Vault Badge</p>
                        <p className="text-[11px] text-muted-foreground">
                          Stand out with verified merit
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Crown className="h-4 w-4 text-amber-400 mb-1" />
                        <p className="text-xs font-bold">Level 5 Banners</p>
                        <p className="text-[11px] text-muted-foreground">
                          Custom cover art &amp; mythic rings
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Button
                        size="lg"
                        onClick={() => openContributorOnboarding()}
                        className="bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-95 text-white font-bold shadow-xl"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Creator Initiation (2 Steps)
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Takes ~60 seconds • Keep full Student Library access
                      </span>
                    </div>
                  </div>

                  {/* Interactive 80% Royalty Calculator */}
                  <div className="lg:col-span-2 rounded-2xl bg-black/45 border border-purple-500/25 p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                      <span className="flex items-center gap-1.5">
                        <Calculator className="h-4 w-4" />
                        Interactive Royalty Calculator
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                        80% Creator Cut
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Price Per Note</span>
                        <span className="text-foreground font-bold">৳{simPrice}</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={500}
                        step={10}
                        value={simPrice}
                        onChange={(e) => setSimPrice(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Classmates Buying / Month</span>
                        <span className="text-foreground font-bold">{simBuyers} students</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={150}
                        step={5}
                        value={simBuyers}
                        onChange={(e) => setSimBuyers(Number(e.target.value))}
                        className="w-full accent-teal-400 cursor-pointer"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Your Monthly Payout</p>
                        <p className="text-[11px] text-teal-400">
                          +{simBuyers * 60} XP earned from sales
                        </p>
                      </div>
                      <span className="text-2xl font-extrabold text-emerald-400">
                        ৳{projectedMonthlyEarnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* ===================================================================== */
            /* VIEW B: ACTIVE STUDENT PROFILE OR INITIATED CREATOR STUDIO HUB        */
            /* ===================================================================== */
            <motion.div
              key={isCreatorSlide ? "creator-hub" : "student-hub"}
              initial={{ opacity: 0, x: isCreatorSlide ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isCreatorSlide ? -20 : 20 }}
              transition={{ duration: 0.28 }}
              className="space-y-6"
            >
              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 scrollbar-hide">
                {[
                  {
                    id: "showcase",
                    label: isCreatorSlide ? "Creator Showcase & Proofs" : "Student Activity",
                    icon: TrendingUp,
                  },
                  {
                    id: "achievements",
                    label: `Trophy Room (${unlockedBadgesCount}/${gamification.badges.length})`,
                    icon: Trophy,
                  },
                  { id: "banners", label: "Banner Studio", icon: ImageIcon },
                  {
                    id: "details",
                    label: isCreatorSlide ? "Edit Credentials & Proofs" : "Edit Student Profile",
                    icon: UserCheck,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as HubTab)}
                      className={`relative px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? isCreatorSlide
                              ? "text-purple-400"
                              : "text-teal-400"
                            : ""
                        }`}
                      />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="profileSubTabUnderline"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                            isCreatorSlide
                              ? "bg-gradient-to-r from-purple-500 to-fuchsia-500"
                              : "bg-gradient-to-r from-teal-400 to-cyan-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {/* TAB 1: SHOWCASE (Role-Specific!) */}
                {activeTab === "showcase" && (
                  <motion.div
                    key="showcase"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {isCreatorSlide ? (
                      <>
                        {/* CREATOR PROOF VAULT (Shown ONLY in Creator Mode!) */}
                        <Card className="bg-card/95 border-purple-500/25">
                          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-purple-400" />
                                Creator Proof Vault &amp; Academic Standing
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Tangible academic proof displayed to students on your public creator showcase
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveTab("details")}
                              className="text-xs self-start sm:self-auto"
                            >
                              Update Proofs
                            </Button>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3.5 rounded-xl bg-muted/35 border border-border/50 space-y-1.5">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                University &amp; ID
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {institution || "Not set"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {studentId || "Not set"}
                                {cgpa ? ` • CGPA ${cgpa}` : ""}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-muted/35 border border-border/50 space-y-1.5">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Specialties &amp; Honors
                              </p>
                              <p className="text-sm font-semibold text-foreground">
                                {expertise || "Subjects not added"}
                              </p>
                              <p className="text-xs text-purple-300">
                                {honors || "Add Dean's List or batch rank"}
                              </p>
                              {portfolioUrl && (
                                <a
                                  href={portfolioUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline"
                                >
                                  <Link2 className="h-3 w-3" />
                                  Portfolio Link
                                </a>
                              )}
                            </div>

                            <div className="p-3.5 rounded-xl bg-muted/35 border border-border/50 space-y-2">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Verification Files
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">University ID Card</span>
                                {idCardUrl ? (
                                  <a
                                    href={idCardUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab("details")}
                                    className="text-amber-400 hover:underline"
                                  >
                                    + Upload (+50 XP)
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Merit / Grade Sheet</span>
                                {meritProofUrl ? (
                                  <a
                                    href={meritProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab("details")}
                                    className="text-amber-400 hover:underline"
                                  >
                                    + Upload (+50 XP)
                                  </button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* CREATOR 4 METRIC CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <Card className="bg-card border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Published Notes</p>
                              <p className="text-2xl font-bold mt-1 text-purple-400">
                                {loadingStats ? "..." : publishedMaterials.length}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {gamification.weeklyStreak}w publishing streak
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Net Earnings (80%)</p>
                              <p className="text-2xl font-bold mt-1 text-emerald-400">
                                {loadingStats
                                  ? "..."
                                  : `৳${gamification.totalCreatorEarnings.toLocaleString()}`}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {gamification.totalSalesCount} approved sales
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Creator Rating</p>
                              <p className="text-2xl font-bold mt-1 text-amber-400">
                                {publishedMaterials.length > 0
                                  ? `${averageRating.toFixed(1)} ★`
                                  : "—"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Student feedback score
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">Payout Account</p>
                              <p className="text-base font-bold mt-1.5 text-foreground truncate">
                                {payoutNumber || "Not set"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                bKash / Nagad
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* HIGHEST EARNING NOTES + LATEST SALES */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-emerald-400" />
                                Highest Earning Notes
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Ranked by your 80% net creator revenue
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                              {gamification.highestEarningNotes.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-2">
                                  <p className="text-xs text-muted-foreground">
                                    No notes published yet. Upload your first guide to earn +120 XP!
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate("/app/upload-notes")}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    Upload First Note
                                  </Button>
                                </div>
                              ) : (
                                gamification.highestEarningNotes.map((note, idx) => (
                                  <div
                                    key={note.id}
                                    onClick={() => navigate(`/app/materials/${note.id}`)}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/35 hover:bg-muted/60 border border-border/50 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                                        #{idx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                          {note.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {note.category} • {note.salesCount}{" "}
                                          {note.salesCount === 1 ? "sale" : "sales"}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-400 shrink-0">
                                      ৳{note.totalEarned.toLocaleString()}
                                    </p>
                                  </div>
                                ))
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-purple-400" />
                                Latest Note Sales
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Recent students who unlocked your study materials
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2.5">
                              {latestBuyouts.filter((b) => b.type === "sale").length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                                  <p className="text-xs text-muted-foreground">
                                    Approved student purchases will appear here automatically.
                                  </p>
                                </div>
                              ) : (
                                latestBuyouts
                                  .filter((b) => b.type === "sale")
                                  .map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        navigate(`/app/materials/${item.materialId}`)
                                      }
                                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/35 hover:bg-muted/60 border border-border/50 cursor-pointer transition-colors"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {item.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs shrink-0">
                                        +৳{item.amount}
                                      </Badge>
                                    </div>
                                  ))
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    ) : (
                      /* PURE STUDENT VIEW (Clean, zero ID/merit clutter!) */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Card className="bg-card border-border">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-teal-400" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-foreground">
                                  {loadingStats ? "..." : gamification.totalUnlockedCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Notes Unlocked
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                <Star className="h-5 w-5 text-amber-400" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-foreground">
                                  {loadingStats ? "..." : reviewsWrittenCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Reviews Written
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-card border-border">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-indigo-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                  {department || "Student Member"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {semester || institution || "Eduminity Learner"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Recent Unlocked Notes */}
                        <Card className="bg-card border-border">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-teal-400" />
                                Latest Unlocked Notes
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Study materials recently added to your library
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate("/app/materials")}
                              className="text-xs"
                            >
                              Explore Study Hub
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-2.5">
                            {latestBuyouts.filter((b) => b.type === "unlocked").length === 0 ? (
                              <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  You haven&apos;t unlocked any notes yet. Browse verified study guides in the Study Hub!
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate("/app/materials")}
                                >
                                  Browse Notes
                                </Button>
                              </div>
                            ) : (
                              latestBuyouts
                                .filter((b) => b.type === "unlocked")
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      navigate(`/app/materials/${item.materialId}`)
                                    }
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/35 hover:bg-muted/60 border border-border/50 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="h-8 w-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                                        <ArrowUpRight className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {item.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          Unlocked on{" "}
                                          {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="border-teal-500/40 text-teal-400 text-xs shrink-0"
                                    >
                                      {item.amount === 0 ? "Free" : `৳${item.amount}`}
                                    </Badge>
                                  </div>
                                ))
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </motion.div>
                )}

                {/* TAB 2: TROPHY ROOM */}
                {activeTab === "achievements" && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {gamification.badges.map((badge, idx) => {
                      const pct = Math.min(
                        100,
                        Math.round((badge.progress / badge.target) * 100)
                      );

                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                            badge.unlocked
                              ? RARITY_CARD_STYLES[badge.rarity]
                              : "border-border/50 bg-card/40 opacity-75"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                  badge.unlocked
                                    ? "bg-white/10 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {renderBadgeIcon(badge.icon, badge.unlocked)}
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  RARITY_PILL_STYLES[badge.rarity]
                                }`}
                              >
                                {badge.rarity}
                              </span>
                            </div>

                            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              {badge.name}
                              {badge.unlocked && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {badge.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">
                                {badge.unlocked
                                  ? "Unlocked"
                                  : `${badge.progress} / ${badge.target}`}
                              </span>
                              <span className="font-semibold text-teal-400">
                                +{badge.xpReward} XP
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                style={{ width: `${badge.unlocked ? 100 : pct}%` }}
                                className={`h-full rounded-full ${
                                  badge.unlocked
                                    ? "bg-gradient-to-r from-teal-400 to-purple-500"
                                    : "bg-muted-foreground/40"
                                }`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* TAB 3: BANNER STUDIO */}
                {activeTab === "banners" && (
                  <motion.div
                    key="banners"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <Card
                      className={`border ${
                        gamification.levelInfo.canUploadCustomBanner
                          ? "border-purple-500/40 bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-rose-500/10"
                          : "border-border bg-card/60"
                      }`}
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-amber-400" />
                            <h3 className="text-base font-bold">Custom Cover Image Upload</h3>
                            <Badge
                              className={
                                gamification.levelInfo.canUploadCustomBanner
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]"
                                  : "bg-muted text-muted-foreground text-[10px]"
                              }
                            >
                              {gamification.levelInfo.canUploadCustomBanner
                                ? "Unlocked"
                                : "Requires Level 5 (1,500 XP)"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload any custom JPG, PNG, or WEBP artwork (max 5MB) as your profile cover banner.
                          </p>
                        </div>

                        {gamification.levelInfo.canUploadCustomBanner ? (
                          <label className="cursor-pointer shrink-0">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              disabled={uploadingBanner}
                              onChange={handleCustomBannerUpload}
                            />
                            <span className="inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 transition-colors">
                              {uploadingBanner ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Custom Banner
                                </>
                              )}
                            </span>
                          </label>
                        ) : (
                          <Button disabled variant="outline" size="sm" className="shrink-0">
                            <Lock className="h-3.5 w-3.5 mr-1.5" />
                            {1500 - gamification.levelInfo.xp} XP Needed
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {BANNER_PRESETS.map((preset) => {
                        const unlocked =
                          gamification.levelInfo.level >= preset.minLevel || isAdmin;
                        const isEquipped =
                          !customBannerUrl && selectedBannerId === preset.id;

                        return (
                          <Card
                            key={preset.id}
                            className={`overflow-hidden border transition-all ${
                              isEquipped
                                ? "border-teal-400 ring-2 ring-teal-400/20"
                                : "border-border"
                            } ${!unlocked ? "opacity-70" : ""}`}
                          >
                            <div className={`h-24 w-full relative ${preset.className}`}>
                              <Badge className="absolute top-2.5 left-2.5 bg-black/60 text-white border-white/15 text-[10px]">
                                Level {preset.minLevel}
                              </Badge>
                              {!unlocked && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                                  <Lock className="h-6 w-6 text-white/80" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold">{preset.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {preset.description}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                disabled={!unlocked || isEquipped}
                                variant={isEquipped ? "secondary" : "default"}
                                onClick={() => handleSelectBannerPreset(preset.id)}
                                className="shrink-0 text-xs"
                              >
                                {isEquipped ? "Equipped" : unlocked ? "Equip" : "Locked"}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: EDIT PROFILE (Clean Student Form vs. Full Creator Proof & Payout Form) */}
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Upload Box: Student sees ONLY Avatar Photo; Creator sees Avatar + ID Card + Merit Proof */}
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {isCreatorSlide
                            ? "Creator Photo & Academic Proof Uploads"
                            : "Profile Picture"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {isCreatorSlide
                            ? "Upload your creator photo, University ID Card, and Merit Sheet to build trust and earn +100 XP."
                            : "Upload a clear profile photo to personalize your Student account."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent
                        className={`grid grid-cols-1 ${
                          isCreatorSlide ? "sm:grid-cols-3" : "sm:grid-cols-1 max-w-md"
                        } gap-3.5`}
                      >
                        <label className="cursor-pointer rounded-xl border border-dashed border-border hover:border-teal-400/60 bg-muted/25 p-4 transition-colors block">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploadingAvatar}
                            onChange={handleAvatarUpload}
                          />
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                              <Camera className="h-4 w-4 text-teal-400" />
                              Profile Picture
                            </span>
                            {avatarUrl && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {uploadingAvatar
                              ? "Uploading photo..."
                              : avatarUrl
                              ? "Photo live • Click to replace"
                              : "Click to upload JPG/PNG photo"}
                          </p>
                        </label>

                        {isCreatorSlide && (
                          <>
                            <label className="cursor-pointer rounded-xl border border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-500/5 p-4 transition-colors block">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="hidden"
                                disabled={uploadingId}
                                onChange={(e) => handleProofUpload(e, "id")}
                              />
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                                  <ShieldCheck className="h-4 w-4" />
                                  University ID Card
                                </span>
                                <span className="text-[10px] font-bold text-teal-400">
                                  +50 XP
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {uploadingId
                                  ? "Uploading ID card..."
                                  : idCardUrl
                                  ? "ID Card Attached • Click to update"
                                  : "Upload student ID card (JPG/PDF)"}
                              </p>
                            </label>

                            <label className="cursor-pointer rounded-xl border border-dashed border-teal-500/40 hover:border-teal-400 bg-teal-500/5 p-4 transition-colors block">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                className="hidden"
                                disabled={uploadingMerit}
                                onChange={(e) => handleProofUpload(e, "merit")}
                              />
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                                  <FileCheck2 className="h-4 w-4" />
                                  Merit / Grade Proof
                                </span>
                                <span className="text-[10px] font-bold text-teal-400">
                                  +50 XP
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {uploadingMerit
                                  ? "Uploading merit proof..."
                                  : meritProofUrl
                                  ? "Merit Proof Attached • Click to update"
                                  : "Upload grade sheet / award (JPG/PDF)"}
                              </p>
                            </label>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Role-Specific Details Form */}
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {isCreatorSlide
                            ? "Creator Studio Credentials & Payouts"
                            : "Student Academic Profile"}
                        </CardTitle>
                        <CardDescription>
                          {isCreatorSlide
                            ? "Manage your verified creator credentials, academic honors, and bKash/Nagad payout number."
                            : "Keep your university and department updated for tailored study recommendations."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {activeCompletion.fields.map((f) => (
                            <span
                              key={f.key}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                                f.filled
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                  : "border-border bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {f.label}
                            </span>
                          ))}
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          {isCreatorSlide ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fullName">Creator Display Name</Label>
                                  <Input
                                    id="fullName"
                                    placeholder="e.g. Sadman Hasan"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="studentId">Student ID Number</Label>
                                  <Input
                                    id="studentId"
                                    placeholder="e.g. 253-33-026"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="institution">University / College</Label>
                                  <Input
                                    id="institution"
                                    placeholder="e.g. Daffodil International University"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="payoutNumber">
                                    bKash / Nagad Payout Number
                                  </Label>
                                  <Input
                                    id="payoutNumber"
                                    placeholder="e.g. 01XXXXXXXXX"
                                    value={payoutNumber}
                                    onChange={(e) => setPayoutNumber(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expertise">Core Subjects</Label>
                                  <Input
                                    id="expertise"
                                    placeholder="e.g. Digital Electronics, Calculus"
                                    value={expertise}
                                    onChange={(e) => setExpertise(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cgpa">Current CGPA / GPA</Label>
                                  <Input
                                    id="cgpa"
                                    placeholder="e.g. 3.88 / 4.00"
                                    value={cgpa}
                                    onChange={(e) => setCgpa(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="honors">Academic Honors / Rank</Label>
                                  <Input
                                    id="honors"
                                    placeholder="e.g. Dean's List, Batch Top 3"
                                    value={honors}
                                    onChange={(e) => setHonors(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="creatorTagline">Creator Tagline</Label>
                                  <Input
                                    id="creatorTagline"
                                    placeholder="e.g. EEE Topper & Visual Circuit Guides"
                                    value={creatorTagline}
                                    onChange={(e) => setCreatorTagline(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="portfolioUrl">
                                    Portfolio / LinkedIn / GitHub URL
                                  </Label>
                                  <Input
                                    id="portfolioUrl"
                                    placeholder="https://..."
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="bio">Creator Bio &amp; Note Guarantee</Label>
                                <Textarea
                                  id="bio"
                                  placeholder="Tell students why they can trust your notes and exam solutions..."
                                  rows={3}
                                  value={bio}
                                  onChange={(e) => setBio(e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            /* PURE STUDENT FORM (No ID Card, CGPA, or Merit Proof!) */
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fullName">Full Name</Label>
                                  <Input
                                    id="fullName"
                                    placeholder="e.g. Sadman Hasan"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="institution">
                                    University / College / School
                                  </Label>
                                  <Input
                                    id="institution"
                                    placeholder="e.g. Daffodil International University"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="department">Department / Major</Label>
                                  <Input
                                    id="department"
                                    placeholder="e.g. B.Sc in EEE / HSC Science"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="semester">Current Year / Semester</Label>
                                  <Input
                                    id="semester"
                                    placeholder="e.g. 2nd Year / Fall 2026"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="bio">Short Bio</Label>
                                <Textarea
                                  id="bio"
                                  placeholder="What subjects are you currently studying or preparing for?"
                                  rows={3}
                                  value={bio}
                                  onChange={(e) => setBio(e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-end pt-2">
                            <Button
                              type="submit"
                              disabled={saving}
                              className={
                                isCreatorSlide
                                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                                  : ""
                              }
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save {isCreatorSlide ? "Creator" : "Student"} Profile
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}