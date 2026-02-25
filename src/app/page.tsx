import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <section className="max-w-2xl text-center space-y-8">
        {/* Logo placeholder */}
        <div className="text-primary text-4xl font-mono mb-4">{">"}_</div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          The club for{" "}
          <span className="text-gradient-brand">AI-native</span> builders.
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Building 0→10M with AI at the core?
          <br />
          You&apos;re not AI-curious. You&apos;re AI-native.
        </p>

        {/* Waitlist Form */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="your@email.com"
            className="flex-1 h-12 text-base"
          />
          <Button size="lg" className="h-12 px-8 glow-brand">
            Join Waitlist
          </Button>
        </div>

        {/* Social proof */}
        <p className="text-sm text-muted-foreground">
          Join <span className="text-foreground font-medium">847</span> founders
          on the waitlist
        </p>
      </section>

      {/* Footer hint */}
      <footer className="absolute bottom-8 text-sm text-muted-foreground font-mono">
        <span className="opacity-50">$</span> launching Q3 2026
      </footer>
    </main>
  );
}
