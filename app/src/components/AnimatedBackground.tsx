"use client";

/**
 * A fixed-position background layer with gradient orbs and a subtle grid.
 * Rendered behind all page content (z-index: -1).
 */
export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: -1, pointerEvents: "none" }}
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,245,214,0.06) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(139,92,246,0.04) 0%, transparent 50%), " +
            "var(--bg-primary)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,245,214,0.02) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(6,245,214,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating orbs — animate via CSS */}
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          top: "-15%",
          left: "20%",
          background: "var(--accent-cyan)",
          animation: "float-orb-1 20s ease-in-out infinite alternate",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          bottom: "10%",
          right: "10%",
          background: "var(--accent-violet)",
          animation: "float-orb-2 25s ease-in-out infinite alternate",
        }}
      />

      {/* Inline keyframes for the orbs */}
      <style jsx>{`
        @keyframes float-orb-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(60px, 40px) scale(1.08); }
        }
        @keyframes float-orb-2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, -30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
