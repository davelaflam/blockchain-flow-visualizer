import {
  Home as HomeIcon,
  AccountBalance as TokenIcon,
  Lock as LockIcon,
  EventNote as CronIcon,
  StackedLineChart as StakingIcon,
  SyncAlt as BridgeIcon,
  SwapHoriz as DexIcon,
  HowToVote as GovernanceIcon,
  AccountBalanceWallet as LendingIcon,
} from '@mui/icons-material';
import React from 'react';

// Define the route interface
export interface AppRoute {
  id: string;
  path: string;
  name: string;
  description?: string;
  homeDescription?: string; // Longer description for HomePage
  icon?: React.ElementType;
  element?: React.ComponentType;
  showInNav?: boolean;
  showInHome?: boolean;
}

// Import page components
const HomePage = React.lazy(() => import('../pages/HomePage'));
const QarTokenPage = React.lazy(() => import('../pages/QarTokenPage'));
const QarTokenCronPage = React.lazy(() => import('../pages/QarTokenCronPage'));
const MultisigMintUsdaPage = React.lazy(() => import('../pages/MultisigMintUsdaPage'));
const MultisigBurnUsdaPage = React.lazy(() => import('../pages/MultisigBurnUsdaPage'));
const StakingPage = React.lazy(() => import('../pages/StakingPage'));
const CrossChainBridgePage = React.lazy(() => import('../pages/CrossChainBridgePage'));
const DexPage = React.lazy(() => import('../pages/DexPage'));
const GovernancePage = React.lazy(() => import('../pages/GovernancePage'));
const LendingPage = React.lazy(() => import('../pages/LendingPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// Define all application routes
export const routes: AppRoute[] = [
  {
    id: 'home',
    path: '/',
    name: 'Home',
    description: 'Main dashboard',
    icon: HomeIcon,
    element: HomePage,
    showInNav: true,
    showInHome: false,
  },
  {
    id: 'qar-token',
    path: '/qar-token',
    name: 'QAR Token',
    description: 'QAR token lifecycle from creation to redemption',
    homeDescription:
      'Visualize the complete lifecycle of QAR tokens, including deposit, minting, and withdrawal processes. This flow demonstrates how users interact with the blockchain to manage their QAR tokens securely and efficiently.',
    icon: TokenIcon,
    element: QarTokenPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'qar-token-cron',
    path: '/qar-token/cron',
    name: 'QAR Token Cron',
    description: 'Automated token maintenance and scheduled operations',
    homeDescription:
      'Explore the automated maintenance processes for QAR tokens managed by scheduled cron jobs. This visualization shows how blockchain systems use automation to ensure token integrity, perform reconciliation, and maintain system health without manual intervention.',
    icon: CronIcon,
    element: QarTokenCronPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'multisig-minting',
    path: '/multisig/mint-usda',
    name: 'Multisig Minting',
    description: 'Secure token minting via multi-signature approval',
    homeDescription:
      'Discover the secure process of minting USDA tokens through a decentralized multi-signature approval system. This visualization demonstrates how multiple authorized signers must approve transactions, providing enhanced security and preventing single points of failure in the minting process.',
    icon: LockIcon,
    element: MultisigMintUsdaPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'multisig-burning',
    path: '/multisig/burn-usda',
    name: 'Multisig Burning',
    description: 'Secure token burning via multi-signature approval',
    homeDescription:
      'Explore the secure process of burning USDA tokens through a decentralized multi-signature approval system. This visualization shows how token burning requests are validated by multiple authorized signers before execution, ensuring maximum security and transparency.',
    icon: LockIcon,
    element: MultisigBurnUsdaPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'token-staking',
    path: '/staking',
    name: 'Staking',
    description: 'Token staking, rewards, and yield generation',
    homeDescription:
      'Visualize the complete token staking lifecycle from deposit to reward distribution. This flow demonstrates how users stake their tokens to earn passive income through network participation while providing security to the protocol.',
    icon: StakingIcon,
    element: StakingPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'cross-chain-bridge',
    path: '/cross-chain-bridge',
    name: 'Cross-Chain Bridge',
    description: 'Secure asset transfers across different blockchains',
    homeDescription:
      'Learn how tokens are transferred securely between different blockchain networks using cross-chain bridge technology. This visualization illustrates the complete bridging process, including locking tokens on the source chain, verifying transactions through validators, and minting equivalent tokens on the destination chain.',
    icon: BridgeIcon,
    element: CrossChainBridgePage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'dex',
    path: '/dex',
    name: 'DEX',
    description: 'Decentralized token swaps and liquidity provision',
    homeDescription:
      'Explore the mechanics of decentralized exchanges where users can swap tokens and provide liquidity without intermediaries. This visualization shows the automated market maker model, liquidity pools, and how price discovery works in a permissionless trading environment.',
    icon: DexIcon,
    element: DexPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'governance',
    path: '/governance',
    name: 'Governance',
    description: 'DAO proposal lifecycle and community voting',
    homeDescription:
      'Understand how decentralized governance works through the complete lifecycle of a DAO proposal. This visualization illustrates how community members create proposals, discuss changes, vote based on token holdings, and implement approved protocol modifications.',
    icon: GovernanceIcon,
    element: GovernancePage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'lending',
    path: '/lending',
    name: 'Lending',
    description: 'Decentralized lending, borrowing, and liquidations',
    homeDescription:
      'Explore the complete process of collateralized lending and borrowing in DeFi protocols. This visualization demonstrates how users deposit assets as collateral, borrow against their positions, manage health factors to avoid liquidation, and how the system maintains solvency.',
    icon: LendingIcon,
    element: LendingPage,
    showInNav: true,
    showInHome: true,
  },
  {
    id: 'not-found',
    path: '*',
    name: 'Not Found',
    element: NotFoundPage,
    showInNav: false,
    showInHome: false,
  },
];

// Helper functions to get routes for specific purposes
export const getNavRoutes = () => routes.filter(route => route.showInNav);
export const getHomeRoutes = () => routes.filter(route => route.showInHome);
export const getRouteByPath = (path: string) => routes.find(route => route.path === path);
