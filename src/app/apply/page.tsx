import type { Metadata } from "next";
import { ApplicationWizard } from "@/components/landing/ApplicationWizard";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join the AI Native Club — exclusive advisory + community for technical co-founders building AI-native companies.",
  openGraph: {
    title: "Apply to AI Native Club",
    description: "Application for technical co-founders. 20K-2M ARR. 30 seats max.",
  },
};

export default function ApplyPage() {
  return <ApplicationWizard />;
}
