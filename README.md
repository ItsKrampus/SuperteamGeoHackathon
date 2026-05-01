# PROOFWORK

**Decentralized Freelance Marketplace on Solana**

ProofWork eliminates the middlemen, platform fees, and trust issues that plague traditional freelancing platforms. Jobs are secured by programmable on-chain escrow, payments settle instantly, and every completed review is minted as a Soulbound NFT — giving freelancers a portable, verifiable reputation they truly own.

> Live on Solana Devnet — [superteamgeohackathon.netlify.app](https://superteamgeohackathon.netlify.app)

---

## Why ProofWork Over Upwork?

| Problem with Upwork | ProofWork Solution |
|---|---|
| **20% platform fee** on freelancer earnings | **0% protocol fee** — funds go directly from client to freelancer |
| Disputes resolved by opaque internal teams | **On-chain arbitration** with transparent dispute resolution |
| Reputation locked inside Upwork's walled garden | **Soulbound NFT reviews** — portable, on-chain, owned by the freelancer |
| Payment delays of 5-14 days after job completion | **Instant settlement** — funds release the moment work is approved |
| Platform can freeze funds or ban accounts arbitrarily | **Programmatic escrow** — funds are secured in PDAs, not controlled by any company |
| Reviews can be deleted or manipulated by the platform | **Immutable reviews** minted as non-transferable tokens on Solana |

### The Core UX Improvement

Traditional freelance platforms insert themselves as a trusted third party and charge for that privilege. ProofWork replaces that trust layer with smart contracts:

1. **Client posts a job** → funds are locked in an on-chain escrow PDA
2. **Freelancer applies and gets accepted** → work begins with payment already guaranteed
3. **Work is submitted and approved** → escrow releases funds instantly to the freelancer's wallet
4. **Client leaves a review** → minted as a Soulbound Token (SBT) that the freelancer carries forever

No waiting periods. No fee deductions. No platform risk.

---

## How to Use the App

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
| Smart Contracts | Anchor Framework (Rust) |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Wallet Integration | Solana Wallet Adapter |
| Soulbound NFTs | Token-2022 (NonTransferable + MetadataPointer) |
| Data Layer | localStorage (demo) |
| Design System | Space Grotesk + Inter, neo-brutalist aesthetic |

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
