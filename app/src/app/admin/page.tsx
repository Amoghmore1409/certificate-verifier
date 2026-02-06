"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  useCertiChain,
  AdminData,
  IssuerData,
} from "@/hooks/useCertiChain";
import { bnToNumber, truncateAddress } from "@/lib/utils";
import { explorerUrl } from "@/lib/constants";

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const {
    initializeAdmin,
    fetchAdmin,
    fetchAllIssuers,
    verifyIssuer,
    revokeIssuer,
  } = useCertiChain();

  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [issuers, setIssuers] = useState<
    Array<{ publicKey: PublicKey; account: IssuerData }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [initTx, setInitTx] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [actionPda, setActionPda] = useState<string | null>(null);

  // Fetch admin + issuers
  useEffect(() => {
    (async () => {
      if (!connected) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const a = await fetchAdmin();
        setAdmin(a);
        const iss = await fetchAllIssuers();
        setIssuers(iss);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [connected, fetchAdmin, fetchAllIssuers]);

  const isAdmin =
    admin && publicKey && admin.authority.toBase58() === publicKey.toBase58();

  // ── Handlers ───────────────────────────────────────────────────
  const handleInitAdmin = async () => {
    setInitializing(true);
    setInitError(null);
    setInitTx(null);
    try {
      const { tx } = await initializeAdmin();
      setInitTx(tx);
      const a = await fetchAdmin();
      setAdmin(a);
    } catch (err: any) {
      setInitError(err?.message || "Initialization failed");
    } finally {
      setInitializing(false);
    }
  };

  const handleVerify = async (authority: PublicKey) => {
    setActionPda(authority.toBase58());
    try {
      await verifyIssuer(authority);
      const iss = await fetchAllIssuers();
      setIssuers(iss);
    } catch {
      /* silent */
    } finally {
      setActionPda(null);
    }
  };

  const handleRevoke = async (authority: PublicKey) => {
    setActionPda(authority.toBase58());
    try {
      await revokeIssuer(authority);
      const iss = await fetchAllIssuers();
      setIssuers(iss);
    } catch {
      /* silent */
    } finally {
      setActionPda(null);
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
          Admin Panel
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Connect the admin wallet to manage issuers.
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

  // ── Admin not initialized ──────────────────────────────────────
  if (!admin) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-24">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Initialize Admin
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          No admin account exists yet. Initialize one to start managing issuers.
          The connected wallet will become the admin authority.
        </p>

        <button
          className="btn-primary w-full"
          onClick={handleInitAdmin}
          disabled={initializing}
        >
          {initializing ? (
            <span className="flex items-center gap-2">
              <span
                className="spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Initializing…
            </span>
          ) : (
            "Initialize Admin Account"
          )}
        </button>

        {initTx && (
          <div className="alert alert-success mt-6">
            <span>✅</span>
            <div>
              <p className="text-sm font-semibold">Admin initialized!</p>
              <a
                href={explorerUrl(initTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-xs underline"
              >
                View transaction ↗
              </a>
            </div>
          </div>
        )}
        {initError && (
          <div className="alert alert-error mt-6">
            <span>⚠</span>
            <span className="text-sm">{initError}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Not admin wallet ───────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="page-enter section-container max-w-xl mx-auto py-32 text-center">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Access Denied
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          The connected wallet is not the admin authority. Switch to the admin
          wallet:
        </p>
        <p
          className="mono text-xs mt-2 break-all"
          style={{ color: "var(--text-muted)" }}
        >
          {admin.authority.toBase58()}
        </p>
      </div>
    );
  }

  // ── Admin dashboard ────────────────────────────────────────────
  return (
    <div className="page-enter section-container py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Admin Panel
          </h1>
          <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>
            {publicKey?.toBase58()}
          </p>
        </div>
        <span className="badge badge-verified">Admin</span>
      </div>

      {/* Issuer Table */}
      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Registered Issuers ({issuers.length})
      </h2>

      {issuers.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No issuers have registered yet.
        </p>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Wallet</th>
                <th>Certificates</th>
                <th>Reputation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuers.map(({ publicKey: pda, account: iss }) => {
                const authStr = iss.authority.toBase58();
                const isProcessing = actionPda === authStr;

                return (
                  <tr key={pda.toBase58()}>
                    <td
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {iss.institutionName}
                    </td>
                    <td className="mono text-xs">
                      {truncateAddress(authStr, 4)}
                    </td>
                    <td>{bnToNumber(iss.certificatesIssued)}</td>
                    <td>{bnToNumber(iss.reputationScore)}</td>
                    <td>
                      <span
                        className={`badge ${
                          iss.isRevoked
                            ? "badge-revoked"
                            : iss.isVerified
                            ? "badge-verified"
                            : "badge-unverified"
                        }`}
                      >
                        {iss.isRevoked
                          ? "Revoked"
                          : iss.isVerified
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      {isProcessing ? (
                        <span
                          className="spinner"
                          style={{ width: 18, height: 18, borderWidth: 2 }}
                        />
                      ) : (
                        <div className="flex gap-2">
                          {!iss.isVerified && !iss.isRevoked && (
                            <button
                              className="btn-primary"
                              style={{
                                padding: "5px 12px",
                                fontSize: "0.75rem",
                              }}
                              onClick={() => handleVerify(iss.authority)}
                            >
                              Verify
                            </button>
                          )}
                          {!iss.isRevoked && (
                            <button
                              className="btn-danger"
                              style={{
                                padding: "5px 12px",
                                fontSize: "0.75rem",
                              }}
                              onClick={() => handleRevoke(iss.authority)}
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
