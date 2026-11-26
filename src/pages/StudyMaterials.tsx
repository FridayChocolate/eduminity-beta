import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  Crown,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { computeProfileGamification } from "@/lib/gamification";

export default function StudyMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<any[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});
  const [ratingsByMatId, setRatingsByMatId] = useState<
    Record<string, { avg: number; count: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = ["All", "Engineering", "Computer Science", "Business", "Medicine"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const [matsRes, profilesRes, reviewsRes] = await Promise.all([
        (supabase as any)
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false }),
        (supabase as any).from("profiles").select("*"),
        (supabase as any).from("material_reviews").select("material_id, rating"),
      ]);

      if (matsRes.error) throw matsRes.error;
      const matsList = matsRes.data || [];
      setMaterials(matsList);

      const pMap: Record<string, any> = {};
      for (const p of profilesRes.data || []) {
        if (p.id) pMap[p.id] = p;
      }
      setProfilesById(pMap);

      const rAgg: Record<string, { sum: number; count: number }> = {};
      for (const r of reviewsRes.data || []) {
        if (!r.material_id) continue;
        if (!rAgg[r.material_id]) rAgg[r.material_id] = { sum: 0, count: 0 };
        rAgg[r.material_id].sum += Number(r.rating || 0);
        rAgg[r.material_id].count += 1;
      }

      const rMap: Record<string, { avg: number; count: number }> = {};
      for (const [matId, val] of Object.entries(rAgg)) {
        rMap[matId] = {
          avg: Number((val.sum / val.count).toFixed(1)),
          count: val.count,
        };
      }
      setRatingsByMatId(rMap);
    } catch (error: any) {
      console.error("Error fetching materials:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Precompute creator trust metadata (Level, Verified status, display info)
  const creatorMetaById = useMemo(() => {
    const matsByUser: Record<string, any[]> = {};
    for (const m of materials) {
      if (!m.user_id) continue;
      if (!matsByUser[m.user_id]) matsByUser[m.user_id] = [];
      matsByUser[m.user_id].push(m);
    }

    const result: Record<
      string,
      {
        name: string;
        avatarUrl: string;
        institution: string;
        level: number;
        levelTitle: string;
        isVerified: boolean;
      }
    > = {};

    const allUserIds = new Set([
      ...Object.keys(profilesById),
      ...Object.keys(matsByUser),
    ]);

    allUserIds.forEach((uid) => {
      const prof = profilesById[uid] || {};
      const userMats = matsByUser[uid] || [];
      const isVerified =
        prof.verification_status === "verified" ||
        Boolean(prof.has_id_proof || prof.has_merit_proof);

      const gamification = computeProfileGamification({
        meta: {
          ...prof,
          student_id_card_url:
            prof.student_id_card_url || (prof.has_id_proof ? "verified" : ""),
          academic_proof_url:
            prof.academic_proof_url || (prof.has_merit_proof ? "verified" : ""),
        },
        email: prof.email,
        publishedMaterials: userMats,
        salesRows: [],
        unlockedPurchases: [],
        reviewsWrittenCount: 0,
        averageRating: 5.0,
      });

      result[uid] = {
        name: prof.full_name?.trim() || "Eduminity Creator",
        avatarUrl: prof.avatar_url || "",
        institution: prof.institution || "",
        level: gamification.levelInfo.level,
        levelTitle: gamification.levelInfo.title,
        isVerified,
      };
    });

    return result;
  }, [materials, profilesById]);

  const filteredMaterials = materials.filter((item) => {
    const creator = item.user_id ? creatorMetaById[item.user_id] : null;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (creator?.name || "").toLowerCase().includes(q) ||
      (creator?.institution || "").toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesVerified = !verifiedOnly || Boolean(creator?.isVerified);
    return matchesSearch && matchesCategory && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-[#12121A] text-white p-6 md:p-12 font-['Inter'] relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* QoL Navigation Bar */}
        <div className="flex justify-between items-center mb-8 bg-[#1A1A1F]/60 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/5 shadow-lg">
          <Button
            onClick={() => navigate("/app")}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Go Back
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            Sign Out
          </Button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Marketplace
            </h1>
            <p className="text-gray-400">
              Discover peer-reviewed study materials, lecture notes, and past papers from verified top students.
            </p>
          </div>

          <Button
            onClick={() => navigate("/app/upload-notes")}
            className="bg-neon-teal hover:bg-teal-400 text-black font-bold px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all hover:scale-105"
          >
            + Upload Notes
          </Button>
        </div>

        {/* Search, Categories & Verified Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <Input
            placeholder="Search notes, subjects, creators, or universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1A1A1F]/80 border-white/10 text-white h-12 lg:w-96 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-[#1A1A1F]/80 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setVerifiedOnly((prev) => !prev)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap inline-flex items-center gap-1.5 border ${
                verifiedOnly
                  ? "bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                  : "bg-[#1A1A1F]/80 text-gray-400 hover:text-white border-white/5"
              }`}
            >
              <BadgeCheck className="h-4 w-4 text-teal-400" />
              Verified Creators
            </button>
          </div>
        </div>

        {/* Dynamic Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-[#1A1A1F]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-3">No materials found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Either the vault is empty, or no materials match your current search filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
                setVerifiedOnly(false);
              }}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => {
              const creator = item.user_id ? creatorMetaById[item.user_id] : null;
              const ratingInfo = ratingsByMatId[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-[#1A1A1F]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] transition-all duration-300 relative group flex flex-col h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

                  {/* Top Category, Rating & Price Row */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white/5 border border-white/10 text-xs font-medium px-3 py-1.5 rounded-lg text-gray-300">
                        {item.category}
                      </span>
                      {ratingInfo && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {ratingInfo.avg} ({ratingInfo.count})
                        </span>
                      )}
                    </div>

                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold px-3 py-1.5 rounded-lg shrink-0">
                      {item.price === 0 ? "Free" : `৳${item.price}`}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2.5 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-5 line-clamp-3 flex-grow">
                    {item.description}
                  </p>

                  {/* Clickable Creator Trust Strip -> /creator/:id */}
                  {item.user_id && creator && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/creator/${item.user_id}`);
                      }}
                      className="w-full mb-4 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-teal-400/40 transition-all flex items-center justify-between gap-2.5 text-left group/creator"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                          {creator.avatarUrl ? (
                            <img
                              src={creator.avatarUrl}
                              alt={creator.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            creator.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-white group-hover/creator:text-teal-300 transition-colors truncate">
                              {creator.name}
                            </span>

                            {creator.isVerified && (
                              <span
                                title="Verified University Credentials"
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30"
                              >
                                <BadgeCheck className="h-3 w-3 text-teal-400" />
                                Verified
                              </span>
                            )}

                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <Crown className="h-2.5 w-2.5 text-amber-400" />
                              Lv.{creator.level}
                            </span>
                          </div>

                          {creator.institution && (
                            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                              <GraduationCap className="h-3 w-3 shrink-0 text-gray-500" />
                              {creator.institution}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-gray-500 group-hover/creator:text-teal-400 shrink-0 transition-colors" />
                    </button>
                  )}

                  <Button
                    onClick={() => navigate(`/app/material/${item.id}`)}
                    className="w-full bg-white/5 hover:bg-indigo-500 text-white border border-white/10 hover:border-transparent transition-all h-11"
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}