import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, MessageSquare, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  materialTitle: string;
  timeAgo: string;
}

const reviews: Review[] = [
  {
    id: "1",
    username: "Rafiq Ahmed",
    rating: 5,
    comment: "Best physics notes I've found! Very clear explanations.",
    materialTitle: "HSC Physics Complete Guide",
    timeAgo: "2 hours ago"
  },
  {
    id: "2",
    username: "Tasnim Akter",
    rating: 5,
    comment: "Helped me a lot in my exams. Highly recommended!",
    materialTitle: "Organic Chemistry Notes",
    timeAgo: "1 day ago"
  },
  {
    id: "3",
    username: "Mehedi Hasan",
    rating: 4,
    comment: "Good content but could use more examples.",
    materialTitle: "ICT Revision Sheet",
    timeAgo: "3 days ago"
  }
];

export const ReviewsCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="creator-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            Recent Reviews
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-creator-primary hover:text-creator-primary hover:bg-creator-primary/10"
            onClick={() => navigate("/app/my-reviews")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((review) => (
          <div 
            key={review.id}
            className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-creator-border/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-creator-primary to-creator-cyan flex items-center justify-center text-xs font-bold text-background">
                  {review.username.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{review.username}</h4>
                  <p className="text-xs text-muted-foreground">{review.timeAgo}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">"{review.comment}"</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-creator-cyan">on {review.materialTitle}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-muted-foreground hover:text-creator-primary"
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> Thank
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
