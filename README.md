# CertiChain — On-Chain Certificate Issuance & Verification

> Tamper-proof certificates on Solana. Issue, verify, and trust — all on-chain.

CertiChain is a production-ready Solana dApp that allows verified institutions to issue immutable certificates on the blockchain, generate QR codes for instant verification, and enable any third party to verify authenticity directly from Solana — no backend trust required.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Solana Devnet                          │
│                                                             │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Admin PDA │  │ Issuer PDA   │  │  Certificate PDA    │  │
│  │ ["admin"]  │  │ ["issuer",   │  │ ["certificate",     │  │
│  │            │  │  authority]  │  │  authority, cert_id] │  │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬──────────┘  │
│        │               │                     │              │
│        └───────┬───────┴─────────────────────┘              │
│                │                                            │
│        ┌───────┴────────┐                                   │
│        │  CertiChain    │  ← Anchor Program                 │
│        │  Smart Contract│                                   │
│        └───────┬────────┘                                   │
└────────────────┼────────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │  Next.js App   │  ← Frontend
         │  + Wallet      │
         │    Adapter     │
         └────────────────┘
```

### Smart Contract (Anchor)

| Account           | PDA Seeds                                | Description                        |
| ----------------- | ---------------------------------------- | ---------------------------------- |
| `AdminAccount`    | `["admin"]`                              | Global admin / DAO authority       |
| `IssuerAccount`   | `["issuer", authority_pubkey]`           | Institution profile & stats        |
| `CertificateAccount` | `["certificate", authority, cert_id]` | Immutable on-chain credential      |

### Instructions

| Instruction          | Who Can Call     | What It Does                                      |
| -------------------- | ---------------- | ------------------------------------------------- |
| `initialize_admin`   | Anyone (once)    | Creates the global admin PDA                      |
| `register_issuer`    | Anyone           | Self-registers an issuer (starts unverified)      |
| `verify_issuer`      | Admin only       | Verifies an issuer → can now issue certificates   |
| `revoke_issuer`      | Admin only       | Revokes an issuer permanently                     |
| `issue_certificate`  | Verified issuer  | Creates an on-chain certificate with SHA-256 hash |
| `revoke_certificate` | Original issuer  | Marks a certificate as revoked                    |

---

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Smart Contract   | Rust + Anchor 0.29                                  |
| Blockchain       | Solana Devnet                                       |
| Frontend         | Next.js 14 (App Router) + React 18                  |
| Styling          | Tailwind CSS + Custom CSS Variables                 |
| Wallet           | Solana Wallet Adapter (Phantom auto-detected)       |
| QR Codes         | qrcode.react                                        |
| Bulk Upload      | PapaParse (CSV) + native JSON                       |

---

## Project Structure

```
certificate-verifier/
├── anchor/                         # Solana program
│   ├── Anchor.toml
│   ├── Cargo.toml
│   ├── programs/certichain/src/
│   │   └── lib.rs                  # Complete Anchor program
│   ├── tests/certichain.ts         # Integration tests
│   └── migrations/deploy.ts
│
├── app/                            # Next.js frontend
│   ├── src/
│   │   ├── app/                    # Pages (App Router)
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── dashboard/          # Issuer dashboard
│   │   │   ├── issue/              # Issue single certificate
│   │   │   ├── bulk/               # Bulk CSV/JSON issuance
│   │   │   ├── verify/             # Verify input
│   │   │   ├── verify/[pubkey]/    # Verification result
│   │   │   └── admin/              # Admin panel
│   │   ├── components/             # Reusable UI
│   │   ├── hooks/                  # useCertiChain, useWalletAuth
│   │   ├── lib/                    # Constants, utils, Anchor helpers
│   │   └── idl/certichain.json     # Program IDL
│   └── package.json
│
├── README.md
└── DEMO_CHECKLIST.md
```

---

## Getting Started

### Prerequisites

- **Rust** + **Cargo** — [Install](https://rustup.rs/)
- **Solana CLI** — [Install](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor CLI** (0.29.x) — [Install](https://www.anchor-lang.com/docs/installation)
- **Node.js** 18+ + **npm/yarn**
- **Phantom Wallet** browser extension

### 1. Configure Solana for Devnet

```bash
solana config set --url devnet
solana-keygen new          # if you don't have a keypair
solana airdrop 2           # get devnet SOL
```

### 2. Build & Deploy the Anchor Program

```bash
cd anchor
yarn install               # install test dependencies
anchor build
anchor keys list           # copy the program ID
```

Update the program ID in:
- `anchor/Anchor.toml` → `[programs.devnet]`
- `anchor/programs/certichain/src/lib.rs` → `declare_id!("...")`
- `app/.env.local` → `NEXT_PUBLIC_PROGRAM_ID`
- `app/src/idl/certichain.json` (if you rebuild the IDL)

```bash
anchor deploy              # deploys to devnet
```

### 3. Run Tests

```bash
cd anchor
anchor test                # runs all integration tests
```

### 4. Start the Frontend

```bash
cd app
npm install
npm run dev                # http://localhost:3000
```

### 5. Update the IDL

After deploying, if you changed the program, copy the generated IDL:

```bash
cp anchor/target/idl/certichain.json app/src/idl/certichain.json
```

---

## Usage Flow

### As an Admin
1. Go to `/admin` → **Initialize Admin** (one-time)
2. Issuers register from `/dashboard`
3. Go back to `/admin` → **Verify** pending issuers

### As an Issuer
1. Connect Phantom wallet
2. Go to `/dashboard` → **Register** with institution name
3. Wait for admin verification
4. Go to `/issue` → fill in student details → **Issue Certificate**
5. Share the QR code with the student

### As a Verifier (Anyone)
1. Scan the QR code  OR  go to `/verify`
2. Enter the certificate PDA address
3. See ✅ Valid / ❌ Revoked + full details from the blockchain

---

## Design Philosophy

- **Dark-first** with deep navy backgrounds and gradient overlays
- **Space Grotesk** for headings, **DM Sans** for body, **JetBrains Mono** for addresses
- Electric cyan (`#06f5d6`) and violet (`#8b5cf6`) accent palette
- Glass-morphism cards with subtle borders
- Motion only on page load and major state transitions
- No generic card grids, no cookie-cutter dashboards

---

## Error Handling

The smart contract enforces:

| Error                       | Cause                                         |
| --------------------------- | --------------------------------------------- |
| `IssuerNotVerified`         | Unverified issuer tried to issue a certificate |
| `IssuerRevoked`             | Revoked issuer tried to issue                  |
| `UnauthorizedAdmin`         | Non-admin tried to verify/revoke an issuer     |
| `UnauthorizedIssuer`        | Wrong wallet tried to revoke a certificate     |
| `CertificateAlreadyRevoked` | Certificate was already revoked                |
| `Overflow`                  | Counter overflow (very unlikely)               |

The frontend translates these into user-friendly error messages.

---

## License

MIT
