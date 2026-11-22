import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { ChatBot } from "@/components/ChatBot";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { ModeProvider } from "@/contexts/ModeContext";
import { ModeTransition } from "@/components/ModeTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthNavigatorBridge, useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { InstallPrompt } from "@/components/InstallPrompt";

// Public pages
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PublicCreatorProfile from "./pages/PublicCreatorProfile";

// App pages
import AppHome from "./pages/app/AppHome";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ContributorDashboard from "./pages/ContributorDashboard";
import QASection from "./pages/QASection";
import StudyMaterials from "./pages/StudyMaterials";
import MaterialDetails from "./pages/MaterialDetails";
import Community from "./pages/Community";
import DiscussionThread from "./pages/DiscussionThread";
import Wallet from "./pages/Wallet";
import Premium from "./pages/Premium";
import Donate from "./pages/Donate";
import Payment from "./pages/Payment";
import WriteStory from "./pages/WriteStory";
import ThemeSettings from "./pages/ThemeSettings";
import NotFound from "./pages/NotFound";

// Creator pages
import MyUploads from "./pages/app/MyUploads";
import UploadNotes from "./pages/app/UploadNotes";
import CreatorAnalytics from "./pages/app/CreatorAnalytics";
import CreatorReviews from "./pages/app/CreatorReviews";
import CreatorEarnings from "./pages/app/CreatorEarnings";
import Withdraw from "./pages/app/Withdraw";
import Notifications from "./pages/app/Notifications";
import HelpRequests from "./pages/app/HelpRequests";
import FeedbackUpdates from "./pages/FeedbackUpdates";
import UploadMaterial from "./pages/UploadMaterial";
import Ak47EasterEgg from "@/pages/Ak47EasterEgg";

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return user ? <Index /> : <HomePage />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModeProvider>
          <Toaster />
          <Sonner />
          <ModeTransition />
          <BrowserRouter>
            <AuthNavigatorBridge />
            <ScrollToTop />
            <PageTransition>
              <Routes>
                {/* Public Marketing Pages */}
                <Route path="/" element={<HomeRoute />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/creator/:username" element={<PublicCreatorProfile />} />
                <Route path="/secret/ak47" element={<Ak47EasterEgg />} />

                {/* Shared Protected App Routes */}
                <Route path="/app" element={<ProtectedRoute><AppHome /></ProtectedRoute>} />
                <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/app/questions" element={<ProtectedRoute><QASection /></ProtectedRoute>} />
                <Route path="/app/materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
                <Route path="/app/material/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/app/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/upload-material" element={<ProtectedRoute><UploadMaterial /></ProtectedRoute>} />
                <Route path="/app/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/app/community/thread/:id" element={<ProtectedRoute><DiscussionThread /></ProtectedRoute>} />
                <Route path="/app/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/app/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/app/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
                <Route path="/app/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
                <Route path="/app/write" element={<ProtectedRoute><WriteStory /></ProtectedRoute>} />
                <Route path="/app/theme-settings" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
                <Route path="/app/feedback" element={<ProtectedRoute><FeedbackUpdates /></ProtectedRoute>} />
                <Route path="/app/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Student-Only Routes */}
                <Route path="/app/student-dashboard" element={<ProtectedRoute allowedPortal="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="/app/student-profile" element={<ProtectedRoute allowedPortal="student"><StudentProfile /></ProtectedRoute>} />

                {/* Creator-Only Routes */}
                <Route path="/app/creator-studio" element={<ProtectedRoute allowedPortal="contributor"><ContributorDashboard /></ProtectedRoute>} />
                <Route path="/app/my-uploads" element={<ProtectedRoute allowedPortal="contributor"><MyUploads /></ProtectedRoute>} />
                <Route path="/app/upload-notes" element={<ProtectedRoute allowedPortal="contributor"><UploadNotes /></ProtectedRoute>} />
                <Route path="/app/upload" element={<Navigate to="/app/upload-notes" replace />} />
                <Route path="/app/creator-analytics" element={<ProtectedRoute allowedPortal="contributor"><CreatorAnalytics /></ProtectedRoute>} />
                <Route path="/app/creator-reviews" element={<ProtectedRoute allowedPortal="contributor"><CreatorReviews /></ProtectedRoute>} />
                <Route path="/app/creator-earnings" element={<ProtectedRoute allowedPortal="contributor"><CreatorEarnings /></ProtectedRoute>} />
                <Route path="/app/withdraw" element={<ProtectedRoute allowedPortal="contributor"><Withdraw /></ProtectedRoute>} />
                <Route path="/app/help-requests" element={<ProtectedRoute allowedPortal="contributor"><HelpRequests /></ProtectedRoute>} />
                <Route path="/app/creator-:path" element={<Navigate to="/app/creator-studio" replace />} />

                {/* Legacy routes */}
                <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="/student-dashboard" element={<Navigate to="/app/student-dashboard" replace />} />
                <Route path="/creator-studio" element={<Navigate to="/app/creator-studio" replace />} />
                <Route path="/questions" element={<Navigate to="/app/questions" replace />} />
                <Route path="/materials" element={<Navigate to="/app/materials" replace />} />
                <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/community" element={<Navigate to="/app/community" replace />} />
                <Route path="/discussions/:id" element={<ProtectedRoute><DiscussionThread /></ProtectedRoute>} />
                <Route path="/wallet" element={<Navigate to="/app/wallet" replace />} />
                <Route path="/premium" element={<Navigate to="/app/premium" replace />} />
                <Route path="/donate" element={<Navigate to="/app/donate" replace />} />
                <Route path="/write" element={<Navigate to="/app/write" replace />} />
                <Route path="/theme-settings" element={<Navigate to="/app/theme-settings" replace />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </PageTransition>
            <QuickActionsMenu />
            <ChatBot />
            <InstallPrompt />
          </BrowserRouter>
        </ModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;