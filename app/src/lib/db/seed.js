const WALLETS = {
  client1: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  client2: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  client3: '3Fq8fDiRTxTbWMPCFrnNbUQnEKSkJRCjzqk7bfWnAvBe',
  freelancer1: 'Dk5GRvD5HBJr4mJxoXq6mLVJqFn1adL4HFyGWHevQaKN',
  freelancer2: '2tWC1D2zXrNjHh3HCfGBqLeDBzg7xkLc6ypjE8X7bK4f',
  freelancer3: 'GkVZjFuC8Asb3dH1tPk9SPjBQN4nXMLTkGfWkBNfpump',
}

const SOL = 1_000_000_000

const now = Date.now()
const hour = 3_600_000
const day = 86_400_000

const profiles = {
  [WALLETS.client1]: {
    wallet: WALLETS.client1,
    displayName: 'Marcus Chen',
    bio: 'Building the future of decentralized governance. DAO infrastructure and DeFi protocol architect. Previously at Solana Foundation.',
    skills: ['Rust', 'Anchor', 'TypeScript', 'DeFi', 'Tokenomics'],
    role: 'client',
    updatedAt: now - 10 * day,
  },
  [WALLETS.client2]: {
    wallet: WALLETS.client2,
    displayName: 'Sarah Nakamoto',
    bio: 'DeFi protocol lead and serial Web3 founder. Focused on building composable financial primitives on Solana.',
    skills: ['Product', 'Solidity', 'DeFi', 'Smart Contracts'],
    role: 'client',
    updatedAt: now - 15 * day,
  },
  [WALLETS.client3]: {
    wallet: WALLETS.client3,
    displayName: 'Alex Rivera',
    bio: 'Creative director of an on-chain generative art studio. Building tools for digital artists in the NFT space.',
    skills: ['NFTs', 'Metaplex', 'Creative Direction', 'React'],
    role: 'client',
    updatedAt: now - 8 * day,
  },
  [WALLETS.freelancer1]: {
    wallet: WALLETS.freelancer1,
    displayName: 'Dmitri Volkov',
    bio: 'Rust and Solana developer with 4 years of experience building on-chain programs. Anchor framework specialist. 15+ audited contracts deployed.',
    skills: ['Rust', 'Anchor', 'Solana', 'TypeScript', 'Security'],
    role: 'freelancer',
    updatedAt: now - 20 * day,
  },
  [WALLETS.freelancer2]: {
    wallet: WALLETS.freelancer2,
    displayName: 'Priya Sharma',
    bio: 'Full-stack Web3 engineer. Building decentralized frontends with React, Next.js, and Solana wallet integrations. Open source contributor.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Solana', 'Anchor'],
    role: 'freelancer',
    updatedAt: now - 12 * day,
  },
  [WALLETS.freelancer3]: {
    wallet: WALLETS.freelancer3,
    displayName: 'Kenji Tanaka',
    bio: 'Independent smart contract auditor. Formerly lead security engineer at OtterSec. Specialized in Solana program security and formal verification.',
    skills: ['Security', 'Rust', 'Auditing', 'Formal Verification', 'Anchor'],
    role: 'freelancer',
    updatedAt: now - 25 * day,
  },
}

