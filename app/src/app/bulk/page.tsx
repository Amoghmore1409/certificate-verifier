"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCertiChain } from "@/hooks/useCertiChain";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import BulkUploader, { BulkEntry } from "@/components/BulkUploader";
import {
  generateCertificateHash,
  generateCertificateId,
} from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";

interface BatchResult {
  studentName: string;
  courseName: string;
  status: "success" | "error";
  tx?: string;
  pda?: string;
  error?: string;
}

export default function BulkPage() {
  const { connected } = useWallet();
  const { issuer, loading: authLoading } = useWalletAuth();
  const { issueCertificate, wallet } = useCertiChain();

  const [entries, setEntries] = useState<BulkEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);

  const handleBatch = async () => {
    if (entries.length === 0) return;
    setRunning(true);
    setResults([]);
    setProgress(0);

    const batchResults: BatchResult[] = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      try {
        const certId = generateCertificateId();
        const certHash = await generateCertificateHash({
          studentName: entry.student_name,
          courseName: entry.course_name,
          issuer: wallet?.publicKey?.toBase58(),
          timestamp: Date.now(),
          index: i,
        });

        const { tx, certificatePda } = await issueCertificate(
          entry.student_name,
          entry.course_name,
          certHash,
          certId
        );

        batchResults.push({
          studentName: entry.student_name,
          courseName: entry.course_name,
          status: "success",
          tx,
          pda: certificatePda.toBase58(),
        });
      } catch (err: any) {
        batchResults.push({
          studentName: entry.student_name,
          courseName: entry.course_name,
          status: "error",
          error: err?.message || "Failed",
        });
      }

      setProgress(((i + 1) / entries.length) * 100);
      setResults([...batchResults]);
    }

    setRunning(false);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  // ── Guards ─────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Bulk Certificate Issuance
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Connect your Phantom wallet to use bulk issuance.
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

  if (!issuer || !issuer.isVerified || issuer.isRevoked) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Unauthorized
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Only verified issuers can use bulk issuance. Register and get verified
          from the Dashboard.
        </p>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────
  return (
    <div className="page-enter section-container max-w-4xl mx-auto py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Bulk Certificate Issuance
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-secondary)" }}>
        Upload a CSV or JSON file to issue multiple certificates in one
        workflow. Each entry creates a separate on-chain transaction.
      </p>

      {/* Upload */}
      {entries.length === 0 && !running && results.length === 0 && (
        <BulkUploader onParsed={setEntries} />
      )}

      {/* Preview */}
      {entries.length > 0 && !running && results.length === 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Preview ({entries.length} entries)
            </h2>
            <div className="flex gap-3">
              <button
                className="btn-ghost"
                onClick={() => setEntries([])}
              >
                Clear
              </button>
              <button className="btn-primary" onClick={handleBatch}>
                Issue All →
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Course Name</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 50).map((e, i) => (
                  <tr key={i}>
                    <td className="mono" style={{ color: "var(--text-muted)" }}>
                      {i + 1}
                    </td>
                    <td>{e.student_name}</td>
                    <td>{e.course_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length > 50 && (
              <p
                className="text-center py-3 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                …and {entries.length - 50} more entries
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {running && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Issuing certificates…
            </span>
            <span
              className="mono text-sm font-semibold"
              style={{ color: "var(--accent-cyan)" }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {results.length} / {entries.length} completed
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !running && (
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Results
            </h2>
            <span className="badge badge-verified">{successCount} success</span>
            {errorCount > 0 && (
              <span className="badge badge-revoked">{errorCount} failed</span>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.studentName}</td>
                    <td>{r.courseName}</td>
                    <td>
                      {r.status === "success" ? (
                        <span className="badge badge-verified">✓</span>
                      ) : (
                        <span className="badge badge-revoked" title={r.error}>
                          ✗
                        </span>
                      )}
                    </td>
                    <td>
                      {r.tx ? (
                        <a
                          href={explorerUrl(r.tx)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono text-xs"
                          style={{ color: "var(--accent-cyan)" }}
                        >
                          {r.tx.slice(0, 12)}…
                        </a>
                      ) : (
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="btn-ghost mt-6"
            onClick={() => {
              setEntries([]);
              setResults([]);
              setProgress(0);
            }}
          >
            Upload New Batch
          </button>
        </div>
      )}
    </div>
  );
}
