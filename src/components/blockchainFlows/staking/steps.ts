import { Step, StepData } from '../types';

/**
 * This file defines the steps for the staking process in a blockchain flow.
 */
export const stakingSteps: Step[] = [
  // 1. Connect Wallet
  {
    title: '1. Connect Wallet',
    description: 'User connects their wallet to the staking platform.',
    what: 'User interaction with the dApp to establish a connection to their blockchain wallet.',
    why: 'Establishes a secure connection between the user and the staking platform.',
    codeSnippet:
      '// Connect wallet\nasync function connectWallet() {\n  try {\n    const provider = await detectEthereumProvider();\n    const accounts = await provider.request({ method: "eth_requestAccounts" });\n    setAccount(accounts[0]);\n    setConnected(true);\n  } catch (error) {\n    logError("Error connecting wallet:", error);\n  }\n}',
    label: 'Connect Wallet',
  },

  // 2. Approve Token Spending
  {
    title: '2. Approve Token Spending',
    description: 'User approves the staking contract to spend their tokens.',
    what: 'User signs a transaction to allow the staking contract to transfer tokens on their behalf.',
    why: "Required for the staking contract to later transfer tokens from the user's wallet to the staking pool.",
    codeSnippet:
      '// Approve token spending\nasync function approveTokens(amount) {\n  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);\n  const tx = await tokenContract.approve(STAKING_ADDRESS, ethers.utils.parseEther(amount));\n  await tx.wait();\n  return tx.hash;\n}',
    label: 'Approve Token Spending',
  },

  // 3. Stake Tokens
  {
    title: '3. Stake Tokens',
    description: 'User stakes their tokens in the staking contract.',
    what: "Tokens are transferred from the user's wallet to the staking contract.",
    why: 'Locks tokens in the staking contract to earn rewards over time.',
    codeSnippet:
      '// Stake tokens\nfunction stake(uint256 amount) external {\n  require(amount > 0, "Cannot stake 0 tokens");\n  require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");\n  \n  // Update staking balance\n  stakingBalance[msg.sender] += amount;\n  totalStaked += amount;\n  \n  // Update staking timestamp\n  stakingTimestamp[msg.sender] = block.timestamp;\n  \n  emit Staked(msg.sender, amount);\n}',
    label: 'Stake Tokens',
  },

  // 4. Tokens Locked in Contract
  {
    title: '4. Tokens Locked in Contract',
    description: 'Tokens are now locked in the staking contract.',
    what: "The staking contract holds the tokens and records the user's stake.",
    why: 'Tokens need to be locked to ensure they remain in the staking pool while earning rewards.',
    codeSnippet:
      '// View staking balance\nfunction getStakingBalance(address staker) external view returns (uint256) {\n  return stakingBalance[staker];\n}\n\n// View total staked\nfunction getTotalStaked() external view returns (uint256) {\n  return totalStaked;\n}',
    label: 'Tokens Locked in Contract',
  },

  // 5. Rewards Accumulation
  {
    title: '5. Rewards Accumulation',
    description: 'Staked tokens accumulate rewards over time.',
    what: 'The staking contract calculates rewards based on staking duration and amount.',
    why: 'Rewards incentivize users to stake their tokens and provide value to the network.',
    codeSnippet:
      '// Calculate rewards\nfunction calculateRewards(address staker) public view returns (uint256) {\n  uint256 stakingTime = block.timestamp - stakingTimestamp[staker];\n  uint256 balance = stakingBalance[staker];\n  \n  // Calculate rewards based on time and amount staked\n  // Example: 10% APY\n  uint256 rewardRate = 10;\n  uint256 rewards = balance * rewardRate * stakingTime / (365 days * 100);\n  \n  return rewards;\n}',
    label: 'Rewards Accumulation',
  },

  // 6. Claim Rewards
  {
    title: '6. Claim Rewards',
    description: 'User claims their accumulated rewards.',
    what: "Rewards are calculated and transferred to the user's wallet.",
    why: 'Allows users to realize the benefits of staking without unstaking their tokens.',
    codeSnippet:
      '// Claim rewards\nfunction claimRewards() external {\n  uint256 rewards = calculateRewards(msg.sender);\n  require(rewards > 0, "No rewards to claim");\n  \n  // Reset staking timestamp for future rewards calculation\n  stakingTimestamp[msg.sender] = block.timestamp;\n  \n  // Transfer rewards to user\n  require(rewardToken.transfer(msg.sender, rewards), "Reward transfer failed");\n  \n  emit RewardsClaimed(msg.sender, rewards);\n}',
    label: 'Claim Rewards',
  },

  // 7. Unstake Request
  {
    title: '7. Unstake Request',
    description: 'User requests to unstake their tokens.',
    what: 'User initiates the unstaking process, which may include a cooldown period.',
    why: 'Begins the process of returning tokens to the user while ensuring network stability.',
    codeSnippet:
      '// Request unstake\nfunction requestUnstake(uint256 amount) external {\n  require(amount > 0, "Cannot unstake 0 tokens");\n  require(stakingBalance[msg.sender] >= amount, "Insufficient staking balance");\n  \n  // Create unstake request with cooldown period\n  unstakeRequests[msg.sender] = UnstakeRequest({\n    amount: amount,\n    requestTime: block.timestamp,\n    completed: false\n  });\n  \n  emit UnstakeRequested(msg.sender, amount);\n}',
    label: 'Unstake Request',
  },

  // 8. Cooldown Period
  {
    title: '8. Cooldown Period',
    description: 'Unstaking request enters a cooldown period.',
    what: 'The unstaking request is locked for a predetermined period before tokens can be withdrawn.',
    why: 'Prevents sudden mass unstaking that could destabilize the network.',
    codeSnippet:
      '// Check if cooldown period has passed\nfunction isCooldownComplete(address staker) public view returns (bool) {\n  UnstakeRequest storage request = unstakeRequests[staker];\n  return block.timestamp >= request.requestTime + COOLDOWN_PERIOD;\n}',
    label: 'Cooldown Period',
  },

  // 9. Withdraw Tokens
  {
    title: '9. Withdraw Tokens',
    description: 'User withdraws their tokens after the cooldown period.',
    what: "Tokens are transferred from the staking contract back to the user's wallet.",
    why: 'Completes the unstaking process and returns control of tokens to the user.',
    codeSnippet:
      '// Withdraw tokens after cooldown\nfunction withdrawTokens() external {\n  UnstakeRequest storage request = unstakeRequests[msg.sender];\n  require(!request.completed, "Unstake already completed");\n  require(isCooldownComplete(msg.sender), "Cooldown period not complete");\n  \n  uint256 amount = request.amount;\n  \n  // Update staking balance\n  stakingBalance[msg.sender] -= amount;\n  totalStaked -= amount;\n  \n  // Mark request as completed\n  request.completed = true;\n  \n  // Transfer tokens back to user\n  require(token.transfer(msg.sender, amount), "Transfer failed");\n  \n  emit Unstaked(msg.sender, amount);\n}',
    label: 'Withdraw Tokens',
  },

  // 10. Transaction Complete
  {
    title: '10. Transaction Complete',
    description: 'The unstaking process is completed and transaction is finalized.',
    what: 'The unstaking request is marked as completed and the user has received their tokens.',
    why: 'Provides closure to the unstaking operation and updates the system state.',
    codeSnippet:
      '// View completed unstake requests\nfunction getCompletedUnstakeRequests() external view returns (address[] memory) {\n  uint256 count = 0;\n  \n  // Count completed requests\n  for (uint256 i = 0; i < stakers.length; i++) {\n    if (unstakeRequests[stakers[i]].completed) {\n      count++;\n    }\n  }\n  \n  // Create array of completed request addresses\n  address[] memory completed = new address[](count);\n  uint256 index = 0;\n  \n  for (uint256 i = 0; i < stakers.length; i++) {\n    if (unstakeRequests[stakers[i]].completed) {\n      completed[index] = stakers[i];\n      index++;\n    }\n  }\n  \n  return completed;\n}',
    label: 'Transaction Complete',
  },
];

/**
 * Step data for the staking process.
 */
export const stepData: StepData[] = [
  { label: 'Connect Wallet', description: 'User connects their wallet to the staking platform.' },
  { label: 'Approve Token Spending', description: 'User approves the staking contract to spend their tokens.' },
  { label: 'Stake Tokens', description: 'User stakes their tokens in the staking contract.' },
  { label: 'Tokens Locked in Contract', description: 'Tokens are now locked in the staking contract.' },
  { label: 'Rewards Accumulation', description: 'Staked tokens accumulate rewards over time.' },
  { label: 'Claim Rewards', description: 'User claims their accumulated rewards.' },
  { label: 'Unstake Request', description: 'User requests to unstake their tokens.' },
  { label: 'Cooldown Period', description: 'Unstaking request enters a cooldown period.' },
  { label: 'Withdraw Tokens', description: 'User withdraws their tokens after the cooldown period.' },
  { label: 'Transaction Complete', description: 'The unstaking process is completed and transaction is finalized.' },
];