const jobs = {
  [`${WALLETS.client1}_1001`]: {
    clientWallet: WALLETS.client1,
    jobId: '1001',
    jobAccountPda: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bFAoiT',
    title: 'Smart Contract Audit for DeFi Lending Protocol',
    description: 'We need a comprehensive security audit of our Solana-based lending protocol. The program handles collateralized lending, liquidations, and interest rate calculations across multiple token pools. Scope includes reviewing all Anchor instructions, PDA derivations, access controls, and economic attack vectors. Deliverables: detailed audit report with severity classifications and remediation guidance.',
    tags: ['Security', 'Rust', 'Anchor', 'DeFi'],
    amount: 15 * SOL,
    tokenMint: null,
    status: 'released',
    freelancerWallet: WALLETS.freelancer3,
    txSig: '5UfDuX6cKwE3ZQHxiLJN7V9VYz8FHpK4mQ3TnGLbGkXvRj7Ae2wN1sYKfB9pDtMhEaR',
    createdAt: now - 30 * day,
    updatedAt: now - 5 * day,
  },
  [`${WALLETS.client2}_1002`]: {
    clientWallet: WALLETS.client2,
    jobId: '1002',
    jobAccountPda: '6RGPxBbUJN3Rj7DQE1pMkLRVnbJj9SqLH3MP5WCEgCzv',
    title: 'Build Custom AMM DEX Frontend',
    description: 'Looking for an experienced frontend developer to build the trading interface for our automated market maker on Solana. Must integrate with our existing Anchor program for swaps, liquidity provision, and pool creation. Tech stack: React, TypeScript, Tailwind CSS, Solana wallet adapter. Design mockups provided in Figma.',
    tags: ['React', 'TypeScript', 'Frontend', 'DeFi'],
    amount: 25 * SOL,
    tokenMint: null,
    status: 'inProgress',
    freelancerWallet: WALLETS.freelancer2,
    txSig: '3HqVPx7gKTZh4Rj6bNmWEfLuY9AKvMxJQD2nFwCe4TpS8sRj5UbYKhN7VzXaQf1mDkL',
    createdAt: now - 14 * day,
    updatedAt: now - 2 * day,
  },
  [`${WALLETS.client3}_1003`]: {
    clientWallet: WALLETS.client3,
    jobId: '1003',
    jobAccountPda: '8hYTn1GjCDZKpf6QNbq3JW9hN2VfRXEr5UaBvxgMySzP',
    title: 'NFT Marketplace Smart Contracts',
    description: 'Build a full NFT marketplace program on Solana using Anchor. Features needed: listing, buying, offers, auctions, royalty enforcement via Token-2022, and collection verification through Metaplex. The marketplace should support both legacy Token Program and Token-2022 NFTs. Must include comprehensive test suite.',
    tags: ['Rust', 'Anchor', 'NFTs', 'Metaplex'],
    amount: 30 * SOL,
    tokenMint: null,
    status: 'funded',
    freelancerWallet: null,
    txSig: '2RqUVz6cFgbKJhT4XwAeMnP8sDf5LYrN3HjBvW7kCxE9mQp1aGdY6ZuRSt4eNfJvXhK',
    createdAt: now - 3 * day,
    updatedAt: now - 3 * day,
  },
  [`${WALLETS.client1}_1004`]: {
    clientWallet: WALLETS.client1,
    jobId: '1004',
    jobAccountPda: 'BnTgFJ3VR8APfPh7Kv5eLjMiXSdNBqU4gwYCxQfJz9rk',
    title: 'Solana Token Vesting Program',
    description: 'Develop a token vesting smart contract on Solana with configurable cliff periods, linear vesting schedules, and revocable grants. The program should support multiple token types (SPL and Token-2022) and allow admins to create vesting schedules for team members, advisors, and investors. Include a simple React dashboard for tracking vesting progress.',
    tags: ['Rust', 'Anchor', 'Solana', 'TypeScript'],
    amount: 12 * SOL,
    tokenMint: null,
    status: 'submitted',
    freelancerWallet: WALLETS.freelancer1,
    txSig: '4KmYRc3NhTgXJf7Wp2BvL5qZaQeU6dFsAHjCxMnE8rDk1PbGtVwN9SuYzR7eJhXfQpL',
    createdAt: now - 18 * day,
    updatedAt: now - 1 * day,
  },
  [`${WALLETS.client2}_1005`]: {
    clientWallet: WALLETS.client2,
    jobId: '1005',
    jobAccountPda: 'CZp4FkNEtu6mGQhXVJ7KcRDfL1nbSwAJYq5PxRv3e8Hm',
    title: 'DAO Governance Dashboard UI',
    description: 'Design and implement a governance dashboard for our DAO tooling protocol. Needs to display proposals, voting power, delegation, treasury overview, and member activity. Should integrate with SPL Governance program. Looking for someone with strong React and data visualization skills.',
    tags: ['React', 'Frontend', 'UI/UX Design', 'TypeScript'],
    amount: 8 * SOL,
    tokenMint: null,
    status: 'funded',
    freelancerWallet: null,
    txSig: '5NhYRz8mKfCvJg3TpX6WqBdL2eZaEUf7sDAjHxMnR4kQ1PcGtVwS9AuYzK7eJiXfRpN',
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day,
  },
  [`${WALLETS.client1}_1006`]: {
    clientWallet: WALLETS.client1,
    jobId: '1006',
    jobAccountPda: 'DxR5mAJk8Sn4YqKfZWbE6pPv3hLcTgNjQu9Gwd7eF2Hz',
    title: 'Cross-Chain Bridge Integration (Solana ↔ EVM)',
    description: 'Integrate Wormhole bridge SDK into our existing DeFi application. Users should be able to bridge SOL, USDC, and wrapped ETH between Solana and Ethereum/Arbitrum. Requires building the frontend bridge UI, transaction tracking, and handling edge cases like stuck transfers. Experience with Wormhole SDK and cross-chain messaging required.',
    tags: ['Solana', 'Backend', 'TypeScript', 'Security'],
    amount: 45 * SOL,
    tokenMint: null,
    status: 'funded',
    freelancerWallet: null,
    txSig: '6PjZSt9nLgDwKh4UrY7XqCeM3fAbRVz8sEAjGxNnQ5kR2QdHuWxT0BvYzL8fKjYgSpO',
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day,
  },
  [`${WALLETS.client2}_1007`]: {
    clientWallet: WALLETS.client2,
    jobId: '1007',
    jobAccountPda: 'ExS6nBKl9To5ZrLgAxQfW7qPw4iMdUnRKv0HxeG8j3Iy',
    title: 'Anchor Program for Staking Rewards Distribution',
    description: 'Build a staking rewards program that allows users to stake our SPL token and earn yield. The program should support configurable reward rates, auto-compounding, and emergency withdrawal. Include admin controls for adjusting parameters and pausing the program. Full test coverage with Bankrun required.',
    tags: ['Rust', 'Anchor', 'Smart Contracts', 'DeFi'],
    amount: 20 * SOL,
    tokenMint: null,
    status: 'released',
    freelancerWallet: WALLETS.freelancer1,
    txSig: '7QkATu0oMhEvZi5VsZ8YrDfN4gBcSWa9tFBjHyOpR6lS3ReIvXyU1CwZzM9gLkZhTqP',
    createdAt: now - 40 * day,
    updatedAt: now - 10 * day,
  },
  [`${WALLETS.client3}_1008`]: {
    clientWallet: WALLETS.client3,
    jobId: '1008',
    jobAccountPda: 'FyT7oCLm0Up6AsNhBxRgY8rQx5jNeTvSLw1IyfH9k4Jz',
    title: 'Security Audit for Token Launch',
    description: 'Need an urgent security review of our token launch contracts before mainnet deployment next week. The program handles token minting, initial distribution, and a bonding curve for the launch phase. Looking for someone who can provide a rapid turnaround with a focus on critical vulnerabilities.',
    tags: ['Security', 'Rust', 'Anchor', 'Auditing'],
    amount: 18 * SOL,
    tokenMint: null,
    status: 'disputed',
    freelancerWallet: WALLETS.freelancer3,
    txSig: '8RlBUv1pNiFwAj6WtA9ZsDgO5hCdTXb0uGCjIzPqS7mT4SfJwYzV2DxAaN0hMlAiUrQ',
    createdAt: now - 22 * day,
    updatedAt: now - 3 * day,
  },
  [`${WALLETS.client1}_1009`]: {
    clientWallet: WALLETS.client1,
    jobId: '1009',
    jobAccountPda: 'GzU8pDMn1Vq7BtOiCySgZ9sRy6kOfWuTMx2JzgI0l5KA',
    title: 'React Frontend for Wallet Analytics Tool',
    description: 'Build a clean, performant React frontend for a Solana wallet analytics tool. Features: portfolio overview with token balances, transaction history with filtering, PnL tracking, and DeFi position summaries. Must connect to Helius RPC for enhanced transaction data. Responsive design with dark mode.',
    tags: ['React', 'TypeScript', 'Frontend', 'UI/UX Design'],
    amount: 10 * SOL,
    tokenMint: null,
    status: 'released',
    freelancerWallet: WALLETS.freelancer2,
    txSig: '9SmCVw2qOjGxBk7XuB0AtEhP6iDeUYc1vHDjJAQrT8nU5TgKxZAW3EyBbO1iNmBjVsR',
    createdAt: now - 35 * day,
    updatedAt: now - 8 * day,
  },
  [`${WALLETS.client3}_1010`]: {
    clientWallet: WALLETS.client3,
    jobId: '1010',
    jobAccountPda: 'HAv9qENn2Wr8CuPjDzThA0tSz7lQgXvUNy3KahJ1m6LB',
    title: 'Metaplex NFT Minting dApp with Candy Machine',
    description: 'Create a minting dApp for our upcoming generative art collection (5,000 pieces). Should integrate with Candy Machine v3, support allowlist phases, and include a live mint counter. The frontend needs to handle wallet connection, mint transactions, and display recently minted NFTs with reveal animation.',
    tags: ['React', 'NFTs', 'Metaplex', 'Frontend'],
    amount: 14 * SOL,
    tokenMint: null,
    status: 'funded',
    freelancerWallet: null,
    txSig: '0TnDWx3rPkHyCl8YvC1BuFiQ7jEfVZd2wIEkKBRsU9oV6UhLyABX4FzCcP2jOnCkWtS',
    createdAt: now - 6 * hour,
    updatedAt: now - 6 * hour,
  },
}

