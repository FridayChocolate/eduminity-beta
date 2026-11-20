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
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Mail,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  Save,
} from "lucide-react";

const ADMIN_EMAIL = "business.eduminity@gmail.com";

export default function Profile() {
  const { user, userRole, canAccessCreator, canAccessStudent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    setFullName(meta.full_name || "");
    setInstitution(meta.institution || "");
    setDepartment(meta.department || "");
    setBio(meta.bio || "");

    const fetchStats = async () => {
      try {
        const { count } = await (supabase as any)
          .from("purchases")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "approved");

        setUnlockedCount(count || 0);
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
          bio: bio.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile details have been saved.",
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

      // Ignore duplicate key error if they already have the row
      if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
        throw error;
      }

      toast({
        title: "Welcome to Creator Studio!",
        description: "Your account has been upgraded. Unlocking Creator tools...",
      });

      // Full reload refreshes cached roles in useAuth and opens Creator Studio
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
    if (userRole === "contributor") {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {userRole === "contributor" ? "Back to Creator Studio" : "Back to Dashboard"}
          </Button>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2 border-primary/40 text-primary"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </div>

        {/* Profile Header Card */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 border-b border-border" />
          <CardContent className="pt-0 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-card shadow-md">
                  {getInitials()}
                </div>
                <div className="pb-1">
                  <h1 className="text-xl font-bold text-foreground">
                    {fullName || "eduminity Member"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
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

        {/* Quick Stats */}
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
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold capitalize">
                  {userRole === "both" ? "Student & Creator" : userRole || "Student"}
                </p>
                <p className="text-xs text-muted-foreground">Account Access Level</p>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Edit Profile Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
            <CardDescription>
              Update your academic profile so peers and creators know who you are.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="department">Department / Class / Major</Label>
                <Input
                  id="department"
                  placeholder="e.g. B.Sc in EEE / HSC Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others what you're studying or what notes you share..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
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