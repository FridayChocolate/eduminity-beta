import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Users, Target, GraduationCap, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <>
      <Seo>
        <title>About Eduminity - Affordable Education for Everyone</title>
        <meta name="description" content="Eduminity is Bangladesh's first student-to-student marketplace. Our mission is to make quality education affordable and accessible for every Bangladeshi student." />
      </Seo>

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-teal to-neon-violet flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-neon-teal to-neon-violet bg-clip-text text-transparent">
                  Eduminity
                </span>
              </Link>
              <Button variant="ghost" asChild>
                <Link to="/" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-teal/10 border border-neon-teal/30 mb-6">
              <Heart className="h-4 w-4 text-neon-teal" />
              <span className="text-sm font-medium text-neon-teal">Built for Students, By Students</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-neon-teal to-neon-violet bg-clip-text text-transparent">Eduminity</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe every student deserves access to quality study materials, regardless of their background or financial situation.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Our <span className="text-neon-teal">Mission</span>
                </h2>
                <p className="text-muted-foreground mb-4">
                  Eduminity was born from a simple observation: students across Bangladesh were struggling to find affordable, quality study materials while talented note-takers had no platform to share their knowledge.
                </p>
                <p className="text-muted-foreground mb-4">
                  We're bridging that gap. Our platform connects students who need study materials with contributors who create them — creating a community where everyone benefits.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Our goal:</strong> Make quality education affordable and accessible for every Bangladeshi student, from Dhaka to Sylhet, Chittagong to Rajshahi.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-neon-teal/30 bg-neon-teal/5">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-neon-teal mx-auto mb-2" />
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </CardContent>
                </Card>
                <Card className="border-neon-violet/30 bg-neon-violet/5">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-neon-violet mx-auto mb-2" />
                    <p className="text-2xl font-bold">5K+</p>
                    <p className="text-sm text-muted-foreground">Materials</p>
                  </CardContent>
                </Card>
                <Card className="border-neon-magenta/30 bg-neon-magenta/5">
                  <CardContent className="p-6 text-center">
                    <GraduationCap className="h-8 w-8 text-neon-magenta mx-auto mb-2" />
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm text-muted-foreground">Universities</p>
                  </CardContent>
                </Card>
                <Card className="border-neon-blue/30 bg-neon-blue/5">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="h-8 w-8 text-neon-blue mx-auto mb-2" />
                    <p className="text-2xl font-bold">৳500K+</p>
                    <p className="text-sm text-muted-foreground">Paid Out</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
              What We <span className="text-neon-violet">Stand For</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50 hover:border-neon-teal/50 transition-colors">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-neon-teal mb-4" />
                  <h3 className="font-semibold mb-2">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Education shouldn't be a privilege. We keep prices low and offer free materials to ensure everyone can learn.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:border-neon-violet/50 transition-colors">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-neon-violet mb-4" />
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    We're more than a marketplace. We're a community of learners helping each other succeed.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:border-neon-magenta/50 transition-colors">
                <CardContent className="p-6">
                  <Heart className="h-8 w-8 text-neon-magenta mb-4" />
                  <h3 className="font-semibold mb-2">Fair Compensation</h3>
                  <p className="text-sm text-muted-foreground">
                    Contributors keep 85% of their earnings. Your knowledge deserves to be rewarded fairly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Join the Eduminity Community
            </h2>
            <p className="text-muted-foreground mb-6">
              Whether you want to learn or earn, there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-neon-teal to-neon-blue">
                <Link to="/auth?role=student">Start Learning</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/10">
                <Link to="/auth?role=contributor">Start Earning</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 Eduminity. Built with ❤️ in Bangladesh.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default About;
