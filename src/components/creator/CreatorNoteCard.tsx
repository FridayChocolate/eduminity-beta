import { motion } from "framer-motion";
import { Star, Download, Eye, Coins, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RequestHelpButton } from "@/components/help-request";

interface NoteData {
  id: string;
  title: string;
  subject: string;
  price: number;
  rating: number;
  reviews: number;
  sales: number;
  thumbnail: string;
  createdAt: string;
}

interface CreatorNoteCardProps {
  note: NoteData;
  index: number;
}

export function CreatorNoteCard({ note, index }: CreatorNoteCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePurchase = () => {
    if (!user) {
      toast.info("Please login to purchase notes");
      navigate("/auth");
      return;
    }
    // Handle purchase logic
    toast.success("Purchase flow initiated!");
  };

  const handlePreview = () => {
    // Handle preview logic
    toast.info("Preview coming soon!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group bg-card/50 backdrop-blur border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
        <img 
          src={note.thumbnail} 
          alt={note.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Preview Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          onClick={handlePreview}
        >
          <Eye className="h-4 w-4 mr-1" />
          Quick Preview
        </Button>

        {/* Subject Badge */}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground">
          {note.subject}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {note.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            {note.rating}
          </span>
          <span className="text-border">•</span>
          <span>{note.reviews} reviews</span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {note.sales}
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="h-5 w-5 text-amber-500" />
            <span className="text-xl font-bold">{note.price}</span>
            <span className="text-sm text-muted-foreground">coins</span>
          </div>
          
          <div className="flex gap-2">
            <RequestHelpButton
              contributorName="Contributor"
              contributorId="contributor-1"
              prefilledTopic={note.title}
              variant="outline"
              size="sm"
            />
            <Button 
              size="sm" 
              onClick={handlePurchase}
              className="bg-primary hover:bg-primary/90"
            >
              Purchase
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
