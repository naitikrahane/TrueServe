# TrueServe — The Sovereign Engine for Human Insights

**TrueServe** is a decentralized, Sybil-resistant Web3 research platform built to guarantee 100% human participation. It eliminates bots, AI spam, and Sybil attacks from surveys, data collection, and community feedback by leveraging token-gated access, zero-knowledge proofs, and instant Celo micropayments.

> **⚠️ Project Status: Early Alpha**
> The core functionality, UI/UX, and smart contracts are built and almost live! We are currently running final tests and making minor/minute adjustments before the official mainnet launch.

## 🌟 Why TrueServe?

In the current Web3 and Web2 landscape, data is often polluted by automated bots. Researchers and creators lose money rewarding fake participants. TrueServe solves this by ensuring that **every single data point comes from a verified, unique human being**.

- **Creators & Researchers** can launch fully sovereign surveys, token-gate them, set GoodDollar (G$) rewards in escrow, and confidently collect pristine data.
- **Earners & Community Members** can monetize their attention and insights, building an on-chain trust score while earning instant micro-rewards for their time.

## 💰 GoodDollar (G$) Integration

TrueServe utilizes **GoodDollar (G$)**, a reserve-backed protocol that distributes a basic income token, as the backbone of its economic model.

- **Sybil Resistance via G$ Verification:** To participate and earn, workers must authenticate through GoodDollar's Identity verification. This acts as a robust, decentralized "Proof of Personhood," ensuring one wallet equals one real human.
- **Escrow & Instant Micropayments:** Creators deposit G$ into the TrueServe smart contract when creating a task. Upon successful completion and approval, the smart contract instantly releases the G$ directly to the earner's Celo wallet. 
- **Gas-efficient on Celo:** By leveraging the Celo blockchain, G$ transactions cost fractions of a cent, making high-volume, low-value micropayments viable for surveys.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Premium, Glassmorphism Design System)
- **Blockchain**: Celo / Solidity
- **Web3 Integrations**: Reown AppKit (WalletConnect), Wagmi, viem
- **Storage**: IPFS via Pinata (for decentralized storage of survey metadata and submission proofs)

## 🚀 Getting Started (Local Development)

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

## 📜 Smart Contracts

The contracts are located in the `contracts/` directory. You can use Hardhat to compile and deploy them to the Celo network.

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network celo
```

## 🤝 Contributing

Contributions are welcome! As we finalize our early alpha, please open an issue or submit a pull request if you have ideas for improvements, UX tweaks, or feature requests.

## 📄 License

This project is open-source and available under the MIT License.
