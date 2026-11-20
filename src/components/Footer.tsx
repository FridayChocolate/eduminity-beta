import { Link } from "react-router-dom";
import { Phone, Mail, Facebook, Twitter, Instagram, Shield, CreditCard, Heart } from "lucide-react";
import logoAsset from "@/assets/eduminity-logo.png.asset.json";
import logoInverseAsset from "@/assets/eduminity-logo-inverse.png.asset.json";

export const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border/50">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Eduminity home" className="flex items-center mb-4">
              <img
                src={logoAsset.url}
                alt="Eduminity"
                className="h-10 w-auto object-contain dark:hidden"
                draggable={false}
              />
              <img
                src={logoInverseAsset.url}
                alt="Eduminity"
                className="hidden h-10 w-auto object-contain dark:block"
                draggable={false}
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Built for students, by students. Making quality education affordable for every Bangladeshi.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-neon-teal/20 hover:text-neon-teal transition-all" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-neon-violet/20 hover:text-neon-violet transition-all" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-neon-magenta/20 hover:text-neon-magenta transition-all" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms#refunds" className="text-muted-foreground hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-neon-teal" />
                <span>support@eduminity.bd</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-neon-teal" />
                <span>+880 1712-345678</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-neon-teal" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-neon-teal" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/images/payment/bkash.svg" alt="bKash" className="h-6" />
              <img src="/images/payment/nagad.svg" alt="Nagad" className="h-6" />
              <img src="/images/payment/rocket.png" alt="Rocket" className="h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© 2025 Eduminity. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-neon-magenta fill-neon-magenta" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
};
