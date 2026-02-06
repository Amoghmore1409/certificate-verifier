import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Certichain } from "../target/types/certichain";
import { expect } from "chai";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as crypto from "crypto";

describe("certichain", () => {
  // ------------------------------------------------------------------
  // Setup
  // ------------------------------------------------------------------
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Certichain as Program<Certichain>;
  const admin = provider.wallet;

  let adminPda: PublicKey;
  let adminBump: number;
  let issuerPda: PublicKey;
  let certificatePda: PublicKey;

  const certificateId = "CERT-TEST-001";

  // ------------------------------------------------------------------
  // 1. Admin initialisation
  // ------------------------------------------------------------------
  it("Initializes the admin account", async () => {
    [adminPda, adminBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin")],
      program.programId
    );

    const tx = await program.methods
      .initializeAdmin()
      .accounts({
        admin: adminPda,
        authority: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Admin init tx:", tx);

    const adminAccount = await program.account.adminAccount.fetch(adminPda);
    expect(adminAccount.authority.toBase58()).to.equal(
      admin.publicKey.toBase58()
    );
  });

  // ------------------------------------------------------------------
  // 2. Issuer registration
  // ------------------------------------------------------------------
  it("Registers an issuer (starts unverified)", async () => {
    [issuerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("issuer"), admin.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .registerIssuer("Test University")
      .accounts({
        issuer: issuerPda,
        authority: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Issuer register tx:", tx);

    const issuer = await program.account.issuerAccount.fetch(issuerPda);
    expect(issuer.institutionName).to.equal("Test University");
    expect(issuer.isVerified).to.be.false;
    expect(issuer.isRevoked).to.be.false;
    expect(issuer.certificatesIssued.toNumber()).to.equal(0);
  });

  // ------------------------------------------------------------------
  // 3. Unverified issuer cannot issue certificates
  // ------------------------------------------------------------------
  it("Rejects certificate issuance from unverified issuer", async () => {
    const hash = crypto
      .createHash("sha256")
      .update("test-data")
      .digest("hex");

    [certificatePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("certificate"),
        admin.publicKey.toBuffer(),
        Buffer.from(certificateId),
      ],
      program.programId
    );

    try {
      await program.methods
        .issueCertificate("Alice", "Blockchain 101", hash, certificateId)
        .accounts({
          certificate: certificatePda,
          issuer: issuerPda,
          authority: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      expect.fail("Should have thrown IssuerNotVerified");
    } catch (err: any) {
      expect(err.toString()).to.contain("IssuerNotVerified");
    }
  });

  // ------------------------------------------------------------------
  // 4. Admin verifies the issuer
  // ------------------------------------------------------------------
  it("Admin verifies the issuer", async () => {
    const tx = await program.methods
      .verifyIssuer()
      .accounts({
        admin: adminPda,
        issuer: issuerPda,
        authority: admin.publicKey,
      })
      .rpc();

    console.log("  ✅ Issuer verify tx:", tx);

    const issuer = await program.account.issuerAccount.fetch(issuerPda);
    expect(issuer.isVerified).to.be.true;
  });

  // ------------------------------------------------------------------
  // 5. Verified issuer issues a certificate
  // ------------------------------------------------------------------
  it("Issues a certificate successfully", async () => {
    const certData = JSON.stringify({
      student: "Alice Johnson",
      course: "Blockchain Development",
      date: Date.now(),
    });
    const certHash = crypto
      .createHash("sha256")
      .update(certData)
      .digest("hex");

    [certificatePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("certificate"),
        admin.publicKey.toBuffer(),
        Buffer.from(certificateId),
      ],
      program.programId
    );

    const tx = await program.methods
      .issueCertificate(
        "Alice Johnson",
        "Blockchain Development",
        certHash,
        certificateId
      )
      .accounts({
        certificate: certificatePda,
        issuer: issuerPda,
        authority: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("  ✅ Certificate issue tx:", tx);

    const cert = await program.account.certificateAccount.fetch(
      certificatePda
    );
    expect(cert.studentName).to.equal("Alice Johnson");
    expect(cert.courseName).to.equal("Blockchain Development");
    expect(cert.certificateHash).to.equal(certHash);
    expect(cert.isRevoked).to.be.false;

    // Issuer stats should have updated
    const issuer = await program.account.issuerAccount.fetch(issuerPda);
    expect(issuer.certificatesIssued.toNumber()).to.equal(1);
    expect(issuer.reputationScore.toNumber()).to.equal(10);
  });

  // ------------------------------------------------------------------
  // 6. Certificate revocation
  // ------------------------------------------------------------------
  it("Revokes a certificate", async () => {
    const tx = await program.methods
      .revokeCertificate()
      .accounts({
        certificate: certificatePda,
        issuer: issuerPda,
        authority: admin.publicKey,
      })
      .rpc();

    console.log("  ✅ Certificate revoke tx:", tx);

    const cert = await program.account.certificateAccount.fetch(
      certificatePda
    );
    expect(cert.isRevoked).to.be.true;
  });

  // ------------------------------------------------------------------
  // 7. Cannot revoke an already-revoked certificate
  // ------------------------------------------------------------------
  it("Rejects double revocation", async () => {
    try {
      await program.methods
        .revokeCertificate()
        .accounts({
          certificate: certificatePda,
          issuer: issuerPda,
          authority: admin.publicKey,
        })
        .rpc();

      expect.fail("Should have thrown CertificateAlreadyRevoked");
    } catch (err: any) {
      expect(err.toString()).to.contain("CertificateAlreadyRevoked");
    }
  });

  // ------------------------------------------------------------------
  // 8. Admin revokes the issuer
  // ------------------------------------------------------------------
  it("Admin revokes the issuer", async () => {
    const tx = await program.methods
      .revokeIssuer()
      .accounts({
        admin: adminPda,
        issuer: issuerPda,
        authority: admin.publicKey,
      })
      .rpc();

    console.log("  ✅ Issuer revoke tx:", tx);

    const issuer = await program.account.issuerAccount.fetch(issuerPda);
    expect(issuer.isVerified).to.be.false;
    expect(issuer.isRevoked).to.be.true;
  });
});
