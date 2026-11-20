import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, Search, FileQuestion, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  return (
    <>
      <Seo>
        <title>Page Not Found - Eduminity</title>
        <meta name="description" content="The page you're looking for doesn't exist. Let's get you back on track." />
      </Seo>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-teal to-neon-violet flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-neon-teal to-neon-violet bg-clip-text text-transparent">
                  Eduminity
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            {/* 404 Illustration */}
            <div className="relative mb-8">
              <div className="text-[120px] sm:text-[160px] font-bold leading-none bg-gradient-to-r from-neon-teal/20 via-neon-violet/20 to-neon-magenta/20 bg-clip-text text-transparent select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-teal to-neon-violet flex items-center justify-center shadow-glow-teal animate-float">
                  <Search className="w-10 h-10 text-background" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              Oops! Page Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-neon-teal to-neon-blue hover:shadow-glow-teal transition-all">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-neon-violet/50 text-neon-violet hover:bg-neon-violet/10">
                <Link to="/app/materials">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Materials
                </Link>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Popular pages:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/about" className="text-sm text-muted-foreground hover:text-neon-teal transition-colors">
                  About
                </Link>
                <span className="text-border">•</span>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-neon-teal transition-colors">
                  Sign Up
                </Link>
                <span className="text-border">•</span>
                <Link to="/app/questions" className="text-sm text-muted-foreground hover:text-neon-teal transition-colors">
                  Q&A
                </Link>
                <span className="text-border">•</span>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-neon-teal transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          <p>© 2025 Eduminity. Need help? <a href="mailto:support@eduminity.bd" className="text-neon-teal hover:underline">Contact Support</a></p>
        </footer>
      </div>
    </>
  );
};

export default NotFound;
