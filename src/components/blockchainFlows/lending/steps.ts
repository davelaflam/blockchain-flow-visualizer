import { Step, StepData } from '../types';

export const lendingSteps: Step[] = [
  // 1. Connect Wallet
  {
    title: '1. Connect Wallet',
    description: 'User connects their wallet to the lending platform.',
    what: 'User interaction with the dApp to establish a connection to their blockchain wallet.',
    why: 'Establishes a secure connection between the user and the lending platform.',
    codeSnippet:
      '// Connect wallet\nasync function connectWallet() {\n  try {\n    const provider = await detectEthereumProvider();\n    const accounts = await provider.request({ method: "eth_requestAccounts" });\n    setAccount(accounts[0]);\n    setConnected(true);\n  } catch (error) {\n    logError("Error connecting wallet:", error);\n  }\n}',
    label: 'Connect Wallet',
  },

  // 2. Approve Token Spending
  {
    title: '2. Approve Token Spending',
    description: 'User approves the lending contract to spend their tokens.',
    what: 'User signs a transaction to allow the lending contract to transfer tokens on their behalf.',
    why: "Required for the lending contract to transfer tokens from the user's wallet to the lending pool.",
    codeSnippet:
      '// Approve token spending\nasync function approveTokens(amount) {\n  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);\n  const tx = await tokenContract.approve(LENDING_POOL_ADDRESS, ethers.utils.parseEther(amount));\n  await tx.wait();\n  return tx.hash;\n}',
    label: 'Approve Token Spending',
  },

  // 3. Deposit Collateral
  {
    title: '3. Deposit Collateral',
    description: 'User deposits collateral into the lending pool.',
    what: "Tokens are transferred from the user's wallet to the lending pool as collateral.",
    why: 'Collateral is required to secure the loan and protect the protocol from default risk.',
    codeSnippet:
      '// Deposit collateral\nfunction depositCollateral(address asset, uint256 amount, address onBehalfOf) external {\n  require(amount > 0, "Cannot deposit 0 tokens");\n  \n  // Transfer tokens from user to lending pool\n  IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);\n  \n  // Update user collateral balance\n  userCollateral[onBehalfOf][asset] += amount;\n  totalCollateral[asset] += amount;\n  \n  // Update collateral timestamp\n  lastCollateralUpdate[onBehalfOf] = block.timestamp;\n  \n  emit CollateralDeposited(onBehalfOf, asset, amount);\n}',
    label: 'Deposit Collateral',
  },

  // 4. Collateral Locked
  {
    title: '4. Collateral Locked',
    description: 'Collateral is locked in the lending pool.',
    what: 'The lending pool locks the collateral and calculates its value using price oracle data.',
    why: 'Locked collateral secures the loan and determines how much the user can borrow.',
    codeSnippet:
      '// Calculate collateral value\nfunction calculateCollateralValue(address user) public view returns (uint256) {\n  uint256 totalValue = 0;\n  \n  // Iterate through all collateral assets\n  for (uint i = 0; i < collateralAssets.length; i++) {\n    address asset = collateralAssets[i];\n    uint256 amount = userCollateral[user][asset];\n    \n    if (amount > 0) {\n      // Get asset price from oracle\n      uint256 price = priceOracle.getAssetPrice(asset);\n      \n      // Calculate value with collateral factor\n      uint256 collateralFactor = collateralFactors[asset];\n      uint256 value = amount * price * collateralFactor / (10**18);\n      \n      totalValue += value;\n    }\n  }\n  \n  return totalValue;\n}',
    label: 'Collateral Locked',
  },

  // 5. Borrow Assets
  {
    title: '5. Borrow Assets',
    description: 'User borrows assets against their collateral.',
    what: 'Based on the collateral value, the user can borrow assets from the lending pool.',
    why: 'Allows users to access liquidity while still maintaining ownership of their collateral assets.',
    codeSnippet:
      '// Borrow assets\nfunction borrow(address asset, uint256 amount, address onBehalfOf) external {\n  // Check if user has enough collateral\n  uint256 collateralValue = calculateCollateralValue(onBehalfOf);\n  uint256 borrowedValue = calculateBorrowedValue(onBehalfOf);\n  \n  // Calculate new borrowed value including this borrow\n  uint256 assetPrice = priceOracle.getAssetPrice(asset);\n  uint256 newBorrowValue = borrowedValue + (amount * assetPrice / 10**18);\n  \n  // Check if health factor is still valid after borrow\n  require(collateralValue >= newBorrowValue * HEALTH_FACTOR_THRESHOLD / 10**18, "Health factor too low");\n  \n  // Update user borrowed balance\n  userBorrows[onBehalfOf][asset] += amount;\n  totalBorrows[asset] += amount;\n  \n  // Calculate and store interest rate\n  uint256 interestRate = interestModel.calculateBorrowRate(asset, totalBorrows[asset], totalLiquidity[asset]);\n  userBorrowRates[onBehalfOf][asset] = interestRate;\n  \n  // Transfer borrowed tokens to user\n  IERC20(asset).safeTransfer(onBehalfOf, amount);\n  \n  emit Borrowed(onBehalfOf, asset, amount, interestRate);\n}',
    label: 'Borrow Assets',
  },

  // 6. Health Factor Monitoring
  {
    title: '6. Health Factor Monitoring',
    description: 'The protocol continuously monitors the health factor of the loan.',
    what: 'The health factor is calculated based on the ratio of collateral value to borrowed value.',
    why: 'Ensures the loan remains overcollateralized and helps prevent liquidations.',
    codeSnippet:
      '// Calculate health factor\nfunction calculateHealthFactor(address user) public view returns (uint256) {\n  uint256 collateralValue = calculateCollateralValue(user);\n  uint256 borrowedValue = calculateBorrowedValue(user);\n  \n  if (borrowedValue == 0) {\n    return type(uint256).max; // Max value if no borrows\n  }\n  \n  // Health factor = collateral value / borrowed value\n  return collateralValue * 10**18 / borrowedValue;\n}\n\n// Check if account is at liquidation risk\nfunction isLiquidationRisk(address user) public view returns (bool) {\n  uint256 healthFactor = calculateHealthFactor(user);\n  return healthFactor < LIQUIDATION_THRESHOLD;\n}',
    label: 'Health Factor Monitoring',
  },

  // 7. Liquidation Risk
  {
    title: '7. Liquidation Risk',
    description: 'If the health factor drops below the threshold, the loan is at risk of liquidation.',
    what: 'Price fluctuations or interest accrual can cause the health factor to decrease.',
    why: 'Liquidation mechanism protects the protocol from bad debt when collateral value falls.',
    codeSnippet:
      '// Liquidation function\nfunction liquidate(address user, address collateralAsset, address debtAsset, uint256 debtAmount) external {\n  // Check if account is eligible for liquidation\n  require(isLiquidationRisk(user), "Health factor not below threshold");\n  \n  // Calculate max liquidatable amount (50% of debt)\n  uint256 maxLiquidatable = userBorrows[user][debtAsset] * LIQUIDATION_CLOSE_FACTOR / 10**18;\n  require(debtAmount <= maxLiquidatable, "Amount exceeds max liquidatable");\n  \n  // Calculate collateral to seize with bonus\n  uint256 debtAssetPrice = priceOracle.getAssetPrice(debtAsset);\n  uint256 collateralAssetPrice = priceOracle.getAssetPrice(collateralAsset);\n  \n  uint256 debtValue = debtAmount * debtAssetPrice / 10**18;\n  uint256 collateralToSeize = debtValue * (10**18 + LIQUIDATION_BONUS) / collateralAssetPrice / 10**18;\n  \n  // Update balances\n  userBorrows[user][debtAsset] -= debtAmount;\n  totalBorrows[debtAsset] -= debtAmount;\n  userCollateral[user][collateralAsset] -= collateralToSeize;\n  totalCollateral[collateralAsset] -= collateralToSeize;\n  \n  // Transfer debt tokens from liquidator to pool\n  IERC20(debtAsset).safeTransferFrom(msg.sender, address(this), debtAmount);\n  \n  // Transfer collateral to liquidator\n  IERC20(collateralAsset).safeTransfer(msg.sender, collateralToSeize);\n  \n  emit Liquidated(user, collateralAsset, debtAsset, debtAmount, collateralToSeize, msg.sender);\n}',
    label: 'Liquidation Risk',
  },

  // 8. Repay Loan
  {
    title: '8. Repay Loan',
    description: 'User repays their loan with interest.',
    what: 'User transfers borrowed tokens plus accrued interest back to the lending pool.',
    why: 'Repaying the loan reduces debt and improves the health factor.',
    codeSnippet:
      '// Repay loan\nfunction repay(address asset, uint256 amount, address onBehalfOf) external {\n  // Calculate accrued interest\n  uint256 borrowBalance = userBorrows[onBehalfOf][asset];\n  require(borrowBalance > 0, "No active loan for this asset");\n  \n  // Calculate total repayment with interest\n  uint256 interest = calculateAccruedInterest(onBehalfOf, asset);\n  uint256 totalDebt = borrowBalance + interest;\n  \n  // Cap repayment at total debt\n  uint256 repayAmount = amount > totalDebt ? totalDebt : amount;\n  \n  // Update user borrowed balance\n  userBorrows[onBehalfOf][asset] -= repayAmount > borrowBalance ? borrowBalance : repayAmount;\n  totalBorrows[asset] -= repayAmount > borrowBalance ? borrowBalance : repayAmount;\n  \n  // Transfer repayment tokens from user to lending pool\n  IERC20(asset).safeTransferFrom(msg.sender, address(this), repayAmount);\n  \n  emit LoanRepaid(onBehalfOf, asset, repayAmount);\n}',
    label: 'Repay Loan',
  },

  // 9. Loan Closed
  {
    title: '9. Loan Closed',
    description: 'The loan is fully repaid and closed.',
    what: "The lending pool updates the user's loan status to closed.",
    why: 'Closing the loan allows the user to withdraw their collateral.',
    codeSnippet:
      '// Check if loan is fully repaid\nfunction isLoanClosed(address user, address asset) public view returns (bool) {\n  return userBorrows[user][asset] == 0;\n}\n\n// Get all active loans\nfunction getActiveLoans(address user) external view returns (address[] memory) {\n  uint256 count = 0;\n  \n  // Count active loans\n  for (uint256 i = 0; i < borrowAssets.length; i++) {\n    if (userBorrows[user][borrowAssets[i]] > 0) {\n      count++;\n    }\n  }\n  \n  // Create array of active loan assets\n  address[] memory activeLoans = new address[](count);\n  uint256 index = 0;\n  \n  for (uint256 i = 0; i < borrowAssets.length; i++) {\n    if (userBorrows[user][borrowAssets[i]] > 0) {\n      activeLoans[index] = borrowAssets[i];\n      index++;\n    }\n  }\n  \n  return activeLoans;\n}',
    label: 'Loan Closed',
  },

  // 10. Withdraw Collateral
  {
    title: '10. Withdraw Collateral',
    description: 'User withdraws their collateral from the lending pool.',
    what: 'After repaying the loan, the user can withdraw their collateral.',
    why: 'Returns the locked collateral to the user after loan obligations are met.',
    codeSnippet:
      '// Withdraw collateral\nfunction withdrawCollateral(address asset, uint256 amount) external {\n  // Check if user has enough collateral\n  require(userCollateral[msg.sender][asset] >= amount, "Insufficient collateral balance");\n  \n  // Calculate new collateral value after withdrawal\n  uint256 newCollateralValue = calculateCollateralValue(msg.sender);\n  uint256 assetPrice = priceOracle.getAssetPrice(asset);\n  uint256 withdrawValue = amount * assetPrice / 10**18;\n  newCollateralValue -= withdrawValue;\n  \n  // Check if health factor is still valid after withdrawal\n  uint256 borrowedValue = calculateBorrowedValue(msg.sender);\n  require(borrowedValue == 0 || newCollateralValue >= borrowedValue * HEALTH_FACTOR_THRESHOLD / 10**18, "Health factor too low");\n  \n  // Update user collateral balance\n  userCollateral[msg.sender][asset] -= amount;\n  totalCollateral[asset] -= amount;\n  \n  // Transfer collateral tokens back to user\n  IERC20(asset).safeTransfer(msg.sender, amount);\n  \n  emit CollateralWithdrawn(msg.sender, asset, amount);\n}',
    label: 'Withdraw Collateral',
  },

  // 11. Transaction Complete
  {
    title: '11. Transaction Complete',
    description: 'The lending/borrowing cycle is completed.',
    what: 'All transactions are finalized and the user has their assets back.',
    why: 'Provides closure to the lending/borrowing operation and updates the system state.',
    codeSnippet:
      '// Get user account summary\nfunction getUserAccountData(address user) external view returns (\n  uint256 totalCollateralETH,\n  uint256 totalDebtETH,\n  uint256 availableBorrowsETH,\n  uint256 currentLiquidationThreshold,\n  uint256 ltv,\n  uint256 healthFactor\n) {\n  totalCollateralETH = calculateCollateralValue(user);\n  totalDebtETH = calculateBorrowedValue(user);\n  \n  // Calculate available borrows\n  ltv = calculateLoanToValueRatio(user);\n  availableBorrowsETH = totalCollateralETH * ltv / 10**18 - totalDebtETH;\n  \n  // Get liquidation threshold\n  currentLiquidationThreshold = LIQUIDATION_THRESHOLD;\n  \n  // Calculate health factor\n  healthFactor = calculateHealthFactor(user);\n  \n  return (totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold, ltv, healthFactor);\n}',
    label: 'Transaction Complete',
  },
];

export const stepData: StepData[] = [
  { label: 'Connect Wallet', description: 'User connects their wallet to the lending platform.' },
  { label: 'Approve Token Spending', description: 'User approves the lending contract to spend their tokens.' },
  { label: 'Deposit Collateral', description: 'User deposits collateral into the lending pool.' },
  { label: 'Collateral Locked', description: 'Collateral is locked in the lending pool.' },
  { label: 'Borrow Assets', description: 'User borrows assets against their collateral.' },
  {
    label: 'Health Factor Monitoring',
    description: 'The protocol continuously monitors the health factor of the loan.',
  },
  {
    label: 'Liquidation Risk',
    description: 'If the health factor drops below the threshold, the loan is at risk of liquidation.',
  },
  { label: 'Repay Loan', description: 'User repays their loan with interest.' },
  { label: 'Loan Closed', description: 'The loan is fully repaid and closed.' },
  { label: 'Withdraw Collateral', description: 'User withdraws their collateral from the lending pool.' },
  { label: 'Transaction Complete', description: 'The lending/borrowing cycle is completed.' },
];
