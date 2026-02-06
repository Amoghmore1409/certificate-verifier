import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Certichain } from "@/idl/certichain_types";
import IDL from "@/idl/certichain.json";
import { SOLANA_RPC_URL } from "./constants";

// ─── Typed helpers ──────────────────────────────────────────────

/** Build a full typed Program instance for a connected wallet */
export function getProgram(provider: AnchorProvider): Program<Certichain> {
  return new Program<Certichain>(IDL as Certichain, provider);
}

/** Build an AnchorProvider from a connection + wallet */
export function getProvider(connection: Connection, wallet: any) {
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
}

// ─── Read-only access (no wallet needed) ────────────────────────

const dummyWallet = {
  publicKey: PublicKey.default,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any[]) => txs,
};

/**
 * Returns a Program instance that can **read** accounts but not sign
 * transactions. Used by the public verification page.
 */
export function getReadOnlyProgram(connection?: Connection): Program<Certichain> {
  const conn = connection ?? new Connection(SOLANA_RPC_URL, "confirmed");
  const provider = new AnchorProvider(conn, dummyWallet as any, {
    commitment: "confirmed",
  });
  return new Program<Certichain>(IDL as Certichain, provider);
}
