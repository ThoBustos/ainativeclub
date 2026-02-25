import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/ui/input";

/**
 * The Input component for text entry.
 * Primary use: email capture in waitlist form.
 */
const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "search"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
  args: {
    placeholder: "Enter text...",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default input
export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

// Email input (primary use case)
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "your@email.com",
  },
};

// Large input for hero section
export const Large: Story = {
  args: {
    type: "email",
    placeholder: "your@email.com",
    className: "h-12 text-base",
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
};

// With value
export const WithValue: Story = {
  args: {
    type: "email",
    defaultValue: "founder@startup.com",
  },
};
