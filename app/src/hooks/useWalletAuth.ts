"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCertiChain, IssuerData } from "./useCertiChain";

/**
 * Convenience hook that resolves the connected wallet's issuer status.
 *
 * Returns:
 *  - `connected` — whether any wallet is connected
 *  - `issuer` — the on-chain IssuerAccount (or null)
 *  - `loading` — whether the fetch is in progress
 *  - `refresh` — manually re-fetch
 */
export function useWalletAuth() {
  const { publicKey, connected } = useWallet();
  const { fetchIssuer } = useCertiChain();
  const [issuer, setIssuer] = useState<IssuerData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!publicKey) {
      setIssuer(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchIssuer(publicKey);
      setIssuer(data);
    } catch {
      setIssuer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  return { connected, publicKey, issuer, loading, refresh };
}
