"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Member } from "@/types";
import { ARR_RUNGS } from "@/types";
import { saveOnboardingData } from "@/app/actions/onboarding";

// ─── Design tokens (mirrors PortalDashboard) ──────────────────────────────────

const T = {
  bg:         "oklch(0.10 0.005 55)",
  surface:    "oklch(0.14 0.005 55)",
  surfaceLow: "oklch(0.12 0.004 55)",
  border:     "oklch(0.22 0.003 55)",
  amber:      "oklch(0.78 0.16 55)",
  fg:         "oklch(0.95 0 0)",
  fgMid:      "oklch(0.85 0 0)",
  fgMute:     "oklch(0.65 0 0)",
  fgDim:      "oklch(0.50 0 0)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };
const LABEL: React.CSSProperties = {
  ...MONO,
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: T.fgMute,
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  padding: "12px 14px",
  ...SANS,
  fontSize: 15,
  color: T.fg,
  outline: "none",
};

// ─── ARR rung reference ───────────────────────────────────────────────────────

function fmtRung(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000 % 1 === 0 ? n / 1_000_000 : (n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepWelcome({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span style={{ ...MONO, fontSize: 28, fontWeight: 700, color: T.amber }}>
          {">"}<span className="animate-blink">_</span>
        </span>
        <h1 style={{ ...MONO, fontSize: 20, fontWeight: 700, color: T.fg }}>
          Welcome, {name}.
        </h1>
        <p style={{ ...SANS, fontSize: 15, color: T.fgMid, lineHeight: 1.6 }}>
          Let&apos;s take 3 minutes to set up your portal.
          Thomas reviews this before your first call.
        </p>
      </div>

      <div className="flex flex-col gap-2" style={{ ...SANS, fontSize: 13, color: T.fgMute, lineHeight: 1.7 }}>
        <span>— Confirm your company</span>
        <span>— Log your current ARR</span>
        <span>— Share your biggest blocker</span>
      </div>

      <button
        onClick={onNext}
        style={{
          ...MONO, fontSize: 13, letterSpacing: "0.06em",
          background: T.amber, color: "oklch(0.12 0 0)",
          border: "none", borderRadius: 6,
          padding: "12px 24px", cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        LET&apos;S GO →
      </button>
    </div>
  );
}

function StepCompany({
  value, onChange, onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const valid = value.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span style={LABEL}>Step 1 of 3</span>
        <h2 style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 4 }}>
          What are you building?
        </h2>
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute, marginTop: 2 }}>
          Confirm or update your company name.
        </p>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && valid && onNext()}
        placeholder="Company name"
        autoFocus
        style={inputStyle}
      />

      <button
        onClick={onNext}
        disabled={!valid}
        style={{
          ...MONO, fontSize: 13, letterSpacing: "0.06em",
          background: valid ? T.amber : T.surface,
          color: valid ? "oklch(0.12 0 0)" : T.fgDim,
          border: `1px solid ${valid ? "transparent" : T.border}`,
          borderRadius: 6,
          padding: "12px 24px",
          cursor: valid ? "pointer" : "default",
          alignSelf: "flex-start",
          transition: "all 0.15s ease",
        }}
      >
        CONTINUE →
      </button>
    </div>
  );
}

function StepArr({
  value, onChange, onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const parsed = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const valid = !isNaN(parsed) && parsed >= 0;

  // Show which rung the entered value sits under
  const nextRung = valid ? ARR_RUNGS.find(r => r > parsed) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span style={LABEL}>Step 2 of 3</span>
        <h2 style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 4 }}>
          What&apos;s your current ARR?
        </h2>
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute, marginTop: 2 }}>
          Annual recurring revenue in USD. Approximate is fine.
        </p>
      </div>

      {/* Dollar input */}
      <div className="relative">
        <span
          style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            ...MONO, fontSize: 15, color: T.fgMute, pointerEvents: "none",
          }}
        >
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && valid && onNext()}
          placeholder="0"
          autoFocus
          style={{ ...inputStyle, paddingLeft: 26 }}
        />
      </div>

      {/* Next milestone hint */}
      {valid && nextRung !== undefined && (
        <p style={{ ...MONO, fontSize: 11, color: T.fgMute }}>
          Next milestone: {fmtRung(nextRung)}
        </p>
      )}
      {valid && nextRung === undefined && parsed >= 2_000_000 && (
        <p style={{ ...MONO, fontSize: 11, color: T.amber }}>
          At $2M — graduation territory.
        </p>
      )}

      {/* Milestone ladder reference */}
      <div className="flex flex-wrap gap-2">
        {ARR_RUNGS.map(rung => (
          <button
            key={rung}
            onClick={() => onChange(String(rung))}
            style={{
              ...MONO, fontSize: 11, letterSpacing: "0.06em",
              background: parsed === rung ? T.amber : T.surfaceLow,
              color: parsed === rung ? "oklch(0.12 0 0)" : T.fgMute,
              border: `1px solid ${parsed === rung ? "transparent" : T.border}`,
              borderRadius: 4,
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 0.1s ease",
            }}
          >
            {fmtRung(rung)}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        style={{
          ...MONO, fontSize: 13, letterSpacing: "0.06em",
          background: valid ? T.amber : T.surface,
          color: valid ? "oklch(0.12 0 0)" : T.fgDim,
          border: `1px solid ${valid ? "transparent" : T.border}`,
          borderRadius: 6,
          padding: "12px 24px",
          cursor: valid ? "pointer" : "default",
          alignSelf: "flex-start",
          transition: "all 0.15s ease",
        }}
      >
        CONTINUE →
      </button>
    </div>
  );
}

function StepObstacle({
  value, onChange, onSubmit, isPending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  const valid = value.trim().length >= 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span style={LABEL}>Step 3 of 3</span>
        <h2 style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 4 }}>
          What&apos;s your biggest blocker right now?
        </h2>
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute, marginTop: 2 }}>
          Thomas reads this before your first session. Be direct.
        </p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. I can&apos;t figure out who my ICP actually is — we keep signing random logos..."
        autoFocus
        rows={5}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
      />

      <button
        onClick={onSubmit}
        disabled={!valid || isPending}
        style={{
          ...MONO, fontSize: 13, letterSpacing: "0.06em",
          background: valid && !isPending ? T.amber : T.surface,
          color: valid && !isPending ? "oklch(0.12 0 0)" : T.fgDim,
          border: `1px solid ${valid && !isPending ? "transparent" : T.border}`,
          borderRadius: 6,
          padding: "12px 24px",
          cursor: valid && !isPending ? "pointer" : "default",
          alignSelf: "flex-start",
          transition: "all 0.15s ease",
        }}
      >
        {isPending ? "SAVING..." : "SUBMIT →"}
      </button>
    </div>
  );
}

