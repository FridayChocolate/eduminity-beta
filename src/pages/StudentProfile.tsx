import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentProfileCard } from "@/components/profile";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageBackButton } from "@/components/ui/page-back-button";
import { Trophy, BookOpen, Star, Flame, Target, Award, Zap, Medal } from "lucide-react";

// Mock data - would come from database
const mockProgressBadges = [
  { id: "1", name: "First Purchase", icon: BookOpen, description: "Buy your first note", progress: 1, maxProgress: 1, earned: true, color: "from-blue-500 to-cyan-500" },
  { id: "2", name: "Bookworm", icon: Target, description: "Purchase 10 notes", progress: 7, maxProgress: 10, earned: false, color: "from-purple-500 to-pink-500" },
  { id: "3", name: "Reviewer", icon: Star, description: "Leave 5 reviews", progress: 5, maxProgress: 5, earned: true, color: "from-amber-500 to-orange-500" },
  { id: "4", name: "Streak Master", icon: Flame, description: "7-day streak", progress: 4, maxProgress: 7, earned: false, color: "from-red-500 to-orange-500" },
  { id: "5", name: "Scholar", icon: Award, description: "Complete 20 notes", progress: 12, maxProgress: 20, earned: false, color: "from-emerald-500 to-teal-500" },
  { id: "6", name: "Expert Learner", icon: Zap, description: "Reach Level 10", progress: 5, maxProgress: 10, earned: false, color: "from-violet-500 to-purple-500" },
  { id: "7", name: "Top Student", icon: Trophy, description: "Complete all subjects", progress: 2, maxProgress: 5, earned: false, color: "from-yellow-500 to-amber-500" },
  { id: "8", name: "Pioneer", icon: Medal, description: "Be among first 100 users", progress: 1, maxProgress: 1, earned: true, color: "from-indigo-500 to-blue-500" }
];

const mockPurchasedSubjects = [
  { id: "1", name: "Physics", notesCount: 8, completedNotes: 5, lastAccessed: "2 hours ago" },
  { id: "2", name: "Mathematics", notesCount: 12, completedNotes: 8, lastAccessed: "Yesterday" },
  { id: "3", name: "Chemistry", notesCount: 6, completedNotes: 2, lastAccessed: "3 days ago" }
];

const mockReviewsGiven = [
  { id: "1", creatorName: "Mohammad Rahman", noteTitle: "Quantum Mechanics Complete Guide", rating: 5, date: "Dec 15, 2024" },
  { id: "2", creatorName: "Fatima Khan", noteTitle: "Organic Chemistry Basics", rating: 4, date: "Dec 10, 2024" },
  { id: "3", creatorName: "Ahmed Hassan", noteTitle: "Calculus for Engineers", rating: 5, date: "Dec 5, 2024" }
];

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [student] = useState({
    id: user?.id || "1",
    displayName: "Student User",
    username: "student-user",
    avatarUrl: avatarUrl,
    email: user?.email || "student@example.com",
    memberSince: "Jan 2024",
    totalPurchases: 26,
    totalReviews: 12,
    streakDays: 4,
    level: 5,
    xp: 1250,
    xpToNextLevel: 2000
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .single();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: data.publicUrl });

      setAvatarUrl(data.publicUrl);
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleEditAvatar = () => {
    fileInputRef.current?.click();
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

  return (
    <>
      <Seo>
        <title>My Profile | Eduminity</title>
        <meta name="description" content="View and manage your student profile on Eduminity" />
      </Seo>

      <Header />
      
      <div className="min-h-screen bg-background pt-20 px-4 md:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <PageBackButton className="mb-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-student-primary via-primary to-student-secondary bg-clip-text text-transparent">
              My Profile
            </h1>

            <StudentProfileCard
              student={{
                ...student,
                avatarUrl
              }}
              progressBadges={mockProgressBadges}
              purchasedSubjects={mockPurchasedSubjects}
              reviewsGiven={mockReviewsGiven}
              isOwnProfile={true}
              onEditAvatar={handleEditAvatar}
            />
          </motion.div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
      </div>
    </>
  );
}
