import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, BarChart3, Bell, Zap, Check } from "lucide-react";
import { LivePreview } from "@/components/LivePreview";
import { MarketStatus } from "@/components/MarketStatus";

const FEATURES = [
  {
    icon: Newspaper,
    title: "Real-time Jin10 Signals",
    description:
      "Chinese financial news decoded into actionable US stock signals. Get the edge before the Western market reacts.",
  },
  {
    icon: BarChart3,
    title: "Technical Analysis",
    description:
      "RSI, MACD, and momentum indicators combined with sentiment for high-confidence trading signals.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Instant notifications when signal strength crosses your threshold. Never miss a high-conviction move.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 stock watchlist",
      "1-hour delayed signals",
      "Daily signal of the day",
      "Basic technical indicators",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited watchlist",
      "Real-time signals",
      "Jin10 + Reddit sentiment",
      "Advanced technical analysis",
      "Email & push alerts",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$79",
    period: "/month",
    features: [
      "Everything in Pro",
      "API access",
      "Custom signal weights",
      "Priority data feed",
      "1-on-1 onboarding",
    ],
    cta: "Contact Us",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#22C55E]" />
            <span className="text-xl font-bold text-white">AlphaEdge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signal-of-the-day"
              className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
            >
              Signal of the Day
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-[#22C55E] text-black hover:bg-[#22C55E]/90">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <Badge className="bg-[#22C55E]/10 text-[#22C55E]">
            Now in Beta
          </Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Trade US stocks with{" "}
            <span className="text-[#22C55E]">Chinese market intelligence</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#A0A0A0]">
            AI-powered signals combining Jin10 financial news, sentiment
            analysis, and technical indicators. Get the edge before the
            Western market catches up.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[#22C55E] text-black hover:bg-[#22C55E]/90"
              >
                Open Dashboard
              </Button>
            </Link>
            <Link href="/signal-of-the-day">
              <Button size="lg" variant="outline" className="border-white/20 text-white">
                Signal of the Day
              </Button>
            </Link>
          </div>
          <div className="pt-2 flex justify-center">
            <MarketStatus />
          </div>
        </div>
      </section>

      {/* Live signals preview */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-[#444]">
            Live Signals — Updated Every 5 Minutes
          </p>
          <LivePreview />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-white">
            Your unfair advantage
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-white/5 bg-[#15151B]"
              >
                <CardContent className="space-y-3 p-6">
                  <f.icon className="h-8 w-8 text-[#22C55E]" />
                  <h3 className="text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#A0A0A0]">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-white">
            Simple pricing
          </h2>
          <p className="mb-12 text-center text-[#A0A0A0]">
            Start free, upgrade when you&apos;re ready.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`border-white/5 bg-[#15151B] ${
                  plan.highlight ? "ring-2 ring-[#22C55E]" : ""
                }`}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-6">
                    {plan.highlight && (
                      <Badge className="mb-3 bg-[#22C55E]/10 text-[#22C55E]">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-[#A0A0A0]">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-[#A0A0A0]"
                      >
                        <Check className="h-4 w-4 shrink-0 text-[#22C55E]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={
                      plan.highlight
                        ? "w-full bg-[#22C55E] text-black hover:bg-[#22C55E]/90"
                        : "w-full border-white/20"
                    }
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-[#A0A0A0]">
          <span>AlphaEdge {new Date().getFullYear()}</span>
          <span>Trade US stocks with Chinese market intelligence</span>
        </div>
      </footer>
    </div>
  );
}
