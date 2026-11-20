import { ContributorLayout } from "@/layouts/ContributorLayout";
import { EarningsOverview } from "@/components/contributor/EarningsCard";
import { UploadCard } from "@/components/contributor/UploadCard";
import { MyUploadsCard } from "@/components/contributor/MyUploadsCard";
import { AnalyticsCard } from "@/components/contributor/AnalyticsCard";
import { ReviewsCard } from "@/components/contributor/ReviewsCard";
import { GrowthTipsCard } from "@/components/contributor/GrowthTipsCard";
import { ProfileCard } from "@/components/contributor/ProfileCard";
import { Sparkles, TrendingUp } from "lucide-react";

export default function ContributorDashboard() {
  return (
    <ContributorLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-creator-primary animate-pulse" />
          <span className="text-sm font-medium text-creator-primary">Creator Studio</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold creator-text-gradient">
          Welcome back, Creator! 🚀
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Your content is performing great this week
        </p>
      </div>

      {/* Earnings Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Earnings Overview
        </h2>
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
          <GrowthTipsCard />
        </div>
      </div>
    </ContributorLayout>
  );
}
