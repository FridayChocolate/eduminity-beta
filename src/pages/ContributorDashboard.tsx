import { ContributorLayout } from "@/layouts/ContributorLayout";
import { EarningsOverview } from "@/components/contributor/EarningsCard";
import { UploadCard } from "@/components/contributor/UploadCard";
import { MyUploadsCard } from "@/components/contributor/MyUploadsCard";
import { AnalyticsCard } from "@/components/contributor/AnalyticsCard";
import { ReviewsCard } from "@/components/contributor/ReviewsCard";
import { ProfileCard } from "@/components/contributor/ProfileCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ContributorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

  return (
    <ContributorLayout>
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-creator-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-creator-primary">
              Creator Studio
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold creator-text-gradient">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your published notes, track student reviews, and monitor your 80% creator earnings.
          </p>
        </div>

        <Button
          onClick={() => navigate("/app/upload-notes")}
          className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Material
        </Button>
      </div>

      {/* Earnings Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
        <EarningsOverview />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <MyUploadsCard />
          <AnalyticsCard />
          <ReviewsCard />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <UploadCard />
          <ProfileCard />
        </div>
      </div>
    </ContributorLayout>
  );
}