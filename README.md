# TrueServe

**TrueServe** is a sovereign engine for human insights. It eliminates bots and Sybil attacks from Web3 research by allowing creators to connect directly with their community using token-gated surveys, zero-knowledge proofs, and instant Celo micropayments.

## Features

- **Sybil-Resistant**: Uses GoodDollar verification and optionally zero-knowledge proofs to ensure only unique humans participate.
- **Instant Micropayments**: Powered by the Celo blockchain, workers get paid instantly upon task approval.
- **Creator Dashboard**: Easily create surveys, token-gate them, and review submissions.
- **Worker Dashboard**: Find available tasks, earn G$ (GoodDollar), and build up your trust score.
- **Decentralized Storage**: Survey data and metadata are pinned on IPFS.

## Tech Stack

- **Frontend**: React (Vite), JavaScript
- **Styling**: Vanilla CSS with modern UI/UX design
- **Blockchain**: Celo / Solidity
- **Web3 Integrations**: Reown AppKit (WalletConnect), Wagmi, viem
- **Storage**: IPFS via Pinata

## Prerequisites

- Node.js (v18+)
- A modern Web3 wallet (e.g., MetaMask, Backpack)
- Some Celo or testnet Celo for gas

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/naitikrahane/TrueServe.git
   cd TrueServe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your keys (you can leave out the private key for local UI development):
   ```bash
   cp .env.example .env
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Smart Contracts

The contracts are located in the `contracts/` directory. You can use Hardhat to compile and deploy them to the Celo network.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network celo
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have ideas for improvements.

## License

This project is open-source and available under the MIT License.
