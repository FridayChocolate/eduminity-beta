import { useState } from "react";
import { Seo } from "@/components/Seo";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IncomingRequestsPanel, 
  HelpSessionChat,
  HelpRequest,
  mockActiveSession
} from "@/components/help-request";
import { PageBackButton } from "@/components/ui/page-back-button";

export default function HelpRequests() {
  const [activeSession, setActiveSession] = useState<HelpRequest | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleAcceptRequest = (request: HelpRequest) => {
    setActiveSession({ ...request, status: "accepted" });
    setShowChat(true);
  };

  const handleSessionComplete = () => {
    setActiveSession(null);
    setShowChat(false);
  };

  // Check if there's an active session (mock)
  const hasActiveSession = activeSession || mockActiveSession.status === "accepted";

  return (
    <>
      <Seo>
        <title>Help Requests | StudyNotes</title>
        <meta name="description" content="Manage incoming help requests from students" />
      </Seo>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <PageBackButton />
            <h1 className="text-2xl font-bold">Help Requests</h1>
          </div>

          <Tabs defaultValue={showChat ? "active" : "incoming"} className="space-y-6">
            <TabsList>
              <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
              <TabsTrigger value="active" disabled={!hasActiveSession}>
                Active Session
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-4">
              <IncomingRequestsPanel onAcceptRequest={handleAcceptRequest} />
            </TabsContent>

            <TabsContent value="active">
              {(activeSession || hasActiveSession) && (
                <HelpSessionChat
                  request={activeSession || mockActiveSession}
                  isContributor={true}
                  onComplete={handleSessionComplete}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="text-center py-12 text-muted-foreground">
                <p>Session history will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
}
