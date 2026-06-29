/**
 * src/lib/goodDollar.js
 * GoodDollar identity helpers + TrueServe contract interactions
 */

import { ethers } from 'ethers';
import { GoodCollectiveSDK } from '@gooddollar/goodcollective-sdk';
import { ClaimSDK } from '@gooddollar/web3sdk-v2';
import TrueServeABI from './TrueServeABI.json';
import { fetchFromIPFS } from './ipfs';

// ─── Network Config ────────────────────────────────────────────────────────
export const CHAIN_ID = 42220; // Celo Mainnet
export const RPC_URL = 'https://forno.celo.org';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// ─── Contract Addresses ───────────────────────────────────────────────────
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const G_DOLLAR_ADDRESS = '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A';
const IDENTITY_CONTRACT_ADDRESS = '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42';
const CELOSCAN_BASE = 'https://celoscan.io';

// ─── Minimal ABIs ─────────────────────────────────────────────────────────
const IdentityABI = [
  'function isWhitelisted(address account) view returns (bool)',
];

const ERC20ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

// ─── Singletons ───────────────────────────────────────────────────────────
export const identityContract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, IdentityABI, provider);
export const gdTokenReadOnly = new ethers.Contract(G_DOLLAR_ADDRESS, ERC20ABI, provider);

// ─── GoodCollective SDK (lazy init) ───────────────────────────────────────
export let goodCollective = null;
try {
  goodCollective = new GoodCollectiveSDK(CHAIN_ID, provider, { network: 'celo' });
} catch (e) {
  console.warn('GoodCollectiveSDK init warning:', e.message);
  try {
    goodCollective = new GoodCollectiveSDK(CHAIN_ID, provider);
  } catch (err) {
    console.warn('GoodCollectiveSDK completely failed to initialize. Using mock fallback.');
  }
}

// ─── Helper: get TrueServe contract instance ─────────────────────────────
function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) throw new Error('VITE_CONTRACT_ADDRESS not set. Deploy the contract first.');
  return new ethers.Contract(CONTRACT_ADDRESS, TrueServeABI, signerOrProvider);
}

// ─── Helper: format wei → G$ display string ──────────────────────────────
export function formatGD(weiAmount) {
  try {
    const n = parseFloat(ethers.utils.formatEther(weiAmount.toString()));
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch {
    return '0';
  }
}

// ─── Helper: map taskType number → display string ─────────────────────────
export function taskTypeLabel(taskType) {
  const types = { 0: 'Survey', 1: 'Beta Test', 2: 'Streaming' };
  return types[taskType] ?? 'Task';
}

// ─── Helper: map taskType → theme colors ──────────────────────────────────
export function taskTypeTheme(taskType) {
  const themes = {
    0: { typeBg: '#EEF2FF', typeColor: '#4F46E5', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
    1: { typeBg: '#ECFEFF', typeColor: '#0891B2', iconBg: '#ECFEFF', iconColor: '#0891B2' },
    2: { typeBg: '#ECFDF5', typeColor: '#059669', iconBg: '#ECFDF5', iconColor: '#059669' },
  };
  return themes[taskType] ?? themes[0];
}

// ─── Helper: map submission state number → display string (v2) ───────────
// 0=PENDING 1=APPROVED 2=REJECTED 3=DISPUTED 4=AUTO-APPROVED
export function submissionStatusLabel(status) {
  const labels = {
    0: 'Pending Review',
    1: 'Approved',
    2: 'Rejected',
    3: 'Disputed',
    4: 'Auto-Approved',
  };
  return labels[status] ?? 'Unknown';
}

// ─── Helper: task state label (v2) ────────────────────────────────────────
// 0=OPEN 1=PAUSED 2=COMPLETED 3=CANCELLED 4=EXPIRED
export function taskStateLabel(state) {
  const labels = { 0: 'Open', 1: 'Paused', 2: 'Completed', 3: 'Cancelled', 4: 'Expired' };
  return labels[state] ?? 'Unknown';
}

// ─── Helper: open slot count ──────────────────────────────────────────────
export function getOpenSlots(task) {
  const max     = typeof task.maxSlots    === 'object' ? task.maxSlots.toNumber()     : task.maxSlots;
  const filled  = typeof task.filledSlots === 'object' ? task.filledSlots.toNumber()  : task.filledSlots;
  const pending = typeof task.pendingSlots=== 'object' ? task.pendingSlots.toNumber() : task.pendingSlots;
  return Math.max(0, max - filled - pending);
}

// ─── CeloScan URL helpers ─────────────────────────────────────────────────
export function txUrl(hash) {
  return `${CELOSCAN_BASE}/tx/${hash}`;
}

// ─── EXISTING FUNCTIONS (unchanged) ──────────────────────────────────────

export async function verifyIdentity(address) {
  // Temporary MVP bypass: always return true so users aren't blocked from testing
  console.log('Simulating successful identity verification for MVP.');
  return true;
}

/**
 * Start the GoodDollar Face Verification flow
 */
export async function startFaceVerification(provider) {
  try {
    const sdk = new ClaimSDK(provider, 'production-celo');
    const callbackUrl = window.location.href;
    const link = await sdk.generateFVLink('TrueServe User', callbackUrl, false, CHAIN_ID);
    window.location.href = link;
  } catch (error) {
    console.error('Error generating FV link:', error);
    throw new Error('Could not start Face Verification. Please ensure you are connected to Celo Mainnet.');
  }
}

/**
 * Connect user wallet via window.ethereum (MetaMask, etc)
 */
export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await web3Provider.getNetwork();
    if (network.chainId !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(CHAIN_ID) }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ethers.utils.hexValue(CHAIN_ID),
              chainName: 'Celo Mainnet',
              rpcUrls: [RPC_URL],
              nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
              blockExplorerUrls: ['https://celoscan.io/'],
            }],
          });
        } else {
          throw switchError;
        }
      }
    }

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    return { provider: web3Provider, signer, address };
  } else {
    throw new Error('Please install a Web3 wallet (like MetaMask or Valora).');
  }
}

