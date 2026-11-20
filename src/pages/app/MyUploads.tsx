import { useState } from "react";
import { ContributorLayout } from "@/layouts/ContributorLayout";
import { MyUploadsList } from "@/components/contributor/MyUploadsList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { PageBackButton } from "@/components/ui/page-back-button";

export type UploadFilter = "all" | "approved" | "pending" | "rejected" | "submitted" | "under_review";

const MyUploads = () => {
  const [activeFilter, setActiveFilter] = useState<UploadFilter>("all");

  return (
    <ContributorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PageBackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-creator-primary via-creator-violet to-creator-cyan bg-clip-text text-transparent">
              My Uploads
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your uploaded study materials
            </p>
          </div>
        </div>

        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as UploadFilter)} className="w-full">
          <TabsList className="bg-muted/30 border border-creator-border/30">
            <TabsTrigger value="all" className="data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary transition-all">
              <FileText className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 transition-all">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 transition-all">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          <MyUploadsList filter={activeFilter} />
        </div>
      </div>
    </ContributorLayout>
  );
};

export default MyUploads;
