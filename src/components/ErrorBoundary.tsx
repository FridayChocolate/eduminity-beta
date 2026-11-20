import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error silently without interrupting user experience
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                We encountered an unexpected error. Please try refreshing the page or go back to the home page.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleRetry} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component for dashboard-specific errors
export const DashboardErrorFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="max-w-md w-full border-border/50">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <CardTitle className="text-xl">Dashboard Loading Issue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center text-sm">
          We're having trouble loading your dashboard. This might be a temporary issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          <Button 
            onClick={() => window.location.href = "/auth"} 
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
