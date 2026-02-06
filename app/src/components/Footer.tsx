import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-10 mt-20"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: "var(--bg-primary)" }}
              >
                CC
              </span>
            </div>
            <span
              className="font-semibold tracking-tight"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--text-primary)",
              }}
            >
              CertiChain
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/verify"
              className="no-underline transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Verify
            </Link>
            <Link
              href="/dashboard"
              className="no-underline transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Dashboard
            </Link>
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Solana Explorer ↗
            </a>
          </div>

          {/* Copyright */}
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Built on Solana Devnet &middot; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
