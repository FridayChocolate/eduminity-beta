import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <>
      <Seo>
        <title>Privacy Policy - Eduminity</title>
        <meta name="description" content="Learn how Eduminity protects your privacy and handles your personal data on our student marketplace platform." />
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
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neon-violet/10">
                <Shield className="h-6 w-6 text-neon-violet" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground">
                  At Eduminity, we take your privacy seriously. This policy explains what information we collect, how we use it, and how we protect it. We're committed to being transparent about our data practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Account Information:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Name and email address</li>
                  <li>Phone number (optional)</li>
                  <li>Profile picture (optional)</li>
                  <li>University/institution name</li>
                </ul>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Usage Information:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Pages viewed and features used</li>
                  <li>Search queries</li>
                  <li>Device and browser information</li>
                  <li>IP address and approximate location</li>
                </ul>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Transaction Information:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Purchase history</li>
                  <li>Payment method details (processed securely by payment partners)</li>
                  <li>Withdrawal requests and payout information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>To provide and improve our services</li>
                  <li>To process transactions and send related notifications</li>
                  <li>To personalize your experience and show relevant content</li>
                  <li>To communicate updates, promotions, and support messages</li>
                  <li>To prevent fraud and maintain platform security</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">4. Payment Privacy</h2>
                <p className="text-muted-foreground mb-2">
                  We take payment security very seriously:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>We never store full card numbers on our servers</li>
                  <li>Payment processing is handled by secure, trusted partners (bKash, Nagad, Rocket, SSL Commerz)</li>
                  <li>All transactions are encrypted with industry-standard SSL/TLS</li>
                  <li>Withdrawal information (mobile wallet numbers) is stored securely and used only for payouts</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">5. Cookies & Tracking</h2>
                <p className="text-muted-foreground mb-2">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Keep you logged in</li>
                  <li>Remember your preferences (theme, language)</li>
                  <li>Understand how you use our platform</li>
                  <li>Improve our services</li>
                </ul>
                <p className="text-muted-foreground">
                  You can control cookies through your browser settings. Disabling cookies may affect some platform features.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">6. Data Sharing</h2>
                <p className="text-muted-foreground mb-2">
                  We do not sell your personal data. We may share information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Payment processors:</strong> To complete transactions</li>
                  <li><strong className="text-foreground">Service providers:</strong> Who help us operate the platform (hosting, analytics)</li>
                  <li><strong className="text-foreground">Legal authorities:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">7. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no system is 100% secure. We encourage you to use strong passwords and protect your account credentials.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">8. Your Rights</h2>
                <p className="text-muted-foreground mb-2">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Export your data</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, contact us at <a href="mailto:privacy@eduminity.bd" className="text-neon-violet hover:underline">privacy@eduminity.bd</a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our platform is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We'll notify you of significant changes through email or platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this policy or our data practices, please contact us at <a href="mailto:privacy@eduminity.bd" className="text-neon-violet hover:underline">privacy@eduminity.bd</a>
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 Eduminity. Your privacy matters to us.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Privacy;
