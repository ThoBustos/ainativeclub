import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";

/**
 * The Terminal Card component displays features in a code/terminal style.
 * Inspired by tinkerer.club and Claude Code aesthetics.
 */
const meta = {
  title: "Landing/Sections/TerminalCard",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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
            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status === "live" ? "LIVE" : "SOON"}
      </Badge>
    </div>
  );
}

// Full terminal card
export const Default: Story = {
  render: () => (
    <div className="max-w-2xl">
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-muted-foreground">membership</span>
        </div>

        <div className="text-muted-foreground mb-4">
          <span className="text-primary">$</span> ls -la ./membership/
        </div>

        <div className="space-y-2">
          <FeatureRow name="Private founder community" status="live" />
          <FeatureRow name="Weekly office hours" status="live" />
          <FeatureRow name="Monthly deep-dive workshops" status="live" />
          <FeatureRow name="Playbooks & templates" status="soon" />
          <FeatureRow name="Founder directory" status="soon" />
          <FeatureRow name="In-person events" status="soon" />
        </div>
      </div>
    </div>
  ),
};

// Mobile viewport
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => (
    <div className="w-[320px] p-4">
      <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-muted-foreground">membership</span>
        </div>

        <div className="text-muted-foreground mb-4">
          <span className="text-primary">$</span> ls -la ./membership/
        </div>

        <div className="space-y-2">
          <FeatureRow name="Private founder community" status="live" />
          <FeatureRow name="Weekly office hours" status="live" />
          <FeatureRow name="Monthly deep-dive workshops" status="live" />
          <FeatureRow name="Playbooks & templates" status="soon" />
          <FeatureRow name="Founder directory" status="soon" />
          <FeatureRow name="In-person events" status="soon" />
        </div>
      </div>
    </div>
  ),
};

// Just the window chrome
export const WindowChrome: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-lg">
      <div className="w-3 h-3 rounded-full bg-red-500/80" />
      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
      <div className="w-3 h-3 rounded-full bg-green-500/80" />
      <span className="ml-2 text-muted-foreground font-mono text-sm">
        terminal
      </span>
    </div>
  ),
};

// Feature row variations
export const FeatureRows: Story = {
  render: () => (
    <div className="space-y-2 p-4 bg-card border border-border rounded-lg font-mono text-sm max-w-md">
      <FeatureRow name="Live feature" status="live" />
      <FeatureRow name="Coming soon feature" status="soon" />
      <FeatureRow name="A very long feature name that might overflow" status="live" />
    </div>
  ),
};
