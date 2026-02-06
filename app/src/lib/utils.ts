// ─── Hashing ─────────────────────────────────────────────────────

/** SHA-256 hash of arbitrary data (browser-native SubtleCrypto) */
export async function generateCertificateHash(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  const buf = await crypto.subtle.digest("SHA-256", encoded.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── ID Generation ───────────────────────────────────────────────

/** Generate a unique, deterministic-ish certificate ID */
export function generateCertificateId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${ts}-${rand}`;
}

// ─── Formatting ──────────────────────────────────────────────────

/** Truncate a base-58 address for display */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Unix timestamp → human-readable date string */
export function formatTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a BN-like value to a plain number */
export function bnToNumber(bn: { toNumber?: () => number } | number): number {
  if (typeof bn === "number") return bn;
  if (bn && typeof bn.toNumber === "function") return bn.toNumber();
  return Number(bn);
}

// ─── Validation ──────────────────────────────────────────────────

/** Basic check that a string looks like a Solana public key */
export function isValidPublicKey(str: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(str);
}

// ─── Clipboard ───────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
