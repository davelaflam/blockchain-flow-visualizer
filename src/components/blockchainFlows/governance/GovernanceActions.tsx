import InboxIcon from '@mui/icons-material/Inbox';
import {
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Divider,
  styled,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import React from 'react';

import { logError } from '../../../services/logger';
import { useGovernanceStore } from '../../../store/governanceStore';
import { uiColors } from '../../../theme/colors';
import { TokenActionButton, TokenActionModal, ProgressBar } from '../../common';

type VoteType = 'for' | 'against' | 'abstain';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = props => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`governance-tabpanel-${index}`}
      aria-labelledby={`governance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const getTabFromStep = (step: number): number => {
  if (step < 1) return 0; // Create tab
  if (step < 5) return 1; // Vote tab
  return 2; // Execute tab
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  background: 'rgba(26, 32, 44, 0.7)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)',
  color: theme.palette.text.primary,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: '24px',
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '2px',
  },
  '& .MuiTabs-flexContainer': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '0 16px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '15px',
  marginRight: '32px',
  minWidth: 'auto',
  padding: '16px 0',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

interface GovernanceActionsProps {}

interface FormData {
  title: string;
  description: string;
  targets: string[];
  targetContract: string;
}

const GovernanceActions: React.FC<GovernanceActionsProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isVoting, setIsVoting] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedVote, setSelectedVote] = React.useState<VoteType | null>(null);
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    targets: [''],
    targetContract: '',
  });

  const {
    step = 0,
    activeTab = 'create',
    setActiveTab,
    isModalOpen = false,
    modalStep = 0,
    openModal,
    closeModal,
    nextStep,
    proposalStatus = 'draft',
    proposalTitle = '',
    proposalId = '',
    forVotes = 0,
    againstVotes = 0,
    abstainVotes = 0,
    quorumVotes = 0,
    timelockEta = 0,
    totalSupply = 1000,
    quorumPercentage = 10,
    proposalThreshold = 50,
    useSnapshot = false,
    setTotalSupply,
    setQuorumPercentage,
    setProposalThreshold,
    setUseSnapshot,
    createProposal = () => '',
    cancelProposal = async () => {},
    castVote = async () => {},
    queueProposal = async () => {},
    executeProposal = async () => {},
    hasVoted = false,
    voteType = null,
    votingStatus = 'idle',
    executionStatus = 'idle',
  } = useGovernanceStore();

  /**
   * Handles tab change between Create, Vote, and Execute tabs.
   * Updates the active tab in the store based on the tab index.
   * @param _ The React synthetic event (unused)
   * @param newValue The index of the new tab
   */
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // Update active tab in store based on the tab index
    const tabMap = ['create', 'vote', 'execute'] as const;
    setActiveTab(tabMap[newValue]);
  };

  // Modal and action handlers
  /**
   * Handles closing the modal.
   * Only closes the modal if no processing is in progress.
   */
  const handleModalClose = React.useCallback(() => {
    if (!isProcessing) {
      closeModal();
    }
  }, [isProcessing, closeModal]);

  /**
   * Handles vote submission on a proposal.
   * Sets the voting state, casts the vote, shows success message,
   * closes the modal, and advances to the next step.
   * @throws {Error} If there's an error casting the vote
   */
  const handleVoteClick = React.useCallback(async () => {
    if (!selectedVote) return;

    try {
      setIsVoting(true);
      await castVote(selectedVote);
      setSelectedVote(selectedVote);
      setActiveTab('success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      closeModal();
      await nextStep();
    } catch (error) {
      logError('Error casting vote:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  }, [selectedVote, castVote, setActiveTab, closeModal, nextStep]);

  /**
   * Handles queuing a passed proposal in the timelock.
   * Sets the processing state, queues the proposal, shows success message,
   * closes the modal, and advances to the next step.
   * @throws {Error} If there's an error queuing the proposal
   */
  const handleQueueProposal = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      await queueProposal();
      setActiveTab('success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      closeModal();
      await nextStep();
    } catch (error) {
      logError('Error queuing proposal:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [queueProposal, setActiveTab, closeModal, nextStep]);

  /**
   * Handles executing a queued proposal after the timelock period.
   * Sets the processing state, executes the proposal, shows success message,
   * closes the modal, and advances to the next step.
   * @throws {Error} If there's an error executing the proposal
   */
  const handleExecuteProposal = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      await executeProposal();
      setActiveTab('success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      closeModal();
      await nextStep();
    } catch (error) {
      logError('Error executing proposal:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [executeProposal, setActiveTab, closeModal, nextStep]);

  /**
   * Handles cancelling a proposal.
   * Sets the processing state, cancels the proposal, shows success message,
   * and closes the modal.
   * @throws {Error} If there's an error cancelling the proposal
   */
  const handleCancelProposal = React.useCallback(async () => {
    try {
      setIsProcessing(true);
      await cancelProposal();
      setActiveTab('success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      closeModal();
    } catch (error) {
      logError('Error cancelling proposal:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [cancelProposal, setActiveTab, closeModal]);

  /**
   * Handles creating a new governance proposal.
   * Validates the form data, sets the processing state, creates the proposal,
   * shows success message, closes the modal, and advances to the next step.
   * @throws {Error} If there's an error creating the proposal
   */
  const handleCreateProposal = React.useCallback(async () => {
    if (!formData.title || !formData.description) {
      // Show validation error
      return;
    }

    try {
      setIsProcessing(true);
      await createProposal(
        formData.title,
        formData.description,
        formData.targetContract ? [formData.targetContract] : []
      );
      setActiveTab('success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      closeModal();
      await nextStep();
    } catch (error) {
      logError('Error creating proposal:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [formData, createProposal, setActiveTab, closeModal, nextStep]);

  /**
   * Handles form input changes for the proposal creation form.
   * Updates the form data state with the new values.
   * @param e The React change event from the input field
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ensure component returns JSX
  if (!activeTab) {
    return <div>Loading...</div>;
  }

  // Render proposal creation tab
  const renderProposalTab = () => (
    <Box>
      <Button variant="contained" color="primary" onClick={() => openModal(1)} disabled={step > 0} fullWidth={isMobile}>
        {step > 0 ? 'Proposal Created' : 'Create Proposal'}
      </Button>

      {/* Dynamic Parameters Section */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'rgba(45, 55, 72, 0.5)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme.palette.divider,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Governance Parameters
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Adjust these parameters to simulate different governance scenarios
        </Typography>

        {/* Total Supply Slider */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Total Token Supply</Typography>
            <Typography variant="body2" fontWeight="medium">
              {totalSupply.toLocaleString()}
            </Typography>
          </Box>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={totalSupply}
            onChange={e => setTotalSupply(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Box>

        {/* Quorum Percentage Slider */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Quorum Percentage</Typography>
            <Typography variant="body2" fontWeight="medium">
              {quorumPercentage}%
            </Typography>
          </Box>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={quorumPercentage}
            onChange={e => setQuorumPercentage(Math.max(1, Number(e.target.value)))}
            style={{ width: '100%' }}
          />
          <Typography variant="caption" color="text.secondary">
            {quorumVotes.toLocaleString()} votes needed for quorum
          </Typography>
        </Box>

        {/* Proposal Threshold Slider */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Proposal Threshold</Typography>
            <Typography variant="body2" fontWeight="medium">
              {proposalThreshold.toLocaleString()} tokens
            </Typography>
          </Box>
          <input
            type="range"
            min="10"
            max={Math.min(1000, totalSupply / 2)}
            step="10"
            value={proposalThreshold}
            onChange={e => setProposalThreshold(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <Typography variant="caption" color="text.secondary">
            Tokens required to submit a proposal
          </Typography>
        </Box>

        {/* Snapshot Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2">Use Snapshot for Off-chain Voting</Typography>
          <input type="checkbox" checked={useSnapshot} onChange={e => setUseSnapshot(e.target.checked)} />
        </Box>
      </Box>

      {step > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Proposal Details:
          </Typography>
          <Typography variant="body1">
            <strong>Title:</strong> {proposalTitle}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            <strong>ID:</strong> {proposalId || '0x...'}
          </Typography>

          {/* Cancel Proposal Button - only show if proposal is not executed, rejected, or already cancelled */}
          {step > 0 && step < 9 && proposalStatus !== 'rejected' && proposalStatus !== 'cancelled' && (
            <Box mt={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => openModal(3)}
                startIcon={<span>❌</span>}
                size="small"
              >
                Cancel Proposal
              </Button>
            </Box>
          )}
        </Box>
      )}

      <TokenActionModal
        open={isModalOpen && activeTab === 'create'}
        onClose={handleModalClose}
        title="Create Governance Proposal"
        actionType="custom"
        confirmText="Create Proposal"
        onConfirm={() => {
          void handleCreateProposal();
        }}
        isProcessing={isProcessing}
        maxWidth="sm"
      >
        <TextField
          fullWidth
          name="title"
          label="Proposal Title"
          value={formData.title}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="description"
          multiline
          rows={4}
          label="Proposal Description"
          value={formData.description}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="targetContract"
          label="Target Contract (Optional)"
          value={formData.targetContract}
          onChange={handleInputChange}
          margin="normal"
          placeholder="0x..."
          helperText="The smart contract address this proposal will interact with"
        />
      </TokenActionModal>
    </Box>
  );

  /**
   * Renders the voting tab content, including voting status, results, and actions.
   */
  const renderVotingTab = () => {
    const votePower = 10; // Example vote power based on tokens
    const quorumPercentage = quorumVotes > 0 ? Math.min(100, (forVotes / quorumVotes) * 100) : 0;
    const isQuorumReached = forVotes >= quorumVotes && quorumVotes > 0;
    const votingActive = step >= 3 && step <= 6;

    if (step < 1) {
      return (
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'rgba(45, 55, 72, 0.5)',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          }}
        >
          <InboxIcon
            sx={{
              fontSize: 48,
              opacity: 0.3,
              mb: 1,
              color: theme.palette.text.secondary,
            }}
          />
          <Typography variant="h6" gutterBottom>
            No Active Proposals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a proposal to start the voting process
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setActiveTab('create')} sx={{ mt: 1 }}>
            Create Proposal
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {/* Voting Status Card */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(45, 55, 72, 0.5)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: votingActive ? 'primary.main' : theme.palette.divider,
            boxShadow: votingActive ? '0 0 0 1px ' + theme.palette.primary.main : 'none',
            mb: 3,
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Voting Status</Typography>
            <Chip
              label={votingActive ? 'Voting Active' : 'Voting Not Started'}
              color={votingActive ? 'primary' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>

          {!votingActive ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Voting will begin after the proposal is submitted and the voting period starts.
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Cast your vote below. Your voting power: <strong>{votePower} tokens</strong>
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={() => openModal(2)}
                disabled={hasVoted || !votingActive}
                fullWidth
                sx={{ py: 1.5, mb: 2 }}
              >
                {hasVoted ? `Vote Cast (${voteType})` : 'Cast Vote'}
              </Button>
            </Box>
          )}
        </Box>

        <TokenActionModal
          open={isModalOpen && activeTab === 'vote'}
          onClose={handleModalClose}
          title="Cast Your Vote"
          actionType="custom"
          confirmText="Submit Vote"
          onConfirm={() => {
            void handleVoteClick();
          }}
          isProcessing={isProcessing}
          maxWidth="sm"
        >
          <Typography variant="body1" gutterBottom>
            How would you like to vote on this proposal?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, my: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button
              fullWidth
              variant={selectedVote === 'for' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setSelectedVote('for')}
              startIcon={<span>✅</span>}
              sx={{ py: 1.5, flexDirection: 'column' }}
            >
              <span>For</span>
              <Typography variant="caption" display="block">
                Support the proposal
              </Typography>
            </Button>
            <Button
              fullWidth
              variant={selectedVote === 'against' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setSelectedVote('against')}
              startIcon={<span>❌</span>}
              sx={{ py: 1.5, flexDirection: 'column' }}
            >
              <span>Against</span>
              <Typography variant="caption" display="block">
                Reject the proposal
              </Typography>
            </Button>
            <Button
              fullWidth
              variant={selectedVote === 'abstain' ? 'contained' : 'outlined'}
              color="inherit"
              onClick={() => setSelectedVote('abstain')}
              startIcon={<span>🤝</span>}
              sx={{ py: 1.5, flexDirection: 'column' }}
            >
              <span>Abstain</span>
              <Typography variant="caption" display="block">
                No vote either way
              </Typography>
            </Button>
          </Box>

          {step < 3 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.light',
                borderRadius: 1,
                mt: 2,
              }}
            >
              <Typography variant="body2" color="warning.light">
                ℹ️ The voting period hasn't started yet. Your vote will be registered when voting begins.
              </Typography>
            </Box>
          )}
        </TokenActionModal>

        {/* Voting Results */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(45, 55, 72, 0.5)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.divider,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Voting Results
          </Typography>

          <Box sx={{ mb: 3 }}>
            {/* For Votes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="body2">For</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {forVotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({((forVotes / (forVotes + againstVotes + abstainVotes)) * 100 || 0).toFixed(1)}%)
                </Typography>
              </Box>
            </Box>

            {/* Against Votes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                  }}
                />
                <Typography variant="body2">Against</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {againstVotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({((againstVotes / (forVotes + againstVotes + abstainVotes)) * 100 || 0).toFixed(1)}%)
                </Typography>
              </Box>
            </Box>

            {/* Abstain Votes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                  }}
                />
                <Typography variant="body2">Abstain</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {abstainVotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({((abstainVotes / (forVotes + againstVotes + abstainVotes)) * 100 || 0).toFixed(1)}%)
                </Typography>
              </Box>
            </Box>

            {/* Quorum Progress */}
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Quorum Progress
                  </Typography>
                  {isQuorumReached && (
                    <Chip
                      label="Quorum Reached"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color={isQuorumReached ? 'success.main' : 'text.secondary'}
                  fontWeight={isQuorumReached ? 'bold' : 'normal'}
                >
                  {forVotes} {quorumVotes > 0 ? `/ ${quorumVotes} votes` : 'votes'}
                </Typography>
              </Box>

              <ProgressBar
                value={quorumPercentage}
                max={100}
                color={isQuorumReached ? theme.palette.success.main : theme.palette.primary.main}
                height={8}
              />

              {isQuorumReached ? (
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ display: 'block', mt: 0.5, fontWeight: 'medium' }}
                >
                  ✅ Quorum reached! This proposal will pass if voting ends now.
                </Typography>
              ) : quorumVotes > 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {quorumVotes - forVotes} more votes needed to reach quorum
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  No quorum requirement set
                </Typography>
              )}
            </Box>

            {/* Voting Period Status */}
            {votingActive && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(49, 130, 206, 0.15)',
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: 'info.main',
                  mt: 3,
                }}
              >
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🗳️</span>
                  <span>
                    {step === 3
                      ? 'Voting period is about to start...'
                      : step === 4
                        ? 'Voting is now active! Cast your vote.'
                        : 'Voting period is ending soon. Make sure to vote!'}
                  </span>
                </Typography>
              </Box>
            )}

            {step >= 3 && step <= 6 && (
              <Box mt={2} p={1.5} bgcolor="action.hover" borderRadius={1}>
                <Typography variant="body2">
                  {step === 3
                    ? '🔄 Voting period starting soon...'
                    : step === 4
                      ? '🗳️ Voting is now open!'
                      : '⏳ Voting period ends soon...'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const tabValue = getTabFromStep(step);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: 'auto',
        background: uiColors.darkBackground,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        p: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)',
        mb: 0,
        mt: 2,
        position: 'relative',
        color: theme.palette.text.primary,
      }}
    >
      <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="governance tabs">
        <StyledTab label="Create Proposal" />
        <StyledTab label="Vote" />
        <StyledTab label="Execute" />
      </StyledTabs>

      <TabPanel value={tabValue} index={0}>
        {renderProposalTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderVotingTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proposalId ? (
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Proposal Status
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {proposalTitle || 'Proposal #' + proposalId.substring(0, 8)}
              </Typography>

              {/* Status Indicator */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor:
                      proposalStatus === 'passed'
                        ? 'success.main'
                        : proposalStatus === 'queued'
                          ? 'warning.main'
                          : 'success.main',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" color="text.primary">
                    {proposalStatus === 'passed'
                      ? 'Voting Passed'
                      : proposalStatus === 'queued'
                        ? 'In Timelock'
                        : 'Executed'}
                  </Typography>

                  {/* Status Indicator */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 2,
                      p: 1.5,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor:
                          proposalStatus === 'passed'
                            ? 'success.main'
                            : proposalStatus === 'queued'
                              ? 'warning.main'
                              : 'success.main',
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" color="text.primary">
                        {proposalStatus === 'passed'
                          ? 'Voting Passed'
                          : proposalStatus === 'queued'
                            ? 'In Timelock'
                            : 'Executed'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proposalStatus === 'passed'
                          ? 'This proposal has passed and is ready to be queued.'
                          : proposalStatus === 'queued'
                            ? 'This proposal is in the timelock period.'
                            : 'This proposal has been successfully executed.'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Voting Results */}
                  {(proposalStatus === 'passed' || proposalStatus === 'queued' || proposalStatus === 'executed') && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Voting Results
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                            <Typography variant="body2">For</Typography>
                          </Box>
                          <Typography variant="body2">{forVotes} votes</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                            <Typography variant="body2">Against</Typography>
                          </Box>
                          <Typography variant="body2">{againstVotes} votes</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                            <Typography variant="body2">Abstain</Typography>
                          </Box>
                          <Typography variant="body2">{abstainVotes} votes</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Timelock Info */}
                  {proposalStatus === 'queued' && timelockEta > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: 'rgba(237, 137, 54, 0.15)',
                        borderRadius: 1,
                        borderLeft: '3px solid',
                        borderColor: 'warning.main',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Timelock
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This proposal is in the timelock period and can be executed after:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                        {new Date(timelockEta * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  {proposalStatus === 'passed' && (
                    <TokenActionButton
                      actionType="custom"
                      customLabel="Queue in Timelock"
                      onClick={() => {
                        void handleQueueProposal();
                      }}
                      isLoading={isProcessing}
                      fullWidth
                    />
                  )}

                  {proposalStatus === 'queued' && (
                    <TokenActionButton
                      actionType="custom"
                      customLabel="Execute Proposal"
                      onClick={() => {
                        void handleExecuteProposal();
                      }}
                      isLoading={isProcessing}
                      fullWidth
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                p: 4,
                bgcolor: 'rgba(45, 55, 72, 0.5)',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(74, 85, 104, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <InboxIcon
                  sx={{
                    fontSize: 40,
                    opacity: 0.6,
                    color: theme.palette.text.secondary,
                  }}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                {step < 3 ? 'No Proposal Created' : step < 5 ? 'Voting In Progress' : 'No Executable Proposals'}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: '400px',
                  mx: 'auto',
                  mb: 3,
                  color: theme.palette.text.secondary,
                }}
              >
                {step < 3
                  ? 'Start by creating a new governance proposal to begin the process.'
                  : step < 5
                    ? 'The voting period is currently active. Please wait for it to complete.'
                    : 'No proposals have passed the voting threshold yet.'}
              </Typography>

              {step < 3 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab('create')}
                  startIcon={<span>📝</span>}
                >
                  Create Proposal
                </Button>
              )}

              {step >= 3 && step < 5 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setActiveTab('vote')}
                  startIcon={<span>🗳️</span>}
                >
                  View Voting
                </Button>
              )}
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* Success Modal - Shows after successful actions */}
      {/* Cancel Proposal Modal */}
      <TokenActionModal
        open={isModalOpen && modalStep === 3}
        onClose={handleModalClose}
        title="Cancel Governance Proposal"
        actionType="custom"
        confirmText="Cancel Proposal"
        onConfirm={() => {
          void handleCancelProposal();
        }}
        isProcessing={isProcessing}
        maxWidth="sm"
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="error">
            Are you sure you want to cancel this proposal?
          </Typography>
          <Typography variant="body1" paragraph>
            Cancelling a proposal will permanently remove it from consideration. This action cannot be undone.
          </Typography>
          <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Proposal Details:
            </Typography>
            <Typography variant="body2">
              <strong>Title:</strong> {proposalTitle}
            </Typography>
            <Typography variant="body2">
              <strong>ID:</strong> {proposalId || '0x...'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Note: Only the proposal creator or governance guardians can cancel a proposal.
          </Typography>
        </Box>
      </TokenActionModal>

      <TokenActionModal
        open={isModalOpen && activeTab === 'success'}
        onClose={handleModalClose}
        actionType="custom"
        showConfirm={false}
      >
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            color: theme.palette.text.primary,
          }}
        >
          <Box sx={{ color: 'success.main', mb: 2 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </Box>
          <Typography variant="h6" gutterBottom>
            {activeTab === 'create'
              ? 'Proposal Created!'
              : activeTab === 'vote'
                ? 'Vote Cast!'
                : proposalStatus === 'cancelled'
                  ? 'Proposal Cancelled!'
                  : 'Proposal Executed!'}
          </Typography>
          <Typography variant="body1" paragraph>
            {activeTab === 'create'
              ? 'Your governance proposal has been created and submitted.'
              : activeTab === 'vote'
                ? 'Your vote has been recorded on the proposal.'
                : proposalStatus === 'cancelled'
                  ? 'Your proposal has been cancelled and will not proceed to voting or execution.'
                  : 'Your proposal has been executed successfully! '}
          </Typography>
          {activeTab === 'vote' && (
            <Typography variant="body2" color="text.secondary">
              You voted: <strong>{voteType?.toUpperCase()}</strong>
            </Typography>
          )}
          <Button variant="contained" color="primary" onClick={handleModalClose} sx={{ mt: 3 }} fullWidth>
            Done
          </Button>
        </Box>
      </TokenActionModal>
    </Paper>
  );
};

export default GovernanceActions;
