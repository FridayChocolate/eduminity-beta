import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  CreatorProfileHeader, 
  NotesCarousel, 
  NotesGrid,
  BadgeType
} from "@/components/profile";
import { RequestHelpDialog } from "@/components/help-request";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

// Mock creator data - would come from database
const mockCreator = {
  id: "1",
  displayName: "Mohammad Rahman",
  username: "mohammad-rahman",
  avatarUrl: null,
  institution: "University of Dhaka",
  department: "Physics",
  cgpa: "3.85",
  year: "3rd Year",
  bio: "Physics enthusiast with a passion for making complex concepts simple. I specialize in quantum mechanics and mathematical physics. My notes are designed to help you understand difficult topics through clear explanations and visual diagrams. Join 300+ students who've improved their grades with my materials!",
  isVerified: true,
  isPremium: true,
  badges: ["top-seller", "five-star-creator", "verified-contributor"] as BadgeType[],
  rating: 4.9,
  reviewCount: 156,
  totalSales: 342,
  memberSince: "Jan 2024"
};

type CreatorNote = {
  id: string; title: string; subject: string; price: number; rating: number;
  reviews: number; sales: number; thumbnail: string; createdAt: string;
  isBestseller?: boolean; isNew?: boolean;
};

export default function PublicCreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(mockCreator);
  const [notes, setNotes] = useState<CreatorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCreator(mockCreator);
      // Creator listings are not connected yet; show an honest empty state instead of examples.
      setNotes([]);
      setLoading(false);
    };
    fetchData();
  }, [username]);

  const handleRequestHelp = () => {
    setHelpDialogOpen(true);
  };

  const handleRateCreator = () => {
    setRateDialogOpen(true);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Thank you for your review!");
    setRateDialogOpen(false);
    setRatingValue(0);
    setReviewText("");
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/app/materials?note=${noteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const popularNotes = notes.filter(n => n.isBestseller || n.sales > 50).slice(0, 6);

  return (
    <>
      <Seo>
        <title>{creator.displayName} - Creator Profile | Eduminity</title>
        <meta name="description" content={`${creator.displayName} - ${creator.bio.substring(0, 150)}...`} />
        <meta property="og:title" content={`${creator.displayName} - Creator Profile`} />
        <meta property="og:description" content={creator.bio.substring(0, 150)} />
        <link rel="canonical" href={`/creator/${creator.username}`} />
      </Seo>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Creator Profile</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Creator Header with all info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-3xl border border-border/50 bg-card/30 backdrop-blur overflow-hidden"
          >
            <CreatorProfileHeader
              creator={creator}
              onRequestHelp={handleRequestHelp}
              onRateCreator={handleRateCreator}
            />
          </motion.div>

          {/* Popular Notes Carousel */}
          {popularNotes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <NotesCarousel
                notes={popularNotes}
                title="Most Popular Notes"
                onNoteClick={handleNoteClick}
              />
            </motion.section>
          )}

          {/* All Notes Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {notes.length > 0 ? (
              <NotesGrid
                notes={notes}
                title={`All Notes by ${creator.displayName}`}
                onNoteClick={handleNoteClick}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
                <h2 className="text-xl font-semibold mb-2">No published notes yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {creator.displayName} hasn't listed any study materials on Eduminity yet. Check back soon, or send a help request to ask about a topic.
                </p>
              </div>
            )}
          </motion.section>
        </main>

        <Footer />
      </div>

      {/* Help Request Dialog */}
      <RequestHelpDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
        contributorName={creator.displayName}
        contributorId={creator.id}
      />

      {/* Rate Creator Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate {creator.displayName}</DialogTitle>
            <DialogDescription>
              Share your experience with this creator's notes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= ratingValue 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-muted-foreground"
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="review">Your Review (optional)</Label>
              <Textarea
                id="review"
                placeholder="Tell others about your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleSubmitRating}
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
