// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title TrueServe v2 — Full-featured bot-proof micro-task escrow on Celo
/// @notice Every participant is gated by GoodDollar Face Verification Identity.
///         Creators have full control: approve, reject (slot reopens), bulk ops,
///         pause/resume, deadline extension, private whitelists, reputation system.
contract TrueServe is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ─── Constants ───────────────────────────────────────────────────────────
    IERC20 public constant G_DOLLAR =
        IERC20(0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A);

    address public constant IDENTITY_CONTRACT =
        0xC361A6E67822a0EDc17D899227dd9FC50BD62F42;

    uint256 public constant PLATFORM_FEE_BPS = 200;     // 2%
    uint256 public constant BPS_DENOMINATOR  = 10000;
    uint256 public constant AUTO_APPROVE_DELAY = 48 hours;
    uint256 public constant DISPUTE_WINDOW    = 24 hours;
    uint256 public constant MAX_BULK_OPS      = 50;

    // ─── Enums ───────────────────────────────────────────────────────────────
    enum TaskState {
        OPEN,        // Posted, accepting submissions
        PAUSED,      // Creator paused, no new submissions
        COMPLETED,   // All slots filled & approved
        CANCELLED,   // Creator cancelled before any filled slots
        EXPIRED      // Deadline passed, refund triggered
    }

    enum TaskType {
        SURVEY,      // One-time submission, lump sum payment
        APP_TESTING, // Streaming payment via Superfluid
        ENGAGEMENT   // Social / follow task
    }

    enum SubmissionState {
        PENDING,   // Submitted, awaiting creator review
        APPROVED,  // Paid out to worker
        REJECTED,  // Creator rejected — slot reopened
        DISPUTED,  // Worker challenged rejection
        EXPIRED    // Auto-approved after 48hr
    }

    // ─── Structs ─────────────────────────────────────────────────────────────
    struct Task {
        uint256 id;
        address creator;
        string  title;
        string  metadataIPFS;      // Questions / instructions on IPFS
        uint256 rewardPerUser;     // G$ paid per approved submission
        uint256 totalBudget;       // Total G$ locked in escrow
        uint256 remainingBudget;   // Unspent G$ still in escrow
        uint8   taskType;          // TaskType enum value
        uint8   state;             // TaskState enum value
        uint256 deadline;
        uint256 maxSlots;          // Max workers who can be paid
        uint256 filledSlots;       // Approved & paid count
        uint256 pendingSlots;      // Submitted but not yet reviewed
        uint256 createdAt;
        // Creator control flags
        bool    autoApproveEnabled; // True → auto-approve after 48hr
        uint256 minTrustScore;      // Minimum reputation (0-100)
        bool    isPrivate;          // True → only whitelisted workers
    }

    struct Submission {
        uint256 id;
        uint256 taskId;
        address worker;
        string  proofIPFS;
        uint8   state;             // SubmissionState enum value
        uint256 submittedAt;
        uint256 reviewedAt;
        string  rejectionReason;
        bool    workerDisputed;
    }

    struct WorkerReputation {
        uint256 totalSubmissions;
        uint256 approvedCount;
        uint256 rejectedCount;
        uint256 disputesWon;
        uint256 trustScore;        // 0–100
        uint256 totalEarnedWei;
        uint256 consecutiveRejections;
        bool    isBanned;
    }

    // ─── Platform Stats ───────────────────────────────────────────────────────
    struct PlatformStats {
        uint256 totalTasksCreated;
        uint256 totalPaidOutWei;
        uint256 totalUBICollectedWei;
        uint256 totalSubmissions;
        uint256 totalApproved;
    }

    // ─── State ───────────────────────────────────────────────────────────────
    address public platformWallet;
    uint256 public taskCounter;
    uint256 public submissionCounter;
    uint256 public collectedFees;

    PlatformStats public platformStats;

    mapping(uint256 => Task)       private tasks;
    mapping(uint256 => Submission) private submissions;

    // taskId → submissionId[]
    mapping(uint256 => uint256[]) private taskSubmissionIds;
    // taskId → worker → submissionId (0 = none)
    mapping(uint256 => mapping(address => uint256)) private taskWorkerSubmission;
    // taskId → whitelisted workers
    mapping(uint256 => mapping(address => bool)) private whitelisted;
    mapping(uint256 => address[]) private whitelistAddresses;

    // worker → submissionId[]
    mapping(address => uint256[]) private workerSubmissionIds;
    // creator → taskId[]
    mapping(address => uint256[]) private creatorTaskIds;

    // Reputation
    mapping(address => WorkerReputation) private reputation;

    // Admin: banned list
    mapping(address => bool) private adminBanned;

    // ─── Events ──────────────────────────────────────────────────────────────
    event TaskCreated(
        uint256 indexed taskId, address indexed creator,
        string title, uint256 rewardPerUser, uint256 totalBudget,
        uint8 taskType, uint256 deadline, uint256 maxSlots,
        bool isPrivate, bool autoApproveEnabled
    );
    event TaskPaused(uint256 indexed taskId);
    event TaskResumed(uint256 indexed taskId);
    event TaskCancelled(uint256 indexed taskId, uint256 refundAmount);
    event TaskCompleted(uint256 indexed taskId);
    event TaskExpired(uint256 indexed taskId, uint256 refundAmount);
    event DeadlineExtended(uint256 indexed taskId, uint256 newDeadline);
    event BudgetAdded(uint256 indexed taskId, uint256 extraAmount, uint256 newMaxSlots);
    event AutoApproveToggled(uint256 indexed taskId, bool enabled);
    event WorkerInvited(uint256 indexed taskId, address indexed worker);

    event WorkSubmitted(
        uint256 indexed taskId, uint256 indexed submissionId,
        address indexed worker, string proofIPFS, uint256 submittedAt
    );
    event WorkApproved(
        uint256 indexed taskId, uint256 indexed submissionId,
        address indexed worker, uint256 workerAmount, uint256 feeAmount
    );
    event WorkRejected(
        uint256 indexed taskId, uint256 indexed submissionId,
        address indexed worker, string reason
    );
    event WorkAutoApproved(
        uint256 indexed taskId, uint256 indexed submissionId,
        address indexed worker, uint256 workerAmount, uint256 feeAmount
    );
    event RejectionDisputed(
        uint256 indexed submissionId, address indexed worker, string reason
    );
    event DisputeResolved(
        uint256 indexed submissionId, bool workerWon,
        uint256 workerAmount, uint256 feeAmount
    );
    event WorkerBanned(address indexed worker);
    event WorkerUnbanned(address indexed worker);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────────────────
    error NotWhitelisted();
    error NotTaskCreator();
    error TaskDoesNotExist();
    error TaskNotOpen();
    error TaskNotPaused();
    error TaskNotActive();
    error AlreadySubmitted();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error MaxSlotsReached();
    error NotPending();
    error NotRejected();
    error AutoApproveNotReady();
    error AutoApproveDisabled();
    error HasFilledSlots();
    error InsufficientBudget();
    error ZeroAddress();
    error InvalidDeadline();
    error TrustScoreTooLow();
    error WorkerIsBanned();
    error NotPrivateTask();
    error NotWhitelistedForTask();
    error WorkerIsCreator();
    error DisputeWindowClosed();
    error AlreadyDisputed();
    error BulkTooLarge();
    error ArrayLengthMismatch();
    error SlotAlreadyFilled();
    error SubmissionDoesNotExist();

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyVerifiedHuman() {
        if (adminBanned[msg.sender]) revert WorkerIsBanned();
        if (!_isWhitelisted(msg.sender)) revert NotWhitelisted();
        _;
    }

    modifier onlyCreator(uint256 taskId) {
        if (tasks[taskId].creator == address(0)) revert TaskDoesNotExist();
        if (tasks[taskId].creator != msg.sender) revert NotTaskCreator();
        _;
    }

    modifier taskExists(uint256 taskId) {
        if (tasks[taskId].creator == address(0)) revert TaskDoesNotExist();
        _;
    }

    modifier submissionExists(uint256 subId) {
        if (submissions[subId].worker == address(0)) revert SubmissionDoesNotExist();
        _;
    }

    modifier taskIsOpen(uint256 taskId) {
        if (tasks[taskId].state != uint8(TaskState.OPEN)) revert TaskNotOpen();
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _platformWallet) Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert ZeroAddress();
        platformWallet = _platformWallet;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────
    function _isWhitelisted(address account) internal view returns (bool) {
        (bool success, bytes memory data) = IDENTITY_CONTRACT.staticcall(
            abi.encodeWithSignature("isWhitelisted(address)", account)
        );
        if (!success || data.length == 0) return false;
        return abi.decode(data, (bool));
    }

    /// @dev Core payout: 98% to worker, 2% to UBI pool. Updates reputation.
    function _processPayout(
        uint256 taskId,
        uint256 subId,
        address worker,
        bool isAutoApprove
    ) internal returns (uint256 workerAmount, uint256 feeAmount) {
        Task storage task = tasks[taskId];
        Submission storage sub = submissions[subId];

        feeAmount   = (task.rewardPerUser * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        workerAmount = task.rewardPerUser - feeAmount;

        task.remainingBudget -= task.rewardPerUser;
        task.filledSlots++;
        task.pendingSlots--;
        collectedFees += feeAmount;

        sub.state      = uint8(isAutoApprove ? SubmissionState.EXPIRED : SubmissionState.APPROVED);
        sub.reviewedAt = block.timestamp;

        // Reputation
        _updateReputation(worker, true, workerAmount);

        // Platform stats
        platformStats.totalPaidOutWei      += workerAmount;
        platformStats.totalUBICollectedWei += feeAmount;
        platformStats.totalApproved++;

        G_DOLLAR.safeTransfer(worker, workerAmount);
        G_DOLLAR.safeTransfer(platformWallet, feeAmount);

        // Check if task is fully completed
        if (task.filledSlots >= task.maxSlots && task.pendingSlots == 0) {
            task.state = uint8(TaskState.COMPLETED);
            emit TaskCompleted(taskId);
        }
    }

    function _updateReputation(address worker, bool approved, uint256 earnedWei) internal {
        WorkerReputation storage rep = reputation[worker];
        rep.totalSubmissions++;
        if (approved) {
            rep.approvedCount++;
            rep.consecutiveRejections = 0;
            rep.totalEarnedWei += earnedWei;
        } else {
            rep.rejectedCount++;
            rep.consecutiveRejections++;
        }
        // Trust score = (approvedCount / totalSubmissions) * 100
        rep.trustScore = rep.totalSubmissions == 0
            ? 100
            : (rep.approvedCount * 100) / rep.totalSubmissions;

        // Auto-ban after 5 consecutive rejections
        if (rep.consecutiveRejections >= 5) {
            rep.isBanned = true;
            adminBanned[worker] = true;
            emit WorkerBanned(worker);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  CREATOR FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Create a task and lock G$ in escrow.
    ///         totalBudget must equal rewardPerUser × maxSlots.
    function createTask(
        string calldata title,
        string calldata metadataIPFS,
        uint256 rewardPerUser,
        uint256 maxSlots,
        uint8   taskType,
        uint256 deadline,
        bool    autoApproveEnabled,
        uint256 minTrustScore,
        bool    isPrivate
    ) external onlyVerifiedHuman nonReentrant returns (uint256 taskId) {
        if (bytes(title).length == 0) revert TaskNotOpen();
        if (rewardPerUser == 0)       revert InsufficientBudget();
        if (maxSlots == 0)            revert MaxSlotsReached();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (taskType > 2)             revert TaskNotOpen();
        if (minTrustScore > 100)      revert TrustScoreTooLow();

        uint256 totalBudget = rewardPerUser * maxSlots;
        G_DOLLAR.safeTransferFrom(msg.sender, address(this), totalBudget);

        taskId = ++taskCounter;
        tasks[taskId] = Task({
            id:                 taskId,
            creator:            msg.sender,
            title:              title,
            metadataIPFS:       metadataIPFS,
            rewardPerUser:      rewardPerUser,
            totalBudget:        totalBudget,
            remainingBudget:    totalBudget,
            taskType:           taskType,
            state:              uint8(TaskState.OPEN),
            deadline:           deadline,
            maxSlots:           maxSlots,
            filledSlots:        0,
            pendingSlots:       0,
            createdAt:          block.timestamp,
            autoApproveEnabled: autoApproveEnabled,
            minTrustScore:      minTrustScore,
            isPrivate:          isPrivate
        });

        creatorTaskIds[msg.sender].push(taskId);
        platformStats.totalTasksCreated++;

        emit TaskCreated(
            taskId, msg.sender, title, rewardPerUser, totalBudget,
            taskType, deadline, maxSlots, isPrivate, autoApproveEnabled
        );
    }

    /// @notice Whitelist a specific worker for a private task.
    function inviteWorker(uint256 taskId, address worker)
        external onlyCreator(taskId)
    {
        if (!tasks[taskId].isPrivate) revert NotPrivateTask();
        if (!whitelisted[taskId][worker]) {
            whitelisted[taskId][worker] = true;
            whitelistAddresses[taskId].push(worker);
            emit WorkerInvited(taskId, worker);
        }
    }

    /// @notice Batch invite workers to a private task.
    function inviteWorkers(uint256 taskId, address[] calldata workers)
        external onlyCreator(taskId)
    {
        if (!tasks[taskId].isPrivate) revert NotPrivateTask();
        if (workers.length > MAX_BULK_OPS) revert BulkTooLarge();
        for (uint256 i = 0; i < workers.length; i++) {
            if (!whitelisted[taskId][workers[i]]) {
                whitelisted[taskId][workers[i]] = true;
                whitelistAddresses[taskId].push(workers[i]);
                emit WorkerInvited(taskId, workers[i]);
            }
        }
    }

    /// @notice Pause a task — no new submissions accepted.
    function pauseTask(uint256 taskId) external onlyCreator(taskId) taskIsOpen(taskId) {
        tasks[taskId].state = uint8(TaskState.PAUSED);
        emit TaskPaused(taskId);
    }

    /// @notice Resume a paused task.
    function resumeTask(uint256 taskId) external onlyCreator(taskId) {
        if (tasks[taskId].state != uint8(TaskState.PAUSED)) revert TaskNotPaused();
        tasks[taskId].state = uint8(TaskState.OPEN);
        emit TaskResumed(taskId);
    }

    /// @notice Extend the task deadline (only future dates allowed).
    function extendDeadline(uint256 taskId, uint256 newDeadline)
        external onlyCreator(taskId)
    {
        if (newDeadline <= tasks[taskId].deadline) revert InvalidDeadline();
        if (newDeadline <= block.timestamp)        revert InvalidDeadline();
        tasks[taskId].deadline = newDeadline;
        emit DeadlineExtended(taskId, newDeadline);
    }

    /// @notice Add more G$ budget to an open task, increasing maxSlots.
    function addBudget(uint256 taskId, uint256 extraSlots)
        external onlyCreator(taskId) nonReentrant
    {
        Task storage task = tasks[taskId];
        if (task.state == uint8(TaskState.COMPLETED) ||
            task.state == uint8(TaskState.CANCELLED)  ||
            task.state == uint8(TaskState.EXPIRED)) revert TaskNotOpen();
        if (extraSlots == 0) revert MaxSlotsReached();

        uint256 extraBudget = task.rewardPerUser * extraSlots;
        G_DOLLAR.safeTransferFrom(msg.sender, address(this), extraBudget);

        task.totalBudget     += extraBudget;
        task.remainingBudget += extraBudget;
        task.maxSlots        += extraSlots;

        // If task was COMPLETED due to slots, reopen it
        if (task.state == uint8(TaskState.COMPLETED)) {
            task.state = uint8(TaskState.OPEN);
        }

        emit BudgetAdded(taskId, extraBudget, task.maxSlots);
    }

    /// @notice Toggle auto-approve (48hr silence → auto paid).
    function setAutoApprove(uint256 taskId, bool enabled)
        external onlyCreator(taskId)
    {
        tasks[taskId].autoApproveEnabled = enabled;
        emit AutoApproveToggled(taskId, enabled);
    }

    /// @notice Cancel a task. Only allowed if zero filled (approved) slots.
    ///         Pending submissions are voided; remaining budget refunded.
    function cancelTask(uint256 taskId)
        external onlyCreator(taskId) nonReentrant
    {
        Task storage task = tasks[taskId];
        if (task.filledSlots > 0) revert HasFilledSlots();
        if (task.state == uint8(TaskState.CANCELLED) ||
            task.state == uint8(TaskState.EXPIRED)) revert TaskNotOpen();

        uint256 refund = task.remainingBudget;
        task.remainingBudget = 0;
        task.state = uint8(TaskState.CANCELLED);

        G_DOLLAR.safeTransfer(msg.sender, refund);
        emit TaskCancelled(taskId, refund);
    }

    /// @notice Approve a single submission and release 98% G$ to worker.
    function approveSubmission(uint256 taskId, uint256 subId)
        external taskExists(taskId) onlyCreator(taskId) submissionExists(subId) nonReentrant
    {
        Submission storage sub = submissions[subId];
        if (sub.taskId != taskId)                         revert TaskDoesNotExist();
        if (sub.state != uint8(SubmissionState.PENDING) &&
            sub.state != uint8(SubmissionState.DISPUTED)) revert NotPending();

        (uint256 workerAmount, uint256 feeAmount) = _processPayout(taskId, subId, sub.worker, false);
        emit WorkApproved(taskId, subId, sub.worker, workerAmount, feeAmount);
    }

    /// @notice Reject a submission — slot reopens for another worker.
    function rejectSubmission(uint256 taskId, uint256 subId, string calldata reason)
        external taskExists(taskId) onlyCreator(taskId) submissionExists(subId)
    {
        Task storage task = tasks[taskId];
        Submission storage sub = submissions[subId];
        if (sub.taskId != taskId)                      revert TaskDoesNotExist();
        if (sub.state != uint8(SubmissionState.PENDING)) revert NotPending();

        sub.state           = uint8(SubmissionState.REJECTED);
        sub.reviewedAt      = block.timestamp;
        sub.rejectionReason = reason;

        // ─── Key logic: slot reopens ──────────────────────────────────────
        task.pendingSlots--;
        // G$ stays in escrow — next worker can take the slot

        // If task was COMPLETED (all slots pending → approved), reopen
        if (task.state == uint8(TaskState.COMPLETED)) {
            task.state = uint8(TaskState.OPEN);
        }

        _updateReputation(sub.worker, false, 0);
        emit WorkRejected(taskId, subId, sub.worker, reason);
    }

    /// @notice Bulk approve multiple submissions in a single tx.
    function bulkApprove(uint256 taskId, uint256[] calldata subIds)
        external taskExists(taskId) onlyCreator(taskId) nonReentrant
    {
        if (subIds.length > MAX_BULK_OPS) revert BulkTooLarge();
        for (uint256 i = 0; i < subIds.length; i++) {
            Submission storage sub = submissions[subIds[i]];
            if (sub.worker == address(0)) continue;
            if (sub.taskId != taskId)    continue;
            if (sub.state != uint8(SubmissionState.PENDING) &&
                sub.state != uint8(SubmissionState.DISPUTED)) continue;

            (uint256 wa, uint256 fa) = _processPayout(taskId, subIds[i], sub.worker, false);
            emit WorkApproved(taskId, subIds[i], sub.worker, wa, fa);
        }
    }

    /// @notice Bulk reject multiple submissions in a single tx.
    function bulkReject(
        uint256 taskId,
        uint256[] calldata subIds,
        string[] calldata reasons
    ) external taskExists(taskId) onlyCreator(taskId) {
        if (subIds.length > MAX_BULK_OPS)         revert BulkTooLarge();
        if (subIds.length != reasons.length)      revert ArrayLengthMismatch();

        Task storage task = tasks[taskId];
        for (uint256 i = 0; i < subIds.length; i++) {
            Submission storage sub = submissions[subIds[i]];
            if (sub.worker == address(0)) continue;
            if (sub.taskId != taskId)    continue;
            if (sub.state != uint8(SubmissionState.PENDING)) continue;

            sub.state           = uint8(SubmissionState.REJECTED);
            sub.reviewedAt      = block.timestamp;
            sub.rejectionReason = reasons[i];
            task.pendingSlots--;
            _updateReputation(sub.worker, false, 0);
            emit WorkRejected(taskId, subIds[i], sub.worker, reasons[i]);
        }

        if (task.state == uint8(TaskState.COMPLETED)) {
            task.state = uint8(TaskState.OPEN);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  WORKER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Submit proof of work for a task.
    ///         One submission per worker per task.
    ///         On reject, worker CANNOT resubmit to same task.
    function submitWork(
        uint256 taskId,
        string calldata proofIPFS
    ) external onlyVerifiedHuman taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        if (task.state != uint8(TaskState.OPEN))      revert TaskNotOpen();
        if (block.timestamp > task.deadline)          revert DeadlinePassed();
        if (msg.sender == task.creator)               revert WorkerIsCreator();

        // Check trust score
        WorkerReputation storage rep = reputation[msg.sender];
        if (rep.totalSubmissions > 0 &&
            rep.trustScore < task.minTrustScore)      revert TrustScoreTooLow();

        // Private task: check whitelist
        if (task.isPrivate && !whitelisted[taskId][msg.sender]) {
            revert NotWhitelistedForTask();
        }

        // One submission per worker per task
        if (taskWorkerSubmission[taskId][msg.sender] != 0) revert AlreadySubmitted();

        // Check slots available (open slots = maxSlots - filledSlots - pendingSlots)
        uint256 openSlots = task.maxSlots - task.filledSlots - task.pendingSlots;
        if (openSlots == 0) revert MaxSlotsReached();

        uint256 subId = ++submissionCounter;
        submissions[subId] = Submission({
            id:              subId,
            taskId:          taskId,
            worker:          msg.sender,
            proofIPFS:       proofIPFS,
            state:           uint8(SubmissionState.PENDING),
            submittedAt:     block.timestamp,
            reviewedAt:      0,
            rejectionReason: "",
            workerDisputed:  false
        });

        taskWorkerSubmission[taskId][msg.sender] = subId;
        taskSubmissionIds[taskId].push(subId);
        workerSubmissionIds[msg.sender].push(subId);

        task.pendingSlots++;
        platformStats.totalSubmissions++;

        // If no more open slots, close to new submissions
        openSlots = task.maxSlots - task.filledSlots - task.pendingSlots;
        if (openSlots == 0 && task.pendingSlots > 0) {
            // Task stays OPEN until approved count == maxSlots
        }

        emit WorkSubmitted(taskId, subId, msg.sender, proofIPFS, block.timestamp);
    }

    /// @notice Worker challenges a rejection within 24hr window.
    function disputeRejection(
        uint256 subId,
        string calldata reason
    ) external submissionExists(subId) {
        Submission storage sub = submissions[subId];
        if (sub.worker != msg.sender)                  revert NotTaskCreator();
        if (sub.state != uint8(SubmissionState.REJECTED)) revert NotRejected();
        if (sub.workerDisputed)                        revert AlreadyDisputed();
        if (block.timestamp > sub.reviewedAt + DISPUTE_WINDOW) revert DisputeWindowClosed();

        sub.state         = uint8(SubmissionState.DISPUTED);
        sub.workerDisputed = true;
        emit RejectionDisputed(subId, msg.sender, reason);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  AUTO / PUBLIC FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Auto-approve a pending submission 48hr after submission.
    ///         Anyone can call this (decentralised fallback).
    function autoApprove(uint256 taskId, uint256 subId)
        external taskExists(taskId) submissionExists(subId) nonReentrant
    {
        Task storage task = tasks[taskId];
        if (!task.autoApproveEnabled)                       revert AutoApproveDisabled();
        Submission storage sub = submissions[subId];
        if (sub.taskId != taskId)                           revert TaskDoesNotExist();
        if (sub.state != uint8(SubmissionState.PENDING))    revert NotPending();
        if (block.timestamp < sub.submittedAt + AUTO_APPROVE_DELAY) revert AutoApproveNotReady();

        (uint256 wa, uint256 fa) = _processPayout(taskId, subId, sub.worker, true);
        emit WorkAutoApproved(taskId, subId, sub.worker, wa, fa);
    }

    /// @notice Refund unspent budget for slots not filled after deadline.
    ///         Anyone can trigger this after the deadline has passed.
    function expireTask(uint256 taskId) external taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        if (block.timestamp <= task.deadline)   revert DeadlineNotPassed();
        if (task.state == uint8(TaskState.CANCELLED) ||
            task.state == uint8(TaskState.EXPIRED))  revert TaskNotOpen();

        // Calculate refundable: budget minus what's reserved for pending slots
        uint256 reservedForPending = task.pendingSlots * task.rewardPerUser;
        uint256 refund = task.remainingBudget > reservedForPending
            ? task.remainingBudget - reservedForPending
            : 0;

        task.state = uint8(TaskState.EXPIRED);

        if (refund > 0) {
            task.remainingBudget -= refund;
            G_DOLLAR.safeTransfer(task.creator, refund);
        }

        emit TaskExpired(taskId, refund);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  ADMIN FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Admin resolves a disputed submission.
    function resolveDispute(
        uint256 taskId,
        uint256 subId,
        bool workerWins
    ) external onlyOwner submissionExists(subId) nonReentrant {
        Submission storage sub = submissions[subId];
        if (sub.taskId != taskId)                           revert TaskDoesNotExist();
        if (sub.state != uint8(SubmissionState.DISPUTED))   revert NotPending();

        if (workerWins) {
            (uint256 wa, uint256 fa) = _processPayout(taskId, subId, sub.worker, false);
            // Bonus trust score for winning dispute
            reputation[sub.worker].disputesWon++;
            reputation[sub.worker].trustScore = _calculateTrustScore(sub.worker);
            emit DisputeResolved(subId, true, wa, fa);
        } else {
            // Confirm rejection
            sub.state = uint8(SubmissionState.REJECTED);
            _updateReputation(sub.worker, false, 0);
            // Slot stays closed (worker already took the slot)
            emit DisputeResolved(subId, false, 0, 0);
        }
    }

    function _calculateTrustScore(address worker) internal view returns (uint256) {
        WorkerReputation storage rep = reputation[worker];
        if (rep.totalSubmissions == 0) return 100;
        uint256 base = (rep.approvedCount * 100) / rep.totalSubmissions;
        uint256 bonus = rep.disputesWon * 5;
        return base + bonus > 100 ? 100 : base + bonus;
    }

    function banWorker(address worker) external onlyOwner {
        adminBanned[worker] = true;
        reputation[worker].isBanned = true;
        emit WorkerBanned(worker);
    }

    function unbanWorker(address worker) external onlyOwner {
        adminBanned[worker] = false;
        reputation[worker].isBanned = false;
        reputation[worker].consecutiveRejections = 0;
        emit WorkerUnbanned(worker);
    }

    function setPlatformWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert ZeroAddress();
        platformWallet = _newWallet;
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = collectedFees;
        collectedFees = 0;
        G_DOLLAR.safeTransfer(platformWallet, amount);
        emit FeesWithdrawn(platformWallet, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    function getTask(uint256 taskId) external view taskExists(taskId) returns (Task memory) {
        return tasks[taskId];
    }

    function getAllTasks() external view returns (Task[] memory result) {
        result = new Task[](taskCounter);
        for (uint256 i = 1; i <= taskCounter; i++) {
            result[i - 1] = tasks[i];
        }
    }

    function getActiveTasks() external view returns (Task[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].state == uint8(TaskState.OPEN)) count++;
        }
        Task[] memory result = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].state == uint8(TaskState.OPEN)) result[idx++] = tasks[i];
        }
        return result;
    }

    function getTasksByType(uint8 taskType) external view returns (Task[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].taskType == taskType && tasks[i].state == uint8(TaskState.OPEN)) count++;
        }
        Task[] memory result = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].taskType == taskType && tasks[i].state == uint8(TaskState.OPEN)) {
                result[idx++] = tasks[i];
            }
        }
        return result;
    }

    function getCreatorTasks(address creator) external view returns (Task[] memory) {
        uint256[] memory ids = creatorTaskIds[creator];
        Task[] memory result = new Task[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tasks[ids[i]];
        }
        return result;
    }

    function getSubmission(uint256 subId) external view submissionExists(subId) returns (Submission memory) {
        return submissions[subId];
    }

    function getTaskSubmissions(uint256 taskId) external view taskExists(taskId) returns (Submission[] memory) {
        uint256[] memory ids = taskSubmissionIds[taskId];
        Submission[] memory result = new Submission[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = submissions[ids[i]];
        }
        return result;
    }

    function getPendingSubmissions(uint256 taskId) external view taskExists(taskId) returns (Submission[] memory) {
        uint256[] memory ids = taskSubmissionIds[taskId];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (submissions[ids[i]].state == uint8(SubmissionState.PENDING)) count++;
        }
        Submission[] memory result = new Submission[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (submissions[ids[i]].state == uint8(SubmissionState.PENDING)) {
                result[idx++] = submissions[ids[i]];
            }
        }
        return result;
    }

    function getWorkerSubmissions(address worker) external view returns (Submission[] memory) {
        uint256[] memory ids = workerSubmissionIds[worker];
        Submission[] memory result = new Submission[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = submissions[ids[i]];
        }
        return result;
    }

    function hasWorkerSubmitted(uint256 taskId, address worker) external view returns (bool) {
        return taskWorkerSubmission[taskId][worker] != 0;
    }

    function getWorkerSubmissionId(uint256 taskId, address worker) external view returns (uint256) {
        return taskWorkerSubmission[taskId][worker];
    }

    function getTaskWhitelist(uint256 taskId) external view taskExists(taskId) returns (address[] memory) {
        return whitelistAddresses[taskId];
    }

    // ─── Stats Views ──────────────────────────────────────────────────────────

    function getTaskStats(uint256 taskId) external view taskExists(taskId) returns (
        uint256 filled,
        uint256 pending,
        uint256 openSlots,
        uint256 remainingBudgetWei,
        uint8   state
    ) {
        Task storage task = tasks[taskId];
        filled             = task.filledSlots;
        pending            = task.pendingSlots;
        openSlots          = task.maxSlots - task.filledSlots - task.pendingSlots;
        remainingBudgetWei = task.remainingBudget;
        state              = task.state;
    }

    function getCreatorStats(address creator) external view returns (
        uint256 totalSpentWei,
        uint256 totalTasks,
        uint256 totalFilledSlots,
        uint256 totalPendingSlots
    ) {
        uint256[] memory ids = creatorTaskIds[creator];
        totalTasks = ids.length;
        for (uint256 i = 0; i < ids.length; i++) {
            Task storage t = tasks[ids[i]];
            totalSpentWei    += t.totalBudget - t.remainingBudget;
            totalFilledSlots += t.filledSlots;
            totalPendingSlots += t.pendingSlots;
        }
    }

    function getWorkerStats(address worker) external view returns (
        uint256 totalSubmissions,
        uint256 approvedCount,
        uint256 rejectedCount,
        uint256 trustScore,
        uint256 totalEarnedWei,
        bool    isBanned
    ) {
        WorkerReputation storage rep = reputation[worker];
        totalSubmissions = rep.totalSubmissions;
        approvedCount    = rep.approvedCount;
        rejectedCount    = rep.rejectedCount;
        trustScore       = rep.trustScore == 0 && rep.totalSubmissions == 0 ? 100 : rep.trustScore;
        totalEarnedWei   = rep.totalEarnedWei;
        isBanned         = rep.isBanned;
    }

    function getTrustScore(address worker) external view returns (uint256) {
        WorkerReputation storage rep = reputation[worker];
        if (rep.totalSubmissions == 0) return 100;
        return rep.trustScore;
    }

    function getPlatformStats() external view returns (PlatformStats memory) {
        return platformStats;
    }

    function getTotalTasks() external view returns (uint256) {
        return taskCounter;
    }

    function getTotalSubmissions() external view returns (uint256) {
        return submissionCounter;
    }
}
