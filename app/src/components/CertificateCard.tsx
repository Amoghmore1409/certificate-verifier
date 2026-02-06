"use client";

import { truncateAddress, formatTimestamp, bnToNumber } from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";

interface CertificateCardProps {
  publicKey: string;
  studentName: string;
  courseName: string;
  certificateHash: string;
  certificateId: string;
  issuedAt: number;
  isRevoked: boolean;
  issuerAddress: string;
  /** If provided, shows a revoke button */
  onRevoke?: () => void;
  revoking?: boolean;
}

export default function CertificateCard({
  publicKey,
  studentName,
  courseName,
  certificateHash,
  certificateId,
  issuedAt,
  isRevoked,
  issuerAddress,
  onRevoke,
  revoking,
}: CertificateCardProps) {
  return (
    <div
      className="glass-card p-6"
      style={{
        borderLeft: `3px solid ${
          isRevoked ? "var(--error)" : "var(--accent-cyan)"
        }`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            {studentName}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {courseName}
          </p>
        </div>
        <span className={`badge ${isRevoked ? "badge-revoked" : "badge-verified"}`}>
          {isRevoked ? "Revoked" : "Valid"}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="input-label" style={{ marginBottom: 2 }}>Certificate ID</span>
          <p className="mono" style={{ color: "var(--text-primary)", fontSize: "0.82rem" }}>
            {certificateId}
          </p>
        </div>
        <div>
          <span className="input-label" style={{ marginBottom: 2 }}>Issued</span>
          <p style={{ color: "var(--text-primary)", fontSize: "0.88rem" }}>
            {formatTimestamp(issuedAt)}
          </p>
        </div>
        <div className="sm:col-span-2">
          <span className="input-label" style={{ marginBottom: 2 }}>Hash (SHA-256)</span>
          <p
            className="mono break-all"
            style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
          >
            {certificateHash}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <a
          href={explorerUrl(publicKey, "address")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs no-underline"
          style={{ color: "var(--accent-cyan)" }}
        >
          View on Explorer ↗
        </a>

        <div className="flex items-center gap-3">
          <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>
            Issuer: {truncateAddress(issuerAddress, 4)}
          </span>
          {onRevoke && !isRevoked && (
            <button
              className="btn-danger"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
              onClick={onRevoke}
              disabled={revoking}
            >
              {revoking ? "Revoking…" : "Revoke"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
