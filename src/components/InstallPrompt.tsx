import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed as an app
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Don't annoy users who already closed it this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // Check for iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (iosDevice) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Catch Android / Desktop Chrome install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in-up">
      <div className="flex items-center gap-3 rounded-2xl border border-neon-teal/40 bg-background/95 p-3.5 shadow-2xl backdrop-blur-lg">
        <img
          src="/eduminity-logo.png"
          alt="Eduminity"
          className="h-11 w-11 shrink-0 rounded-xl object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Install Eduminity App</p>
          <p className="text-xs text-muted-foreground">
            {isIOS
              ? 'Tap Share, then "Add to Home Screen"'
              : "Faster access to notes right from your home screen"}
          </p>
        </div>

        {!isIOS && (
          <Button
            size="sm"
            onClick={handleInstall}
            className="shrink-0 bg-gradient-to-r from-neon-teal to-neon-violet text-xs font-semibold"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Install
          </Button>
        )}

        <button
          onClick={handleDismiss}
          aria-label="Close install banner"
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};