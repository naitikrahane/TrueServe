/**
 * src/lib/streaming.js
 * Superfluid G$ streaming helpers for TrueServe APP_TESTING tasks
 *
 * Uses @superfluid-finance/sdk-core for creating / deleting / reading
 * Superfluid constant flow agreements (CFA) on Celo Mainnet.
 */

import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';

// G$ Superfluid wrapper token address on Celo Mainnet
// This is the Super Token version of GoodDollar (G$x)
const G_DOLLAR_SUPER_TOKEN = '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A';

const CELO_MAINNET_CHAIN_ID = 42220;

let _sfFramework = null;

/**
 * Lazily initialise the Superfluid Framework
 * @param {ethers.providers.Provider} provider
 * @returns {Promise<Framework>}
 */
async function getSuperfluidFramework(provider) {
  if (_sfFramework) return _sfFramework;

  _sfFramework = await Framework.create({
    chainId: CELO_MAINNET_CHAIN_ID,
    provider,
  });

  return _sfFramework;
}

/**
 * Convert a monthly G$ amount to per-second flowRate (BigInt string)
 * @param {number} monthlyAmountInGD   e.g. 1500 for 1500 G$/month
 * @returns {string}  flow rate in wei per second as string
 */
function monthlyToFlowRate(monthlyAmountInGD) {
  // 1 month ≈ 30.44 days = 2,629,800 seconds
  const SECONDS_PER_MONTH = BigInt(2629800);
  const amountWei = ethers.utils.parseEther(monthlyAmountInGD.toString()).toBigInt();
  const flowRate = amountWei / SECONDS_PER_MONTH;
  return flowRate.toString();
}

/**
 * Convert a per-second flowRate (wei) to G$ per month for display
 * @param {string|BigInt} flowRatePerSec
 * @returns {number}  G$ per month (human readable)
 */
export function flowRateToMonthly(flowRatePerSec) {
  const SECONDS_PER_MONTH = 2629800;
  const perSecWei = ethers.BigNumber.from(flowRatePerSec.toString());
  const monthlyWei = perSecWei.mul(SECONDS_PER_MONTH);
  return parseFloat(ethers.utils.formatEther(monthlyWei));
}

/**
 * Create a Superfluid G$ stream from the signer to a receiver
 * Typically used when a creator starts an APP_TESTING task for a specific worker.
 *
 * @param {ethers.Signer} signer            Connected wallet signer (the payer/creator)
 * @param {string}        receiverAddress   Worker wallet address
 * @param {number}        monthlyAmount     G$ per month to stream
 * @returns {Promise<ethers.ContractTransaction>}
 */
export async function createStream(signer, receiverAddress, monthlyAmount) {
  try {
    const provider = signer.provider;
    const sf = await getSuperfluidFramework(provider);

    const gdSuperToken = await sf.loadSuperToken(G_DOLLAR_SUPER_TOKEN);

    const flowRate = monthlyToFlowRate(monthlyAmount);

    const createFlowOperation = gdSuperToken.createFlow({
      sender: await signer.getAddress(),
      receiver: receiverAddress,
      flowRate,
    });

    const tx = await createFlowOperation.exec(signer);
    await tx.wait();

    console.log(`Stream created: ${monthlyAmount} G$/month → ${receiverAddress}`);
    return tx;
  } catch (error) {
    console.error('createStream error:', error);
    throw new Error(`Failed to create stream: ${error.message}`);
  }
}

/**
 * Delete an existing Superfluid G$ stream
 * Used when a worker misses their daily review task or the period ends.
 *
 * @param {ethers.Signer} signer            Connected wallet signer (the payer)
 * @param {string}        receiverAddress   Worker wallet address
 * @returns {Promise<ethers.ContractTransaction>}
 */
export async function deleteStream(signer, receiverAddress) {
  try {
    const provider = signer.provider;
    const sf = await getSuperfluidFramework(provider);

    const gdSuperToken = await sf.loadSuperToken(G_DOLLAR_SUPER_TOKEN);

    const deleteFlowOperation = gdSuperToken.deleteFlow({
      sender: await signer.getAddress(),
      receiver: receiverAddress,
    });

    const tx = await deleteFlowOperation.exec(signer);
    await tx.wait();

    console.log(`Stream deleted: sender → ${receiverAddress}`);
    return tx;
  } catch (error) {
    console.error('deleteStream error:', error);
    throw new Error(`Failed to delete stream: ${error.message}`);
  }
}

/**
 * Read the current flow rate between a sender and receiver
 *
 * @param {ethers.providers.Provider} provider
 * @param {string} senderAddress
 * @param {string} receiverAddress
 * @returns {Promise<{ flowRatePerSec: string, monthlyAmount: number, isActive: boolean }>}
 */
export async function getStreamFlowRate(provider, senderAddress, receiverAddress) {
  try {
    const sf = await getSuperfluidFramework(provider);
    const gdSuperToken = await sf.loadSuperToken(G_DOLLAR_SUPER_TOKEN);

    const { flowRate } = await gdSuperToken.getFlow({
      sender: senderAddress,
      receiver: receiverAddress,
      providerOrSigner: provider,
    });

    const flowRateBN = ethers.BigNumber.from(flowRate);
    const isActive = flowRateBN.gt(0);
    const monthlyAmount = isActive ? flowRateToMonthly(flowRate) : 0;

    return {
      flowRatePerSec: flowRate,
      monthlyAmount,
      isActive,
    };
  } catch (error) {
    console.error('getStreamFlowRate error:', error);
    return { flowRatePerSec: '0', monthlyAmount: 0, isActive: false };
  }
}
