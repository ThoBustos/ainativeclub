import { Badge } from "@/components/ui/badge";
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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-2xl text-center space-y-6 sm:space-y-8">
          {/* Logo - the ONLY animation on the page */}
          <div className="text-primary text-3xl sm:text-4xl font-mono mb-4">
            <span>{">"}</span>
            <span className="animate-blink">_</span>
          </div>

          {/* Pre-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground">
            50K-2M ARR. Technical founders who ship.
          </p>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            The club for{" "}
            <span className="text-gradient-brand">AI-native</span> builders.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            We build roadmaps, ship product, hire teams, close deals.
            <br />
            We do it with AI ofc. And fast.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Apply to Join
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-sm text-muted-foreground">
            Early access waitlist. Application required.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary/40"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* What is AI Native */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
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

          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-muted-foreground text-xs">membership</span>
            </div>

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
          </div>

          <p className="text-muted-foreground">
            we are shiiiiping.
          </p>
        </div>
      </section>

      {/* Members - Terminal Style */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Who&apos;s inside</h2>

          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-muted-foreground text-xs">members</span>
            </div>

            <div className="text-muted-foreground mb-4">
              <span className="text-primary">$</span> who --founders
            </div>

            <div className="space-y-2">
              <MemberRow name="Agostino Calamia" context="Launch Lab, agentic GTM engineer" linkedin="https://www.linkedin.com/in/agostino-calamia/" />
              <MemberRow name="Alan Kashkash" context="AI Engineering Lead, Zero Hiring, exited founder" linkedin="https://www.linkedin.com/in/alankashkash/" />
              <MemberRow name="Alexis Bouvet" context="Co-founder, Growth Hiring" linkedin="https://www.linkedin.com/in/alexis-bouvet-growth-hiring/" />
              <MemberRow name="Thomas Bustos" context="@Supernal, 2x Co-Founder, Let's Talk AI" linkedin="https://www.linkedin.com/in/thomasbustos/" />
              <MemberRow name="William Littlefield" context="Unlimited, AI-native fintech, exited founder" linkedin="https://www.linkedin.com/in/william-littlefield/" />
              {/* <MemberRow name="Miguel Otero Pedrido" context="The Neural Maze, ML/AI engineer @ Zapier" linkedin="https://www.linkedin.com/in/migueloteropedrido/" /> */}
              {/* <MemberRow name="Paul Iusztin" context="Decoding AI, LLM Engineer's Handbook author" linkedin="https://www.linkedin.com/in/pauliusztin/" /> */}
            </div>

            <div className="mt-4 pt-4 border-t border-border text-muted-foreground">
              <span className="text-primary">$</span> count
              <div className="mt-1 text-foreground">5 founders · 30 max</div>
            </div>
          </div>

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
