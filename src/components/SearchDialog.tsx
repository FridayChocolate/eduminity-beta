import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, User, X, BookOpen, GraduationCap } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SearchFilter = "all" | "materials" | "creators";

interface SearchResult {
  id: string;
  type: "material" | "creator";
  title: string;
  subtitle: string;
  avatar?: string;
  badge?: string;
}

// Mock search results - replace with actual API call
const mockResults: SearchResult[] = [
  { id: "1", type: "material", title: "Organic Chemistry Notes", subtitle: "By Sarah Ahmed • 4.9★", badge: "Best Seller" },
  { id: "2", type: "material", title: "Calculus II Complete Guide", subtitle: "By John Doe • 4.7★" },
  { id: "3", type: "creator", title: "Sarah Ahmed", subtitle: "University of Dhaka • 4.9★ • 234 sales", badge: "Verified" },
  { id: "4", type: "creator", title: "John Doe", subtitle: "BUET • 4.5★ • 89 sales" },
  { id: "5", type: "material", title: "Physics Mechanics", subtitle: "By Alex Khan • 4.8★", badge: "New" },
  { id: "6", type: "creator", title: "Alex Khan", subtitle: "NSU • 4.8★ • 156 sales", badge: "Rising Star" },
];

export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const navigate = useNavigate();

  const isAk47EasterEgg = query.toLowerCase().replace(/[^a-z0-9]/g, "") === "ak47";

  const triggerEasterEgg = () => {
    setOpen(false);
    setQuery("");
    navigate("/secret/ak47");
  };

  const filteredResults = mockResults.filter((result) => {
    const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || 
      (filter === "materials" && result.type === "material") ||
      (filter === "creators" && result.type === "creator");
    return matchesQuery && matchesFilter;
  });

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "creator") {
      navigate(`/creator/${result.title.toLowerCase().replace(/\s+/g, "_")}`);
    } else {
      navigate("/app/materials");
    }
    setOpen(false);
    setQuery("");
  };

  const filterButtons: { value: SearchFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "all", label: "All", icon: Search },
    { value: "materials", label: "Materials", icon: FileText },
    { value: "creators", label: "Creators", icon: User },
  ];

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
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] duration-200">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, materials, or creators..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isAk47EasterEgg) {
                  e.preventDefault();
                  triggerEasterEgg();
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
          </motion.div>
        </DialogHeader>

        {/* Filter Buttons */}
        <motion.div 
          className="flex gap-2 p-3 border-b border-border bg-muted/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filter === btn.value ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-1.5 text-xs transition-all duration-200",
                filter === btn.value && "bg-primary text-primary-foreground"
              )}
              onClick={() => setFilter(btn.value)}
            >
              <btn.icon className="h-3.5 w-3.5" />
              {btn.label}
            </Button>
          ))}
        </motion.div>

        {/* Results */}
        <motion.div 
          className="max-h-[400px] overflow-y-auto p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
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
          ) : query.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start typing to search</p>
              <p className="text-xs mt-1">Find notes, study materials, or creators</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try a different search term or filter</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredResults.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                    whileHover={{ x: 4 }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      result.type === "creator" 
                        ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20" 
                        : "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                    )}>
                      {result.type === "creator" ? (
                        <GraduationCap className="h-5 w-5 text-violet-400" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-cyan-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {result.title}
                        </span>
                        {result.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">
                      {result.type}
                    </Badge>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="p-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.25 }}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">esc</kbd>
            Close
          </span>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};