import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, CheckCircle, GraduationCap, MapPin, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProfileCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Placeholder data - would come from database
  const profile = {
    name: "Mohammad Rahman",
    university: "University of Dhaka",
    department: "Physics",
    year: "3rd Year",
    location: "Dhaka, Bangladesh",
    verified: true,
    rating: 4.9,
    totalSales: 342,
    badges: ["Top Seller", "5-Star Creator"]
  };

  return (
    <Card className="creator-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-creator-violet" />
            Profile & Qualifications
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-creator-primary hover:text-creator-primary hover:bg-creator-primary/10"
            onClick={() => navigate("/app/creator-profile")}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-creator-primary via-creator-cyan to-creator-violet flex items-center justify-center text-2xl font-bold text-background shadow-lg">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              {profile.verified && (
                <CheckCircle className="h-4 w-4 text-creator-cyan fill-creator-cyan/20" />
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {profile.university}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/30">
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-medium mt-0.5">{profile.department}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30">
            <p className="text-xs text-muted-foreground">Year</p>
            <p className="text-sm font-medium mt-0.5">{profile.year}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {profile.location}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-creator-primary/10 to-creator-cyan/10 border border-creator-primary/20">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{profile.rating}</span>
            <span className="text-xs text-muted-foreground">rating</span>
          </div>
          <div className="w-px h-4 bg-creator-border" />
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-creator-primary" />
            <span className="font-semibold">{profile.totalSales}</span>
            <span className="text-xs text-muted-foreground">sales</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <Badge 
              key={badge} 
              variant="outline"
              className="bg-gradient-to-r from-creator-primary/10 to-creator-cyan/10 border-creator-primary/30 text-creator-primary"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
