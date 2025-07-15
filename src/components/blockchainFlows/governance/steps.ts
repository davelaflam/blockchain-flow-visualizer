import { Step, StepData } from '../types';

export const stepData: StepData[] = [
  {
    label: 'Proposal Creation',
    description: 'DAO member initiates a governance proposal',
    link: '#step-1',
    linkLabel: 'View Creation',
  },
  {
    label: 'Proposal Submission',
    description: 'Proposal is submitted to the governance contract',
    link: '#step-2',
    linkLabel: 'View Submission',
  },
  {
    label: 'Proposal Registration',
    description: 'Proposal is registered on-chain',
    link: '#step-3',
    linkLabel: 'View Registration',
  },
  {
    label: 'Discussion Period',
    description: 'Community discusses the proposal',
    link: '#step-4',
    linkLabel: 'View Discussion',
  },
  {
    label: 'Voting Begins',
    description: 'Voting period opens for token holders',
    link: '#step-5',
    linkLabel: 'View Voting Start',
  },
  {
    label: 'Vote Casting',
    description: 'Token holders cast their votes',
    link: '#step-6',
    linkLabel: 'View Voting',
  },
  {
    label: 'Proposal Passed',
    description: 'Proposal receives sufficient votes to pass',
    link: '#step-7',
    linkLabel: 'View Approval',
  },
  {
    label: 'Execution Queued',
    description: 'Passed proposal is queued in timelock',
    link: '#step-8',
    linkLabel: 'View Queue',
  },
  {
    label: 'Proposal Executed',
    description: 'Timelock executes the proposal',
    link: '#step-9',
    linkLabel: 'View Execution',
  },
  {
    label: 'Proposal Rejected',
    description: 'Proposal fails to receive sufficient votes',
    link: '#step-10',
    linkLabel: 'View Rejection',
  },
  {
    label: 'Proposal Cancellation',
    description: 'Proposal creator cancels the governance proposal',
    link: '#step-11',
    linkLabel: 'View Cancellation',
  },
  {
    label: 'Snapshot Voting',
    description: 'Off-chain voting through Snapshot',
    link: '#step-12',
    linkLabel: 'View Snapshot',
  },
  {
    label: 'Snapshot Votes Cast',
    description: 'Token holders cast votes on Snapshot',
    link: '#step-13',
    linkLabel: 'View Off-Chain Voting',
  },
];

