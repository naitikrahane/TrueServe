const { ethers, run, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

// ─── Configuration ──────────────────────────────────────────────────────────
// IMPORTANT: Replace with your actual platform fee wallet before deploying
const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x0000000000000000000000000000000000000001";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("─────────────────────────────────────────────────────────");
  console.log("  TrueServe — Deployment Script");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`  Network  : ${network.name} (chainId: ${network.chainId})`);
  console.log(`  Deployer : ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`  Balance  : ${ethers.utils.formatEther(balance)} CELO`);
  console.log("─────────────────────────────────────────────────────────\n");

  // ─── Deploy ────────────────────────────────────────────────────────────────
  console.log("🚀 Deploying TrueServe contract...");
  console.log(`   Platform Wallet: ${PLATFORM_WALLET}\n`);

  const TrueServe = await ethers.getContractFactory("TrueServe");
  const trueServe = await TrueServe.deploy(PLATFORM_WALLET);
  await trueServe.deployed();

  console.log(`✅ TrueServe deployed!`);
  console.log(`   Contract Address : ${trueServe.address}`);
  console.log(`   Tx Hash          : ${trueServe.deployTransaction.hash}`);

  const explorerBase = network.chainId === 42220
    ? "https://celoscan.io"
    : "https://alfajores.celoscan.io";

  console.log(`   CeloScan         : ${explorerBase}/address/${trueServe.address}\n`);

  // ─── Save ABI ──────────────────────────────────────────────────────────────
  console.log("📁 Saving ABI to src/lib/TrueServeABI.json...");

  const artifact = await artifacts.readArtifact("TrueServe");
  const abiOutputPath = path.join(__dirname, "../src/lib/TrueServeABI.json");

  fs.writeFileSync(
    abiOutputPath,
    JSON.stringify(artifact.abi, null, 2),
    "utf-8"
  );
  console.log(`   ✅ ABI saved to ${abiOutputPath}\n`);

  // ─── Update .env Hint ─────────────────────────────────────────────────────
  console.log("📝 Add this to your .env file:");
  console.log(`   VITE_CONTRACT_ADDRESS=${trueServe.address}\n`);

  // ─── Verify on CeloScan ───────────────────────────────────────────────────
  console.log("⏳ Waiting 30 seconds for CeloScan to index the contract...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    console.log("🔍 Verifying contract on CeloScan...");
    await run("verify:verify", {
      address: trueServe.address,
      constructorArguments: [PLATFORM_WALLET],
    });
    console.log(`✅ Contract verified on CeloScan!\n`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified.\n");
    } else {
      console.warn("⚠️  Verification failed (retry manually):");
      console.warn(`   npx hardhat verify --config hardhat.config.cjs --network ${network.name} ${trueServe.address} "${PLATFORM_WALLET}"`);
      console.warn(`   Error: ${error.message}\n`);
    }
  }

  console.log("─────────────────────────────────────────────────────────");
  console.log("  🎉 Deployment Complete!");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`  Contract  : ${trueServe.address}`);
  console.log(`  Explorer  : ${explorerBase}/address/${trueServe.address}`);
  console.log("─────────────────────────────────────────────────────────\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
