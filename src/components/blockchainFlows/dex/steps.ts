import { Step, StepData } from '../types';

export const stepData: StepData[] = [
  {
    label: 'Connect Wallet',
    description: 'User connects their wallet to the DEX',
    link: '#step-1',
    linkLabel: 'View Connection',
  },
  {
    label: 'Approve Tokens',
    description: 'User approves tokens for DEX interaction',
    link: '#step-2',
    linkLabel: 'View Approval',
  },
  {
    label: 'Process Transaction',
    description: 'Router processes the transaction',
    link: '#step-3',
    linkLabel: 'View Processing',
  },
  {
    label: 'Execute Swap',
    description: 'Token swap is executed in the liquidity pool',
    link: '#step-4',
    linkLabel: 'View Swap',
  },
  {
    label: 'Collect Fees',
    description: 'Trading fees are collected from the swap',
    link: '#step-5',
    linkLabel: 'View Fees',
  },
  {
    label: 'Validate Liquidity',
    description: 'Validators validate the liquidity addition',
    link: '#step-6',
    linkLabel: 'View Validation',
  },
  {
    label: 'Add Liquidity',
    description: 'Liquidity is added to the pool',
    link: '#step-7',
    linkLabel: 'View Addition',
  },
  {
    label: 'Mint LP Tokens',
    description: 'LP tokens are minted for the liquidity provider',
    link: '#step-8',
    linkLabel: 'View Minting',
  },
  {
    label: 'Validate Removal',
    description: 'Validators validate the liquidity removal',
    link: '#step-9',
    linkLabel: 'View Validation',
  },
  {
    label: 'Remove Liquidity',
    description: 'Liquidity is removed from the pool',
    link: '#step-10',
    linkLabel: 'View Removal',
  },
];

