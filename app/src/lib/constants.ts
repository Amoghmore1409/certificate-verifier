import { PublicKey } from "@solana/web3.js";

// ─── Program ID ──────────────────────────────────────────────────
// After running `anchor keys list`, replace this with your real program ID.
// Also update: Anchor.toml, .env.local, and the IDL metadata.
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "8exNmXgWUKijpNmQTAGhpaLeXSorGZmcExT2LTrFhogj"
);

// ─── Network ─────────────────────────────────────────────────────
export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

// ─── PDA Seeds ───────────────────────────────────────────────────
export const ADMIN_SEED = "admin";
export const ISSUER_SEED = "issuer";
export const CERTIFICATE_SEED = "certificate";

// ─── Explorer ────────────────────────────────────────────────────
export const explorerUrl = (
  sig: string,
  type: "tx" | "address" = "tx"
): string =>
  `https://explorer.solana.com/${type}/${sig}?cluster=${SOLANA_NETWORK}`;
