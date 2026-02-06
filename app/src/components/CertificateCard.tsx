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

/* ── Decorative SVG seal ── */
function CertificateSeal({ revoked }: { revoked: boolean }) {
  const color = revoked ? "#ef4444" : "#f5a623";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer starburst */}
      <g opacity={revoked ? 0.4 : 0.85}>
        {Array.from({ length: 16 }).map((_, i) => (
          <polygon
            key={i}
            points="36,4 39,16 36,14 33,16"
            fill={color}
            transform={`rotate(${i * 22.5} 36 36)`}
          />
        ))}
      </g>
      {/* Inner circles */}
      <circle cx="36" cy="36" r="22" fill={revoked ? "#1a1010" : "#141008"} stroke={color} strokeWidth="1.5" opacity={revoked ? 0.6 : 0.9} />
      <circle cx="36" cy="36" r="17" fill="none" stroke={color} strokeWidth="0.5" opacity={0.5} />
      {/* Center icon – checkmark or X */}
      {revoked ? (
        <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity={0.8}>
          <line x1="29" y1="29" x2="43" y2="43" />
          <line x1="43" y1="29" x2="29" y2="43" />
        </g>
      ) : (
        <path d="M26 36 L33 43 L46 29" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {/* "VERIFIED" / "REVOKED" text around the circle */}
      <defs>
        <path id="sealArc" d="M 12,36 a 24,24 0 1,1 48,0" />
      </defs>
      <text fontSize="5.5" fontFamily="Space Grotesk, sans-serif" fontWeight="700" letterSpacing="3" fill={color} opacity={0.7}>
        <textPath href="#sealArc" startOffset="50%" textAnchor="middle">
          {revoked ? "REVOKED" : "VERIFIED"}
        </textPath>
      </text>
    </svg>
  );
}

/* ── Blockchain shield icon ── */
function BlockchainBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline-block">
      <path d="M7 1L12.5 3.5V7C12.5 10 10 12.5 7 13.5C4 12.5 1.5 10 1.5 7V3.5L7 1Z" stroke="var(--accent-cyan)" strokeWidth="1" fill="rgba(6,245,214,0.08)" />
      <path d="M5 7L6.5 8.5L9 5.5" stroke="var(--accent-cyan)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
  const accentColor = isRevoked ? "var(--error)" : "var(--accent-amber)";

  return (
    <div className={`cert-card ${isRevoked ? "cert-card--revoked" : ""}`}>
      {/* Decorative corner flourishes */}
      <div className="cert-corner cert-corner--tl" />
      <div className="cert-corner cert-corner--tr" />
      <div className="cert-corner cert-corner--bl" />
      <div className="cert-corner cert-corner--br" />

      {/* Watermark */}
      <div className="cert-watermark">CERTICHAIN</div>

      {/* Revoked diagonal stamp */}
      {isRevoked && <div className="cert-revoked-stamp">REVOKED</div>}

      {/* ─── Top decorative border ─── */}
      <div className="cert-top-border">
        <div className="cert-top-line" />
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <path d="M0 6 Q6 0 12 6 Q18 12 24 6" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        <div className="cert-top-line" />
      </div>

      {/* ─── Header ─── */}
      <div className="cert-header">
        <div className="cert-logo-row">
          <BlockchainBadge />
          <span className="cert-logo-text">CertiChain</span>
          <BlockchainBadge />
        </div>
        <h2 className="cert-title">Certificate of Completion</h2>
        <div className="cert-subtitle-rule" />
      </div>

      {/* ─── Body ─── */}
      <div className="cert-body">
        <p className="cert-preamble">This is to certify that</p>
        <h3 className="cert-student-name">{studentName}</h3>
        <p className="cert-preamble">has successfully completed the course</p>
        <h4 className="cert-course-name">{courseName}</h4>
        <p className="cert-date">
          Issued on {formatTimestamp(issuedAt)}
        </p>
      </div>

      {/* ─── Seal + Meta row ─── */}
      <div className="cert-seal-row">
        {/* Left: details */}
        <div className="cert-details">
          <div className="cert-detail-item">
            <span className="cert-detail-label">Certificate ID</span>
            <span className="cert-detail-value mono">{certificateId}</span>
          </div>
          <div className="cert-detail-item">
            <span className="cert-detail-label">Issuer</span>
            <span className="cert-detail-value mono">{truncateAddress(issuerAddress, 6)}</span>
          </div>
          <div className="cert-detail-item">
            <span className="cert-detail-label">SHA-256 Hash</span>
            <span className="cert-detail-value cert-hash mono">{certificateHash}</span>
          </div>
        </div>

        {/* Center: Seal */}
        <div className="cert-seal">
          <CertificateSeal revoked={isRevoked} />
        </div>

        {/* Right: signature area */}
        <div className="cert-signature-area">
          <div className="cert-signature-line" />
          <span className="cert-signature-label">Authorized Signature</span>
          <span className="cert-signature-address mono">
            {truncateAddress(issuerAddress, 6)}
          </span>
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div className="cert-bottom-bar">
        <div className="cert-blockchain-tag">
          <BlockchainBadge />
          <span>Blockchain Verified</span>
        </div>

        <a
          href={explorerUrl(publicKey, "address")}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-explorer-link"
        >
          View on Solana Explorer ↗
        </a>

        <div className="cert-actions">
          {onRevoke && !isRevoked && (
            <button
              className="btn-danger"
              style={{ padding: "6px 16px", fontSize: "0.76rem" }}
              onClick={onRevoke}
              disabled={revoking}
            >
              {revoking ? "Revoking…" : "Revoke Certificate"}
            </button>
          )}
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="cert-top-border" style={{ marginTop: 0 }}>
        <div className="cert-top-line" />
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <path d="M0 6 Q6 0 12 6 Q18 12 24 6" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
        <div className="cert-top-line" />
      </div>
    </div>
  );
}