/**
 * Create a new Direct Payments Pool (GoodCollective legacy — kept for compatibility)
 */
export async function createCampaignPool(signer, title, rewardPerUser, totalUsers) {
  if (!goodCollective) {
    console.warn('GoodCollective SDK not initialized. Returning mock pool data.');
    return { address: '0xMockPoolAddressOnSepolia' + Date.now().toString().slice(-6) };
  }

  const settings = {
    manager: await signer.getAddress(),
    membersValidator: ethers.constants.AddressZero,
    rewardPerEvent: [ethers.utils.parseEther(rewardPerUser.toString())],
    validEvents: [1],
    rewardToken: G_DOLLAR_ADDRESS,
    uniqunessValidator: ethers.constants.AddressZero,
  };

  const limits = {
    maxMemberPerDay: totalUsers,
    maxMemberPerMonth: totalUsers,
    maxTotalPerMonth: totalUsers * rewardPerUser,
  };

  const ipfsMetadata = 'ipfs://QmDummyMetadataHashForNow';
  const projectId = `Campaign-${Date.now()}`;

  const pool = await goodCollective.createPool(signer, projectId, ipfsMetadata, settings, limits);
  return pool;
}

// ─── CONTRACT FUNCTIONS (v2) ──────────────────────────────────────────────

/**
 * Get the G$ token balance of an address (in G$, not wei)
 */
export async function getGDollarBalance(address) {
  try {
    const balance = await gdTokenReadOnly.balanceOf(address);
    return formatGD(balance);
  } catch (error) {
    console.error('getGDollarBalance error:', error);
    return '0';
  }
}

/**
 * Enrich a raw on-chain Task struct into a UI-ready object.
 * Maps v2 fields: maxSlots, filledSlots, pendingSlots, state, autoApproveEnabled, isPrivate
 */
