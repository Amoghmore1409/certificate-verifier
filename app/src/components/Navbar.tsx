"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { truncateAddress } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";

// Dynamically import wallet button to avoid SSR issues
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Issue", href: "/issue" },
  { label: "Bulk Issue", href: "/bulk" },
  { label: "Verify", href: "/verify" },
  { label: "Admin", href: "/admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(7, 11, 20, 0.82)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
            }}
          >
            <span className="text-sm font-bold" style={{ color: "var(--bg-primary)" }}>
              CC
            </span>
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
            }}
          >
            CertiChain
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  color: isActive
                    ? "var(--accent-cyan)"
                    : "var(--text-secondary)",
                  background: isActive
                    ? "var(--accent-cyan-dim)"
                    : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {publicKey && (
            <span
              className="hidden sm:inline-block mono text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {truncateAddress(publicKey.toBase58(), 5)}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