const applications = {
  app_001: {
    clientWallet: WALLETS.client3,
    jobId: '1003',
    freelancerWallet: WALLETS.freelancer1,
    coverLetter: 'I have extensive experience building NFT marketplace programs on Solana. My recent work includes a custom marketplace with auction support and royalty enforcement. I can deliver a production-ready Anchor program with full test coverage within 3 weeks.',
    id: 'app_001',
    status: 'pending',
    createdAt: now - 2 * day,
  },
  app_002: {
    clientWallet: WALLETS.client3,
    jobId: '1003',
    freelancerWallet: WALLETS.freelancer2,
    coverLetter: 'Full-stack Web3 engineer with deep Metaplex and Token-2022 experience. I recently shipped a marketplace that handles both legacy and Token-2022 NFTs. Happy to share references from previous clients.',
    id: 'app_002',
    status: 'pending',
    createdAt: now - 2.5 * day,
  },
  app_003: {
    clientWallet: WALLETS.client2,
    jobId: '1005',
    freelancerWallet: WALLETS.freelancer2,
    coverLetter: 'I specialize in React data dashboards and have built governance UIs for two DAOs on Solana. Comfortable with SPL Governance integration and charting libraries like Recharts. Can start immediately.',
    id: 'app_003',
    status: 'pending',
    createdAt: now - 1 * day,
  },
  app_004: {
    clientWallet: WALLETS.client1,
    jobId: '1006',
    freelancerWallet: WALLETS.freelancer3,
    coverLetter: 'Security-focused engineer with Wormhole integration experience. I audited a bridge protocol last quarter and am familiar with the edge cases around stuck transfers and message verification. Can architect a robust solution.',
    id: 'app_004',
    status: 'pending',
    createdAt: now - 12 * hour,
  },
  app_005: {
    clientWallet: WALLETS.client3,
    jobId: '1010',
    freelancerWallet: WALLETS.freelancer1,
    coverLetter: 'Built three Candy Machine v3 minting dApps in the last 6 months. Experienced with allowlist phases, hidden reveals, and optimizing for high-traffic mints. Portfolio available upon request.',
    id: 'app_005',
    status: 'pending',
    createdAt: now - 4 * hour,
  },
  app_006: {
    clientWallet: WALLETS.client1,
    jobId: '1006',
    freelancerWallet: WALLETS.freelancer1,
    coverLetter: 'Rust/TypeScript developer with cross-chain development experience. I have worked with Wormhole SDK for token bridging and can handle the full integration including frontend UI and error recovery flows.',
    id: 'app_006',
    status: 'pending',
    createdAt: now - 8 * hour,
  },
}

