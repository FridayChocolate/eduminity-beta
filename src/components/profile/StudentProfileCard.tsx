import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Camera, 
  BookOpen, 
  Star, 
  Trophy, 
  Target, 
  TrendingUp,
  Award,
  Flame,
  Zap,
  GraduationCap,
  Clock,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBadge {
  id: string;
  name: string;
  icon: typeof Trophy;
  description: string;
  progress: number;
  maxProgress: number;
  earned: boolean;
  color: string;
}

interface PurchasedSubject {
  id: string;
  name: string;
  notesCount: number;
  completedNotes: number;
  lastAccessed: string;
}

interface ReviewGiven {
  id: string;
  creatorName: string;
  noteTitle: string;
  rating: number;
  date: string;
}

interface StudentProfileCardProps {
  student: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
    email: string;
    memberSince: string;
    totalPurchases: number;
    totalReviews: number;
    streakDays: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  progressBadges: ProgressBadge[];
  purchasedSubjects: PurchasedSubject[];
  reviewsGiven: ReviewGiven[];
  isOwnProfile?: boolean;
  onEditAvatar?: () => void;
  className?: string;
}

export function StudentProfileCard({
  student,
  progressBadges,
  purchasedSubjects,
  reviewsGiven,
  isOwnProfile = true,
  onEditAvatar,
  className
}: StudentProfileCardProps) {
  const levelProgress = (student.xp / student.xpToNextLevel) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-student-primary/10 via-transparent to-student-secondary/10" />
        
        <CardContent className="relative pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-xl">
                <AvatarImage src={student.avatarUrl || undefined} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-student-primary to-student-secondary text-white">
                  {student.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {isOwnProfile && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                  onClick={onEditAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              
              {/* Streak badge */}
              {student.streakDays > 0 && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Flame className="h-3 w-3" />
                  {student.streakDays}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{student.displayName}</h2>
              <p className="text-muted-foreground mb-3">@{student.username}</p>

              {/* Level progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-md bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold">
                      Level {student.level}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {student.xp} / {student.xpToNextLevel} XP
                    </span>
                  </div>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{student.totalPurchases}</span>
                  <span className="text-muted-foreground">purchased</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold">{student.totalReviews}</span>
                  <span className="text-muted-foreground">reviews</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Since {student.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Badges */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-400" />
            Progress Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progressBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative p-4 rounded-xl border text-center transition-all",
                  badge.earned 
                    ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30" 
                    : "bg-muted/30 border-border/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center",
                  badge.earned 
                    ? `bg-gradient-to-br ${badge.color} shadow-lg` 
                    : "bg-muted"
                )}>
                  <badge.icon className={cn(
                    "h-6 w-6",
                    badge.earned ? "text-white" : "text-muted-foreground"
                  )} />
                </div>
                
                <h4 className={cn(
                  "font-semibold text-sm mb-1",
                  !badge.earned && "text-muted-foreground"
                )}>
                  {badge.name}
                </h4>
                
                {!badge.earned && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {badge.progress} / {badge.maxProgress}
                    </div>
                    <Progress 
                      value={(badge.progress / badge.maxProgress) * 100} 
                      className="h-1"
                    />
                  </div>
                )}
                
                {badge.earned && (
                  <Badge className="mt-2 bg-amber-500/20 text-amber-400 text-[10px]">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Earned
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purchased Subjects */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            My Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchasedSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{subject.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {subject.completedNotes} / {subject.notesCount} notes completed
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Progress 
                      value={(subject.completedNotes / subject.notesCount) * 100} 
                      className="w-20 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round((subject.completedNotes / subject.notesCount) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last: {subject.lastAccessed}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Given */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-amber-400" />
            Reviews Given
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reviewsGiven.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div>
                  <h4 className="font-semibold text-sm">{review.noteTitle}</h4>
                  <p className="text-xs text-muted-foreground">by {review.creatorName}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-3 w-3",
                          i < review.rating 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-muted"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
