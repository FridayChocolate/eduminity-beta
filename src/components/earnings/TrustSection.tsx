import { motion } from "framer-motion";
import { Shield, Coins, Percent, HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const transparencyItems = [
  {
    icon: Coins,
    title: "1 Coin = 1 BDT",
    description: "Simple, transparent conversion. No hidden rates.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Percent,
    title: "15% Platform Fee",
    description: "Only charged on sales. Tips & bonuses are 100% yours.",
    color: "text-creator-primary",
    bg: "bg-creator-primary/10",
  },
  {
    icon: Shield,
    title: "No Hidden Fees",
    description: "What you see is what you get. Transparent always.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
];

const faqItems = [
  {
    question: "How long does withdrawal take?",
    answer: "Withdrawal requests are typically processed within 1-3 business days. Once processed, funds will appear in your account according to your payment provider's schedule (usually instant for mobile wallets).",
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is ৳500. This helps us keep transaction fees low and ensures efficient processing for all creators.",
  },
  {
    question: "Why is there a 7-day pending period for new earnings?",
    answer: "New earnings are held for 7 days to ensure transaction validity and protect against fraudulent purchases. After this period, funds move to your available balance automatically.",
  },
  {
    question: "How is the platform fee calculated?",
    answer: "We charge a 15% platform fee on note sales only. This covers payment processing, hosting, and platform maintenance. Tips and bonuses you receive are 100% yours with no deductions.",
  },
  {
    question: "Can I withdraw to a bank account?",
    answer: "Bank transfer is coming soon! Currently, we support bKash, Nagad, and Rocket for withdrawals. We're working on adding bank transfer support in the near future.",
  },
  {
    question: "What happens if my withdrawal fails?",
    answer: "If a withdrawal fails (usually due to incorrect account details), the amount will be returned to your available balance within 24 hours. You'll receive a notification with details about the failure.",
  },
];

export function TrustSection() {
  return (
    <div className="space-y-6">
      {/* Transparency Cards */}
      <Card className="creator-card border-creator-border/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Transparency & Trust</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Clear, honest earnings. No surprises.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {transparencyItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
                >
                  <div className={`p-2.5 rounded-lg ${item.bg} w-fit mb-3`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="creator-card border-creator-border/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-creator-primary/10">
              <HelpCircle className="h-5 w-5 text-creator-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Everything you need to know about earnings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/30 rounded-lg px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
