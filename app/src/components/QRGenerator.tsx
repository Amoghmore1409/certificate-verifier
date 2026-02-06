"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRGeneratorProps {
  /** The data encoded in the QR (URL or public key) */
  value: string;
  /** Size in pixels (default 200) */
  size?: number;
  /** Optional label below the QR */
  label?: string;
}

/**
 * Renders a styled QR code inside a white container
 * with an optional label below.
 */
export default function QRGenerator({
  value,
  size = 200,
  label,
}: QRGeneratorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="qr-container">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#070b14"
          level="H"
          includeMargin={false}
        />
      </div>
      {label && (
        <p
          className="mono text-xs text-center max-w-[280px] break-all"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
