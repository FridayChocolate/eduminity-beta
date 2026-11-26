import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { ModeProvider } from "@/contexts/ModeContext";
import { ModeTransition } from "@/components/ModeTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthNavigatorBridge, useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { InstallPrompt } from "@/components/InstallPrompt";

// Public pages
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PublicCreatorProfile from "./pages/PublicCreatorProfile";
import Ak47EasterEgg from "@/pages/Ak47EasterEgg";

// Core App pages
import AppHome from "./pages/app/AppHome";
import Profile from "./pages/Profile";
import StudyMaterials from "./pages/StudyMaterials";
import MaterialDetails from "./pages/MaterialDetails";
import UploadNotes from "./pages/app/UploadNotes";
import Notifications from "./pages/app/Notifications";
import FeedbackUpdates from "./pages/FeedbackUpdates";
import NotFound from "./pages/NotFound";

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading Eduminity...</p>
      </div>
    );
  }

  return user ? <Navigate to="/app" replace /> : <HomePage />;
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
                {/* Public Routes */}
                <Route path="/" element={<HomeRoute />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/creator/:username" element={<PublicCreatorProfile />} />
                <Route path="/secret/ak47" element={<Ak47EasterEgg />} />

                {/* Core Protected App Routes */}
                <Route path="/app" element={<ProtectedRoute><AppHome /></ProtectedRoute>} />
                <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/app/materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
                <Route path="/app/material/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/app/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/app/upload-notes" element={<ProtectedRoute><UploadNotes /></ProtectedRoute>} />
                <Route path="/app/updates" element={<ProtectedRoute><FeedbackUpdates /></ProtectedRoute>} />
                <Route path="/app/feedback" element={<ProtectedRoute><FeedbackUpdates /></ProtectedRoute>} />
                <Route path="/app/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Admin Command Center */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                {/* Clean Redirects for Retired & Legacy URLs */}
                <Route path="/app/student-dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/app/creator-studio" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/my-uploads" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/creator-analytics" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/creator-reviews" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/creator-earnings" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/withdraw" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/help-requests" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/creator-:path" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/questions" element={<Navigate to="/app/materials" replace />} />
                <Route path="/app/community" element={<Navigate to="/app/updates" replace />} />
                <Route path="/app/community/*" element={<Navigate to="/app/updates" replace />} />
                <Route path="/app/wallet" element={<Navigate to="/app/profile" replace />} />
                <Route path="/upload-material" element={<Navigate to="/app/upload-notes" replace />} />
                <Route path="/app/upload" element={<Navigate to="/app/upload-notes" replace />} />
                <Route path="/app/student-profile" element={<Navigate to="/app/profile" replace />} />
                <Route path="/app/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/app/payment" element={<Navigate to="/app/materials" replace />} />
                <Route path="/app/premium" element={<Navigate to="/app" replace />} />
                <Route path="/app/donate" element={<Navigate to="/app" replace />} />
                <Route path="/app/write" element={<Navigate to="/app/upload-notes" replace />} />
                <Route path="/app/theme-settings" element={<Navigate to="/app/profile" replace />} />
                <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/student-dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/creator-studio" element={<Navigate to="/app/profile" replace />} />
                <Route path="/questions" element={<Navigate to="/app/materials" replace />} />
                <Route path="/materials" element={<Navigate to="/app/materials" replace />} />
                <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetails /></ProtectedRoute>} />
                <Route path="/wallet" element={<Navigate to="/app/profile" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
            <InstallPrompt />
          </BrowserRouter>
        </ModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;