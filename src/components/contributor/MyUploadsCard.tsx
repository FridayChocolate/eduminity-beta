import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, ExternalLink } from "lucide-react";

export function MyUploadsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyUploads();
  }, [user]);

  const fetchMyUploads = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("materials")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error: any) {
      console.error("Error loading uploads:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this study material permanently?")) return;

    try {
      const { error } = await (supabase as any)
        .from("materials")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      setUploads((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Delete error:", error.message);
      alert("Failed to delete material.");
    }
  };

  return (
    <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            My Uploaded Materials
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {uploads.length} {uploads.length === 1 ? "material" : "materials"} published
          </p>
        </div>

        <Button
          onClick={() => navigate("/app/upload")}
          className="bg-teal-500 hover:bg-teal-600 text-black font-bold h-9 px-4 rounded-lg text-sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Upload New
        </Button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
          <p className="text-gray-400 text-sm mb-3">You haven&apos;t uploaded any notes yet.</p>
          <Button
            onClick={() => navigate("/app/upload")}
            variant="outline"
            className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
          >
            Upload Your First Material
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2A2A32]/60 border border-white/5 rounded-xl p-4 hover:border-white/15 transition-colors"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300">
                    {item.category}
                  </span>
                  {item.page_count && <span>{item.page_count} pages</span>}
                  <span className="text-teal-400 font-bold">
                    {item.price === 0 ? "Free" : `৳${item.price}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => navigate(`/app/materials/${item.id}`)}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> View
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}