import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Upload, 
  Wallet, 
  GraduationCap, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import logoAsset from "@/assets/eduminity-logo.png.asset.json";
import logoInverseAsset from "@/assets/eduminity-logo-inverse.png.asset.json";

const HomePage = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      name: "Rafiul Hasan",
      university: "BUET",
      avatar: "R",
      rating: 5,
      review: "Sold my CSE notes and earned ৳15,000 in my first month! Amazing platform for students.",
      role: "Contributor"
    },
    {
      name: "Taslima Akter",
      university: "DU",
      avatar: "T",
      rating: 5,
      review: "Found all my exam prep materials here. Saved so much time and money!",
      role: "Student"
    },
    {
      name: "Mehedi Chowdhury",
      university: "CUET",
      avatar: "M",
      rating: 5,
      review: "The quality of notes here is exceptional. Helped me ace my engineering finals.",
      role: "Student"
    },
    {
      name: "Sadia Noor",
      university: "NSU",
      avatar: "S",
      rating: 4,
      review: "Great community of learners. The Q&A feature is super helpful!",
      role: "Student"
    },
    {
      name: "Naimur Rahman",
      university: "SUST",
      avatar: "N",
      rating: 5,
      review: "Started as a buyer, now I'm a top contributor earning passive income from my notes.",
      role: "Contributor"
    },
    {
      name: "Farzana Jahan",
      university: "RUET",
      avatar: "F",
      rating: 5,
      review: "The best investment I made for my academic career. Highly recommend!",
      role: "Student"
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "৳0",
      period: "/forever",
      description: "Get started with basic access",
      features: [
        "Browse free study materials",
        "Ask 3 questions/month",
        "View community discussions",
        "Basic profile"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Student Pro",
      price: "৳199",
      period: "/month",
      description: "Unlock unlimited learning",
      features: [
        "Unlimited downloads",
        "Unlimited Q&A",
        "Priority support",
        "Ad-free experience",
        "Exclusive content"
      ],
      cta: "Go Pro",
      popular: true
    },
    {
      name: "Contributor",
      price: "৳0",
      period: "to start",
      description: "Earn from your knowledge",
      features: [
        "Upload & sell notes",
        "80% revenue share",
        "Analytics dashboard",
        "Verification badge",
        "Withdraw anytime"
      ],
      cta: "Start Earning",
      popular: false
    },
  ];

  return (
    <>
      <Seo>
        <title>Eduminity - Bangladesh's #1 Student Marketplace for Study Notes</title>
        <meta name="description" content="Buy, sell, and earn from study notes. Join thousands of Bangladeshi students on Eduminity — the trusted marketplace for quality study materials." />
        <meta name="keywords" content="study notes, Bangladesh, student marketplace, HSC notes, university notes, earn money, study materials" />
        <link rel="canonical" href="https://eduminity.bd" />
      </Seo>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" aria-label="Eduminity home" className="flex items-center transition-opacity hover:opacity-90">
                <img
                  src={logoAsset.url}
                  alt="Eduminity"
                  className="h-10 w-auto object-contain sm:h-11 md:h-12 dark:hidden"
                  draggable={false}
                />
                <img
                  src={logoInverseAsset.url}
                  alt="Eduminity"
                  className="hidden h-10 w-auto object-contain sm:h-11 md:h-12 dark:block"
                  draggable={false}
                />
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#reviews" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Log In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-neon-teal to-neon-violet hover:shadow-glow-teal transition-all"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-teal/10 border border-neon-teal/30 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-neon-teal" />
            <span className="text-sm font-medium text-neon-teal">Bangladesh's #1 Student Marketplace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-neon-teal via-neon-violet to-neon-magenta bg-clip-text text-transparent">
              Buy, Sell & Earn
            </span>
            <br />
            <span className="text-foreground">with Study Notes</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Join thousands of Bangladeshi students who buy quality study materials and earn from sharing their knowledge.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-neon-teal to-neon-blue text-primary-foreground px-8 py-6 text-lg hover:shadow-glow-teal transition-all hover:-translate-y-1"
              onClick={() => navigate("/auth?role=student")}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Sign up as Student
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/10 px-8 py-6 text-lg hover:-translate-y-1 transition-all"
              onClick={() => navigate("/auth?role=contributor")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Become a Contributor
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neon-teal" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neon-teal" />
              <span>5,000+ Study Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neon-teal" />
              <span>৳500K+ Earned by Contributors</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-neon-teal">Eduminity</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're looking to learn or earn, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Students */}
            <Card className="border-neon-teal/30 bg-gradient-to-br from-neon-teal/5 to-transparent hover:shadow-glow-teal/30 transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-neon-teal/20 flex items-center justify-center mb-4">
                  <GraduationCap className="h-7 w-7 text-neon-teal" />
                </div>
                <CardTitle className="text-2xl">For Students</CardTitle>
                <CardDescription>Access quality study materials instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-teal/20 flex items-center justify-center text-neon-teal font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold">Browse & Search</h4>
                    <p className="text-sm text-muted-foreground">Find notes by subject, university, or topic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-teal/20 flex items-center justify-center text-neon-teal font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold">Preview & Purchase</h4>
                    <p className="text-sm text-muted-foreground">Check quality before you buy with free previews</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-teal/20 flex items-center justify-center text-neon-teal font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold">Download & Study</h4>
                    <p className="text-sm text-muted-foreground">Instant access to your purchased materials</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Contributors */}
            <Card className="border-neon-magenta/30 bg-gradient-to-br from-neon-magenta/5 to-transparent hover:shadow-glow-magenta/30 transition-all duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-neon-magenta/20 flex items-center justify-center mb-4">
                  <Upload className="h-7 w-7 text-neon-magenta" />
                </div>
                <CardTitle className="text-2xl">For Contributors</CardTitle>
                <CardDescription>Turn your notes into passive income</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-magenta/20 flex items-center justify-center text-neon-magenta font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold">Upload Your Notes</h4>
                    <p className="text-sm text-muted-foreground">Share your best study materials with others</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-magenta/20 flex items-center justify-center text-neon-magenta font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold">Set Your Price</h4>
                    <p className="text-sm text-muted-foreground">You decide how much your knowledge is worth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-magenta/20 flex items-center justify-center text-neon-magenta font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold">Earn & Withdraw</h4>
                    <p className="text-sm text-muted-foreground">80% revenue share, withdraw to bKash/Nagad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-neon-teal/50 transition-all">
              <Shield className="h-8 w-8 text-neon-teal mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Verified Quality</h4>
              <p className="text-sm text-muted-foreground">All materials reviewed</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-neon-violet/50 transition-all">
              <Zap className="h-8 w-8 text-neon-violet mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Instant Access</h4>
              <p className="text-sm text-muted-foreground">Download immediately</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-neon-blue/50 transition-all">
              <Wallet className="h-8 w-8 text-neon-blue mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Secure Payments</h4>
              <p className="text-sm text-muted-foreground">bKash, Nagad, Cards</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-neon-magenta/50 transition-all">
              <TrendingUp className="h-8 w-8 text-neon-magenta mx-auto mb-3" />
              <h4 className="font-semibold mb-1">Earn Passively</h4>
              <p className="text-sm text-muted-foreground">Make money while you sleep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="text-neon-violet">Students</span> Across Bangladesh
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied students and contributors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <Card key={index} className="border-border/50 hover:border-neon-violet/50 transition-all hover:-translate-y-1 duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal to-neon-violet flex items-center justify-center text-background font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-muted-foreground">{review.university} • {review.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple <span className="text-neon-magenta">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all hover:-translate-y-2 duration-300 ${
                  plan.popular 
                    ? "border-neon-teal shadow-glow-teal/30 scale-105" 
                    : "border-border/50 hover:border-neon-teal/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-neon-teal to-neon-violet text-background text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-neon-teal" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? "bg-gradient-to-r from-neon-teal to-neon-violet hover:shadow-glow-teal" 
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your <span className="text-neon-teal">Academic Journey</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the fastest-growing student community in Bangladesh. Start learning smarter or earning from your knowledge today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-neon-teal to-neon-blue text-primary-foreground px-8 py-6 text-lg hover:shadow-glow-teal transition-all hover:-translate-y-1"
              onClick={() => navigate("/auth?role=student")}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Sign up as Student
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/10 px-8 py-6 text-lg hover:-translate-y-1 transition-all"
              onClick={() => navigate("/auth?role=contributor")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Become a Contributor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
};

export default HomePage;
