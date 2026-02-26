"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  building: string;
  website: string;
  github: string;
  linkedin: string;
  role: string;
  arr: string;
  painPoints: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  building: "",
  website: "",
  github: "",
  linkedin: "",
  role: "",
  arr: "",
  painPoints: "",
};

const roleOptions = [
  { value: "", label: "Select your role" },
  { value: "technical-cofounder", label: "Technical Co-founder" },
  { value: "cto", label: "CTO" },
  { value: "ceo-technical", label: "CEO (technical)" },
  { value: "head-product", label: "Head of Product" },
  { value: "head-engineering", label: "Head of Engineering" },
  { value: "head-tech", label: "Head of Tech" },
  { value: "solo-founder", label: "Solo Founder" },
  { value: "other", label: "Other" },
];

const arrOptions = [
  { value: "", label: "Select current ARR" },
  { value: "50k-100k", label: "$50K - $100K" },
  { value: "100k-500k", label: "$100K - $500K" },
  { value: "500k-1m", label: "$500K - $1M" },
  { value: "1m-2m", label: "$1M - $2M" },
  { value: "2m-plus", label: "$2M+" },
];

interface ApplicationFormProps {
  className?: string;
  variant?: "inline" | "full";
}

export function ApplicationForm({ className, variant = "full" }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (state === "error") {
      setState("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("Name is required");
      setState("error");
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email");
      setState("error");
      return;
    }

    if (!formData.building.trim()) {
      setErrorMessage("Please tell us what you're building");
      setState("error");
      return;
    }

    if (!formData.website.trim()) {
      setErrorMessage("Website is required");
      setState("error");
      return;
    }

    if (!formData.role) {
      setErrorMessage("Please select your role");
      setState("error");
      return;
    }

    if (!formData.arr) {
      setErrorMessage("Please select your current ARR");
      setState("error");
      return;
    }

    if (!formData.painPoints.trim()) {
      setErrorMessage("Please share your biggest challenges");
      setState("error");
      return;
    }

    setState("loading");

    // TODO: Replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Application submitted:", formData);
      setState("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className={`text-center space-y-4 py-8 ${className}`}>
        <div className="text-4xl">✓</div>
        <h3 className="text-xl font-semibold text-foreground">Application received</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thomas reviews every application personally.
          You&apos;ll hear back within 48 hours.
        </p>
      </div>
    );
  }

  // Inline variant - just email for hero section
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto w-full">
          <div className="flex-1 space-y-1">
            <Input
              type="email"
              name="email"
              placeholder="founder@startup.com"
              value={formData.email}
              onChange={handleChange}
              className={`h-12 text-base ${state === "error" ? "border-destructive" : ""}`}
              disabled={state === "loading"}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 sm:px-8 glow-brand"
            disabled={state === "loading"}
          >
            {state === "loading" ? "..." : "Apply to Join"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Limited to 30 members. Application required.
        </p>
      </form>
    );
  }

  // Full form variant
  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First name *
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Jane"
            value={formData.firstName}
            onChange={handleChange}
            disabled={state === "loading"}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium text-foreground">
            Last name *
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Smith"
            value={formData.lastName}
            onChange={handleChange}
            disabled={state === "loading"}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@startup.com"
          value={formData.email}
          onChange={handleChange}
          disabled={state === "loading"}
        />
      </div>

      {/* What are you building */}
      <div className="space-y-2">
        <label htmlFor="building" className="text-sm font-medium text-foreground">
          What are you building? *
        </label>
        <textarea
          id="building"
          name="building"
          placeholder="AI-powered tool that helps teams..."
          value={formData.building}
          onChange={handleChange}
          disabled={state === "loading"}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium text-foreground">
          Website *
        </label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://yourstartup.com"
          value={formData.website}
          onChange={handleChange}
          disabled={state === "loading"}
        />
      </div>

      {/* GitHub / LinkedIn row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="github" className="text-sm font-medium text-foreground">
            GitHub <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="github"
            name="github"
            type="url"
            placeholder="https://github.com/username"
            value={formData.github}
            onChange={handleChange}
            disabled={state === "loading"}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-sm font-medium text-foreground">
            LinkedIn <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={formData.linkedin}
            onChange={handleChange}
            disabled={state === "loading"}
          />
        </div>
      </div>

      {/* Role / ARR row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Your role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={state === "loading"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="arr" className="text-sm font-medium text-foreground">
            Current ARR *
          </label>
          <select
            id="arr"
            name="arr"
            value={formData.arr}
            onChange={handleChange}
            disabled={state === "loading"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {arrOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pain points */}
      <div className="space-y-2">
        <label htmlFor="painPoints" className="text-sm font-medium text-foreground">
          What&apos;s your biggest challenge right now? *
        </label>
        <textarea
          id="painPoints"
          name="painPoints"
          placeholder="Scaling the team, product-market fit, technical architecture, fundraising..."
          value={formData.painPoints}
          onChange={handleChange}
          disabled={state === "loading"}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Error message */}
      {state === "error" && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-12 glow-brand"
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit Application"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Thomas reviews every application personally. You&apos;ll hear back within 48 hours.
      </p>
    </form>
  );
}
