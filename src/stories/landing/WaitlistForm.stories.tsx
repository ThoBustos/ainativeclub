import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

/**
 * The WaitlistForm component captures email signups for the AI Native Club waitlist.
 * Features email validation, loading states, and success confirmation.
 */
const meta = {
  title: "Landing/WaitlistForm",
  component: WaitlistForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WaitlistForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {};

// In a dark card context (like the hero)
export const InHeroContext: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 p-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          The club for{" "}
          <span className="text-gradient-brand">AI-native</span> builders.
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Building 0→10M with AI at the core?
          <br />
          Join founders who ship the same way.
        </p>
        <Story />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">847</span> founders
          already on the list
        </p>
      </div>
    ),
  ],
};

// Mobile viewport
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] p-4">
        <Story />
      </div>
    ),
  ],
};