async function enrichTask(task) {
  const theme       = taskTypeTheme(task.taskType);
  const rewardGD    = formatGD(task.rewardPerUser);
  const maxSlots    = task.maxSlots.toNumber();
  const filled      = task.filledSlots.toNumber();
  const pending     = task.pendingSlots.toNumber();
  const openSlots   = Math.max(0, maxSlots - filled - pending);

  let metadata = null;
  if (task.metadataIPFS) {
    metadata = await fetchFromIPFS(task.metadataIPFS).catch(() => null);
  }

  return {
    id:                  task.id.toNumber(),
    creator:             task.creator,
    title:               task.title,
    metadataIPFS:        task.metadataIPFS,
    metadata,
    rewardPerUser:       task.rewardPerUser,
    rewardGD,
    totalBudget:         task.totalBudget,
    totalGD:             formatGD(task.totalBudget),
    remainingBudget:     task.remainingBudget,
    remainingGD:         formatGD(task.remainingBudget),
    taskType:            task.taskType,
    type:                taskTypeLabel(task.taskType),
    state:               task.state,
    stateLabel:          taskStateLabel(task.state),
    active:              task.state === 0,
    deadline:            task.deadline.toNumber(),
    maxSlots,
    filledSlots:         filled,
    pendingSlots:        pending,
    openSlots,
    createdAt:           task.createdAt.toNumber(),
    autoApproveEnabled:  task.autoApproveEnabled,
    minTrustScore:       task.minTrustScore.toNumber(),
    isPrivate:           task.isPrivate,
    // UI shorthands
    reward:              `${rewardGD} G$`,
    slots:               `${filled} / ${maxSlots} filled · ${openSlots} open`,
    duration:            metadata?.duration || '~10 min',
    ...theme,
  };
}

/**
 * Fetch all OPEN tasks from contract + enrich with IPFS metadata
 */
export async function getActiveTasks() {
  try {
    const contract = getContract(provider);
    const rawTasks = await contract.getActiveTasks();
    return Promise.all(rawTasks.map(enrichTask));
  } catch (error) {
    console.error('getActiveTasks error:', error);
    return [];
  }
}

/**
 * Fetch a single task by ID from the contract + enrich with IPFS metadata
 */
export async function getTask(taskId) {
  try {
    const contract = getContract(provider);
    const raw = await contract.getTask(taskId);
    return enrichTask(raw);
  } catch (error) {
    console.error('getTask error:', error);
    return null;
  }
}


/**
 * Fetch all tasks created by a specific address
 */
export async function getCreatorTasks(address) {
  try {
    const contract = getContract(provider);
    const rawTasks = await contract.getCreatorTasks(address);
    return Promise.all(rawTasks.map(enrichTask));
  } catch (error) {
    console.error('getCreatorTasks error:', error);
    return [];
  }
}

/**
 * Enrich a raw Submission struct into a UI-ready object
 */
function enrichSubmission(sub) {
  return {
    id:               sub.id.toNumber(),
    taskId:           sub.taskId.toNumber(),
    worker:           sub.worker,
    workerShort:      `${sub.worker.slice(0, 6)}...${sub.worker.slice(-4)}`,
    proofIPFS:        sub.proofIPFS,
    state:            sub.state,
    statusLabel:      submissionStatusLabel(sub.state),
    submittedAt:      sub.submittedAt.toNumber(),
    submittedAtDate:  new Date(sub.submittedAt.toNumber() * 1000).toLocaleString(),
    reviewedAt:       sub.reviewedAt.toNumber(),
    rejectionReason:  sub.rejectionReason,
    workerDisputed:   sub.workerDisputed,
    isPending:        sub.state === 0,
    isApproved:       sub.state === 1,
    isRejected:       sub.state === 2,
    isDisputed:       sub.state === 3,
    // Auto-approve ready = 48hr passed since submission AND state is PENDING
    canAutoApprove:   sub.state === 0 && Date.now() / 1000 > sub.submittedAt.toNumber() + 48 * 3600,
    // Dispute window = within 24hr of rejection
    canDispute:       sub.state === 2 && !sub.workerDisputed &&
                      Date.now() / 1000 < sub.reviewedAt.toNumber() + 24 * 3600,
  };
}

/**
 * Get all submissions for a task (all states) — for creator review panel
 */
export async function getTaskSubmissions(taskId) {
  try {
    const contract = getContract(provider);
    const rawSubs  = await contract.getTaskSubmissions(taskId);

    const enriched = await Promise.all(rawSubs.map(async (sub) => {
      const base = enrichSubmission(sub);
      if (sub.proofIPFS) {
        base.proofData = await fetchFromIPFS(sub.proofIPFS).catch(() => null);
      }
      return base;
    }));
    return enriched;
  } catch (error) {
    console.error('getTaskSubmissions error:', error);
    return [];
  }
}

/**
 * Get only PENDING submissions for a task (creator review queue)
 */
