"use client";

import { useState } from "react";

interface InviteCodeDisplayProps {
  code: string;
}

export function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="font-mono text-2xl font-bold tracking-widest text-primary">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className="ml-auto rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        {copied ? "已複製 ✓" : "複製"}
      </button>
    </div>
  );
}
