"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/app/actions/waitlist";

type FormState = "idle" | "loading" | "success" | "error";

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (!email.trim()) {
      setErrorMessage("Email is required");
      setState("error");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email");
      setState("error");
      return;
    }

    setState("loading");

    try {
      const result = await joinWaitlist(email);

      if (!result.success) {
        throw new Error(result.error || "Submission failed");
      }

      setState("success");
      setEmail("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className={`text-center space-y-2 ${className}`}>
        <div className="text-2xl">🎉</div>
        <p className="text-foreground font-medium">You&apos;re on the list!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll be in touch when we launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto w-full">
        <div className="flex-1 space-y-1">
          <Input
            type="email"
            placeholder="founder@startup.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") {
                setState("idle");
                setErrorMessage("");
              }
            }}
            className={`h-12 text-base ${
              state === "error" ? "border-destructive" : ""
            }`}
            disabled={state === "loading"}
            aria-invalid={state === "error"}
            aria-describedby={state === "error" ? "email-error" : undefined}
          />
          {state === "error" && errorMessage && (
            <p id="email-error" className="text-xs text-destructive pl-1">
              {errorMessage}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 sm:px-8 glow-brand"
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
              Joining...
            </span>
          ) : (
            "Join the Waitlist"
          )}
        </Button>
      </div>
    </form>
  );
}
