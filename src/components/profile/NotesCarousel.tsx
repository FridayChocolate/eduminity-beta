import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, TrendingUp, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  price: number;
  rating: number;
  reviews: number;
  sales: number;
  thumbnail: string;
  createdAt: string;
  isBestseller?: boolean;
  isNew?: boolean;
}

interface NotesCarouselProps {
  notes: NoteItem[];
  title?: string;
  showFilters?: boolean;
  onNoteClick?: (noteId: string) => void;
  className?: string;
}

type SortOption = "bestselling" | "highest-rated" | "newest";

export function NotesCarousel({
  notes,
  title = "Popular Notes",
  showFilters = false,
  onNoteClick,
  className
}: NotesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={handleScroll}
      >
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNoteClick?.(note.id)}
            className="flex-shrink-0 w-[240px] cursor-pointer group"
          >
            <div className="relative rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              {/* Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-primary/20 to-accent/20">
                <img
                  src={note.thumbnail || "/placeholder.svg"}
                  alt={note.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {note.isBestseller && (
                    <Badge className="bg-amber-500/90 text-white text-[10px]">
                      <Award className="h-3 w-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                  {note.isNew && (
                    <Badge className="bg-emerald-500/90 text-white text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                
                {/* Price */}
                <div className="absolute bottom-2 right-2">
                  <div className="px-2 py-1 rounded-md bg-background/90 backdrop-blur text-sm font-bold">
                    {note.price} coins
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <Badge variant="outline" className="mb-2 text-[10px]">
                  {note.subject}
                </Badge>
                
                <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {note.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-foreground">{note.rating}</span>
                    <span>({note.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    <span>{note.sales}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Full notes grid with filters
interface NotesGridProps {
  notes: NoteItem[];
  title?: string;
  onNoteClick?: (noteId: string) => void;
  className?: string;
}

export function NotesGrid({ notes, title = "All Notes", onNoteClick, className }: NotesGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("bestselling");

  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortBy) {
      case "bestselling":
        return b.sales - a.sales;
      case "highest-rated":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="bestselling" className="text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Best Selling
            </TabsTrigger>
            <TabsTrigger value="highest-rated" className="text-xs sm:text-sm">
              <Star className="h-3 w-3 mr-1" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="newest" className="text-xs sm:text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Newest
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onNoteClick?.(note.id)}
            className="cursor-pointer group"
          >
            <div className="relative rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
                <img
                  src={note.thumbnail || "/placeholder.svg"}
                  alt={note.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {note.isBestseller && (
                    <Badge className="bg-amber-500/90 text-white text-[10px]">
                      <Award className="h-3 w-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                </div>
                
                <div className="absolute bottom-2 right-2">
                  <div className="px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur font-bold">
                    {note.price} coins
                  </div>
                </div>
              </div>

              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-[10px]">
                  {note.subject}
                </Badge>
                
                <h4 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                  {note.title}
                </h4>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-foreground">{note.rating}</span>
                    <span>({note.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    <span>{note.sales} sales</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
