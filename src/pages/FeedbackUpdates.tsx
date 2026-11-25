import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/gamification";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone,
  Star,
  Sparkles,
  Rocket,
  Bell,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Send,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Trash2,
  Wrench,
  Loader2,
  Radio,
} from "lucide-react";

interface PlatformUpdate {
  id: string;
  type: "release" | "feature" | "fix" | "notice" | string;
  version_tag: string;
  title: string;
  description: string;
  badge_label: string;
  author_name: string;
  author_email?: string;
  created_at: string;
}

interface UpdateComment {
  id: string;
  update_id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  comment_text: string;
  created_at: string;
}

interface PlatformReview {
  id: string;
  user_id: string;
  author_name: string;
  rating: number;
  version: string;
  pros?: string;
  cons?: string;
  created_at: string;
}

const VERSIONS = [
  "Beta 2.0 + Profile Makeover (Current)",
  "Beta 2.0",
  "Beta 1.0",
];

const getAnnouncementVisuals = (type: string) => {
  switch (type) {
    case "release":
      return {
        Icon: Rocket,
        boxClass: "bg-teal-500/15 text-teal-400",
        badgeClass: "bg-teal-500/15 text-teal-400 border-teal-500/30",
      };
    case "feature":
      return {
        Icon: Sparkles,
        boxClass: "bg-purple-500/15 text-purple-400",
        badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      };
    case "fix":
      return {
        Icon: Wrench,
        boxClass: "bg-emerald-500/15 text-emerald-400",
        badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    case "notice":
      return {
        Icon: Bell,
        boxClass: "bg-amber-500/15 text-amber-400",
        badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    default:
      return {
        Icon: Megaphone,
        boxClass: "bg-cyan-500/15 text-cyan-400",
        badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      };
  }
};

export default function FeedbackUpdates() {
  const { user, loading, isContributor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = isAdminEmail(user?.email);

  const [activeTab, setActiveTab] = useState("announcements");
  const [dataLoading, setDataLoading] = useState(true);

  // Real-time collections
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [commentsByUpdate, setCommentsByUpdate] = useState<Record<string, UpdateComment[]>>({});
  const [reviews, setReviews] = useState<PlatformReview[]>([]);

  // Admin Live Update Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [updateType, setUpdateType] = useState("release");
  const [versionTag, setVersionTag] = useState("Beta 2.0");
  const [badgeLabel, setBadgeLabel] = useState("Live Now");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [publishingUpdate, setPublishingUpdate] = useState(false);

  // Comment input per update card
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [openThreads, setOpenThreads] = useState<Record<string, boolean>>({});

  // Platform Review form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0]);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      const [updatesRes, commentsRes, reviewsRes] = await Promise.all([
        (supabase as any)
          .from("platform_updates")
          .select("*")
          .order("created_at", { ascending: false }),
        (supabase as any)
          .from("platform_update_comments")
          .select("*")
          .order("created_at", { ascending: true }),
        (supabase as any)
          .from("platform_reviews")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const fetchedUpdates: PlatformUpdate[] = updatesRes.data || [];
      const fetchedComments: UpdateComment[] = commentsRes.data || [];
      const fetchedReviews: PlatformReview[] = reviewsRes.data || [];

      const grouped: Record<string, UpdateComment[]> = {};
      for (const c of fetchedComments) {
        if (!grouped[c.update_id]) grouped[c.update_id] = [];
        grouped[c.update_id].push(c);
      }

      setUpdates(fetchedUpdates);
      setCommentsByUpdate(grouped);
      setReviews(fetchedReviews);

      // Auto-expand comments on the latest 2 updates on initial load
      if (!silent && fetchedUpdates.length > 0) {
        setOpenThreads((prev) => {
          const next = { ...prev };
          fetchedUpdates.slice(0, 2).forEach((u) => {
            if (next[u.id] === undefined) next[u.id] = true;
          });
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to fetch feedback & updates:", err);
    } finally {
      if (!silent) setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData(false);

    // Subscribe to live Postgres changes across updates, comments, and reviews
    const channel = supabase
      .channel("eduminity-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platform_updates" },
        () => fetchAllData(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platform_update_comments" },
        () => fetchAllData(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "platform_reviews" },
        () => fetchAllData(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Admin: Push a new real-time update
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;

    if (!updateTitle.trim() || !updateDescription.trim()) {
      toast({
        title: "Missing details",
        description: "Please enter both an update title and description.",
        variant: "destructive",
      });
      return;
    }

    setPublishingUpdate(true);
    try {
      const authorName =
        user.user_metadata?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        "Eduminity Admin";

      const { error } = await (supabase as any).from("platform_updates").insert({
        type: updateType,
        version_tag: versionTag.trim() || "Beta 2.0",
        badge_label: badgeLabel.trim() || "Update",
        title: updateTitle.trim(),
        description: updateDescription.trim(),
        author_name: authorName,
        author_email: user.email,
      });

      if (error) throw error;

      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      toast({
        title: "Live Update Pushed!",
        description: "Your announcement is now visible to all students and creators.",
      });

      setUpdateTitle("");
      setUpdateDescription("");
      setComposerOpen(false);
      await fetchAllData(true);
    } catch (err: any) {
      toast({
        title: "Could not publish update",
        description: err.message || "Make sure you ran the SQL setup in Supabase.",
        variant: "destructive",
      });
    } finally {
      setPublishingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!isAdmin) return;
    try {
      const { error } = await (supabase as any)
        .from("platform_updates")
        .delete()
        .eq("id", updateId);

      if (error) throw error;
      toast({ title: "Update deleted" });
      await fetchAllData(true);
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // User: Post a comment on a specific update
  const handlePostComment = async (updateId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please log in to comment on updates.",
        variant: "destructive",
      });
      return;
    }

    const text = (commentDrafts[updateId] || "").trim();
    if (!text) return;

    setSubmittingCommentId(updateId);
    try {
      const authorName =
        user.user_metadata?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        "Member";
      const authorRole = isAdmin
        ? "Admin"
        : isContributor
        ? "Creator"
        : "Student";

      const { error } = await (supabase as any)
        .from("platform_update_comments")
        .insert({
          update_id: updateId,
          user_id: user.id,
          author_name: authorName,
          author_role: authorRole,
          comment_text: text,
        });

      if (error) throw error;

      setCommentDrafts((prev) => ({ ...prev, [updateId]: "" }));
      setOpenThreads((prev) => ({ ...prev, [updateId]: true }));
      await fetchAllData(true);
    } catch (err: any) {
      toast({
        title: "Could not post comment",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("platform_update_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      await fetchAllData(true);
    } catch (err: any) {
      toast({
        title: "Could not delete comment",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // User: Submit real platform review
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const authorName =
        user.user_metadata?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        "Eduminity Student";

      const { error } = await (supabase as any).from("platform_reviews").insert({
        user_id: user.id,
        author_name: authorName,
        rating,
        version: selectedVersion || VERSIONS[0],
        pros: pros.trim() || null,
        cons: cons.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Feedback Published!",
        description: "Thank you for helping us improve Eduminity.",
      });

      setRating(0);
      setPros("");
      setCons("");
      await fetchAllData(true);
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const avgPlatformRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl space-y-6">
        {/* Top Navigation & Live Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1.5">
              <Radio className="h-3 w-3 animate-pulse" />
              Live Sync Active
            </Badge>

            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setComposerOpen((prev) => !prev)}
                className="bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                {composerOpen ? "Close Publisher" : "Push Live Update"}
              </Button>
            )}
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1.5 bg-gradient-to-r from-neon-teal to-neon-violet bg-clip-text text-transparent">
            Feedback &amp; Live Updates
          </h1>
          <p className="text-sm text-muted-foreground">
            Follow real-time platform releases, comment on new features, and share your feedback.
          </p>
        </div>

        {/* Admin Live Update Publisher Drawer */}
        <AnimatePresence>
          {isAdmin && composerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card className="border-purple-500/40 bg-gradient-to-br from-purple-950/30 via-card to-teal-950/20 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-400" />
                    Push Real-Time Platform Update
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Broadcast release notes, feature drops, or maintenance notices instantly to all users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePublishUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Update Type</Label>
                        <Select value={updateType} onValueChange={setUpdateType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="release">Major Release</SelectItem>
                            <SelectItem value="feature">New Feature</SelectItem>
                            <SelectItem value="fix">Bug Fix &amp; Polish</SelectItem>
                            <SelectItem value="notice">Notice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Version Tag</Label>
                        <Input
                          value={versionTag}
                          onChange={(e) => setVersionTag(e.target.value)}
                          placeholder="e.g. Beta 2.0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Badge Label</Label>
                        <Input
                          value={badgeLabel}
                          onChange={(e) => setBadgeLabel(e.target.value)}
                          placeholder="e.g. Live Now"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Update Headline *</Label>
                      <Input
                        required
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        placeholder="e.g. Operation Profile Makeover is Live!"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">What&apos;s New? *</Label>
                      <Textarea
                        required
                        rows={3}
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        placeholder="Describe the new features, improvements, or fixes..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setComposerOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={publishingUpdate}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      >
                        {publishingUpdate ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Broadcasting...
                          </>
                        ) : (
                          <>
                            <Megaphone className="h-4 w-4 mr-2" />
                            Publish Live Update
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Live Updates ({updates.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews &amp; Feedback ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LIVE ANNOUNCEMENTS + REAL-TIME USER COMMENTS */}
          <TabsContent value="announcements" className="space-y-5">
            {dataLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : updates.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="p-10 text-center space-y-2">
                  <p className="text-sm font-medium">No updates published yet</p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin
                      ? 'Click "Push Live Update" above to broadcast your first release note!'
                      : "Check back soon for new feature drops from the Eduminity team."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              updates.map((item, index) => {
                const { Icon, boxClass, badgeClass } = getAnnouncementVisuals(item.type);
                const comments = commentsByUpdate[item.id] || [];
                const isThreadOpen = Boolean(openThreads[item.id]);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-border/60 bg-card/90 hover:border-primary/35 transition-all">
                      <CardContent className="p-5 space-y-4">
                        {/* Update Header */}
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl ${boxClass} flex items-center justify-center shrink-0`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-base text-foreground">
                                  {item.title}
                                </h3>
                                {item.badge_label && (
                                  <Badge variant="outline" className={`${badgeClass} text-[11px]`}>
                                    {item.badge_label}
                                  </Badge>
                                )}
                                {item.version_tag && (
                                  <Badge variant="secondary" className="text-[11px]">
                                    {item.version_tag}
                                  </Badge>
                                )}
                              </div>

                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUpdate(item.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                  title="Delete update"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-3 whitespace-pre-line">
                              {item.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(item.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>• Posted by {item.author_name || "Eduminity Team"}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenThreads((prev) => ({
                                    ...prev,
                                    [item.id]: !isThreadOpen,
                                  }))
                                }
                                className="inline-flex items-center gap-1.5 font-semibold text-teal-400 hover:underline"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                {comments.length}{" "}
                                {comments.length === 1 ? "Comment" : "Comments"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Live Comment Thread */}
                        {isThreadOpen && (
                          <div className="pt-3 border-t border-border/50 space-y-3 pl-0 sm:pl-14">
                            {comments.length > 0 && (
                              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                {comments.map((c) => {
                                  const canDelete = isAdmin || user?.id === c.user_id;
                                  return (
                                    <div
                                      key={c.id}
                                      className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-foreground">
                                            {c.author_name}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`text-[10px] px-1.5 py-0 ${
                                              c.author_role === "Admin"
                                                ? "border-rose-500/40 text-rose-400"
                                                : c.author_role === "Creator"
                                                ? "border-purple-500/40 text-purple-400"
                                                : "border-teal-500/40 text-teal-400"
                                            }`}
                                          >
                                            {c.author_role}
                                          </Badge>
                                          <span className="text-[10px] text-muted-foreground">
                                            {new Date(c.created_at).toLocaleDateString()}
                                          </span>
                                        </div>

                                        {canDelete && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteComment(c.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                            title="Delete comment"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-foreground/90 leading-relaxed">
                                        {c.comment_text}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex items-center gap-2">
                              <Input
                                value={commentDrafts[item.id] || ""}
                                onChange={(e) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment(item.id);
                                  }
                                }}
                                placeholder={
                                  user
                                    ? "Write a comment or feature suggestion..."
                                    : "Log in to comment on this update..."
                                }
                                disabled={!user || submittingCommentId === item.id}
                                className="h-9 text-xs bg-muted/30"
                              />
                              <Button
                                size="sm"
                                disabled={
                                  !user ||
                                  !(commentDrafts[item.id] || "").trim() ||
                                  submittingCommentId === item.id
                                }
                                onClick={() => handlePostComment(item.id)}
                                className="h-9 px-3 shrink-0"
                              >
                                {submittingCommentId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* TAB 2: REAL REVIEWS & FEEDBACK */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Submit Platform Feedback
                    </CardTitle>
                    <CardDescription>
                      Rate Beta 2.0 and tell us what you love or what we should build next
                    </CardDescription>
                  </div>
                  {reviews.length > 0 && (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">
                      {avgPlatformRating} ★ Average ({reviews.length} reviews)
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Version Selector */}
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-medium">
                    Version
                  </Label>
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger id="version" className="w-full md:w-80">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {VERSIONS.map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pros" className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      What&apos;s Working Great (Pros)
                    </Label>
                    <Textarea
                      id="pros"
                      placeholder="e.g. Love the new profile levels and fast note downloads..."
                      value={pros}
                      onChange={(e) => setPros(e.target.value)}
                      className="min-h-24 resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cons" className="text-sm font-medium flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500 text-xs font-bold">
                        −
                      </span>
                      Suggestions / Issues (Cons)
                    </Label>
                    <Textarea
                      id="cons"
                      placeholder="e.g. Would love dark mode contrast tweaks or new subjects..."
                      value={cons}
                      onChange={(e) => setCons(e.target.value)}
                      className="min-h-24 resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full md:w-auto bg-gradient-to-r from-neon-teal to-neon-violet hover:opacity-90"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Live Feedback
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Live Community Reviews Feed */}
            {reviews.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold">Recent Student &amp; Creator Feedback</h3>
                {reviews.map((rev) => (
                  <Card key={rev.id} className="border-border/50 bg-card/80">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{rev.author_name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {rev.version}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          {"★".repeat(rev.rating)}
                          <span className="text-muted-foreground ml-1">
                            • {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {rev.pros && (
                        <p className="text-xs text-emerald-400">
                          <strong>+ Pros:</strong> {rev.pros}
                        </p>
                      )}
                      {rev.cons && (
                        <p className="text-xs text-muted-foreground">
                          <strong>− Suggestions:</strong> {rev.cons}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}