export const dexSteps: Step[] = [
  // 1. User Connects Wallet
  {
    title: '1. User Connects Wallet',
    description: 'The user connects their wallet to the decentralized exchange (DEX) interface.',
    what: 'User initiates a connection between their wallet and the DEX application.',
    why: 'Establishes a secure connection that allows the DEX to request transaction signatures and read account information.',
    codeSnippet:
      '// Connect wallet to DEX\nasync function connectWallet() {\n  try {\n    // Request account access\n    const accounts = await window.ethereum.request({\n      method: "eth_requestAccounts"\n    });\n    \n    // Set active account\n    const account = accounts[0];\n    \n    // Get network ID\n    const chainId = await window.ethereum.request({\n      method: "eth_chainId"\n    });\n    \n    // Check if connected to supported network\n    if (!SUPPORTED_CHAINS.includes(chainId)) {\n      throw new Error("Unsupported network");\n    }\n    \n    return { account, chainId };\n  } catch (error) {\n    console.error("Failed to connect wallet:", error);\n    throw error;\n  }\n}',
    label: 'Connect Wallet',
  },

  // 2. User Approves Tokens
  {
    title: '2. User Approves Tokens',
    description: 'The user approves the DEX to spend their tokens on their behalf.',
    what: 'User signs a transaction that grants the DEX router contract permission to transfer specific tokens from their wallet.',
    why: 'Required security step for ERC-20 tokens to prevent unauthorized spending. The DEX needs this approval to execute trades or add liquidity.',
    codeSnippet:
      '// Approve tokens for DEX\nasync function approveTokens(tokenAddress, spenderAddress, amount) {\n  // Get token contract\n  const tokenContract = new ethers.Contract(\n    tokenAddress,\n    ERC20_ABI,\n    provider.getSigner()\n  );\n  \n  // Convert amount to wei\n  const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);\n  \n  // Send approval transaction\n  const tx = await tokenContract.approve(spenderAddress, amountInWei);\n  \n  // Wait for transaction confirmation\n  const receipt = await tx.wait();\n  \n  return receipt;\n}',
    label: 'Approve Tokens',
  },

  // 3. Router Processes Transaction
  {
    title: '3. Router Processes Transaction',
    description: "The DEX router contract processes the user's transaction request.",
    what: 'Router contract receives the transaction, validates parameters, and prepares to execute the requested operation.',
    why: 'The router determines the optimal execution path and ensures the transaction meets all requirements before proceeding.',
    codeSnippet:
      '// Router contract processes transaction\nfunction processTransaction(\n  address tokenIn,\n  address tokenOut,\n  uint256 amountIn,\n  uint256 amountOutMin,\n  address to,\n  uint256 deadline\n) external {\n  // Validate parameters\n  require(tokenIn != tokenOut, "Identical tokens");\n  require(amountIn > 0, "Insufficient input amount");\n  require(to != address(0), "Invalid recipient");\n  require(deadline >= block.timestamp, "Expired");\n  \n  // Transfer tokens from sender to router\n  TransferHelper.safeTransferFrom(\n    tokenIn,\n    msg.sender,\n    address(this),\n    amountIn\n  );\n  \n  // Determine execution path\n  address[] memory path = new address[](2);\n  path[0] = tokenIn;\n  path[1] = tokenOut;\n  \n  // Execute swap\n  _swap(path, amountIn, amountOutMin, to);\n  \n  emit TransactionProcessed(msg.sender, tokenIn, tokenOut, amountIn);\n}',
    label: 'Process Transaction',
  },

  // 4. Token Swap Execution
  {
    title: '4. Token Swap Execution',
    description: 'The DEX executes the token swap in the liquidity pool.',
    what: 'Tokens are exchanged between the user and the liquidity pool based on the current exchange rate.',
    why: 'The core function of a DEX is to facilitate token swaps without traditional intermediaries, using an automated market maker formula.',
    codeSnippet:
      '// Execute token swap in liquidity pool\nfunction _swap(\n  address[] memory path,\n  uint256 amountIn,\n  uint256 amountOutMin,\n  address to\n) internal {\n  // Get the pair address for the tokens\n  address pair = factory.getPair(path[0], path[1]);\n  require(pair != address(0), "Pair does not exist");\n  \n  // Calculate amounts out\n  uint256[] memory amounts = getAmountsOut(amountIn, path);\n  require(amounts[1] >= amountOutMin, "Insufficient output amount");\n  \n  // Transfer input tokens to pair\n  TransferHelper.safeTransfer(path[0], pair, amountIn);\n  \n  // Execute swap\n  IUniswapV2Pair(pair).swap(\n    path[0] == IUniswapV2Pair(pair).token0() ? 0 : amounts[1],\n    path[0] == IUniswapV2Pair(pair).token0() ? amounts[1] : 0,\n    to,\n    new bytes(0)\n  );\n  \n  emit Swap(msg.sender, amounts[0], amounts[1], path);\n}',
    label: 'Execute Swap',
  },

  // 5. Fees Collection
  {
    title: '5. Fees Collection',
    description: 'Trading fees are collected from the swap and distributed to liquidity providers.',
    what: 'A percentage of the traded amount (typically 0.3%) is retained in the liquidity pool as a fee.',
    why: 'Fees incentivize liquidity providers to deposit their tokens in the pool, ensuring there is always sufficient liquidity for trading.',
    codeSnippet:
      '// Collect and distribute trading fees\nfunction _collectFees(uint256 amount) internal returns (uint256) {\n  // Calculate fee amount (0.3% of trade)\n  uint256 feeAmount = amount.mul(3).div(1000);\n  \n  // Deduct fee from amount\n  uint256 amountAfterFee = amount.sub(feeAmount);\n  \n  // Update fee accumulator for this pair\n  feeAccumulator = feeAccumulator.add(feeAmount);\n  \n  // If fee distribution threshold reached, distribute to LP token holders\n  if (feeAccumulator >= FEE_DISTRIBUTION_THRESHOLD) {\n    _distributeFees();\n  }\n  \n  emit FeesCollected(feeAmount);\n  \n  return amountAfterFee;\n}',
    label: 'Collect Fees',
  },

  // 6. Liquidity Addition Validation
  {
    title: '6. Liquidity Addition Validation',
    description: 'Validators validate the liquidity addition transaction.',
    what: 'Network validators check the transaction parameters and signatures to ensure the liquidity addition is legitimate.',
    why: 'Validation ensures the integrity of the liquidity pool and protects against malicious transactions.',
    codeSnippet:
      '// Validate liquidity addition transaction\nfunction validateLiquidityAddition(\n  address tokenA,\n  address tokenB,\n  uint256 amountA,\n  uint256 amountB,\n  bytes memory signature\n) external view returns (bool) {\n  // Create message hash from parameters\n  bytes32 messageHash = keccak256(\n    abi.encodePacked(tokenA, tokenB, amountA, amountB, msg.sender)\n  );\n  \n  // Recover signer from signature\n  address signer = recoverSigner(messageHash, signature);\n  \n  // Check if signer is an authorized validator\n  bool isValidator = validators[signer];\n  \n  // Verify token addresses are valid\n  bool validTokens = tokenA != address(0) && tokenB != address(0) && tokenA != tokenB;\n  \n  // Verify amounts are reasonable\n  bool validAmounts = amountA > 0 && amountB > 0;\n  \n  return isValidator && validTokens && validAmounts;\n}',
    label: 'Validate Liquidity',
  },

  // 7. Liquidity Addition to Pool
  {
    title: '7. Liquidity Addition to Pool',
    description: 'Liquidity is added to the pool by depositing token pairs.',
    what: "User's tokens are transferred to the liquidity pool in exchange for LP tokens.",
    why: "Adding liquidity increases the pool's capacity to facilitate trades and earns the provider a share of trading fees.",
    codeSnippet:
      '// Add liquidity to pool\nfunction addLiquidity(\n  address tokenA,\n  address tokenB,\n  uint256 amountADesired,\n  uint256 amountBDesired,\n  uint256 amountAMin,\n  uint256 amountBMin,\n  address to,\n  uint256 deadline\n) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {\n  // Validate deadline\n  require(deadline >= block.timestamp, "Expired");\n  \n  // Calculate optimal amounts\n  (amountA, amountB) = _calculateLiquidityAmounts(\n    tokenA,\n    tokenB,\n    amountADesired,\n    amountBDesired,\n    amountAMin,\n    amountBMin\n  );\n  \n  // Get pair address, create if doesn\'t exist\n  address pair = factory.getPair(tokenA, tokenB);\n  if (pair == address(0)) {\n    pair = factory.createPair(tokenA, tokenB);\n  }\n  \n  // Transfer tokens to pair\n  TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);\n  TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);\n  \n  // Mint LP tokens to recipient\n  liquidity = IUniswapV2Pair(pair).mint(to);\n  \n  emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);\n  \n  return (amountA, amountB, liquidity);\n}',
    label: 'Add Liquidity',
  },

  // 8. LP Token Minting
  {
    title: '8. LP Token Minting',
    description: 'LP tokens are minted and sent to the liquidity provider.',
    what: "The liquidity pool contract mints LP tokens proportional to the provider's share of the pool.",
    why: 'LP tokens represent ownership of the pool and entitle holders to a proportional share of trading fees.',
    codeSnippet:
      '// Mint LP tokens to liquidity provider\nfunction mint(address to) external returns (uint256 liquidity) {\n  // Get reserves\n  (uint112 reserve0, uint112 reserve1,) = getReserves();\n  \n  // Get balances\n  uint256 balance0 = IERC20(token0).balanceOf(address(this));\n  uint256 balance1 = IERC20(token1).balanceOf(address(this));\n  \n  // Calculate amounts\n  uint256 amount0 = balance0.sub(reserve0);\n  uint256 amount1 = balance1.sub(reserve1);\n  \n  // Calculate liquidity amount\n  if (totalSupply == 0) {\n    // Initial liquidity\n    liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);\n    _mint(address(0), MINIMUM_LIQUIDITY); // Permanently lock minimum liquidity\n  } else {\n    // Additional liquidity\n    liquidity = Math.min(\n      amount0.mul(totalSupply) / reserve0,\n      amount1.mul(totalSupply) / reserve1\n    );\n  }\n  \n  require(liquidity > 0, "Insufficient liquidity minted");\n  \n  // Mint LP tokens to recipient\n  _mint(to, liquidity);\n  \n  // Update reserves\n  _update(balance0, balance1, reserve0, reserve1);\n  \n  emit Mint(msg.sender, amount0, amount1);\n  \n  return liquidity;\n}',
    label: 'Mint LP Tokens',
  },

  // 9. Liquidity Removal Validation
  {
    title: '9. Liquidity Removal Validation',
    description: 'Validators validate the liquidity removal transaction.',
    what: 'Network validators check the transaction parameters and signatures to ensure the liquidity removal is legitimate.',
    why: 'Validation ensures the integrity of the liquidity pool and protects against malicious withdrawals.',
    codeSnippet:
      '// Validate liquidity removal transaction\nfunction validateLiquidityRemoval(\n  address pair,\n  uint256 liquidity,\n  bytes memory signature\n) external view returns (bool) {\n  // Create message hash from parameters\n  bytes32 messageHash = keccak256(\n    abi.encodePacked(pair, liquidity, msg.sender)\n  );\n  \n  // Recover signer from signature\n  address signer = recoverSigner(messageHash, signature);\n  \n  // Check if signer is an authorized validator\n  bool isValidator = validators[signer];\n  \n  // Verify pair address is valid\n  bool validPair = factory.isPair(pair);\n  \n  // Verify liquidity amount\n  bool validLiquidity = liquidity > 0 && liquidity <= IERC20(pair).balanceOf(msg.sender);\n  \n  return isValidator && validPair && validLiquidity;\n}',
    label: 'Validate Removal',
  },

  // 10. Liquidity Removal from Pool
  {
    title: '10. Liquidity Removal from Pool',
    description: 'Liquidity is removed from the pool by burning LP tokens.',
    what: 'LP tokens are burned and the corresponding share of tokens in the pool is returned to the provider.',
    why: 'Allows liquidity providers to withdraw their assets from the pool when needed.',
    codeSnippet:
      '// Remove liquidity from pool\nfunction removeLiquidity(\n  address tokenA,\n  address tokenB,\n  uint256 liquidity,\n  uint256 amountAMin,\n  uint256 amountBMin,\n  address to,\n  uint256 deadline\n) external returns (uint256 amountA, uint256 amountB) {\n  // Validate deadline\n  require(deadline >= block.timestamp, "Expired");\n  \n  // Get pair address\n  address pair = factory.getPair(tokenA, tokenB);\n  require(pair != address(0), "Pair does not exist");\n  \n  // Transfer LP tokens from sender to pair\n  IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity);\n  \n  // Burn LP tokens and receive tokens\n  (uint256 amount0, uint256 amount1) = IUniswapV2Pair(pair).burn(to);\n  \n  // Sort token amounts\n  (address token0,) = sortTokens(tokenA, tokenB);\n  (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);\n  \n  // Validate minimum amounts\n  require(amountA >= amountAMin, "Insufficient A amount");\n  require(amountB >= amountBMin, "Insufficient B amount");\n  \n  emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);\n  \n  return (amountA, amountB);\n}',
    label: 'Remove Liquidity',
  },
];
