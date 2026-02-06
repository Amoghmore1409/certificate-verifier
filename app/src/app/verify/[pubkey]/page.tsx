"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { useCertiChain, CertificateData, IssuerData } from "@/hooks/useCertiChain";
import QRGenerator from "@/components/QRGenerator";
import { formatTimestamp, bnToNumber, truncateAddress } from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";

type VerifyStatus = "loading" | "valid" | "revoked" | "not-found";

export default function VerifyResultPage() {
  const params = useParams();
  const pubkeyStr = params.pubkey as string;
  const { fetchCertificatePublic, fetchIssuerPublic, getIssuerPda } =
    useCertiChain();

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [issuer, setIssuer] = useState<IssuerData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const pda = new PublicKey(pubkeyStr);
        const certData = await fetchCertificatePublic(pda);

        if (!certData) {
          setStatus("not-found");
          return;
        }

        setCert(certData);

        // Fetch issuer details
        try {
          const issuerData = await fetchIssuerPublic(certData.issuer);
          setIssuer(issuerData);
        } catch {
          /* issuer lookup is optional */
        }

        setStatus(certData.isRevoked ? "revoked" : "valid");
      } catch {
        setStatus("not-found");
      }
    })();
  }, [pubkeyStr, fetchCertificatePublic, fetchIssuerPublic]);

  // ── Loading ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="spinner spinner-lg" />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Fetching certificate from Solana…
        </p>
      </div>
    );
  }

  // ── Not Found ──────────────────────────────────────────────────
  if (status === "not-found") {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "2px solid var(--error)",
          }}
        >
          <span className="text-3xl">❌</span>
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Certificate Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          No certificate exists at address{" "}
          <code className="mono text-xs">{truncateAddress(pubkeyStr, 8)}</code>.
          It may have been entered incorrectly.
        </p>
      </div>
    );
  }

  // ── Valid / Revoked ────────────────────────────────────────────
  const isValid = status === "valid";

  return (
    <div className="page-enter section-container max-w-3xl mx-auto py-16">
      {/* Status banner */}
      <div
        className="flex items-center gap-4 p-6 rounded-2xl mb-10"
        style={{
          background: isValid
            ? "rgba(0, 217, 126, 0.06)"
            : "rgba(239, 68, 68, 0.06)",
          border: `1.5px solid ${
            isValid ? "var(--success)" : "var(--error)"
          }`,
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isValid
              ? "rgba(0, 217, 126, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
          }}
        >
          <span className="text-2xl">{isValid ? "✅" : "❌"}</span>
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-heading)",
              color: isValid ? "var(--success)" : "var(--error)",
            }}
          >
            {isValid ? "Certificate Valid" : "Certificate Revoked"}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {isValid
              ? "This certificate is authentic and has not been revoked."
              : "This certificate was revoked by the issuer and is no longer valid."}
          </p>
        </div>
      </div>

      {/* Certificate data */}
      {cert && (
        <div className="glass-card p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow label="Student Name" value={cert.studentName} />
            <InfoRow label="Course / Credential" value={cert.courseName} />
            <InfoRow
              label="Issuer"
              value={
                issuer
                  ? `${issuer.institutionName} (${truncateAddress(
                      cert.issuer.toBase58(),
                      4
                    )})`
                  : truncateAddress(cert.issuer.toBase58(), 6)
              }
            />
            <InfoRow
              label="Issued On"
              value={formatTimestamp(bnToNumber(cert.issuedAt))}
            />
            <InfoRow label="Certificate ID" value={cert.certificateId} mono />
            <InfoRow
              label="Status"
              value={cert.isRevoked ? "Revoked" : "Active"}
              badge={cert.isRevoked ? "badge-revoked" : "badge-verified"}
            />
            <div className="md:col-span-2">
              <InfoRow
                label="SHA-256 Hash"
                value={cert.certificateHash}
                mono
                fullWidth
              />
            </div>
          </div>

          {/* Issuer reputation */}
          {issuer && (
            <div
              className="mt-6 pt-6 flex flex-wrap gap-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div>
                <span className="stat-label">Issuer Verified</span>
                <p className="text-sm mt-1">
                  {issuer.isVerified ? (
                    <span className="badge badge-verified">Yes</span>
                  ) : (
                    <span className="badge badge-unverified">No</span>
                  )}
                </p>
              </div>
              <div>
                <span className="stat-label">Certificates Issued</span>
                <p className="text-sm mt-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {bnToNumber(issuer.certificatesIssued)}
                </p>
              </div>
              <div>
                <span className="stat-label">Reputation Score</span>
                <p className="text-sm mt-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {bnToNumber(issuer.reputationScore)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR + Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            QR Code
          </h3>
          <QRGenerator
            value={typeof window !== "undefined" ? window.location.href : pubkeyStr}
            size={180}
          />
        </div>
        <div className="glass-card p-8 flex flex-col gap-4">
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Blockchain Proof
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <span className="stat-label">Certificate PDA</span>
              <p className="mono text-xs break-all mt-1" style={{ color: "var(--text-secondary)" }}>
                {pubkeyStr}
              </p>
            </div>
            <a
              href={explorerUrl(pubkeyStr, "address")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center"
              style={{ padding: "10px 20px", fontSize: "0.85rem" }}
            >
              View on Solana Explorer ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono: isMono,
  badge,
  fullWidth,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: string;
  fullWidth?: boolean;
}) {
  return (
    <div>
      <span className="stat-label">{label}</span>
      {badge ? (
        <p className="mt-1">
          <span className={`badge ${badge}`}>{value}</span>
        </p>
      ) : (
        <p
          className={`text-sm mt-1 ${isMono ? "mono break-all" : ""} ${
            fullWidth ? "text-xs" : ""
          }`}
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      )}
    </div>
  );
}
