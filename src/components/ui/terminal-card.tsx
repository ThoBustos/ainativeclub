"use client";

import { useState } from "react";

interface TerminalCardProps {
  title: string;
  children: React.ReactNode;
}

export function TerminalCard({ title, children }: TerminalCardProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="w-2.5 h-2.5 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close card"
        />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors" />
        <span className="ml-2 text-muted-foreground text-xs">{title}</span>
      </div>
      {children}
    </div>
  );
}
