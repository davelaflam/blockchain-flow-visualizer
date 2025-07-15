import { Step, StepData } from '../types';

/**
 * This file defines the steps for the QAR blockchain flow.
 */
export const qarTokenSteps: Step[] = [
  // 1. Create Proposal
  {
    title: '1. Create Proposal',
    description: 'The user initiates a deposit of AR tokens to the bridge contract.',
    what: 'User interaction with the bridge contract to start the token wrapping process.',
    why: 'Initiates the cross-chain token flow with user consent.',
    codeSnippet:
      '// User deposits AR tokens\nfunction deposit(uint256 amount) external {\n  require(arToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");\n  emit Deposit(msg.sender, amount);\n}',
    label: 'Create Proposal',
  },

  // 2. Submit to Governance
  {
    title: '2. Submit to Governance',
    description: 'The bridge contract confirms the deposit after the required number of network confirmations.',
    what: 'The deposit operation is verified and recorded on the blockchain.',
    why: 'Ensures the transaction is valid and irreversible before proceeding.',
    codeSnippet:
      '// Confirm deposit after confirmations\nfunction confirmDeposit(bytes32 txHash) external onlyValidator {\n  require(!confirmedDeposits[txHash], "Already confirmed");\n  confirmedDeposits[txHash] = true;\n  emit DepositConfirmed(txHash);\n}',
    label: 'Submit to Governance',
  },

  // 3. Proposal Registered
  {
    title: '3. Proposal Registered',
    description: 'Authorized minters call the Mint-Tokens action to mint QAR tokens.',
    what: 'An equivalent amount of QAR tokens are minted based on the deposited AR amount.',
    why: 'Creates the wrapped token representation on the target chain.',
    codeSnippet:
      '// Mint QAR tokens\nfunction mintTokens(address recipient, uint256 amount) external onlyMinter {\n  qarToken.mint(recipient, amount);\n  emit TokensMinted(recipient, amount);\n}',
    label: 'Proposal Registered',
  },

  // 4. Start Discussion
  {
    title: '4. Start Discussion',
    description: 'The system calculates staking rewards for QAR token holders.',
    what: 'The ao_rewards module tracks AR wallet balances and distributes rewards.',
    why: 'Provides staking benefits to QAR holders proportional to their holdings.',
    codeSnippet:
      '// Calculate rewards\nfunction calculateRewards() external {\n  uint256 totalRewards = getTotalRewards();\n  uint256 totalSupply = qarToken.totalSupply();\n  \n  for (uint i = 0; i < holders.length; i++) {\n    address holder = holders[i];\n    uint256 balance = qarToken.balanceOf(holder);\n    uint256 reward = (balance * totalRewards) / totalSupply;\n    rewards[holder] += reward;\n  }\n  emit RewardsCalculated(totalRewards);\n}',
    label: 'Start Discussion',
  },

  // 5. Voting Started
  {
    title: '5. Voting Started',
    description: 'The user initiates a withdrawal request using the Unwrap action.',
    what: 'QAR tokens are burned and an unwrap request is created with a unique ID.',
    why: 'Begins the process of converting wrapped tokens back to native tokens.',
    codeSnippet:
      '// Initiate withdrawal\nfunction initiateWithdrawal(uint256 amount) external {\n  require(qarToken.balanceOf(msg.sender) >= amount, "Insufficient balance");\n  qarToken.burn(msg.sender, amount);\n  bytes32 requestId = keccak256(abi.encodePacked(msg.sender, amount, block.timestamp));\n  withdrawalRequests[requestId] = WithdrawalRequest(msg.sender, amount, false);\n  emit WithdrawalInitiated(requestId, msg.sender, amount);\n}',
    label: 'Voting Started',
  },

  // 6. Voting Completed
  {
    title: '6. Voting Completed',
    description: 'The bridge contract processes the withdrawal request by sending AR tokens.',
    what: 'AR tokens are sent to the user and the request status is updated.',
    why: "Fulfills the user's request to convert back to native tokens.",
    codeSnippet:
      '// Process withdrawal\nfunction processWithdrawal(bytes32 requestId) external onlyProcessor {\n  WithdrawalRequest storage request = withdrawalRequests[requestId];\n  require(!request.processed, "Already processed");\n  require(arToken.transfer(request.user, request.amount), "Transfer failed");\n  request.processed = true;\n  emit WithdrawalProcessed(requestId, request.user, request.amount);\n}',
    label: 'Voting Completed',
  },

  // 7. Proposal Passed
  {
    title: '7. Proposal Passed',
    description: 'After the required confirmations, the withdrawal is marked as confirmed.',
    what: 'Authorized confirmers call the Confirm-Withdrawals action.',
    why: 'Ensures the withdrawal transaction is properly validated.',
    codeSnippet:
      '// Confirm withdrawal\nfunction confirmWithdrawal(bytes32 requestId) external onlyValidator {\n  require(withdrawalRequests[requestId].processed, "Not processed yet");\n  confirmedWithdrawals[requestId] = true;\n  emit WithdrawalConfirmed(requestId);\n}',
    label: 'Proposal Passed',
  },

  // 8. Execution Queued
  {
    title: '8. Execution Queued',
    description: 'The withdrawal is queued for execution after the timelock period.',
    what: 'The proposal is queued in the timelock contract before execution.',
    why: 'Provides a delay period for security and allows time for emergency actions if needed.',
    codeSnippet:
      '// Queue transaction in timelock\nfunction queueTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) external returns (bytes32) {\n  require(eta >= block.timestamp + delay, "Timelock::queueTransaction: Estimated execution block must satisfy delay");\n  bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));\n  queuedTransactions[txHash] = true;\n  emit QueueTransaction(txHash, target, value, signature, data, eta);\n  return txHash;\n}',
    label: 'Execution Queued',
  },

  // 9. Proposal Executed
  {
    title: '9. Proposal Executed',
    description: 'The proposal has been successfully executed.',
    what: 'The transaction is executed after the timelock period has passed.',
    why: 'Completes the governance process and implements the approved changes.',
    codeSnippet:
      '// Execute transaction after timelock\nfunction executeTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) external payable returns (bytes memory) {\n  bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));\n  require(queuedTransactions[txHash], "Timelock::executeTransaction: Transaction hasn\'t been queued");\n  require(block.timestamp >= eta, "Timelock::executeTransaction: Transaction hasn\'t surpassed time lock");\n  require(block.timestamp <= eta + GRACE_PERIOD, "Timelock::executeTransaction: Transaction is stale");\n  delete queuedTransactions[txHash];\n  bytes memory callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);\n  (bool success, bytes memory returnData) = target.call{value: value}(callData);\n  require(success, "Timelock::executeTransaction: Transaction execution reverted");\n  emit ExecuteTransaction(txHash, target, value, signature, data, eta);\n  return returnData;\n}',
    label: 'Proposal Executed',
  },

  // 10. Proposal Rejected
  {
    title: '10. Proposal Rejected',
    description: 'The proposal failed to pass the vote.',
    what: 'The proposal did not receive enough votes to pass.',
    why: 'Governance mechanism ensures only proposals with sufficient support are implemented.',
    codeSnippet:
      '// Process vote results\nfunction _processVoteResults(uint proposalId) internal {\n  Proposal storage proposal = proposals[proposalId];\n  uint forVotes = proposal.forVotes;\n  uint againstVotes = proposal.againstVotes;\n  uint quorum = (proposal.totalSupply * quorumPercent) / 100;\n  \n  if (forVotes <= againstVotes || forVotes < quorum) {\n    proposal.state = ProposalState.Rejected;\n    emit ProposalRejected(proposalId);\n  } else {\n    proposal.state = ProposalState.Passed;\n    emit ProposalPassed(proposalId);\n  }\n}',
    label: 'Proposal Rejected',
  },

  // 11. Proposal Canceled
  {
    title: '11. Proposal Canceled',
    description: 'The proposal was canceled before completion.',
    what: 'The proposal was canceled by the proposer or an admin.',
    why: 'Allows for cancellation of proposals that are no longer relevant or contain errors.',
    codeSnippet:
      '// Cancel proposal\nfunction cancelProposal(uint proposalId) external {\n  Proposal storage proposal = proposals[proposalId];\n  require(msg.sender == proposal.proposer || msg.sender == admin, "GovernorAlpha::cancelProposal: only proposer or admin can cancel");\n  require(proposal.state == ProposalState.Active, "GovernorAlpha::cancelProposal: proposal must be active");\n  proposal.state = ProposalState.Canceled;\n  emit ProposalCanceled(proposalId);\n}',
    label: 'Proposal Canceled',
  },

  // 12. Execution Failed
  {
    title: '12. Execution Failed',
    description: 'The proposal execution failed.',
    what: 'The transaction reverted during execution.',
    why: 'Provides visibility into execution failures for debugging and resolution.',
    codeSnippet:
      '// Execute transaction with error handling\ntry {\n  (bool success, bytes memory returnData) = target.call{value: value}(callData);\n  require(success, "Transaction execution reverted");\n  emit ExecutionSucceeded(txHash);\n  return returnData;\n} catch Error(string memory reason) {\n  emit ExecutionFailed(txHash, reason);\n  revert(reason);\n} catch {\n  emit ExecutionFailed(txHash, "Unknown error");\n  revert("Execution failed with unknown error");\n}',
    label: 'Execution Failed',
  },
];

