import { useEffect, useState } from "react";
import { StudentLayout } from "@/layouts/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ShoppingBag,
  Clock,
  TrendingUp,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Wallet,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PurchasedItem {
  purchaseId: string;
  materialId: string;
  status: string;
  amount: number;
  purchasedAt: string;
  title: string;
  category: string;
  pageCount?: number | null;
  filePath?: string | null;
}

interface MarketplaceNote {
  id: string;
  title: string;
  category: string;
  price: number;
  page_count?: number | null;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [library, setLibrary] = useState<PurchasedItem[]>([]);
  const [latestNotes, setLatestNotes] = useState<MarketplaceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch student's purchases
        const { data: purchasesData, error: purchasesError } = await (supabase as any)
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (purchasesError) throw purchasesError;

        const materialIds = [
          ...new Set((purchasesData || []).map((p: any) => p.material_id).filter(Boolean)),
        ] as string[];

        // 2. Fetch matching materials (only existing columns)
        const materialsMap = new Map<string, any>();
        if (materialIds.length > 0) {
          const { data: matsData } = await (supabase as any)
            .from("materials")
            .select("id, title, category, page_count, file_path, price")
            .in("id", materialIds);

          for (const m of matsData || []) {
            materialsMap.set(m.id, m);
          }
        }

        const combinedLibrary: PurchasedItem[] = (purchasesData || []).map((p: any) => {
          const mat = materialsMap.get(p.material_id);
          return {
            purchaseId: p.id,
            materialId: p.material_id,
            status: (p.status || "pending").toLowerCase(),
            amount: Number(p.amount ?? mat?.price ?? 0),
            purchasedAt: p.created_at,
            title: mat?.title || "Study Material",
            category: mat?.category || "General",
            pageCount: mat?.page_count,
            filePath: mat?.file_path,
          };
        });

        // 3. Fetch latest materials for discovery
        const { data: recentMaterials } = await (supabase as any)
          .from("materials")
          .select("id, title, category, price, page_count")
          .order("created_at", { ascending: false })
          .limit(4);

        if (cancelled) return;

        setLibrary(combinedLibrary);
        setLatestNotes(
          (recentMaterials || []).map((m: any) => ({
            id: m.id,
            title: m.title || "Untitled Note",
            category: m.category || "General",
            price: Number(m.price || 0),
            page_count: m.page_count,
          }))
        );
      } catch (err: any) {
        console.error("Error loading student dashboard:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleDownload = async (item: PurchasedItem) => {
    if (!item.filePath) {
      toast({
        title: "File unavailable",
        description: "Open the material page to access this file.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingId(item.purchaseId);
    try {
      const { data, error } = await supabase.storage
        .from("study_materials")
        .createSignedUrl(item.filePath, 3600);

      if (error || !data?.signedUrl) throw error || new Error("Could not generate link");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: err.message || "Please try again from the material page.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const unlockedNotes = library.filter((item) => item.status === "approved");
  const pendingNotes = library.filter((item) => item.status === "pending");
  const totalSpent = unlockedNotes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <StudentLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => navigate("/app/materials")} size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Study Hub
          </Button>
        </div>

        {/* Live Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : unlockedNotes.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Unlocked Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : pendingNotes.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : `৳${totalSpent.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Library / Purchases */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
                My Library &amp; Purchases
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {library.length} {library.length === 1 ? "item" : "items"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="py-10 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : library.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl space-y-3">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t purchased any study materials yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/app/materials")}
                >
                  Explore Notes
                </Button>
              </div>
            ) : (
              library.map((item) => {
                const isApproved = item.status === "approved";

                return (
                  <div
                    key={item.purchaseId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.title}
                          </p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {item.amount === 0 ? "Free" : `৳${item.amount}`}
                          </span>
                          {item.pageCount && <span>{item.pageCount} pages</span>}
                          <span>
                            {new Date(item.purchasedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isApproved ? (
                        <>
                          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[11px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(item)}
                            disabled={downloadingId === item.purchaseId}
                            className="h-8 px-3"
                          >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            {downloadingId === item.purchaseId ? "Opening..." : "Download"}
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[11px]">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/app/materials/${item.materialId}`)}
                        className="h-8 px-2.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest in Study Hub */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Latest in Study Hub
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/app/materials")}
                  >
                    Browse All <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {latestNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No materials published yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {latestNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => navigate(`/app/materials/${note.id}`)}
                        className="p-3.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-muted-foreground/30"
                          >
                            {note.category}
                          </Badge>
                          <span className="text-sm font-semibold text-primary">
                            {note.price === 0 ? "Free" : `৳${note.price}`}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {note.title}
                        </p>
                        {note.page_count && (
                          <p className="text-xs text-muted-foreground">
                            {note.page_count} pages
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Tip */}
          <div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-primary mb-1">💡 Study Tip</p>
                <p className="text-xs text-muted-foreground">
                  Students who review notes within 24 hours retain 80% more information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}