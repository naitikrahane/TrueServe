import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PLATFORM_WALLET = "0x033D986709c6c794C42a1259A8baeb6693de9444";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Deploying from: ${wallet.address}`);

  const artifactPath = path.join(__dirname, "artifacts", "contracts", "TrueServe.sol", "TrueServe.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  console.log("Deploying contract...");
  const contract = await factory.deploy(PLATFORM_WALLET);
  await contract.deployTransaction.wait();

  console.log(`Contract deployed at: ${contract.address}`);

  console.log(`Transferring ownership to ${PLATFORM_WALLET}...`);
  const tx = await contract.transferOwnership(PLATFORM_WALLET);
  await tx.wait();
  console.log(`Ownership transferred successfully!`);

  const abiOutputPath = path.join(__dirname, "src", "lib", "TrueServeABI.json");
  fs.writeFileSync(abiOutputPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`ABI saved to ${abiOutputPath}`);

  console.log(`\nNext steps:`);
  console.log(`1. Update VITE_CONTRACT_ADDRESS in .env with ${contract.address}`);
  console.log(`2. Run: npx hardhat verify --network celo ${contract.address} "${PLATFORM_WALLET}"`);
}

main().catch(console.error);
