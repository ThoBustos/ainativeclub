"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { submitApplication } from "@/app/actions/applications";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type FormState = "idle" | "loading" | "success";

interface FormData {
  email: string;
  arr: string;
  firstName: string;
  lastName: string;
  building: string;
  website: string;
  github: string;
  linkedin: string;
  role: string;
  painPoints: string;
}

const initialFormData: FormData = {
  email: "",
  arr: "",
  firstName: "",
  lastName: "",
  building: "",
  website: "",
  github: "",
  linkedin: "",
  role: "",
  painPoints: "",
};

const roleOptions = [
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
  { value: "under-50k", label: "~$50K" },
  { value: "50k-500k", label: "$50K-$500K" },
  { value: "500k-1m", label: "$500K-$1M" },
  { value: "1m-2m", label: "$1M-$2M" },
  { value: "2m-plus", label: "$2M+" },
];

const TOTAL_STEPS = 7;

const stepTitles = [
  "What are you building?",
  "What's your name?",
  "Where are you at?",
  "What's your role?",
  "What's your biggest challenge?",
  "Share some links",
  "What's your email?",
];

export function ApplicationWizard() {
  const [step, setStep] = useState<Step>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [step]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleExit = () => {
    if (confirm("Leave application?")) {
      window.location.href = "/";
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  const handleContinue = () => {
    setError("");

    switch (step) {
      case 0: // Building
        if (!formData.building.trim()) {
          setError("Please tell us what you're building");
          return;
        }
        break;
      case 1: // Name
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("Please enter your full name");
          return;
        }
        break;
      case 2: // ARR
        if (!formData.arr) {
          setError("Please select your ARR range");
          return;
        }
        break;
      case 3: // Role
        if (!formData.role) {
          setError("Please select your role");
          return;
        }
        break;
      case 4: // Challenge
        if (!formData.painPoints.trim()) {
          setError("Please share your biggest challenge");
          return;
        }
        break;
      case 5: // Links
        if (!formData.website.trim()) {
          setError("Website is required");
          return;
        }
        break;
      case 6: // Email
        if (!validateEmail(formData.email)) {
          setError("Please enter a valid email");
          return;
        }
        handleSubmit();
        return;
    }

    setStep((prev) => Math.min(prev + 1, 7) as Step);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 0) as Step);
  };

  const handleSubmit = async () => {
    setState("loading");

    try {
      const result = await submitApplication(formData);

      if (!result.success) {
        throw new Error(result.error || "Submission failed");
      }

      setState("success");
      setStep(7);
    } catch {
      setError("Something went wrong. Please try again.");
      setState("idle");
    }
  };

  // Success screen
  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 max-w-md w-full">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 hover:shadow-[0_0_8px_rgba(234,179,8,0.6)] transition-all" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 hover:shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all" />
            <span className="ml-2 text-sm font-medium">Application received</span>
          </div>

          <div className="text-center space-y-6">
            <div className="text-green-400 text-4xl font-mono">✓</div>

            <p className="text-muted-foreground">
              We'll be in touch soon.
            </p>

            <Link
              href="/"
              className="inline-flex items-center text-primary hover:underline text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-card border border-border rounded-lg p-6 sm:p-8 max-w-xl w-full">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <button
            type="button"
            onClick={handleExit}
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all cursor-pointer"
            title="Close"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 hover:shadow-[0_0_8px_rgba(234,179,8,0.6)] transition-all" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 hover:shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all" />
          <span className="ml-2 text-sm font-medium">{stepTitles[step]}</span>
        </div>

        {/* Step content */}
        <div className="relative">
          {/* Step 0: Building */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 0
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <textarea
              ref={step === 0 ? textareaRef : undefined}
              placeholder="Tell us about your startup..."
              value={formData.building}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, building: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleContinue();
                }
              }}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Step 1: Name */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                ref={step === 1 ? inputRef : undefined}
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                className="h-12 text-base"
              />
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Step 2: ARR */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <div className="flex flex-wrap gap-2">
              {arrOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, arr: option.value }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm transition-all",
                    formData.arr === option.value
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Role */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: option.value }))
                  }
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm transition-all",
                    formData.role === option.value
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Challenge */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 4
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <textarea
              ref={step === 4 ? textareaRef : undefined}
              placeholder="Scaling, hiring, product-market fit, fundraising..."
              value={formData.painPoints}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, painPoints: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleContinue();
                }
              }}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Step 5: Links */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 5
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Website *</label>
                <Input
                  ref={step === 5 ? inputRef : undefined}
                  type="url"
                  placeholder="https://yourstartup.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">GitHub</label>
                  <Input
                    type="url"
                    placeholder="github.com/you"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github: e.target.value }))
                    }
                    onKeyDown={handleKeyDown}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">LinkedIn</label>
                  <Input
                    type="url"
                    placeholder="linkedin.com/in/you"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin: e.target.value }))
                    }
                    onKeyDown={handleKeyDown}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Email */}
          <div
            className={cn(
              "transition-all duration-300",
              step === 6
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            )}
          >
            <Input
              ref={step === 6 ? inputRef : undefined}
              type="email"
              placeholder="founder@startup.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}

        {/* Navigation */}
        <div className="mt-6 pt-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            ) : (
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Home
              </Link>
            )}

            <Button
              type="button"
              onClick={handleContinue}
              className="h-10 px-6 glow-brand"
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
              ) : step === 6 ? (
                "Submit"
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>press</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter ↵</kbd>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === step
                    ? "bg-primary"
                    : i < step
                    ? "bg-primary/40"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
