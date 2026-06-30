import pkg from "hardhat";
const { ethers, run, artifacts } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuration ──────────────────────────────────────────────────────────
// IMPORTANT: Replace with your actual platform fee wallet before deploying
const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x033D986709c6c794C42a1259A8baeb6693de9444";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("─────────────────────────────────────────────────────────");
  console.log("  TrueServe — Deployment Script");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`  Network  : ${network.name} (chainId: ${network.chainId})`);
  console.log(`  Deployer : ${deployer.address}`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`  Balance  : ${ethers.formatEther(balance)} CELO`);
  console.log("─────────────────────────────────────────────────────────\n");

  // ─── Deploy ────────────────────────────────────────────────────────────────
  console.log("🚀 Deploying TrueServe contract...");
  console.log(`   Platform Wallet: ${PLATFORM_WALLET}\n`);

  const TrueServe = await ethers.getContractFactory("TrueServe");
  const trueServe = await TrueServe.deploy(PLATFORM_WALLET);
  await trueServe.waitForDeployment();

  const contractAddress = await trueServe.getAddress();
  const deployTx = trueServe.deploymentTransaction();

  console.log(`✅ TrueServe deployed!`);
  console.log(`   Contract Address : ${contractAddress}`);
  console.log(`   Tx Hash          : ${deployTx?.hash}`);

  console.log(`\n👑 Transferring ownership to ${PLATFORM_WALLET}...`);
  const transferTx = await trueServe.transferOwnership(PLATFORM_WALLET);
  await transferTx.wait();
  console.log(`   ✅ Ownership transferred successfully!`);

  const explorerBase = network.chainId === 42220n
    ? "https://celoscan.io"
    : "https://alfajores.celoscan.io";

  console.log(`   CeloScan         : ${explorerBase}/address/${contractAddress}\n`);

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
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}\n`);

  // ─── Verify on CeloScan ───────────────────────────────────────────────────
  console.log("⏳ Waiting 30 seconds for CeloScan to index the contract...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    console.log("🔍 Verifying contract on CeloScan...");
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [PLATFORM_WALLET],
    });
    console.log(`✅ Contract verified on CeloScan!\n`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified.\n");
    } else {
      console.warn("⚠️  Verification failed (retry manually):");
      console.warn(`   npx hardhat verify --network ${network.name} ${contractAddress} "${PLATFORM_WALLET}"`);
      console.warn(`   Error: ${error.message}\n`);
    }
  }

  console.log("─────────────────────────────────────────────────────────");
  console.log("  🎉 Deployment Complete!");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`  Contract  : ${contractAddress}`);
  console.log(`  Explorer  : ${explorerBase}/address/${contractAddress}`);
  console.log("─────────────────────────────────────────────────────────\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
