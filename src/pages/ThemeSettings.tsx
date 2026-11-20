import { Seo } from "@/components/Seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Type, Volume2, VolumeX, Sparkles, BookOpen, Cpu, Check, Play } from "lucide-react";
import { useFont, fontOptions, FontStyle } from "@/hooks/useFont";
import { useSound, soundOptions, SoundStyle } from "@/hooks/useSound";
import { cn } from "@/lib/utils";

const ThemeSettings = () => {
  const { font, setFont } = useFont();
  const { soundStyle, setSoundStyle, playClickSound, volume, setVolume } = useSound();

  const sciFiFonts = fontOptions.filter(f => f.category === "sci-fi");
  const classicFonts = fontOptions.filter(f => f.category === "classic");
  const modernFonts = fontOptions.filter(f => f.category === "modern");

  const handleFontSelect = (fontId: FontStyle) => {
    setFont(fontId);
  };

  const handleSoundSelect = (soundId: SoundStyle) => {
    setSoundStyle(soundId);
  };

  const handlePreviewSound = (soundId: SoundStyle) => {
    const originalStyle = soundStyle;
    setSoundStyle(soundId);
    // Small delay to allow state update
    setTimeout(() => {
      playClickSound();
      // Restore original style after preview
      setTimeout(() => setSoundStyle(originalStyle), 100);
    }, 50);
  };

  const FontCard = ({ fontOption }: { fontOption: typeof fontOptions[0] }) => {
    const isActive = font === fontOption.id;
    return (
      <button
        onClick={() => handleFontSelect(fontOption.id)}
        className={cn(
          "relative p-4 rounded-xl border-2 transition-all duration-300 text-left w-full group",
          "hover:scale-[1.02] hover:shadow-lg",
          isActive 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-border hover:border-primary/50 bg-card"
        )}
        data-font-preview="true"
      >
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h3 
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: fontOption.family }}
          >
            {fontOption.name}
          </h3>
          <p 
            className="text-sm text-muted-foreground"
            style={{ fontFamily: fontOption.family }}
          >
            {fontOption.preview}
          </p>
          <p 
            className="text-xs text-foreground/70 leading-relaxed"
            style={{ fontFamily: fontOption.family }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </button>
    );
  };

  const SoundCard = ({ soundOption }: { soundOption: typeof soundOptions[0] }) => {
    const isActive = soundStyle === soundOption.id;
    return (
      <div
        className={cn(
          "relative p-4 rounded-xl border-2 transition-all duration-300 group",
          isActive 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-border hover:border-primary/50 bg-card"
        )}
      >
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {soundOption.id === "none" ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {soundOption.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {soundOption.description}
          </p>
          <div className="flex gap-2">
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleSoundSelect(soundOption.id)}
              className="flex-1"
            >
              {isActive ? "Selected" : "Select"}
            </Button>
            {soundOption.id !== "none" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreviewSound(soundOption.id)}
                className="px-3"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Seo>
        <title>Theme Settings - EDUMINITY</title>
        <meta name="description" content="Customize your EDUMINITY experience with fonts and sound effects" />
      </Seo>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Theme Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Customize your visual and audio experience
            </p>
          </div>

          {/* Sound Effects Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sound Effects</CardTitle>
                  <CardDescription>Choose satisfying click sounds for interactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Volume</span>
                  <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={([val]) => setVolume(val)}
                    max={1}
                    min={0}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              <Separator />
              
              {/* Sound Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {soundOptions.map((option) => (
                  <SoundCard key={option.id} soundOption={option} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Font Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Type className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Font Themes</CardTitle>
                  <CardDescription>Select a font style that matches your vibe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Sci-Fi Fonts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-neon-teal" />
                  <h3 className="text-lg font-semibold">Sci-Fi Fonts</h3>
                  <Badge variant="outline" className="text-xs">Futuristic</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sciFiFonts.map((fontOption) => (
                    <FontCard key={fontOption.id} fontOption={fontOption} />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Classic Fonts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-neon-violet" />
                  <h3 className="text-lg font-semibold">Classic Fonts</h3>
                  <Badge variant="outline" className="text-xs">Elegant</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classicFonts.map((fontOption) => (
                    <FontCard key={fontOption.id} fontOption={fontOption} />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Modern Fonts */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neon-magenta" />
                  <h3 className="text-lg font-semibold">Modern Fonts</h3>
                  <Badge variant="outline" className="text-xs">Clean</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modernFonts.map((fontOption) => (
                    <FontCard key={fontOption.id} fontOption={fontOption} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ThemeSettings;
