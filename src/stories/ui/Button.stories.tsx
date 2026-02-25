import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Button } from "@/components/ui/button";

/**
 * The Button component is the primary interactive element.
 * Built on shadcn/ui with AI Native Club theming.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
    },
  },
  args: {
    onClick: fn(),
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default button with amber primary color
export const Default: Story = {
  args: {
    variant: "default",
    children: "Join Waitlist",
  },
};

// With glow effect (our custom utility)
export const WithGlow: Story = {
  args: {
    variant: "default",
    children: "Join Waitlist",
    className: "glow-brand",
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Learn More",
  },
};

// Outline variant
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "View Details",
  },
};

// Ghost variant
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Cancel",
  },
};

// Destructive variant
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

// Size variations
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