export async function getPendingSubmissions(taskId) {
  try {
    const contract = getContract(provider);
    const rawSubs  = await contract.getPendingSubmissions(taskId);
    return Promise.all(rawSubs.map(async (sub) => {
      const base = enrichSubmission(sub);
      if (sub.proofIPFS) {
        base.proofData = await fetchFromIPFS(sub.proofIPFS).catch(() => null);
      }
      return base;
    }));
  } catch (error) {
    console.error('getPendingSubmissions error:', error);
    return [];
  }
}

/**
 * Get all submissions made by a worker (task history view)
 */
export async function getWorkerSubmissions(address) {
  try {
    const contract = getContract(provider);
    const rawSubs  = await contract.getWorkerSubmissions(address);
    return rawSubs.map(enrichSubmission);
  } catch (error) {
    console.error('getWorkerSubmissions error:', error);
    return [];
  }
}

/**
 * Get real-time task stats: filled / pending / openSlots / remainingBudget / state
 */
export async function getTaskStats(taskId) {
  try {
    const contract = getContract(provider);
    const [filled, pending, openSlots, remainingBudgetWei, state] = await contract.getTaskStats(taskId);
    return {
      filled:           filled.toNumber(),
      pending:          pending.toNumber(),
      openSlots:        openSlots.toNumber(),
      remainingBudget:  formatGD(remainingBudgetWei),
      state:            state,
      stateLabel:       taskStateLabel(state),
    };
  } catch (error) {
    console.error('getTaskStats error:', error);
    return { filled: 0, pending: 0, openSlots: 0, remainingBudget: '0', state: 0, stateLabel: 'Unknown' };
  }
}

/**
 * Get on-chain reputation / stats for a worker
 */
export async function getWorkerStats(address) {
  try {
    const contract = getContract(provider);
    const [totalSubmissions, approvedCount, rejectedCount, trustScore, totalEarnedWei, isBanned] =
      await contract.getWorkerStats(address);

    return {
      totalSubmissions: totalSubmissions.toNumber(),
      approvedCount:    approvedCount.toNumber(),
      rejectedCount:    rejectedCount.toNumber(),
      trustScore:       trustScore.toNumber(),
      totalEarned:      formatGD(totalEarnedWei),
      isBanned,
    };
  } catch (error) {
    console.error('getWorkerStats error:', error);
    return { totalSubmissions: 0, approvedCount: 0, rejectedCount: 0, trustScore: 100, totalEarned: '0', isBanned: false };
  }
}

/**
 * Get creator stats: total spent, total tasks, filled/pending slots
 */
export async function getCreatorStats(address) {
  try {
    const contract = getContract(provider);
    const [totalSpentWei, totalTasks, totalFilledSlots, totalPendingSlots] =
      await contract.getCreatorStats(address);
    return {
      totalSpent:       formatGD(totalSpentWei),
      totalTasks:       totalTasks.toNumber(),
      totalFilledSlots: totalFilledSlots.toNumber(),
      totalPendingSlots: totalPendingSlots.toNumber(),
    };
  } catch (error) {
    console.error('getCreatorStats error:', error);
    return { totalSpent: '0', totalTasks: 0, totalFilledSlots: 0, totalPendingSlots: 0 };
  }
}

/**
 * Get platform-wide stats
 */
export async function getPlatformStats() {
  try {
    const contract = getContract(provider);
    const stats = await contract.getPlatformStats();
    return {
      totalTasksCreated:    stats.totalTasksCreated.toNumber(),
      totalPaidOut:         formatGD(stats.totalPaidOutWei),
      totalUBICollected:    formatGD(stats.totalUBICollectedWei),
      totalSubmissions:     stats.totalSubmissions.toNumber(),
      totalApproved:        stats.totalApproved.toNumber(),
    };
  } catch (error) {
    console.error('getPlatformStats error:', error);
    return {};
  }
}

// ─── CREATOR WRITE FUNCTIONS ──────────────────────────────────────────────

/**
 * Create a new task on-chain (v2 signature).
 * 1) Approve G$ spend
 * 2) Call contract.createTask()
 *
 * @param {ethers.Signer} signer
 * @param {object} params
 * @param {function} onProgress  Callback(step: string, msg: string)
 * @returns {Promise<{ taskId: number, txHash: string }>}
 */
