import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <>
      <Seo>
        <title>Terms & Conditions - Eduminity</title>
        <meta name="description" content="Read the terms and conditions for using Eduminity, Bangladesh's student marketplace for study materials." />
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
              <div className="p-2 rounded-lg bg-neon-teal/10">
                <FileText className="h-6 w-6 text-neon-teal" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Terms & Conditions</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Eduminity, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">2. User Accounts</h2>
                <p className="text-muted-foreground mb-2">
                  You must be at least 13 years old to create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Maintaining the security of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and truthful information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">3. Content Ownership & Rights</h2>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">For Contributors:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>You retain full ownership of your original content</li>
                  <li>You grant Eduminity a license to display and distribute your content on the platform</li>
                  <li>You confirm that your uploads do not infringe on any third-party copyrights</li>
                  <li>Plagiarized or copyrighted content will be removed, and accounts may be suspended</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">For Students:</strong> Purchased materials are for personal use only. Redistribution, reselling, or sharing of purchased content is prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">4. Payments & Refunds</h2>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Purchases:</strong> All purchases are processed securely through our payment partners (bKash, Nagad, Rocket, or card).
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Refund Policy:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Refunds are available within 24 hours of purchase if the content significantly differs from its description</li>
                  <li>Refund requests are reviewed on a case-by-case basis</li>
                  <li>No refunds for content that has been fully downloaded</li>
                  <li>Coin purchases are non-refundable once credited to your wallet</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">5. Contributor Earnings</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Contributors receive 85% of the sale price (15% platform fee)</li>
                  <li>Earnings are held for 7 days before becoming available for withdrawal</li>
                  <li>Minimum withdrawal amount is ৳500</li>
                  <li>Withdrawals are processed within 1-3 business days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">6. Platform Responsibilities</h2>
                <p className="text-muted-foreground mb-2">
                  Eduminity commits to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Providing a secure and reliable platform</li>
                  <li>Processing payments and withdrawals promptly</li>
                  <li>Reviewing reported content fairly</li>
                  <li>Protecting user data according to our Privacy Policy</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Eduminity is not responsible for the accuracy or quality of user-uploaded content. We provide a platform for sharing, not content guarantees.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">7. Prohibited Activities</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Uploading plagiarized or copyrighted content without permission</li>
                  <li>Creating fake accounts or misrepresenting identity</li>
                  <li>Attempting to manipulate reviews or ratings</li>
                  <li>Harassing other users</li>
                  <li>Attempting to bypass payment systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">8. Account Termination</h2>
                <p className="text-muted-foreground">
                  Eduminity reserves the right to suspend or terminate accounts that violate these terms. In case of termination for policy violations, pending earnings may be forfeited.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">9. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-foreground">10. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, please contact us at <a href="mailto:support@eduminity.bd" className="text-neon-teal hover:underline">support@eduminity.bd</a>
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 Eduminity. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Terms;
