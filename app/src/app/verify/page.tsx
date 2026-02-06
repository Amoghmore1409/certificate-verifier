"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidPublicKey } from "@/lib/utils";

export default function VerifyPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Accept a full URL like /verify/<pubkey> or just a pubkey
    const parts = trimmed.split("/");
    const candidate = parts[parts.length - 1];

    if (!isValidPublicKey(candidate)) {
      setError("Please enter a valid Solana public key (base-58).");
      return;
    }

    router.push(`/verify/${candidate}`);
  };

  return (
    <div className="page-enter section-container max-w-2xl mx-auto py-24">
      <div className="text-center mb-12">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Verify a <span className="gradient-text">Certificate</span>
        </h1>
        <p
          className="text-sm max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Enter the certificate&apos;s on-chain address (PDA) or paste a
          verification URL. The data is fetched directly from the Solana
          blockchain — no backend trust required.
        </p>
      </div>

      {/* Input */}
      <div className="glass-card p-8">
        <label className="input-label">Certificate Address or URL</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="e.g. 7xKX…9fWq  or  https://…/verify/7xKX…9fWq"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <button
            className="btn-primary whitespace-nowrap"
            onClick={handleVerify}
            disabled={!input.trim()}
          >
            Verify →
          </button>
        </div>

        {error && (
          <div className="alert alert-error mt-4">
            <span>⚠</span>
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--accent-cyan)" }}
          >
            📱 Have a QR code?
          </h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Scan the QR code from your certificate. It will redirect you
            directly to the verification page with all details.
          </p>
        </div>
        <div className="glass-card p-5">
          <h3
            className="text-sm font-semibold mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--accent-amber)" }}
          >
            🔍 What gets checked?
          </h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            We read the on-chain account data: issuer, student name, course,
            issuance date, SHA-256 hash, and revocation status.
          </p>
        </div>
      </div>
    </div>
  );
}