export async function createTask(
  signer,
  {
    title,
    metadataIPFS,
    rewardPerUser,    // G$ number (NOT wei)
    maxSlots,
    taskType = 0,
    deadline,         // Unix timestamp seconds
    autoApproveEnabled = true,
    minTrustScore = 0,
    isPrivate = false,
  },
  onProgress = () => {}
) {
  const rewardWei   = ethers.utils.parseEther(rewardPerUser.toString());
  const totalBudget = rewardWei.mul(maxSlots);
  const signerAddress = await signer.getAddress();

  // Step 1 — Approve G$ spend
  onProgress('approve', 'Approving G$ spend in your wallet...');
  const gdToken = new ethers.Contract(G_DOLLAR_ADDRESS, ERC20ABI, signer);
  const currentAllowance = await gdToken.allowance(signerAddress, CONTRACT_ADDRESS);
  if (currentAllowance.lt(totalBudget)) {
    const approveTx = await gdToken.approve(CONTRACT_ADDRESS, totalBudget);
    onProgress('approve', 'Waiting for approval confirmation...');
    await approveTx.wait();
  }

  // Step 2 — Create task on-chain
  onProgress('deploy', 'Deploying campaign on Celo...');
  const contract = getContract(signer);
  const tx = await contract.createTask(
    title, metadataIPFS, rewardWei, maxSlots, taskType,
    deadline, autoApproveEnabled, minTrustScore, isPrivate
  );
  onProgress('deploy', 'Waiting for confirmation...');
  const receipt = await tx.wait();

  // Extract taskId from TaskCreated event
  const event   = receipt.events?.find(e => e.event === 'TaskCreated');
  const taskId  = event?.args?.taskId?.toNumber() ?? null;

  return { taskId, txHash: receipt.transactionHash };
}

/**
 * Invite workers to a private task (single or batch)
 */
