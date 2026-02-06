"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import {
  useCertiChain,
  IssuerData,
  CertificateData,
} from "@/hooks/useCertiChain";
import CertificateCard from "@/components/CertificateCard";
import { bnToNumber, truncateAddress } from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";
import { PublicKey } from "@solana/web3.js";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const {
    registerIssuer,
    fetchIssuer,
    fetchCertificatesByIssuer,
    revokeCertificate,
  } = useCertiChain();

  const [issuer, setIssuer] = useState<IssuerData | null>(null);
  const [certs, setCerts] = useState<
    Array<{ publicKey: PublicKey; account: CertificateData }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [regName, setRegName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regTx, setRegTx] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [revokingPda, setRevokingPda] = useState<string | null>(null);

  // Fetch on load
  useEffect(() => {
    (async () => {
      if (!publicKey) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const iss = await fetchIssuer(publicKey);
        setIssuer(iss);
        if (iss) {
          const c = await fetchCertificatesByIssuer(publicKey);
          setCerts(c);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey, fetchIssuer, fetchCertificatesByIssuer]);

  // ── Register handler ───────────────────────────────────────────
  const handleRegister = async () => {
    if (!regName.trim()) return;
    setRegistering(true);
    setRegError(null);
    setRegTx(null);
    try {
      const { tx } = await registerIssuer(regName.trim());
      setRegTx(tx);
      const iss = await fetchIssuer(publicKey!);
      setIssuer(iss);
    } catch (err: any) {
      setRegError(err?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  // ── Revoke handler ─────────────────────────────────────────────
  const handleRevoke = async (certPda: PublicKey) => {
    setRevokingPda(certPda.toBase58());
    try {
      await revokeCertificate(certPda);
      // Refresh
      if (publicKey) {
        const c = await fetchCertificatesByIssuer(publicKey);
        setCerts(c);
      }
    } catch {
      /* silent */
    } finally {
      setRevokingPda(null);
    }
  };

  // ── Not connected ──────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="page-enter section-container py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Issuer Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Connect your Phantom wallet to get started.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // ── Not registered ─────────────────────────────────────────────
  if (!issuer) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-24">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Register as an Issuer
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Enter your institution name to create an on-chain issuer profile.
          An admin will verify you before you can issue certificates.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="input-label">Institution Name</label>
            <input
              className="input-field"
              placeholder="e.g. Stanford University"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              maxLength={64}
            />
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleRegister}
            disabled={registering || !regName.trim()}
          >
            {registering ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Registering…
              </span>
            ) : (
              "Register on Solana"
            )}
          </button>
        </div>

        {regTx && (
          <div className="alert alert-success mt-6">
            <span>✅</span>
            <div>
              <p className="text-sm font-semibold">Registered successfully!</p>
              <a
                href={explorerUrl(regTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-xs underline"
              >
                View transaction ↗
              </a>
            </div>
          </div>
        )}
        {regError && (
          <div className="alert alert-error mt-6">
            <span>⚠</span>
            <span className="text-sm">{regError}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Registered — show dashboard ────────────────────────────────
  return (
    <div className="page-enter section-container py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {issuer.institutionName}
          </h1>
          <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>
            {publicKey?.toBase58()}
          </p>
        </div>
        <span
          className={`badge ${
            issuer.isRevoked
              ? "badge-revoked"
              : issuer.isVerified
              ? "badge-verified"
              : "badge-unverified"
          }`}
        >
          {issuer.isRevoked
            ? "Revoked"
            : issuer.isVerified
            ? "Verified"
            : "Pending Verification"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          {
            label: "Certificates",
            value: bnToNumber(issuer.certificatesIssued),
          },
          {
            label: "Reputation",
            value: bnToNumber(issuer.reputationScore),
          },
          {
            label: "Status",
            value: issuer.isVerified ? "Verified" : "Unverified",
          },
          { label: "Network", value: "Devnet" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5">
            <p className="stat-value" style={{ color: "var(--text-primary)" }}>
              {s.value}
            </p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {issuer.isVerified && !issuer.isRevoked && (
        <div className="flex flex-wrap gap-3 mb-12">
          <Link href="/issue" className="btn-primary">
            Issue Certificate
          </Link>
          <Link href="/bulk" className="btn-secondary">
            Bulk Issue
          </Link>
        </div>
      )}

      {!issuer.isVerified && !issuer.isRevoked && (
        <div className="alert alert-warning mb-12">
          <span>⏳</span>
          <span className="text-sm">
            Your institution is pending admin verification. You cannot issue
            certificates yet.
          </span>
        </div>
      )}

      {issuer.isRevoked && (
        <div className="alert alert-error mb-12">
          <span>🚫</span>
          <span className="text-sm">
            Your issuer account has been revoked by the admin. Contact the
            administrator for more information.
          </span>
        </div>
      )}

      {/* Certificates */}
      <h2
        className="text-xl font-semibold mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Issued Certificates ({certs.length})
      </h2>

      {certs.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No certificates issued yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {certs.map((c) => (
            <CertificateCard
              key={c.publicKey.toBase58()}
              publicKey={c.publicKey.toBase58()}
              studentName={c.account.studentName}
              courseName={c.account.courseName}
              certificateHash={c.account.certificateHash}
              certificateId={c.account.certificateId}
              issuedAt={bnToNumber(c.account.issuedAt)}
              isRevoked={c.account.isRevoked}
              issuerAddress={c.account.issuer.toBase58()}
              onRevoke={() => handleRevoke(c.publicKey)}
              revoking={revokingPda === c.publicKey.toBase58()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
