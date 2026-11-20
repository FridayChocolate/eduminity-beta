import { ContributorLayout } from "@/layouts/ContributorLayout";
import { ReviewsCard } from "@/components/contributor/ReviewsCard";
import { PageBackButton } from "@/components/ui/page-back-button";

const CreatorReviews = () => {
  return (
    <ContributorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PageBackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-creator-primary via-creator-violet to-creator-cyan bg-clip-text text-transparent">
              Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              See what students are saying about your content
            </p>
          </div>
        </div>

        <ReviewsCard />
      </div>
    </ContributorLayout>
  );
};

export default CreatorReviews;
