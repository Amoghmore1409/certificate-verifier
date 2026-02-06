# CertiChain — Hackathon Demo Checklist

Use this checklist when presenting CertiChain to judges. Each step demonstrates a real on-chain interaction.

---

## Pre-Demo Setup

- [ ] Solana CLI configured for **Devnet** (`solana config get`)
- [ ] Program deployed to Devnet (`anchor deploy`)
- [ ] Frontend running at `http://localhost:3000`
- [ ] Phantom wallet installed with **2+ SOL** on Devnet
- [ ] Program ID matches across: `Anchor.toml`, `lib.rs`, `.env.local`, IDL
- [ ] Have Solana Explorer open in a separate tab (cluster: Devnet)

---

## Demo Script (8–10 minutes)

### 1. Landing Page (30 sec)
- [ ] Show the landing page — explain the problem (fake certificates)
- [ ] Highlight: "Everything is on Solana, no backend trust"

### 2. Admin Initialization (1 min)
- [ ] Navigate to `/admin`
- [ ] Connect Phantom wallet
- [ ] Click **Initialize Admin** → show the transaction in Solana Explorer
- [ ] Explain: "This creates a PDA — the admin authority is now on-chain"

### 3. Issuer Registration (1.5 min)
- [ ] Navigate to `/dashboard`
- [ ] Enter institution name (e.g., "MIT Blockchain Lab")
- [ ] Click **Register** → show the Solana transaction
- [ ] Point out: status is **Pending Verification** (unverified issuer cannot issue)

### 4. Admin Verifies Issuer (1 min)
- [ ] Go back to `/admin`
- [ ] Show the issuer in the table with "Pending" status
- [ ] Click **Verify** → show the transaction
- [ ] Explain: "Only admin-verified institutions can issue certificates"

### 5. Issue a Certificate (2 min)
- [ ] Navigate to `/issue`
- [ ] Fill in: Student Name + Course Name
- [ ] Click **Issue Certificate**
- [ ] Show the transaction hash → open in Solana Explorer
- [ ] Show the generated **QR code**
- [ ] Explain: "A SHA-256 hash of the data is stored on-chain. Tamper-proof."

### 6. QR Verification (1.5 min)
- [ ] Scan the QR code (or copy the URL)
- [ ] Show the `/verify/<pubkey>` page
- [ ] Point out: ✅ Valid, issuer name, issue date, hash, reputation score
- [ ] Explain: "Anyone can do this without a wallet — data is read directly from Solana"
- [ ] Click **View on Solana Explorer** to show the on-chain account

### 7. Bulk Issuance (1.5 min)
- [ ] Navigate to `/bulk`
- [ ] Upload the sample CSV:
  ```csv
  student_name,course_name
  Alice Johnson,Blockchain Development
  Bob Smith,Web3 Security
  Carol Williams,DeFi Architecture
  Dave Brown,Smart Contract Auditing
  ```
- [ ] Show the preview table
- [ ] Click **Issue All** → watch the progress bar
- [ ] Show results: transaction hashes for each certificate

### 8. Certificate Revocation (30 sec)
- [ ] Go to `/dashboard`
- [ ] Click **Revoke** on a certificate
- [ ] Go back to `/verify/<pubkey>` → show ❌ Revoked status

---

## Key Talking Points for Judges

1. **Real Transactions**: Every action produces a Solana Devnet transaction visible on Explorer
2. **PDA Architecture**: Admin, Issuer, and Certificate accounts are all PDAs — deterministically derived
3. **Wallet Auth**: The smart contract verifies `signer == authority` — no backend auth needed
4. **Zero Trust Verification**: The verify page works without a wallet, reading directly from Solana
5. **Enterprise Ready**: Bulk issuance supports CSV/JSON upload for 100+ certificates
6. **Issuer Reputation**: On-chain reputation score increases with each certificate issued
7. **Revocation**: Certificates can be revoked by the original issuer only
8. **Extensible**: Architecture is ready for AI features (e.g., AI-powered certificate content, fraud detection)

---

## Sample Data

### CSV for Bulk Upload
```csv
student_name,course_name
Alice Johnson,Blockchain Development
Bob Smith,Web3 Security Fundamentals
Carol Williams,DeFi Protocol Architecture
Dave Brown,Smart Contract Auditing
Eve Davis,Cryptographic Systems
Frank Miller,Solana Program Development
Grace Lee,Zero Knowledge Proofs
Henry Wang,Token Economics
Ivy Chen,NFT Engineering
Jack Taylor,Decentralized Identity
```

### JSON for Bulk Upload
```json
[
  { "student_name": "Alice Johnson", "course_name": "Blockchain Development" },
  { "student_name": "Bob Smith", "course_name": "Web3 Security Fundamentals" },
  { "student_name": "Carol Williams", "course_name": "DeFi Protocol Architecture" }
]
```

---

## Troubleshooting During Demo

| Issue | Fix |
|-------|-----|
| "Wallet not connected" | Click wallet button in navbar, ensure Phantom is on Devnet |
| "Insufficient funds" | Run `solana airdrop 2` in terminal |
| "IssuerNotVerified" | Go to Admin → verify the issuer first |
| Transaction timeout | Devnet can be slow — wait and retry |
| "Account already exists" | Admin was already initialized — skip that step |

---

## After Demo

- Show the Solana Explorer with all transactions from the demo
- Mention future roadmap: AI-powered verification, multi-chain, IPFS attachments
- Invite judges to scan a QR code on their own phones
