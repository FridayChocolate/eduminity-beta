import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

const ADMIN_EMAILS = [
  "business.neurovane@gmail.com",
  "shariarlabib04@gmail.com",
  "tanvirshafi9510@gmail.com",
];

export default function Profile() {
  const { user, canAccessCreator, canAccessStudent, activeMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Default the profile tab to whichever mode the user is currently in
  const [profileTab, setProfileTab] = useState<"student" | "contributor">(
    activeMode === "contributor" && canAccessCreator ? "contributor" : "student"
  );

  // Shared & Student fields
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [bio, setBio] = useState("");

  // Creator-only fields
  const [creatorTagline, setCreatorTagline] = useState("");
  const [expertise, setExpertise] = useState("");
  const [payoutNumber, setPayoutNumber] = useState("");

  // Stats
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [reviewsWrittenCount, setReviewsWrittenCount] = useState<number>(0);
  const [publishedCount, setPublishedCount] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const isAdmin = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );

  useEffect(() => {
    if (activeMode === "contributor" && canAccessCreator) {
      setProfileTab("contributor");
    } else {
      setProfileTab("student");
    }
  }, [activeMode, canAccessCreator]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    setFullName(meta.full_name || "");
    setInstitution(meta.institution || "");
    setDepartment(meta.department || "");
    setSemester(meta.semester || "");
    setBio(meta.bio || "");
    setCreatorTagline(meta.creator_tagline || "");
    setExpertise(meta.expertise || "");
    setPayoutNumber(meta.payout_number || "");

    const fetchStats = async () => {
      try {
        const [purchasesRes, reviewsRes, materialsRes] = await Promise.all([
          (supabase as any)
            .from("purchases")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "approved"),
          (supabase as any)
            .from("material_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          (supabase as any)
            .from("materials")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setUnlockedCount(purchasesRes.count || 0);
        setReviewsWrittenCount(reviewsRes.count || 0);
        setPublishedCount(materialsRes.count || 0);
      } catch {
        // Ignore stat fetch errors
      }
    };

    fetchStats();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          institution: institution.trim(),
          department: department.trim(),
          semester: semester.trim(),
          bio: bio.trim(),
          creator_tagline: creatorTagline.trim(),
          expertise: expertise.trim(),
          payout_number: payoutNumber.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: profileTab === "contributor" ? "Creator profile updated" : "Student profile updated",
        description: "Your changes have been saved.",
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

  const handleBecomeCreator = async () => {
    if (!user) return;
    setUpgrading(true);

    try {
      const { error } = await (supabase as any)
        .from("user_roles")
        .insert({ user_id: user.id, role: "contributor" });

      if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
        throw error;
      }

      toast({
        title: "Welcome to Creator Studio!",
        description: "Your account has been upgraded. Unlocking Creator tools...",
      });

      window.location.href = "/app/creator-studio";
    } catch (err: any) {
      toast({
        title: "Upgrade failed",
        description: err.message || "Could not upgrade your account. Please try again.",
        variant: "destructive",
      });
      setUpgrading(false);
    }
  };

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

  const handleBack = () => {
    if (activeMode === "contributor") {
      navigate("/app/creator-studio");
    } else {
      navigate("/app/student-dashboard");
    }
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const isCreatorView = profileTab === "contributor" && canAccessCreator;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {activeMode === "contributor" ? "Back to Creator Studio" : "Back to Dashboard"}
          </Button>

          <div className="flex items-center gap-2">
            {/* Profile Mode Switcher (Only for dual-role users) */}
            {canAccessCreator && (
              <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setProfileTab("student")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !isCreatorView
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Student Profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("contributor")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isCreatorView
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Creator Profile
                </button>
              </div>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-2 border-primary/40 text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-card border-border overflow-hidden">
          <div
            className={`h-24 border-b border-border transition-colors ${
              isCreatorView
                ? "bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-indigo-500/25"
                : "bg-gradient-to-r from-teal-500/20 via-primary/20 to-cyan-500/20"
            }`}
          />
          <CardContent className="pt-0 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
              <div className="flex items-end gap-4">
                <div
                  className={`h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-card shadow-md ${
                    isCreatorView
                      ? "bg-purple-600 text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {getInitials()}
                </div>
                <div className="pb-1">
                  <h1 className="text-xl font-bold text-foreground">
                    {fullName || "Eduminity Member"}
                  </h1>
                  {isCreatorView && creatorTagline && (
                    <p className="text-xs text-purple-400 mt-0.5">{creatorTagline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {canAccessStudent && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </Badge>
                    )}
                    {canAccessCreator && (
                      <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs gap-1">
                        <Sparkles className="h-3 w-3" />
                        Creator
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pb-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Specific Stats */}
        {isCreatorView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xl font-bold">{publishedCount}</p>
                  <p className="text-xs text-muted-foreground">Published Study Materials</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-bold truncate">
                    {payoutNumber || "Not set yet"}
                  </p>
                  <p className="text-xs text-muted-foreground">Payout Number (bKash / Nagad)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{unlockedCount}</p>
                  <p className="text-xs text-muted-foreground">Unlocked Study Materials</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold">{reviewsWrittenCount}</p>
                  <p className="text-xs text-muted-foreground">Material Reviews Written</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 1-Click Become a Creator Card (Only for Student-Only accounts) */}
        {!canAccessCreator && (
          <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-cyan-500/10">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h2 className="text-base font-semibold text-foreground">
                    Want to upload notes &amp; earn?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Upgrade your account to a Creator in one click. You&apos;ll keep your Student
                  library and unlock Creator Studio to publish notes and track earnings.
                </p>
              </div>
              <Button
                onClick={handleBecomeCreator}
                disabled={upgrading}
                className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Become a Creator
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Role-Specific Edit Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">
              {isCreatorView ? "Creator Studio Profile" : "Student Academic Profile"}
            </CardTitle>
            <CardDescription>
              {isCreatorView
                ? "Manage your public creator identity and where you receive payouts."
                : "Keep your university and department updated for tailored study materials."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {isCreatorView ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Creator Name</Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Sadman Hasan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creatorTagline">Creator Tagline</Label>
                      <Input
                        id="creatorTagline"
                        placeholder="e.g. EEE Topper & Circuit Notes"
                        value={creatorTagline}
                        onChange={(e) => setCreatorTagline(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Subjects / Expertise</Label>
                      <Input
                        id="expertise"
                        placeholder="e.g. Digital Electronics, Calculus, Physics"
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutNumber">Payout Number (bKash / Nagad)</Label>
                      <Input
                        id="payoutNumber"
                        placeholder="e.g. 01XXXXXXXXX"
                        value={payoutNumber}
                        onChange={(e) => setPayoutNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Creator Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students why they can trust your notes and exam guides..."
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </>
              ) : (
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
                      <Label htmlFor="institution">University / College / School</Label>
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
                      placeholder="What are you currently studying or preparing for?"
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
                  className={isCreatorView ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save {isCreatorView ? "Creator" : "Student"} Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}