export const governanceSteps: Step[] = [
  // 1. Proposal Creation Initiated
  {
    title: '1. Proposal Creation Initiated',
    description: 'A DAO member initiates the creation of a governance proposal.',
    what: 'A member of the DAO begins the process of creating a governance proposal by drafting the proposal details.',
    why: 'Governance proposals allow DAOs to make collective decisions about protocol changes, treasury management, and other important matters.',
    codeSnippet:
      '// Prepare proposal data\nfunction prepareProposal(\n  address[] memory targets,\n  uint256[] memory values,\n  string[] memory signatures,\n  bytes[] memory calldatas,\n  string memory description\n) public view returns (bytes32) {\n  return keccak256(abi.encode(targets, values, signatures, calldatas, description));\n}',
    label: 'Proposal Creation',
  },

  // 2. Proposal Submitted to Governance Contract
  {
    title: '2. Proposal Submitted to Governance Contract',
    description: 'The proposal is submitted to the governance smart contract.',
    what: 'The proposal creator submits the proposal to the governance contract, which includes the target contracts to call, function signatures, and call data.',
    why: 'Submitting the proposal on-chain makes it official and begins the governance process in a transparent, verifiable way.',
    codeSnippet:
      '// Submit proposal to governance contract\nfunction propose(\n  address[] memory targets,\n  uint256[] memory values,\n  string[] memory signatures,\n  bytes[] memory calldatas,\n  string memory description\n) public returns (uint256) {\n  require(token.getPriorVotes(msg.sender, block.number - 1) >= proposalThreshold, "GovernorAlpha::propose: proposer votes below threshold");\n  \n  uint256 proposalId = hashProposal(targets, values, signatures, calldatas, description);\n  \n  proposals[proposalId] = Proposal({\n    id: proposalId,\n    proposer: msg.sender,\n    targets: targets,\n    values: values,\n    signatures: signatures,\n    calldatas: calldatas,\n    startBlock: block.number + votingDelay,\n    endBlock: block.number + votingDelay + votingPeriod,\n    forVotes: 0,\n    againstVotes: 0,\n    abstainVotes: 0,\n    canceled: false,\n    executed: false\n  });\n  \n  emit ProposalCreated(proposalId, msg.sender, targets, values, signatures, calldatas, description);\n  return proposalId;\n}',
    label: 'Proposal Submission',
  },

  // 3. Proposal Created and Registered
  {
    title: '3. Proposal Created and Registered',
    description: 'The proposal is officially registered on the blockchain.',
    what: 'The governance contract registers the proposal with a unique ID and sets the start and end blocks for voting.',
    why: 'Registration creates an immutable record of the proposal and establishes the timeline for the governance process.',
    codeSnippet:
      '// Event emitted when proposal is created\nevent ProposalCreated(\n  uint256 id,\n  address proposer,\n  address[] targets,\n  uint256[] values,\n  string[] signatures,\n  bytes[] calldatas,\n  string description\n);\n\n// Internal function to register proposal\nfunction _registerProposal(\n  uint256 proposalId,\n  address proposer\n) internal {\n  uint256 startBlock = block.number + votingDelay;\n  uint256 endBlock = startBlock + votingPeriod;\n  \n  proposalStartBlock[proposalId] = startBlock;\n  proposalEndBlock[proposalId] = endBlock;\n  proposalProposer[proposalId] = proposer;\n  proposalStatus[proposalId] = ProposalStatus.ACTIVE;\n  \n  emit ProposalRegistered(proposalId, proposer, startBlock, endBlock);\n}',
    label: 'Proposal Registration',
  },

  // 4. Discussion Period Active
  {
    title: '4. Discussion Period Active',
    description: 'The community discusses the proposal in the governance forum.',
    what: 'DAO members engage in discussion about the proposal, asking questions, suggesting improvements, and sharing opinions.',
    why: 'Discussion allows the community to fully understand the proposal, identify potential issues, and build consensus before voting begins.',
    codeSnippet:
      '// No direct code for off-chain discussion, but often integrated with on-chain events\n\n// Example of how a forum might track on-chain proposals\ninterface IGovernanceTracker {\n  function trackProposal(\n    uint256 proposalId,\n    string calldata forumLink,\n    string calldata discussionSummary\n  ) external;\n  \n  function getProposalDiscussion(uint256 proposalId) external view returns (\n    string memory forumLink,\n    string memory discussionSummary,\n    uint256 commentCount\n  );\n}',
    label: 'Discussion Period',
  },

  // 5. Voting Period Begins
  {
    title: '5. Voting Period Begins',
    description: 'The voting period for the proposal officially begins.',
    what: 'The governance contract opens voting, allowing token holders to cast their votes for or against the proposal.',
    why: 'A formal voting period ensures all eligible DAO members have sufficient time to participate in the decision-making process.',
    codeSnippet:
      '// Check if voting is active for a proposal\nfunction state(uint256 proposalId) public view returns (ProposalState) {\n  Proposal storage proposal = proposals[proposalId];\n  \n  if (proposal.canceled) {\n    return ProposalState.CANCELED;\n  }\n  \n  if (block.number <= proposal.startBlock) {\n    return ProposalState.PENDING;\n  }\n  \n  if (block.number <= proposal.endBlock) {\n    return ProposalState.ACTIVE; // Voting is active\n  }\n  \n  if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes) {\n    return ProposalState.DEFEATED;\n  }\n  \n  if (proposal.executed) {\n    return ProposalState.EXECUTED;\n  }\n  \n  return ProposalState.QUEUED;\n}',
    label: 'Voting Begins',
  },

  // 6. Votes Being Cast
  {
    title: '6. Votes Being Cast',
    description: 'Token holders cast their votes on the proposal.',
    what: 'DAO members use their governance tokens to vote for, against, or abstain on the proposal, with voting power proportional to token holdings.',
    why: 'Token-weighted voting allows stakeholders to have influence proportional to their stake in the protocol.',
    codeSnippet:
      '// Cast vote on a proposal\nfunction castVote(uint256 proposalId, uint8 support) public {\n  return _castVote(msg.sender, proposalId, support);\n}\n\n// Cast vote with signature\nfunction castVoteBySig(\n  uint256 proposalId,\n  uint8 support,\n  uint8 v,\n  bytes32 r,\n  bytes32 s\n) public {\n  bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name)), getChainId(), address(this)));\n  bytes32 structHash = keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support));\n  bytes32 digest = keccak256(abi.encodePacked("\\x19\\x01", domainSeparator, structHash));\n  address signatory = ecrecover(digest, v, r, s);\n  \n  require(signatory != address(0), "GovernorAlpha::castVoteBySig: invalid signature");\n  return _castVote(signatory, proposalId, support);\n}\n\n// Internal vote casting logic\nfunction _castVote(address voter, uint256 proposalId, uint8 support) internal {\n  require(state(proposalId) == ProposalState.ACTIVE, "GovernorAlpha::_castVote: voting is closed");\n  require(support <= 2, "GovernorAlpha::_castVote: invalid vote type");\n  \n  Proposal storage proposal = proposals[proposalId];\n  Receipt storage receipt = proposal.receipts[voter];\n  require(receipt.hasVoted == false, "GovernorAlpha::_castVote: voter already voted");\n  \n  uint256 votes = token.getPriorVotes(voter, proposal.startBlock);\n  \n  if (support == 0) {\n    proposal.againstVotes = proposal.againstVotes + votes;\n  } else if (support == 1) {\n    proposal.forVotes = proposal.forVotes + votes;\n  } else if (support == 2) {\n    proposal.abstainVotes = proposal.abstainVotes + votes;\n  }\n  \n  receipt.hasVoted = true;\n  receipt.support = support;\n  receipt.votes = votes;\n  \n  emit VoteCast(voter, proposalId, support, votes);\n}',
    label: 'Vote Casting',
  },

  // 7. Proposal Passed
  {
    title: '7. Proposal Passed',
    description: 'The proposal receives sufficient votes to pass.',
    what: 'After the voting period ends, the votes are tallied, and the proposal has received enough "for" votes to meet the required threshold.',
    why: 'Passing a proposal indicates that the DAO has reached consensus to implement the proposed changes.',
    codeSnippet:
      '// Check if a proposal has passed\nfunction proposalPassed(uint256 proposalId) public view returns (bool) {\n  Proposal storage proposal = proposals[proposalId];\n  return (\n    proposal.forVotes > proposal.againstVotes &&\n    proposal.forVotes >= quorumVotes\n  );\n}\n\n// Event emitted when proposal passes\nevent ProposalPassed(uint256 proposalId, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes);\n\n// Function to finalize voting\nfunction finalizeVote(uint256 proposalId) public {\n  require(state(proposalId) == ProposalState.ACTIVE, "Voting still active");\n  require(block.number > proposals[proposalId].endBlock, "Voting period not ended");\n  \n  Proposal storage proposal = proposals[proposalId];\n  \n  if (proposalPassed(proposalId)) {\n    proposal.status = ProposalStatus.PASSED;\n    emit ProposalPassed(proposalId, proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);\n  } else {\n    proposal.status = ProposalStatus.REJECTED;\n    emit ProposalRejected(proposalId, proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);\n  }\n}',
    label: 'Proposal Passed',
  },

  // 8. Execution Queued in Timelock
  {
    title: '8. Execution Queued in Timelock',
    description: 'The passed proposal is queued in the timelock contract for delayed execution.',
    what: 'The governance contract queues the proposal in a timelock contract, which enforces a mandatory waiting period before execution.',
    why: 'The timelock provides a security buffer, allowing users to exit the protocol if they disagree with a passed proposal before it takes effect.',
    codeSnippet:
      '// Queue a passed proposal in the timelock\nfunction queue(uint256 proposalId) public {\n  require(state(proposalId) == ProposalState.SUCCEEDED, "GovernorAlpha::queue: proposal can only be queued if it is succeeded");\n  \n  Proposal storage proposal = proposals[proposalId];\n  uint256 eta = block.timestamp + timelock.delay();\n  \n  for (uint i = 0; i < proposal.targets.length; i++) {\n    _queueOrRevert(\n      proposal.targets[i],\n      proposal.values[i],\n      proposal.signatures[i],\n      proposal.calldatas[i],\n      eta\n    );\n  }\n  \n  proposal.eta = eta;\n  emit ProposalQueued(proposalId, eta);\n}\n\n// Internal function to queue a transaction or revert\nfunction _queueOrRevert(\n  address target,\n  uint256 value,\n  string memory signature,\n  bytes memory data,\n  uint256 eta\n) internal {\n  require(\n    !timelock.queuedTransactions(keccak256(abi.encode(target, value, signature, data, eta))),\n    "GovernorAlpha::_queueOrRevert: proposal action already queued at eta"\n  );\n  \n  timelock.queueTransaction(target, value, signature, data, eta);\n}',
    label: 'Execution Queued',
  },

  // 9. Proposal Executed
  {
    title: '9. Proposal Executed',
    description: 'After the timelock period, the proposal is executed.',
    what: 'The timelock contract executes the proposal by calling the target contracts with the specified function calls and parameters.',
    why: 'Execution implements the changes approved by the DAO, modifying the protocol as specified in the proposal.',
    codeSnippet:
      '// Execute a queued proposal\nfunction execute(uint256 proposalId) public payable {\n  require(state(proposalId) == ProposalState.QUEUED, "GovernorAlpha::execute: proposal can only be executed if it is queued");\n  \n  Proposal storage proposal = proposals[proposalId];\n  proposal.executed = true;\n  \n  for (uint i = 0; i < proposal.targets.length; i++) {\n    timelock.executeTransaction{\n      value: proposal.values[i]\n    }(\n      proposal.targets[i],\n      proposal.values[i],\n      proposal.signatures[i],\n      proposal.calldatas[i],\n      proposal.eta\n    );\n  }\n  \n  emit ProposalExecuted(proposalId);\n}\n\n// Timelock execute transaction function\nfunction executeTransaction(\n  address target,\n  uint256 value,\n  string memory signature,\n  bytes memory data,\n  uint256 eta\n) public payable returns (bytes memory) {\n  require(msg.sender == admin, "Timelock::executeTransaction: Call must come from admin");\n  \n  bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));\n  require(queuedTransactions[txHash], "Timelock::executeTransaction: Transaction hasn\'t been queued");\n  require(block.timestamp >= eta, "Timelock::executeTransaction: Transaction hasn\'t surpassed time lock");\n  require(block.timestamp <= eta + GRACE_PERIOD, "Timelock::executeTransaction: Transaction is stale");\n  \n  queuedTransactions[txHash] = false;\n  \n  bytes memory callData;\n  if (bytes(signature).length == 0) {\n    callData = data;\n  } else {\n    callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);\n  }\n  \n  // solium-disable-next-line security/no-call-value\n  (bool success, bytes memory returnData) = target.call{value: value}(callData);\n  require(success, "Timelock::executeTransaction: Transaction execution reverted");\n  \n  emit ExecuteTransaction(txHash, target, value, signature, data, eta);\n  \n  return returnData;\n}',
    label: 'Proposal Executed',
  },

  // 10. Proposal Rejected (Alternative Path)
  {
    title: '10. Proposal Rejected',
    description: 'The proposal fails to receive sufficient votes and is rejected.',
    what: 'After the voting period ends, the votes are tallied, and the proposal has not received enough "for" votes to meet the required threshold.',
    why: 'Rejection indicates that the DAO has not reached consensus on implementing the proposed changes.',
    codeSnippet:
      '// Check if a proposal has been rejected\nfunction proposalRejected(uint256 proposalId) public view returns (bool) {\n  Proposal storage proposal = proposals[proposalId];\n  return (\n    proposal.againstVotes >= proposal.forVotes ||\n    proposal.forVotes < quorumVotes\n  );\n}\n\n// Event emitted when proposal is rejected\nevent ProposalRejected(uint256 proposalId, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes);\n\n// Function to handle rejected proposals\nfunction handleRejectedProposal(uint256 proposalId) internal {\n  Proposal storage proposal = proposals[proposalId];\n  proposal.status = ProposalStatus.REJECTED;\n  \n  // Clean up any resources or update metrics\n  rejectedProposalCount++;\n  \n  emit ProposalRejected(\n    proposalId,\n    proposal.forVotes,\n    proposal.againstVotes,\n    proposal.abstainVotes\n  );\n}',
    label: 'Proposal Rejected',
  },

  // 11. Proposal Cancelled (Alternative Path)
  {
    title: '11. Proposal Cancelled',
    description: 'The proposal creator cancels the governance proposal before voting concludes.',
    what: 'The proposal creator or authorized governance participants can cancel a proposal before it is executed, removing it from consideration.',
    why: 'Cancellation allows for correcting errors in proposals, responding to community feedback, or withdrawing proposals that are no longer relevant or beneficial.',
    codeSnippet:
      '// Function to cancel a proposal\nfunction cancelProposal(uint256 proposalId) external {\n  require(state(proposalId) != ProposalState.EXECUTED, "GovernorAlpha::cancel: cannot cancel executed proposal");\n  \n  Proposal storage proposal = proposals[proposalId];\n  \n  // Only proposal creator or guardian can cancel\n  require(\n    msg.sender == proposal.proposer || msg.sender == guardian,\n    "GovernorAlpha::cancel: only proposer or guardian can cancel"\n  );\n  \n  proposal.canceled = true;\n  \n  // If proposal was in timelock, cancel the timelock transaction too\n  if (state(proposalId) == ProposalState.QUEUED) {\n    for (uint i = 0; i < proposal.targets.length; i++) {\n      timelock.cancelTransaction(\n        proposal.targets[i],\n        proposal.values[i],\n        proposal.signatures[i],\n        proposal.calldatas[i],\n        proposal.eta\n      );\n    }\n  }\n  \n  emit ProposalCanceled(proposalId);\n}\n\n// Event emitted when a proposal is cancelled\nevent ProposalCanceled(uint256 proposalId);',
    label: 'Proposal Cancelled',
  },

  // 12. Snapshot Voting (Alternative Voting Path)
  {
    title: '12. Snapshot Voting',
    description: 'The proposal is put to a vote on Snapshot, an off-chain voting platform.',
    what: 'The governance contract creates a proposal on Snapshot, allowing token holders to vote without paying gas fees.',
    why: 'Off-chain voting reduces barriers to participation by eliminating gas costs, potentially increasing voter turnout and making governance more inclusive.',
    codeSnippet:
      '// Create a Snapshot proposal\nasync function createSnapshotProposal(proposalId, title, description) {\n  // Connect to Snapshot API\n  const snapshot = new SnapshotClient(SNAPSHOT_HUB_URL);\n  \n  // Create proposal on Snapshot\n  const snapshotProposal = await snapshot.proposal({\n    space: "your-dao.eth",\n    type: "single-choice",\n    title: title,\n    body: description,\n    choices: ["For", "Against", "Abstain"],\n    start: Math.floor(Date.now() / 1000),\n    end: Math.floor(Date.now() / 1000) + VOTING_PERIOD,\n    snapshot: await provider.getBlockNumber(),\n    network: "1",\n    strategies: [\n      {\n        name: "erc20-balance-of",\n        params: {\n          symbol: "GOV",\n          address: TOKEN_ADDRESS,\n          decimals: 18\n        }\n      }\n    ],\n    plugins: {},\n    metadata: {\n      proposalId: proposalId\n    }\n  });\n  \n  return snapshotProposal.id;\n}',
    label: 'Snapshot Voting',
  },

  // 13. Snapshot Votes Being Cast
  {
    title: '13. Snapshot Votes Being Cast',
    description: 'Token holders cast their votes on the Snapshot platform.',
    what: 'DAO members sign messages with their wallets to cast votes on Snapshot without submitting on-chain transactions.',
    why: 'Gasless voting allows all token holders to participate regardless of ETH holdings, and votes can be tallied off-chain before being submitted as a single on-chain transaction.',
    codeSnippet:
      '// Cast a vote on Snapshot\nasync function castSnapshotVote(proposalId, choice, voter) {\n  // Connect to Snapshot API\n  const snapshot = new SnapshotClient(SNAPSHOT_HUB_URL);\n  \n  // Prepare vote payload\n  const votePayload = {\n    space: "your-dao.eth",\n    proposal: proposalId,\n    type: "single-choice",\n    choice: choice, // 1 = For, 2 = Against, 3 = Abstain\n    metadata: {}\n  };\n  \n  // Sign message with user\'s wallet\n  const provider = new ethers.providers.Web3Provider(window.ethereum);\n  const signer = provider.getSigner();\n  const signature = await snapshot.utils.sign(signer, voter, votePayload);\n  \n  // Submit vote to Snapshot\n  const receipt = await snapshot.vote(voter, votePayload, signature);\n  return receipt;\n}\n\n// Submit Snapshot results to chain\nasync function submitSnapshotResults(proposalId, forVotes, againstVotes, abstainVotes) {\n  // This function would be called by a trusted relayer or governance contract\n  const governanceContract = new ethers.Contract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, signer);\n  \n  // Submit the tallied results from Snapshot to the on-chain governance contract\n  const tx = await governanceContract.submitOffChainVoteResults(\n    proposalId,\n    forVotes,\n    againstVotes,\n    abstainVotes,\n    // Include cryptographic proof of vote tallying if required\n  );\n  \n  await tx.wait();\n  return tx.hash;\n}',
    label: 'Snapshot Votes Cast',
  },
];