export async function inviteWorkers(signer, taskId, workers) {
  const contract = getContract(signer);
  const isArray = Array.isArray(workers);
  const tx = isArray
    ? await contract.inviteWorkers(taskId, workers)
    : await contract.inviteWorker(taskId, workers);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Pause a task (creator only)
 */
export async function pauseTask(signer, taskId) {
  const contract = getContract(signer);
  const tx = await contract.pauseTask(taskId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Resume a paused task (creator only)
 */
export async function resumeTask(signer, taskId) {
  const contract = getContract(signer);
  const tx = await contract.resumeTask(taskId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Extend task deadline (creator only, only future dates)
 */
export async function extendDeadline(signer, taskId, newDeadlineTimestamp) {
  const contract = getContract(signer);
  const tx = await contract.extendDeadline(taskId, newDeadlineTimestamp);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Add more budget (extra slots) to a task (creator only)
 */
export async function addBudget(signer, taskId, extraSlots) {
  const contract = getContract(signer);

  // First approve extra G$
  const task = await contract.getTask(taskId);
  const extraBudget = task.rewardPerUser.mul(extraSlots);
  const signerAddress = await signer.getAddress();
  const gdToken = new ethers.Contract(G_DOLLAR_ADDRESS, ERC20ABI, signer);
  const allowance = await gdToken.allowance(signerAddress, CONTRACT_ADDRESS);
  if (allowance.lt(extraBudget)) {
    const approveTx = await gdToken.approve(CONTRACT_ADDRESS, extraBudget);
    await approveTx.wait();
  }

  const tx = await contract.addBudget(taskId, extraSlots);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Toggle auto-approve on/off for a task
 */
export async function setAutoApprove(signer, taskId, enabled) {
  const contract = getContract(signer);
  const tx = await contract.setAutoApprove(taskId, enabled);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Cancel a task (only if 0 filled slots). Refunds remainingBudget.
 */
export async function cancelTask(signer, taskId) {
  const contract = getContract(signer);
  const tx = await contract.cancelTask(taskId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Approve a single submission — releases 98% G$ to worker, 2% to UBI pool.
 * Slot is permanently filled.
 */
export async function approveSubmission(signer, taskId, subId) {
  const contract = getContract(signer);
  const tx = await contract.approveSubmission(taskId, subId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Reject a submission — slot reopens, G$ stays in escrow.
 * @param {string} reason  Human-readable rejection reason shown to worker
 */
export async function rejectSubmission(signer, taskId, subId, reason = 'Quality standards not met') {
  const contract = getContract(signer);
  const tx = await contract.rejectSubmission(taskId, subId, reason);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Bulk approve multiple submissions in one tx (max 50)
 */
export async function bulkApprove(signer, taskId, subIds) {
  const contract = getContract(signer);
  const tx = await contract.bulkApprove(taskId, subIds);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Bulk reject multiple submissions in one tx (max 50)
 */
export async function bulkReject(signer, taskId, subIds, reasons) {
  const contract = getContract(signer);
  const tx = await contract.bulkReject(taskId, subIds, reasons);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

// ─── WORKER WRITE FUNCTIONS ───────────────────────────────────────────────

/**
 * Submit work proof for a task.
 * 1) Upload proof data to IPFS
 * 2) Call contract.submitWork()
 *
 * @param {ethers.Signer} signer
 * @param {number} taskId
 * @param {object} proofData  Any JSON object (form answers, screenshot URL, etc.)
 * @returns {Promise<{ txHash: string, ipfsHash: string }>}
 */
export async function submitWork(signer, taskId, proofData) {
  // If proofData is already an ipfs:// string, use directly
  let ipfsHash;
  if (typeof proofData === 'string' && proofData.startsWith('ipfs://')) {
    ipfsHash = proofData;
  } else {
    const { uploadToIPFS } = await import('./ipfs.js');
    const payload = typeof proofData === 'object'
      ? { ...proofData, submittedAt: new Date().toISOString() }
      : { note: proofData, submittedAt: new Date().toISOString() };
    ipfsHash = await uploadToIPFS(payload);
  }

  const contract = getContract(signer);
  const tx = await contract.submitWork(taskId, ipfsHash);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash, ipfsHash };
}

/**
 * Worker disputes a rejection (must be within 24hr of rejection)
 */
export async function disputeRejection(signer, subId, reason) {
  const contract = getContract(signer);
  const tx = await contract.disputeRejection(subId, reason);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

// ─── AUTO / PUBLIC FUNCTIONS ──────────────────────────────────────────────

/**
 * Trigger auto-approve for a pending submission after 48hr
 * Anyone can call this (decentralized fallback).
 */
export async function autoApprove(signer, taskId, subId) {
  const contract = getContract(signer);
  const tx = await contract.autoApprove(taskId, subId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

/**
 * Expire a task after its deadline — refunds unfilled slot budgets to creator.
 * Anyone can call this.
 */
export async function expireTask(signer, taskId) {
  const contract = getContract(signer);
  const tx = await contract.expireTask(taskId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

// ─── G$ TRANSFER HISTORY ──────────────────────────────────────────────────

/**
 * Get G$ Transfer events for an address (recent transactions)
 */
export async function getGDollarTransfers(address, blockRange = 4900) {
  try {
    const gdToken = new ethers.Contract(G_DOLLAR_ADDRESS, ERC20ABI, provider);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - blockRange);

    const [sent, received] = await Promise.all([
      gdToken.queryFilter(gdToken.filters.Transfer(address, null), fromBlock),
      gdToken.queryFilter(gdToken.filters.Transfer(null, address), fromBlock),
    ]);

    return [...sent, ...received]
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, 20)
      .map(ev => ({
        type:        ev.args.from.toLowerCase() === address.toLowerCase() ? 'Send' : 'Receive',
        positive:    ev.args.to.toLowerCase() === address.toLowerCase(),
        amount:      parseFloat(ethers.utils.formatEther(ev.args.value)).toFixed(2),
        txHash:      ev.transactionHash,
        blockNumber: ev.blockNumber,
        title:       ev.args.from.toLowerCase() === address.toLowerCase()
          ? `Sent G$ to ${ev.args.to.slice(0, 6)}...${ev.args.to.slice(-4)}`
          : `Received G$ from ${ev.args.from.slice(0, 6)}...${ev.args.from.slice(-4)}`,
      }));
  } catch (error) {
    console.error('getGDollarTransfers error:', error);
    return [];
  }
}

// ─── BACKWARD COMPAT SHIMS ────────────────────────────────────────────────
// Keep these so existing TaskDashboard.jsx imports don't break

/** @deprecated Use approveSubmission(signer, taskId, subId) instead */
export async function approveWork(signer, taskId, workerOrSubId) {
  return approveSubmission(signer, taskId, workerOrSubId);
}

/** @deprecated Use rejectSubmission(signer, taskId, subId, reason) instead */
export async function rejectWork(signer, taskId, workerOrSubId) {
  return rejectSubmission(signer, taskId, workerOrSubId, 'Rejected by creator');
}
