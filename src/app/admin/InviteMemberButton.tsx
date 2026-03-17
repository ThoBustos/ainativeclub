"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { inviteMember } from "@/app/actions/admin";

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
  red:        "oklch(0.65 0.18 25)",
  green:      "oklch(0.70 0.15 145)",
};

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const SANS: React.CSSProperties = { fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" };
const LABEL: React.CSSProperties = {
  ...MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.fgMute,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: T.surfaceLow,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  padding: "10px 12px",
  ...SANS,
  fontSize: 14,
  color: T.fg,
  outline: "none",
};

export function InviteMemberButton() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleClose() {
    setOpen(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setError("");
    setSuccess(false);
    setEmailSent(true);
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function handleSubmit() {
    setError("");
    if (!firstName.trim()) { setError("First name is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Valid email is required."); return; }

    startTransition(async () => {
      try {
        const result = await inviteMember(email, firstName, lastName);
        if (!result.success) {
          setError(result.error ?? "Something went wrong.");
        } else {
          setEmailSent(result.emailSent);
          setSuccess(true);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          ...MONO, fontSize: 11, letterSpacing: "0.08em",
          background: T.amber, color: "oklch(0.10 0 0)",
          border: "none", borderRadius: 5,
          padding: "6px 14px", cursor: "pointer",
        }}
      >
        + INVITE
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "oklch(0.05 0 0 / 0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: 28, width: "100%", maxWidth: 400,
              display: "flex", flexDirection: "column", gap: 20,
            }}
          >
            {success ? (
              /* Success state */
              <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
                <span style={{ ...MONO, fontSize: 24, color: emailSent ? T.green : T.amber }}>
                  {emailSent ? "✓" : "⚠"}
                </span>
                <p style={{ ...SANS, fontSize: 14, color: T.fgMid }}>
                  {emailSent
                    ? <>Invite sent to <strong style={{ color: T.fg }}>{email}</strong>.</>
                    : <>Member created, but the invite email failed to send. Send it manually to <strong style={{ color: T.fg }}>{email}</strong>.</>
                  }
                </p>
                <p style={{ ...SANS, fontSize: 12, color: T.fgMute }}>
                  They can log in at app.ainativeclub.com/login.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    ...MONO, fontSize: 11, letterSpacing: "0.08em",
                    background: T.surfaceLow, color: T.fgMid,
                    border: `1px solid ${T.border}`, borderRadius: 5,
                    padding: "8px 16px", cursor: "pointer", alignSelf: "center",
                  }}
                >
                  CLOSE
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                <div>
                  <span style={LABEL}>Invite Member</span>
                  <p style={{ ...SANS, fontSize: 12, color: T.fgMute, marginTop: 4 }}>
                    Creates their account and sends the welcome email.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={LABEL}>First name *</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Alexis"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={LABEL}>Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Dupont"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={LABEL}>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="alexis@founder-system.fr"
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <p style={{ ...SANS, fontSize: 12, color: T.red }}>{error}</p>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={handleClose}
                    style={{
                      ...MONO, fontSize: 11, letterSpacing: "0.08em",
                      background: "transparent", color: T.fgMute,
                      border: `1px solid ${T.border}`, borderRadius: 5,
                      padding: "8px 16px", cursor: "pointer",
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    style={{
                      ...MONO, fontSize: 11, letterSpacing: "0.08em",
                      background: isPending ? T.fgDim : T.amber,
                      color: "oklch(0.10 0 0)",
                      border: "none", borderRadius: 5,
                      padding: "8px 16px",
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    {isPending ? "SENDING..." : "SEND INVITE"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
