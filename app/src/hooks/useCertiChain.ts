"use client";

import { useCallback, useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import type { Certichain } from "@/idl/certichain_types";
import IDL from "@/idl/certichain.json";
import {
  PROGRAM_ID,
  ADMIN_SEED,
  ISSUER_SEED,
  CERTIFICATE_SEED,
} from "@/lib/constants";

// ─── Data shapes ─────────────────────────────────────────────────

export interface CertificateData {
  issuer: PublicKey;
  studentName: string;
  courseName: string;
  certificateHash: string;
  certificateId: string;
  issuedAt: BN;
  isRevoked: boolean;
}

export interface IssuerData {
  authority: PublicKey;
  institutionName: string;
  isVerified: boolean;
  isRevoked: boolean;
  certificatesIssued: BN;
  reputationScore: BN;
  registeredAt: BN;
}

export interface AdminData {
  authority: PublicKey;
  createdAt: BN;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useCertiChain() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Build the Anchor program instance (null when wallet is disconnected)
  const program = useMemo<Program<Certichain> | null>(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new Program<Certichain>(IDL as Certichain, provider);
  }, [connection, wallet]);

  // ════════════════════════════════════════════════════════════════
  //  PDA derivation
  // ════════════════════════════════════════════════════════════════

  const getAdminPda = useCallback(
    () =>
      PublicKey.findProgramAddressSync(
        [Buffer.from(ADMIN_SEED)],
        PROGRAM_ID
      )[0],
    []
  );

  const getIssuerPda = useCallback(
    (authority: PublicKey) =>
      PublicKey.findProgramAddressSync(
        [Buffer.from(ISSUER_SEED), authority.toBuffer()],
        PROGRAM_ID
      )[0],
    []
  );

  const getCertificatePda = useCallback(
    (authority: PublicKey, certificateId: string) =>
      PublicKey.findProgramAddressSync(
        [
          Buffer.from(CERTIFICATE_SEED),
          authority.toBuffer(),
          Buffer.from(certificateId),
        ],
        PROGRAM_ID
      )[0],
    []
  );

  // ════════════════════════════════════════════════════════════════
  //  Write instructions
  // ════════════════════════════════════════════════════════════════

  const initializeAdmin = useCallback(async () => {
    if (!program || !wallet) throw new Error("Wallet not connected");
    const adminPda = getAdminPda();
    const tx = await program.methods
      .initializeAdmin()
      .rpc();
    return { tx, adminPda };
  }, [program, wallet, getAdminPda]);

  const registerIssuer = useCallback(
    async (institutionName: string) => {
      if (!program || !wallet) throw new Error("Wallet not connected");
      const issuerPda = getIssuerPda(wallet.publicKey);
      const tx = await program.methods
        .registerIssuer(institutionName)
        .rpc();
      return { tx, issuerPda };
    },
    [program, wallet, getIssuerPda]
  );

  const verifyIssuer = useCallback(
    async (issuerAuthority: PublicKey) => {
      if (!program || !wallet) throw new Error("Wallet not connected");
      const issuerPda = getIssuerPda(issuerAuthority);
      const tx = await program.methods
        .verifyIssuer()
        .accounts({
          issuer: issuerPda,
        } as any)
        .rpc();
      return { tx };
    },
    [program, wallet, getIssuerPda]
  );

  const revokeIssuer = useCallback(
    async (issuerAuthority: PublicKey) => {
      if (!program || !wallet) throw new Error("Wallet not connected");
      const issuerPda = getIssuerPda(issuerAuthority);
      const tx = await program.methods
        .revokeIssuer()
        .accounts({
          issuer: issuerPda,
        } as any)
        .rpc();
      return { tx };
    },
    [program, wallet, getIssuerPda]
  );

  const issueCertificate = useCallback(
    async (
      studentName: string,
      courseName: string,
      certificateHash: string,
      certificateId: string
    ) => {
      if (!program || !wallet) throw new Error("Wallet not connected");
      const issuerPda = getIssuerPda(wallet.publicKey);
      const certificatePda = getCertificatePda(
        wallet.publicKey,
        certificateId
      );
      const tx = await program.methods
        .issueCertificate(
          studentName,
          courseName,
          certificateHash,
          certificateId
        )
        .rpc();
      return { tx, certificatePda };
    },
    [program, wallet, getIssuerPda, getCertificatePda]
  );

  const revokeCertificate = useCallback(
    async (certificatePda: PublicKey) => {
      if (!program || !wallet) throw new Error("Wallet not connected");
      const tx = await program.methods
        .revokeCertificate()
        .accounts({
          certificate: certificatePda,
        } as any)
        .rpc();
      return { tx };
    },
    [program, wallet]
  );

  // ════════════════════════════════════════════════════════════════
  //  Read-only fetchers
  // ════════════════════════════════════════════════════════════════

  const fetchAdmin = useCallback(async (): Promise<AdminData | null> => {
    if (!program) return null;
    try {
      const pda = getAdminPda();
      return (await program.account.adminAccount.fetch(
        pda
      )) as unknown as AdminData;
    } catch {
      return null;
    }
  }, [program, getAdminPda]);

  const fetchIssuer = useCallback(
    async (authority: PublicKey): Promise<IssuerData | null> => {
      if (!program) return null;
      try {
        const pda = getIssuerPda(authority);
        return (await program.account.issuerAccount.fetch(
          pda
        )) as unknown as IssuerData;
      } catch {
        return null;
      }
    },
    [program, getIssuerPda]
  );

  const fetchCertificate = useCallback(
    async (pda: PublicKey): Promise<CertificateData | null> => {
      if (!program) return null;
      try {
        return (await program.account.certificateAccount.fetch(
          pda
        )) as unknown as CertificateData;
      } catch {
        return null;
      }
    },
    [program]
  );

  const fetchAllIssuers = useCallback(async () => {
    if (!program) return [];
    try {
      return (await program.account.issuerAccount.all()) as Array<{
        publicKey: PublicKey;
        account: IssuerData;
      }>;
    } catch {
      return [];
    }
  }, [program]);

  const fetchCertificatesByIssuer = useCallback(
    async (issuerAuthority: PublicKey) => {
      if (!program) return [];
      try {
        return (await program.account.certificateAccount.all([
          {
            memcmp: {
              offset: 8, // skip discriminator → first field is `issuer` (Pubkey)
              bytes: issuerAuthority.toBase58(),
            },
          },
        ])) as Array<{
          publicKey: PublicKey;
          account: CertificateData;
        }>;
      } catch {
        return [];
      }
    },
    [program]
  );

  // ────────────────────────────────────────────────────────────────
  //  Read-only helpers (no wallet required — used on /verify)
  // ────────────────────────────────────────────────────────────────

  const getReadOnlyProgram = useCallback(() => {
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    };
    const provider = new AnchorProvider(
      connection,
      dummyWallet as any,
      { commitment: "confirmed" }
    );
    return new Program<Certichain>(IDL as Certichain, provider);
  }, [connection]);

  const fetchCertificatePublic = useCallback(
    async (pda: PublicKey): Promise<CertificateData | null> => {
      try {
        const p = getReadOnlyProgram();
        return (await p.account.certificateAccount.fetch(
          pda
        )) as unknown as CertificateData;
      } catch {
        return null;
      }
    },
    [getReadOnlyProgram]
  );

  const fetchIssuerPublic = useCallback(
    async (authority: PublicKey): Promise<IssuerData | null> => {
      try {
        const p = getReadOnlyProgram();
        const pda = getIssuerPda(authority);
        return (await p.account.issuerAccount.fetch(
          pda
        )) as unknown as IssuerData;
      } catch {
        return null;
      }
    },
    [getReadOnlyProgram, getIssuerPda]
  );

  // ════════════════════════════════════════════════════════════════

  return {
    program,
    wallet,
    connection,
    // PDA helpers
    getAdminPda,
    getIssuerPda,
    getCertificatePda,
    // Write
    initializeAdmin,
    registerIssuer,
    verifyIssuer,
    revokeIssuer,
    issueCertificate,
    revokeCertificate,
    // Read (wallet)
    fetchAdmin,
    fetchIssuer,
    fetchCertificate,
    fetchAllIssuers,
    fetchCertificatesByIssuer,
    // Read (public)
    fetchCertificatePublic,
    fetchIssuerPublic,
  };
}
