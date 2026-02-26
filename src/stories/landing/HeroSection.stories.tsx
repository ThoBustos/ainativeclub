import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

/**
 * The Hero Section is the first thing visitors see.
 * Features the main value proposition, waitlist form, and social proof.
 */
const meta = {
  title: "Landing/Sections/Hero",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Full hero section
export const Default: Story = {
  render: () => (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
      <div className="max-w-2xl text-center space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="text-primary text-3xl sm:text-4xl font-mono mb-4">
          {">"}_
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          The club for{" "}
          <span className="text-gradient-brand">AI-native</span> builders.
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto">
          Building 0→10M with AI at the core?
          <br />
          Join founders who ship the same way.
        </p>

        {/* Waitlist Form */}
        <WaitlistForm />

        {/* Social proof */}
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">847</span> founders
          already on the list
        </p>
      </div>
    </section>
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
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center space-y-6">
        <div className="text-primary text-3xl font-mono mb-4">{">"}_</div>
        <h1 className="text-3xl font-bold tracking-tight">
          The club for{" "}
          <span className="text-gradient-brand">AI-native</span> builders.
        </h1>
        <p className="text-lg text-muted-foreground">
          Building 0→10M with AI at the core?
          <br />
          Join founders who ship the same way.
        </p>
        <WaitlistForm />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">847</span> founders
          already on the list
        </p>
      </div>
    </section>
  ),
};

// Tablet viewport
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
  render: () => (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl text-center space-y-8">
        <div className="text-primary text-4xl font-mono mb-4">{">"}_</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          The club for{" "}
          <span className="text-gradient-brand">AI-native</span> builders.
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Building 0→10M with AI at the core?
          <br />
          Join founders who ship the same way.
        </p>
        <WaitlistForm />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">847</span> founders
          already on the list
        </p>
      </div>
    </section>
  ),
};