/**
 * This file defines the step data for the QAR blockchain flow.
 * Each step includes a label, description, and links to view details.
 */
export const stepData: StepData[] = [
  {
    label: 'Create Proposal',
    description: 'User deposits AR tokens to the bridge contract',
    link: '#step-1',
    linkLabel: 'View Deposit',
  },
  {
    label: 'Submit to Governance',
    description: 'Bridge contract confirms the deposit after required confirmations',
    link: '#step-2',
    linkLabel: 'View Confirmation',
  },
  {
    label: 'Proposal Registered',
    description: 'Bridge contract mints equivalent QAR tokens to user wallet',
    link: '#step-3',
    linkLabel: 'View Minting',
  },
  {
    label: 'Start Discussion',
    description: 'System calculates staking rewards for QAR token holders',
    link: '#step-4',
    linkLabel: 'View Rewards',
  },
  {
    label: 'Voting Started',
    description: 'User initiates withdrawal by burning QAR tokens',
    link: '#step-5',
    linkLabel: 'View Withdrawal',
  },
  {
    label: 'Voting Completed',
    description: 'Bridge contract processes the withdrawal request and sends AR tokens',
    link: '#step-6',
    linkLabel: 'View Processing',
  },
  {
    label: 'Proposal Passed',
    description: 'System confirms the withdrawal transaction after blockchain confirmations',
    link: '#step-7',
    linkLabel: 'View Confirmation',
  },
  {
    label: 'Execution Queued',
    description: 'Withdrawal is queued for execution after timelock period',
    link: '#step-8',
    linkLabel: 'View Queue',
  },
  {
    label: 'Proposal Executed',
    description: 'System distributes staking rewards to QAR token holders',
    link: '#step-9',
    linkLabel: 'View Rewards Distribution',
  },
  {
    label: 'Proposal Rejected',
    description: 'Governance proposal failed due to insufficient votes',
    link: '#step-10',
    linkLabel: 'View Rejection',
  },
  {
    label: 'Proposal Canceled',
    description: 'Operation was canceled by authorized parties before completion',
    link: '#step-11',
    linkLabel: 'View Cancellation',
  },
];
