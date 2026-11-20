import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ExternalLink,
  Trash2,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type { UploadFilter } from "@/pages/app/MyUploads";

interface MaterialRow {
  id: string;
  title: string;
  category?: string | null;
  subject?: string | null;
  price?: number | null;
  page_count?: number | null;
  status?: string | null;
  created_at: string;
}

interface MyUploadsListProps {
  filter?: UploadFilter;
}

export function MyUploadsList({ filter = "all" }: MyUploadsListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [uploads, setUploads] = useState<MaterialRow[]>([]);
  const [salesByMaterial, setSalesByMaterial] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("materials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list: MaterialRow[] = data || [];
      setUploads(list);

      // Fetch real approved sales counts for these materials
      const ids = list.map((m) => m.id);
      if (ids.length > 0) {
        const { data: purchases } = await (supabase as any)
          .from("purchases")
          .select("material_id")
          .in("material_id", ids)
          .eq("status", "approved");

        const counts: Record<string, number> = {};
        for (const p of purchases || []) {
          counts[p.material_id] = (counts[p.material_id] || 0) + 1;
        }
        setSalesByMaterial(counts);
      } else {
        setSalesByMaterial({});
      }
    } catch (err: any) {
      console.error("Failed to fetch uploads:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [user?.id]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently?`)) return;

    try {
      const { error } = await (supabase as any)
        .from("materials")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      setUploads((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Material deleted",
        description: `"${title}" has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const filteredUploads = uploads.filter((item) => {
    const status = (item.status || "approved").toLowerCase();
    if (filter === "all") return true;
    if (filter === "pending") {
      return status === "pending" || status === "submitted" || status === "under_review";
    }
    return status === filter;
  });

  const renderStatusBadge = (rawStatus?: string | null) => {
    const status = (rawStatus || "approved").toLowerCase();
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }
    if (status === "pending" || status === "submitted" || status === "under_review") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  };

  return (
    <div className="rounded-2xl bg-card/80 border border-border/50 p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-creator-primary" />
          <h2 className="text-lg font-bold">All Uploads</h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {filteredUploads.length}
          </span>
        </div>

        <Button
          onClick={() => navigate("/app/upload")}
          className="bg-creator-primary hover:bg-creator-primary/90 text-background font-semibold h-9 px-4 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Upload New
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-creator-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUploads.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl space-y-3">
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "You haven't uploaded any study materials yet."
              : `No ${filter} uploads found.`}
          </p>
          {filter === "all" && (
            <Button
              onClick={() => navigate("/app/upload")}
              variant="outline"
              className="border-creator-primary/40 text-creator-primary hover:bg-creator-primary/10"
            >
              Upload Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUploads.map((item) => {
            const sales = salesByMaterial[item.id] || 0;
            const subjectLabel = item.category || item.subject || "General";

            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background/60 border border-border/50 hover:border-creator-primary/40 transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-creator-primary/10 border border-creator-primary/20 text-creator-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground/80">
                        {subjectLabel}
                      </span>
                      <span className="font-bold text-teal-400">
                        {!item.price || Number(item.price) === 0 ? "Free" : `৳${item.price}`}
                      </span>
                      {item.page_count && <span>{item.page_count} pages</span>}
                      <span className="inline-flex items-center gap-1">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {sales} {sales === 1 ? "sale" : "sales"}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
                  {renderStatusBadge(item.status)}

                  <Button
                    onClick={() => navigate(`/app/materials/${item.id}`)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View
                  </Button>

                  <Button
                    onClick={() => handleDelete(item.id, item.title)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}