import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Home from "@/app/page";

/**
 * The complete landing page with all sections.
 * This is the full page as rendered at ainativeclub.com.
 */
const meta = {
  title: "Landing/FullPage",
  component: Home,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

// Desktop view
export const Desktop: Story = {};

// Mobile view
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

// Tablet view
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};

// Large desktop view
export const LargeDesktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
};
