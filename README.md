# PROOFWORK

**Trustless Escrow & Portable Reputation Protocol on Solana**

ProofWork is a protocol that provides two primitives any marketplace can plug into: **programmatic escrow** (funds lock in on-chain PDAs, released by code not a company) and **soulbound reputation** (non-transferable NFT reviews that live in your wallet forever). Together, they replace the trust layer that platforms like Upwork charge 19% to provide.

The freelance marketplace is the first app built on the protocol. But the same two building blocks power any service marketplace — bounty boards, security audits, art commissions, grant disbursement, tutoring, service DAOs.

> Live on Solana Devnet — [proofworksol.netlify.app](https://proofworksol.netlify.app)

---

## The Problem

Every online marketplace charges you to trust them. Upwork made $788M last year just sitting in the middle. Leave the platform? Your reputation stays behind — zero portability. Your money sits in their bank account, and they decide when you get paid. This isn't unique to freelancing — it's how every marketplace works.

## The Protocol

Two primitives. No middleman.

1. **Programmatic Escrow** — Client posts a job, SOL locks in a PDA. Code releases funds on approval, not a company.
2. **Soulbound Reputation** — On completion, a non-transferable Token-2022 NFT review is minted into the worker's wallet. Any app on Solana can read it.

## Cross-Platform Vision

Think Stripe — Stripe doesn't run a store, it powers payments for every store. ProofWork doesn't run a marketplace, it powers trust for every marketplace.

| Use Case | How It Works |
|---|---|
| Bounty Boards | DAO posts task → escrow locks funds → contributor delivers → reputation minted |
| Audit Markets | Protocol posts audit → escrow secures payment → auditor delivers report |
| Commissions | Client requests art/design/music → escrow guarantees payment on delivery |
| Grant Disbursement | Foundation funds milestone-based grants with escrow release on completion |
| Tutoring | Session-based escrow for 1:1 learning |
| Service DAOs | Agency contracts with multi-party escrow |

---

## How to Use the App (ProofWork Marketplace)

### Prerequisites

- [Phantom Wallet](https://phantom.app/) browser extension
- Phantom set to **Devnet** (Settings → Developer Settings → Testnet Mode)
- Free Devnet SOL from [faucet.solana.com](https://faucet.solana.com)

### Step-by-Step Guide

#### 1. Connect Your Wallet
Visit the app and click the red **Connect Wallet** button in the top-right corner. Select Phantom and approve the connection. Make sure Phantom is set to Devnet.

#### 2. Browse Jobs
Navigate to **Browse Jobs** to see open listings. Use the search bar to filter by keywords or skills, and use the category checkboxes on the left to narrow results.

#### 3. Post a Job (Client Flow)
- Click **Post Job** in the navigation bar
- Fill in the job title, description, budget (in SOL), and required skills
- Click **Deploy Job to Chain** — this triggers a Phantom transaction that locks your SOL in the escrow contract
- Your job is now live and accepting applications

#### 4. Apply for a Job (Freelancer Flow)
- Open any job with an "Escrow Secured" status
- Scroll down to the Applications section
- Write a cover letter and click **Apply**

#### 5. Accept a Freelancer (Client Flow)
- Open your posted job
- Review applications
- Click **Accept Top Applicant** — this triggers an on-chain transaction assigning the freelancer

#### 6. Submit & Release Payment
- **Freelancer**: Click **Submit Work** when deliverables are ready
- **Client**: Review the submission and click **Release Payment** — funds transfer instantly from escrow to the freelancer's wallet
- After release, you can leave a review that gets minted as a Soulbound NFT

#### 7. Disputes
Either party can click **Dispute** during an active job. An admin arbitrator reviews the case and can either award the freelancer or refund the client.

#### 8. View Your Dashboard
The **Dashboard** shows your wallet overview, active gigs, completed jobs, and total earnings/escrow amounts.

#### 9. View Profiles
Click any wallet address in the app to view that user's profile — their skills, completed gigs, and Soulbound Reviews.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Solana (Devnet) |
| Smart Contracts | Anchor 0.31.1 (Rust) |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Wallet Integration | Solana Wallet Adapter |
| Soulbound NFTs | Token-2022 (NonTransferable + MetadataPointer) |
| Data Layer | Firebase / Firestore (real-time sync) |
| Real-Time | Firestore subscriptions for chat, notifications, live dashboard updates |
| Avatars | DiceBear pixel-art (deterministic, seeded by wallet address) |
| Design System | Space Grotesk + Inter, neo-brutalist dark theme |

## Architecture

```
Client posts job → SOL locked in PDA escrow
                         ↓
              Freelancer accepted on-chain
                         ↓
              Work submitted → Client reviews
                         ↓
         Release: escrow → freelancer wallet (instant)
                         ↓
         Review minted as Soulbound NFT (Token-2022)
```

**Escrow PDAs** are derived from `["job", client_pubkey, job_id]` — each job has a unique on-chain account that holds the funds until release or dispute resolution.

**Soulbound Reviews** use Token-2022's NonTransferable extension — once minted, the NFT cannot be transferred, sold, or removed. It permanently lives in the freelancer's wallet as proof of work.

## Program

Deployed to Devnet: `E9jCj4PbqrAjgJozagmhuXBaLWyzXmwVqTZxpkEGJu4p`

Instructions: `create_job`, `accept_freelancer`, `submit_work`, `release`, `dispute`, `resolve_dispute`, `cancel`

---

## Local Development

```bash
# Frontend
cd app
npm install
npm run dev

# Build & deploy program (requires Solana CLI + Anchor)
anchor build
anchor deploy --provider.cluster devnet
```

## License

MIT
