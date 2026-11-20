import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Send
} from "lucide-react";

// Demo announcements data
const announcements = [
  {
    id: 1,
    type: "version",
    title: "Version 2.5.0 Released",
    description: "New dashboard analytics, improved performance, and bug fixes.",
    date: "Dec 28, 2025",
    badge: "New",
    badgeColor: "bg-neon-teal/20 text-neon-teal"
  },
  {
    id: 2,
    type: "feature",
    title: "AI-Powered Study Assistant Coming Soon",
    description: "Get personalized study recommendations and smart summaries of your notes.",
    date: "Dec 25, 2025",
    badge: "Coming Soon",
    badgeColor: "bg-neon-violet/20 text-neon-violet"
  },
  {
    id: 3,
    type: "notice",
    title: "Scheduled Maintenance",
    description: "Brief maintenance window on Jan 2nd, 2026 from 2-4 AM BDT.",
    date: "Dec 22, 2025",
    badge: "Notice",
    badgeColor: "bg-amber-500/20 text-amber-500"
  },
  {
    id: 4,
    type: "version",
    title: "Version 2.4.0 Released",
    description: "Dark mode improvements, new notification system, and wallet enhancements.",
    date: "Dec 15, 2025",
    badge: "Update",
    badgeColor: "bg-blue-500/20 text-blue-500"
  },
  {
    id: 5,
    type: "feature",
    title: "Community Forums Beta",
    description: "Join discussions, share tips, and connect with fellow students.",
    date: "Dec 10, 2025",
    badge: "Beta",
    badgeColor: "bg-neon-magenta/20 text-neon-magenta"
  },
];

const versions = [
  "2.5.0 (Current)",
  "2.4.0",
  "2.3.0",
  "2.2.0",
  "2.1.0",
  "2.0.0",
];

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case "version":
      return Rocket;
    case "feature":
      return Sparkles;
    case "notice":
      return Bell;
    default:
      return Megaphone;
  }
};

export default function FeedbackUpdates() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("announcements");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVersion) {
      toast({
        title: "Version Required",
        description: "Please select a version to review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback. It helps us improve!",
    });

    // Reset form
    setRating(0);
    setSelectedVersion("");
    setPros("");
    setCons("");
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-neon-teal to-neon-violet bg-clip-text text-transparent">
            Feedback & Updates
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest changes and share your thoughts
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            {announcements.map((item, index) => {
              const IconComponent = getAnnouncementIcon(item.type);
              return (
                <Card 
                  key={item.id} 
                  className="border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${
                        item.type === 'version' ? 'bg-neon-teal/10' :
                        item.type === 'feature' ? 'bg-neon-violet/10' :
                        'bg-amber-500/10'
                      } flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`h-5 w-5 ${
                          item.type === 'version' ? 'text-neon-teal' :
                          item.type === 'feature' ? 'text-neon-violet' :
                          'text-amber-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <Badge className={`${item.badgeColor} text-xs`}>
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Submit Your Review
                </CardTitle>
                <CardDescription>
                  Help us improve by sharing your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating */}
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
                        className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Version Selector */}
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-sm font-medium">
                    Version
                  </Label>
                  <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                    <SelectTrigger id="version" className="w-full md:w-64">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pros */}
                <div className="space-y-2">
                  <Label htmlFor="pros" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Pros
                  </Label>
                  <Textarea
                    id="pros"
                    placeholder="What do you like about the app?"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    className="min-h-24 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {pros.length}/500
                  </p>
                </div>

                {/* Cons */}
                <div className="space-y-2">
                  <Label htmlFor="cons" className="text-sm font-medium flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs font-bold">−</span>
                    Cons
                  </Label>
                  <Textarea
                    id="cons"
                    placeholder="What could be improved?"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    className="min-h-24 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {cons.length}/500
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-gradient-to-r from-neon-teal to-neon-violet hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
