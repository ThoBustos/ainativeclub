import { Badge } from "@/components/ui/badge";
import { TerminalCard } from "@/components/ui/terminal-card";
import Link from "next/link";

/**
 * Direction A: "Silent Confidence"
 *
 * No scroll animations. No staggered reveals. No ambient glow.
 * Just typography, color, and one blinking cursor.
 *
 * The confidence comes from what we DON'T do.
 */

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Member Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-2xl text-center space-y-6 sm:space-y-8">
          {/* Logo - the ONLY animation on the page */}
          <div className="text-primary text-3xl sm:text-4xl font-mono mb-4">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            The club for <span className="text-gradient-brand">AI-native</span> builders.
          </h1>

          {/* Value Box */}
          <div className="font-mono text-sm sm:text-base text-primary">
            Better decisions · Faster growth · 30 founders
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Apply to Join
            </Link>
          </div>

          {/* Filter */}
          <p className="text-sm text-muted-foreground">
            50K-5M ARR founders only
          </p>
        </div>

        {/* Scroll indicator */}
        <a
          href="#what-is-ai-native"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary animate-clignotant"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* What is AI Native */}
      <section id="what-is-ai-native" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border scroll-mt-8">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold">What is AI-native?</h2>

          <div className="space-y-6 text-base sm:text-lg text-muted-foreground">
            <div className="space-y-2">
              <p className="text-foreground font-medium">
                AI-native = operating at a speed and scale that wasn&apos;t possible before.
              </p>
              <p>
                Not because AI is magic. Because your systems are rebuilt around it.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-mono">→</span>
                <span>You ship faster because your systems are designed for it</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-mono">→</span>
                <span>You make better decisions because you have better context</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-mono">→</span>
                <span>You learn faster because you&apos;ve rebuilt how you learn</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-mono">→</span>
                <span>You don&apos;t add AI, you build with it from the ground up</span>
              </li>
            </ul>

            <p className="pt-4 text-foreground font-medium">
              If this sounds like you, you&apos;re one of us.
            </p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold">What you get</h2>

          <TerminalCard title="membership">
            <div className="text-muted-foreground mb-4">
              <span className="text-primary">$</span> ls -la ./membership/
            </div>

            <div className="space-y-2">
              <FeatureRow name="Strategy calls (2x/month)" status="live" />
              <FeatureRow name="Async access (always on)" status="live" />
              <FeatureRow name="Founder community (30 max)" status="live" />
              <FeatureRow name="Frameworks & playbooks" status="live" />
              <FeatureRow name="Warm intros" status="live" />
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-primary text-lg sm:text-xl font-medium">$400/mo</span>
            </div>
          </TerminalCard>

          <p className="text-muted-foreground">
            we are shiiiiping.
          </p>
        </div>
      </section>

      {/* Members - Terminal Style */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Who&apos;s inside</h2>

          <TerminalCard title="members">
            <div className="text-muted-foreground mb-4">
              <span className="text-primary">$</span> who --founders
            </div>

            <div className="space-y-2">
              <MemberRow name="Agostino Calamia" context="Launch Lab, agentic GTM engineer" linkedin="https://www.linkedin.com/in/agostino-calamia/" />
              <MemberRow name="Alan Kashkash" context="AI Engineering Lead, Zero Hiring, exited founder" linkedin="https://www.linkedin.com/in/alankashkash/" />
              <MemberRow name="Alexis Bouvet" context="Co-founder, Growth Hiring" linkedin="https://www.linkedin.com/in/alexis-bouvet-growth-hiring/" />
              <MemberRow name="Thomas Bustos" context="Cooking @Supernal | 2x Co-Founder" linkedin="https://www.linkedin.com/in/thomasbustos/" />
              <MemberRow name="William Littlefield" context="Unlimited, AI-native fintech, exited founder" linkedin="https://www.linkedin.com/in/william-littlefield/" />
              {/* <MemberRow name="Miguel Otero Pedrido" context="The Neural Maze, ML/AI engineer @ Zapier" linkedin="https://www.linkedin.com/in/migueloteropedrido/" /> */}
              {/* <MemberRow name="Paul Iusztin" context="Decoding AI, LLM Engineer's Handbook author" linkedin="https://www.linkedin.com/in/pauliusztin/" /> */}
            </div>

            <div className="mt-4 pt-4 border-t border-border text-muted-foreground">
              <span className="text-primary">$</span> count
              <div className="mt-1 text-foreground">5 founders · 30 max</div>
            </div>
          </TerminalCard>

          <p className="text-muted-foreground">
            30 seats. 0 spectators.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Built by Thomas Bustos</h2>

          <p className="text-base sm:text-lg text-muted-foreground">
            Cooking @Supernal | 2x Co-Founder | Let&apos;s Talk AI Podcast & AI Native Club
          </p>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
            <p>
              I started this because I wanted more conversations like the ones I have with founders I respect.
            </p>
            <p>
              Talking through hard problems helps me think. Seeing other people&apos;s setups teaches me things I&apos;d never learn alone. And honestly, I like being useful.
            </p>
            <p className="text-foreground">
              This isn&apos;t a side hustle. It&apos;s how I like to spend my time.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            <a
              href="https://www.youtube.com/@lets-talk-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              Podcast <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="https://thomasbustos.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              Substack <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="https://www.linkedin.com/in/thomasbustos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              LinkedIn <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="https://x.com/ThoBustos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              X <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div className="font-mono">
            <span className="opacity-50">$</span> launching Q3 2026
          </div>
          <div>© 2026 AI Native Club</div>
        </div>
      </footer>
    </main>
  );
}

function FeatureRow({
  name,
  status,
}: {
  name: string;
  status: "live" | "soon";
}) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-foreground truncate">{name}</span>
      <Badge
        variant={status === "live" ? "default" : "secondary"}
        className={`shrink-0 ${
          status === "live"
            ? "bg-green-500/20 text-green-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status === "live" ? "LIVE" : "SOON"}
      </Badge>
    </div>
  );
}

function MemberRow({ name, context, linkedin }: { name: string; context: string; linkedin: string }) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground hover:text-primary transition-colors"
      >
        {name}
      </a>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{context}</span>
    </div>
  );
}