function StepHolding() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span style={{ ...MONO, fontSize: 20, color: T.amber }}>✓</span>
        <h2 style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.fg }}>
          You&apos;re set up.
        </h2>
        <p style={{ ...SANS, fontSize: 15, color: T.fgMid, lineHeight: 1.6 }}>
          Your portal activates after your first session with Thomas.
        </p>
        <p style={{ ...SANS, fontSize: 13, color: T.fgMute, lineHeight: 1.6 }}>
          Thomas will review your answers and reach out to schedule your first call.
          You&apos;ll have full dashboard access after that session.
        </p>
      </div>

      <div
        className="flex flex-col gap-2 p-4 rounded"
        style={{ background: T.surfaceLow, border: `1px solid ${T.border}` }}
      >
        <span style={LABEL}>What happens next</span>
        <div className="flex flex-col gap-1.5" style={{ ...SANS, fontSize: 13, color: T.fgMute, lineHeight: 1.6, marginTop: 4 }}>
          <span>1. Thomas reviews your setup</span>
          <span>2. You schedule your first call</span>
          <span>3. After the call, your portal activates</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

type Step = "welcome" | "company" | "arr" | "obstacle" | "holding";

interface OnboardingWizardProps {
  member: Member;
}

export function OnboardingWizard({ member }: OnboardingWizardProps) {
  const displayName = member.first_name || member.email.split("@")[0];

  // If they already submitted (arr_current > 0) go straight to holding
  const initialStep: Step = member.arr_current > 0 ? "holding" : "welcome";

  const [step, setStep] = useState<Step>(initialStep);
  const [company, setCompany] = useState(member.company ?? "");
  const [arr, setArr] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const arrNum = parseInt(arr, 10);
    if (isNaN(arrNum) || !company.trim() || obstacle.trim().length < 10) return;

    startTransition(async () => {
      await saveOnboardingData(member.id, {
        company: company.trim(),
        arrCurrent: arrNum,
        obstacle: obstacle.trim(),
      });
      setStep("holding");
    });
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 flex-none"
        style={{ height: 44, borderBottom: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ ...MONO, fontSize: 18, fontWeight: 700, color: T.amber }}>
            {">"}<span className="animate-blink">_</span>
          </span>
          <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: T.fgMid, letterSpacing: "0.05em" }}>
            AI Native Club
          </span>
        </div>
        {member.role === "admin" && (
          <Link
            href="/admin"
            style={{ ...MONO, fontSize: 11, color: T.amber, letterSpacing: "0.08em" }}
            className="hover:opacity-75 transition-opacity"
          >
            ADMIN
          </Link>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 mx-auto w-full max-w-md">
        {step === "welcome"  && <StepWelcome name={displayName} onNext={() => setStep("company")} />}
        {step === "company"  && <StepCompany value={company} onChange={setCompany} onNext={() => setStep("arr")} />}
        {step === "arr"      && <StepArr value={arr} onChange={setArr} onNext={() => setStep("obstacle")} />}
        {step === "obstacle" && <StepObstacle value={obstacle} onChange={setObstacle} onSubmit={handleSubmit} isPending={isPending} />}
        {step === "holding"  && <StepHolding />}
      </div>

      {/* Step indicator — not shown on holding */}
      {step !== "holding" && step !== "welcome" && (
        <div
          className="flex items-center justify-center gap-2 pb-8 flex-none"
          aria-label="Step progress"
        >
          {(["company", "arr", "obstacle"] as const).map((s) => {
            const stepOrder = { company: 0, arr: 1, obstacle: 2 };
            const currentOrder = { welcome: -1, company: 0, arr: 1, obstacle: 2, holding: 3 };
            const isActive = s === step;
            const isDone = currentOrder[step] > stepOrder[s];
            return (
              <div
                key={s}
                style={{
                  width: isActive ? 20 : 6,
                  height: 4,
                  borderRadius: 2,
                  background: isActive ? T.amber : isDone ? T.fgMute : T.border,
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
