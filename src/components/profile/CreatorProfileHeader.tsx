import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  CheckCircle, 
  MessageCircle, 
  Star, 
  Flag, 
  Bookmark,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { StatusBadge, PremiumBanner, NeonGlowWrapper, BadgeType } from "./StatusBadge";
import { TrustIndicators } from "./TrustIndicators";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreatorProfileHeaderProps {
  creator: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
    institution: string;
    department: string;
    cgpa: string;
    year: string;
    bio: string;
    isVerified: boolean;
    isPremium: boolean;
    badges: BadgeType[];
    rating: number;
    reviewCount: number;
    totalSales: number;
    memberSince: string;
  };
  isOwnProfile?: boolean;
  onEditAvatar?: () => void;
  onRequestHelp?: () => void;
  onRateCreator?: () => void;
  className?: string;
}

export function CreatorProfileHeader({
  creator,
  isOwnProfile = false,
  onEditAvatar,
  onRequestHelp,
  onRateCreator,
  className
}: CreatorProfileHeaderProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Creator removed from saved" : "Creator saved to your list");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/creator/${creator.username}`;
    if (navigator.share) {
      await navigator.share({ 
        title: `${creator.displayName} on Eduminity`,
        url 
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard");
    }
  };

  const handleReport = () => {
    toast.info("Report submitted. We'll review this profile.");
  };

  return (
    <div className={cn("relative", className)}>
      {/* Premium animated banner background */}
      {creator.isPremium && (
        <motion.div
          className="absolute inset-0 -top-4 rounded-3xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/15 to-violet-500/10" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
        </motion.div>
      )}

      <div className="relative z-10 p-6 md:p-8">
        {/* Top row - Avatar and Quick Actions */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
          {/* Avatar with neon glow */}
          <div className="relative">
            <NeonGlowWrapper isPremium={creator.isPremium} isVerified={creator.isVerified}>
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-2xl">
                <AvatarImage src={creator.avatarUrl || undefined} />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {creator.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </NeonGlowWrapper>
            
            {isOwnProfile && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-lg"
                onClick={onEditAvatar}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Name and badges */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className={cn(
                "text-2xl md:text-3xl font-bold",
                creator.isPremium && "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400"
              )}>
                {creator.displayName}
              </h1>
              
              {creator.isVerified && (
                <CheckCircle className="h-6 w-6 text-sky-400 fill-sky-400/20" />
              )}
            </div>

            <p className="text-muted-foreground mb-3">@{creator.username}</p>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {creator.isPremium && <StatusBadge type="premium" size="md" />}
              {creator.badges.map((badge) => (
                <StatusBadge key={badge} type={badge} size="sm" />
              ))}
            </div>
          </div>

          {/* Quick actions */}
          {!isOwnProfile && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={onRequestHelp}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Request Help
              </Button>
              
              <Button variant="outline" onClick={onRateCreator}>
                <Star className="h-4 w-4 mr-2" />
                Rate
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSave}
                className={isSaved ? "text-pink-500 border-pink-500/30" : ""}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReport} className="text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Creator
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Premium Banner */}
        {creator.isPremium && (
          <div className="mb-6">
            <PremiumBanner />
          </div>
        )}

        {/* Professional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Institution</p>
            <p className="font-semibold text-sm">{creator.institution}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Department</p>
            <p className="font-semibold text-sm">{creator.department}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">CGPA</p>
            <p className="font-semibold text-sm">{creator.cgpa}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Year</p>
            <p className="font-semibold text-sm">{creator.year}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">About</h3>
          <p className="text-foreground leading-relaxed">{creator.bio}</p>
        </div>

        {/* Trust Indicators */}
        <TrustIndicators
          rating={creator.rating}
          reviewCount={creator.reviewCount}
          totalSales={creator.totalSales}
          memberSince={creator.memberSince}
          verificationStatus={creator.isVerified ? "verified" : "not-verified"}
        />
      </div>
    </div>
  );
}