const reviews = {
  rev_001: {
    jobId: '1001',
    freelancerWallet: WALLETS.freelancer3,
    clientWallet: WALLETS.client1,
    rating: 5,
    comment: 'Exceptional audit work. Kenji identified two critical vulnerabilities in our liquidation logic that could have resulted in protocol insolvency. Thorough report with clear remediation steps. Highly recommend for any security-critical work.',
    mintAddress: '3xNFT1auditmintaddresskenji001placeholder',
    txSig: 'rev1txsig001',
    id: 'rev_001',
    createdAt: now - 5 * day,
  },
  rev_002: {
    jobId: '1007',
    freelancerWallet: WALLETS.freelancer1,
    clientWallet: WALLETS.client2,
    rating: 4,
    comment: 'Dmitri delivered a solid staking program with clean code and good test coverage. Minor delays on the auto-compounding feature but the final product exceeded expectations. Would hire again.',
    mintAddress: '4yNFT2stakingmintaddressdmitri002placeholder',
    txSig: 'rev2txsig002',
    id: 'rev_002',
    createdAt: now - 10 * day,
  },
  rev_003: {
    jobId: '1009',
    freelancerWallet: WALLETS.freelancer2,
    clientWallet: WALLETS.client1,
    rating: 5,
    comment: 'Priya built an incredibly polished analytics dashboard. The UI is responsive, fast, and intuitive. Great communication throughout the project and delivered ahead of schedule. 10/10 would work with again.',
    mintAddress: '5zNFT3analyticsmintaddresspriya003placeholder',
    txSig: 'rev3txsig003',
    id: 'rev_003',
    createdAt: now - 8 * day,
  },
}

const disputes = {
  [`${WALLETS.client3}_1008`]: {
    clientWallet: WALLETS.client3,
    jobId: '1008',
    reason: 'Freelancer submitted incomplete audit report missing critical sections on access control and economic attack vectors. Deadline was missed by 4 days without communication.',
    createdAt: now - 3 * day,
  },
}

export function seedDemoData() {
  if (localStorage.getItem('_demo_seeded')) return false

  localStorage.setItem('profiles', JSON.stringify(profiles))
  localStorage.setItem('jobs', JSON.stringify(jobs))
  localStorage.setItem('applications', JSON.stringify(applications))
  localStorage.setItem('reviews', JSON.stringify(reviews))
  localStorage.setItem('disputes', JSON.stringify(disputes))
  localStorage.setItem('_demo_seeded', '1')

  return true
}

export function clearDemoData() {
  localStorage.removeItem('profiles')
  localStorage.removeItem('jobs')
  localStorage.removeItem('applications')
  localStorage.removeItem('reviews')
  localStorage.removeItem('disputes')
  localStorage.removeItem('_demo_seeded')
}
