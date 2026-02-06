"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCertiChain } from "@/hooks/useCertiChain";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import QRGenerator from "@/components/QRGenerator";
import {
  generateCertificateHash,
  generateCertificateId,
} from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";

export default function IssuePage() {
  const { connected, publicKey } = useWallet();
  const { issuer, loading: authLoading } = useWalletAuth();
  const { issueCertificate } = useCertiChain();

  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    tx: string;
    pda: string;
  } | null>(null);

  const handleIssue = async () => {
    if (!studentName.trim() || !courseName.trim()) return;
    setIssuing(true);
    setError(null);
    setResult(null);

    try {
      const certId = generateCertificateId();
      const certHash = await generateCertificateHash({
        studentName: studentName.trim(),
        courseName: courseName.trim(),
        issuer: publicKey?.toBase58(),
        timestamp: Date.now(),
      });

      const { tx, certificatePda } = await issueCertificate(
        studentName.trim(),
        courseName.trim(),
        certHash,
        certId
      );

      setResult({ tx, pda: certificatePda.toBase58() });
      setStudentName("");
      setCourseName("");
    } catch (err: any) {
      const msg = err?.message || "Issuance failed";
      if (msg.includes("IssuerNotVerified")) {
        setError("Your issuer account is not yet verified by the admin.");
      } else if (msg.includes("Unauthorized")) {
        setError("Unauthorized: You are not a registered issuer.");
      } else if (msg.includes("insufficient")) {
        setError("Insufficient SOL. Airdrop some devnet SOL and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setIssuing(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Issue Certificate
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Connect your Phantom wallet to issue a certificate.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!issuer) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Not Registered
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          You must register as an issuer from the Dashboard before you can
          issue certificates.
        </p>
      </div>
    );
  }

  if (!issuer.isVerified || issuer.isRevoked) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {issuer.isRevoked ? "Issuer Revoked" : "Pending Verification"}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {issuer.isRevoked
            ? "Your issuer account has been revoked."
            : "Your issuer account is not yet verified. Contact the admin."}
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="page-enter section-container max-w-2xl mx-auto py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Issue Certificate
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-secondary)" }}>
        Fill in the student details below. A certificate will be issued as a
        Solana transaction and stored on-chain.
      </p>

      {/* Issuer info bar */}
      <div
        className="flex items-center gap-3 mb-8 p-4 rounded-xl"
        style={{
          background: "var(--accent-cyan-dim)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <span className="badge badge-verified">Verified</span>
        <span
          className="text-sm font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {issuer.institutionName}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="input-label">Student / Recipient Name</label>
          <input
            className="input-field"
            placeholder="e.g. Alice Johnson"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            maxLength={64}
          />
        </div>

        <div>
          <label className="input-label">Course / Credential Name</label>
          <input
            className="input-field"
            placeholder="e.g. Blockchain Development Bootcamp"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            maxLength={128}
          />
        </div>

        <button
          className="btn-primary w-full mt-2"
          onClick={handleIssue}
          disabled={issuing || !studentName.trim() || !courseName.trim()}
        >
          {issuing ? (
            <span className="flex items-center gap-2">
              <span
                className="spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Issuing on Solana…
            </span>
          ) : (
            "Issue Certificate →"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mt-6">
          <span>⚠</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mt-10">
          <div className="alert alert-success mb-6">
            <span>✅</span>
            <div>
              <p className="text-sm font-semibold mb-1">
                Certificate issued successfully!
              </p>
              <a
                href={explorerUrl(result.tx)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-xs underline"
              >
                View transaction on Solana Explorer ↗
              </a>
            </div>
          </div>

          <div className="glass-card p-8 flex flex-col items-center gap-6">
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Verification QR Code
            </h3>
            <QRGenerator
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${result.pda}`}
              size={220}
              label={result.pda}
            />
            <p
              className="text-xs text-center max-w-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Share this QR code with the certificate holder. Anyone who scans
              it can verify the certificate directly from the Solana blockchain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
