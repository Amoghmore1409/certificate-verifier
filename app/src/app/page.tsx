"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="page-enter">
      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="section-container flex flex-col items-center text-center py-28 md:py-40">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: "var(--accent-cyan-dim)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent-cyan)" }}
            />
            <span
              className="text-xs font-semibold tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--accent-cyan)",
              }}
            >
              Powered by Solana Devnet
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tamper-Proof <br className="hidden sm:block" />
            <span className="gradient-text">Certificates</span>{" "}
            <br className="hidden sm:block" />
            on Solana
          </h1>

          <p
            className="max-w-2xl text-base md:text-lg mb-10"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            Issue immutable credentials, verify them instantly via QR code, and
            let any third party confirm authenticity — all directly from the
            blockchain. No backend trust required.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary">
              Start Issuing →
            </Link>
            <Link href="/verify" className="btn-secondary">
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="section-container">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-16"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Why <span className="gradient-text">CertiChain</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card p-7 flex flex-col gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: f.bgColor,
                    border: `1px solid ${f.borderColor}`,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="section-container">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <p
            className="text-center text-sm mb-16 max-w-lg mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Three steps from issuance to verification — no intermediaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
                    color: "var(--bg-primary)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {i + 1}
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="section-container">
          <div
            className="glass-card p-10 md:p-16 text-center"
            style={{
              borderImage:
                "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet)) 1",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(160deg, rgba(6,245,214,0.04) 0%, rgba(139,92,246,0.04) 100%), var(--bg-card)",
            }}
          >
            <h2
              className="text-2xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ready to go <span className="gradient-text">on-chain</span>?
            </h2>
            <p
              className="text-sm md:text-base mb-8 max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Connect your Phantom wallet, register your institution, get
              verified, and start issuing tamper-proof certificates today.
            </p>
            <Link href="/dashboard" className="btn-primary">
              Launch Dashboard →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Static data ─────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🔗",
    title: "Immutable On-Chain Records",
    description:
      "Every certificate is stored as a PDA on Solana. Once issued, the data cannot be altered — period.",
    bgColor: "var(--accent-cyan-dim)",
    borderColor: "rgba(6,245,214,0.15)",
  },
  {
    icon: "📱",
    title: "QR Instant Verification",
    description:
      "Scan a QR code and instantly verify a certificate's authenticity directly from the Solana blockchain.",
    bgColor: "var(--accent-violet-dim)",
    borderColor: "rgba(139,92,246,0.15)",
  },
  {
    icon: "🛡️",
    title: "Trust & Reputation",
    description:
      "Only admin-verified institutions can issue certificates. Fake issuers are blocked at the smart contract level.",
    bgColor: "var(--accent-amber-dim)",
    borderColor: "rgba(245,166,35,0.15)",
  },
];

const STEPS = [
  {
    title: "Register & Get Verified",
    description:
      "Connect your Phantom wallet, register your institution, and wait for admin verification.",
  },
  {
    title: "Issue Certificates",
    description:
      "Fill in student details and submit. Each certificate is a Solana transaction stored on-chain forever.",
  },
  {
    title: "Share & Verify via QR",
    description:
      "Share the generated QR code. Anyone can scan it to verify the certificate — no login, no trust assumptions.",
  },
];
