import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, X, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MaterialResult {
  id: string;
  title: string;
  category: string | null;
  price: number;
  page_count: number | null;
  class_level: string | null;
}

export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MaterialResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAk47EasterEgg = query.toLowerCase().replace(/[^a-z0-9]/g, "") === "ak47";

  // Enable Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Live debounced search against Supabase materials table
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || isAk47EasterEgg) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("materials")
          .select("id, title, category, price, page_count, class_level")
          .or(`title.ilike.%${trimmed}%,category.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!error && data) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isAk47EasterEgg]);

  const triggerEasterEgg = () => {
    setOpen(false);
    setQuery("");
    navigate("/secret/ak47");
  };

  const handleResultClick = (materialId: string) => {
    navigate(`/app/materials/${materialId}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="gap-2 text-muted-foreground hover:text-foreground bg-muted/50 border-border hover:bg-muted transition-all duration-200"
            size="sm"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden duration-200">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study notes, subjects, or categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (isAk47EasterEgg) {
                    e.preventDefault();
                    triggerEasterEgg();
                  } else if (results.length > 0) {
                    e.preventDefault();
                    handleResultClick(results[0].id);
                  }
                }
              }}
              className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary h-11"
              autoFocus
            />
            <AnimatePresence>
              {query && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted"
                    onClick={() => setQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogHeader>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {isAk47EasterEgg ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={triggerEasterEgg}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-left group"
              whileHover={{ x: 4 }}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                🐱
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-400 truncate">
                    Sgt. Whiskers&apos; Classified Field Manual
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-300">
                    Top Secret
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Press Enter or click to open classified briefing...
                </p>
              </div>
            </motion.button>
          ) : query.trim().length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start typing to search</p>
              <p className="text-xs mt-1">Find notes, subjects, or study guides</p>
            </div>
          ) : loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary mb-2" />
              <p className="text-xs">Searching Study Hub...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No study materials found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1">Try a different subject or keyword</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleResultClick(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {[
                        item.category,
                        item.class_level,
                        item.page_count ? `${item.page_count} pages` : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold text-teal-400 border-teal-500/30 flex-shrink-0">
                    {item.price === 0 ? "Free" : `৳${item.price}`}
                  </Badge>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↵</kbd>
            Open top result
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">esc</kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};