import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ActionStatus = 'idle' | 'processing' | 'awaiting' | 'confirming' | 'completed' | 'error';
export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'active'
  | 'passed'
  | 'rejected'
  | 'queued'
  | 'executed'
  | 'cancelled';
export type VoteType = 'for' | 'against' | 'abstain';

interface GovernanceState {
  // Flow state
  step: number;
  isPlaying: boolean;
  activeTab: 'create' | 'vote' | 'execute' | 'success';
  isModalOpen: boolean;
  modalStep: number;

  // Proposal state
  proposalStatus: ProposalStatus;
  proposalTitle: string;
  proposalDescription: string;
  proposalCreator: string;
  proposalId: string;
  proposalTargets: string[];
  proposalValues: number[];
  proposalSignatures: string[];
  proposalCalldatas: string[];

  // Voting state
  votingStatus: ActionStatus;
  votingStartBlock: number;
  votingEndBlock: number;
  currentBlock: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorumVotes: number;
  hasVoted: boolean;
  voteType: VoteType | null;

  // Dynamic parameters
  totalSupply: number;
  quorumPercentage: number;
  proposalThreshold: number;
  useSnapshot: boolean;

  // Timelock state
  timelockStatus: ActionStatus;
  timelockDelay: number;
  timelockEta: number;
  currentTimestamp: number;

  // Execution state
  executionStatus: ActionStatus;

  // Flow actions
  setStep: (step: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setActiveTab: (tab: 'create' | 'vote' | 'execute' | 'success') => void;
  openModal: (step: number) => void;
  closeModal: () => void;

  // Proposal actions
  createProposal: (title: string, description: string, targets: string[]) => Promise<string>;
  submitProposal: () => void;
  cancelProposal: () => Promise<void>;
  updateProposalStatus: (status: ProposalStatus) => void;

  // Voting actions
  castVote: (voteType: VoteType) => Promise<void>;
  updateVotingStatus: (status: ActionStatus) => void;
  advanceVotingPeriod: () => void;

  // Timelock actions
  queueProposal: () => void;
  updateTimelockStatus: (status: ActionStatus) => void;
  advanceTimelock: () => void;

  // Execution actions
  executeProposal: () => void;
  updateExecutionStatus: (status: ActionStatus) => void;

  // Dynamic parameter actions
  setTotalSupply: (totalSupply: number) => void;
  setQuorumPercentage: (percentage: number) => void;
  setProposalThreshold: (threshold: number) => void;
  setUseSnapshot: (useSnapshot: boolean) => void;
  updateQuorumVotes: () => void;
}

export const useGovernanceStore = create<GovernanceState>()(
  devtools(
    (set, get) =>
      ({
        // Initial state
        step: 0,
        isPlaying: false,
        activeTab: 'create',
        isModalOpen: false,
        modalStep: 0,

        // Proposal state
        proposalStatus: 'draft',
        proposalTitle: '',
        proposalDescription: '',
        proposalCreator: '0x' + Math.random().toString(16).substring(2, 42),
        proposalId: '',
        proposalTargets: [],
        proposalValues: [],
        proposalSignatures: [],
        proposalCalldatas: [],

        // Voting state
        votingStatus: 'idle',
        votingStartBlock: 0,
        votingEndBlock: 0,
        currentBlock: 0,
        forVotes: 0,
        againstVotes: 0,
        abstainVotes: 0,
        quorumVotes: Math.max(1, Math.floor((1000 * 10) / 100)), // 10% of 1000 = 100
        hasVoted: false,
        voteType: null,

        // Timelock state
        timelockStatus: 'idle',
        timelockDelay: 172800, // 2 days in seconds
        timelockEta: 0,
        currentTimestamp: Math.floor(Date.now() / 1000),

        // Dynamic parameters
        totalSupply: 1000,
        quorumPercentage: 10,
        proposalThreshold: 50,
        useSnapshot: false,

        // Execution state
        executionStatus: 'idle',

        // Flow actions
        setStep: step => set({ step }),
        setActiveTab: tab => set({ activeTab: tab as 'create' | 'vote' | 'execute' | 'success' }),
        openModal: modalStep => set({ isModalOpen: true, modalStep }),
        closeModal: () => set({ isModalOpen: false }),
        /**
         * Advances to the next step in the governance flow, up to a maximum of step 13.
         * Also, automatically switches the active tab based on the current step.
         */
        nextStep: async () => {
          const { step } = get();
          // Handle any async validation here if needed
          set({ step: Math.min(step + 1, 13) });

          // Auto-switch tabs based on the step
          if (step >= 1 && step < 5) {
            set({ activeTab: 'vote' });
          } else if (step >= 5) {
            set({ activeTab: 'execute' });
          }

          return Promise.resolve();
        },
        /**
         * Moves back to the previous step in the governance flow, with a minimum of step 0.
         */
        prevStep: () => set(state => ({ step: Math.max(state.step - 1, 0) })),

        /**
         * Sets the isPlaying state to true to start the automatic progression of steps.
         */
        play: () => set({ isPlaying: true }),

        /**
         * Sets the isPlaying state to false to pause the automatic progression of steps.
         */
        pause: () => set({ isPlaying: false }),

        /**
         * Resets the governance store to its initial state.
         * This includes resetting the step, proposal status, voting status, and all parameters.
         */
        reset: () => {
          set({
            step: 0,
            isPlaying: false,
            proposalStatus: 'draft',
            proposalTitle: '',
            proposalDescription: '',
            proposalId: '',
            votingStatus: 'idle',
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            hasVoted: false,
            voteType: null,
            timelockStatus: 'idle',
            timelockEta: 0,
            executionStatus: 'idle',
            // Reset dynamic parameters to their initial values
            totalSupply: 1000,
            quorumPercentage: 10,
            proposalThreshold: 50,
            useSnapshot: false,
          });
          // Recalculate quorumVotes based on reset values
          get().updateQuorumVotes();
        },

        // Proposal actions
        /**
         * Creates a new governance proposal with the specified title, description, and target contracts.
         * @param title The title of the proposal
         * @param description The detailed description of the proposal
         * @param targets An array of target contract addresses that the proposal will interact with
         * @returns {Promise<string>} A promise that resolves to the proposal ID
         */
        createProposal: async (title, description, targets) => {
          set({
            proposalStatus: 'draft',
            proposalTitle: title,
            proposalDescription: description,
            proposalTargets: targets,
            proposalValues: targets.map(() => 0),
            proposalSignatures: targets.map(() => ''),
            proposalCalldatas: targets.map(() => '0x'),
          });

          // Simulate proposal creation
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const proposalId = '0x' + Math.random().toString(16).substring(2, 66);
              set({ proposalId });
              resolve(proposalId);
            }, 1000);
          });
        },

        /**
         * Submits a created proposal to start the voting process.
         * Sets the proposal status to 'submitted' and calculates the voting period.
         * @returns {void}
         */
        submitProposal: () => {
          const { proposalId } = get();
          if (!proposalId) return;

          set({
            proposalStatus: 'submitted',
            votingStartBlock: get().currentBlock + 10, // 10 blocks delay
            votingEndBlock: get().currentBlock + 10 + 100, // 100 blocks voting period
          });
        },

        /**
         * Cancels an existing proposal.
         * Sets the proposal status to 'cancelled' and moves to the cancellation step.
         * @returns {Promise<void>} A promise that resolves when the cancellation is complete
         */
        cancelProposal: async () => {
          const { proposalId } = get();
          if (!proposalId) return;

          set({ proposalStatus: 'cancelled' });

          // Simulate proposal cancellation
          return new Promise<void>(resolve => {
            setTimeout(() => {
              set({ step: 11 }); // Move to the cancellation step
              resolve();
            }, 1000);
          });
        },

        updateProposalStatus: status => set({ proposalStatus: status }),

        // Voting actions
        /**
         * Casts a vote on the current proposal.
         * @param voteType The type of vote to cast ('for', 'against', or 'abstain')
         * @returns {Promise<void>} A promise that resolves when the vote is cast
         */
        castVote: async voteType => {
          set({ votingStatus: 'processing' });

          // Simulate vote casting
          return new Promise<void>(resolve => {
            setTimeout(() => {
              set(state => {
                const voteWeight = 10 + Math.floor(Math.random() * 20); // Random vote weight between 10-30

                let newForVotes = state.forVotes;
                let newAgainstVotes = state.againstVotes;
                let newAbstainVotes = state.abstainVotes;

                if (voteType === 'for') {
                  newForVotes += voteWeight;
                } else if (voteType === 'against') {
                  newAgainstVotes += voteWeight;
                } else {
                  newAbstainVotes += voteWeight;
                }

                return {
                  votingStatus: 'completed',
                  hasVoted: true,
                  voteType,
                  forVotes: newForVotes,
                  againstVotes: newAgainstVotes,
                  abstainVotes: newAbstainVotes,
                };
              });
              resolve();
            }, 1500);
          });
        },

        updateVotingStatus: status => set({ votingStatus: status }),

        advanceVotingPeriod: () => {
          set(state => {
            const newBlock = state.currentBlock + 10;

            // Check if voting period has ended
            if (newBlock >= state.votingEndBlock) {
              // Determine if proposal passed or failed
              const passed = state.forVotes > state.againstVotes && state.forVotes >= state.quorumVotes;

              return {
                currentBlock: newBlock,
                proposalStatus: passed ? 'passed' : 'rejected',
              };
            }

            return { currentBlock: newBlock };
          });
        },

        // Timelock actions
        /**
         * Queues a passed proposal in the timelock.
         * Sets the proposal status to 'queued' and calculates the execution time (ETA).
         * @returns {void}
         */
        queueProposal: () => {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const eta = currentTimestamp + get().timelockDelay;

          set({
            timelockStatus: 'awaiting',
            timelockEta: eta,
            proposalStatus: 'queued',
          });
        },

        updateTimelockStatus: status => set({ timelockStatus: status }),

        advanceTimelock: () => {
          set(state => {
            const newTimestamp = state.currentTimestamp + 86400; // Advance by 1 day

            // Check if timelock period has ended
            if (newTimestamp >= state.timelockEta) {
              return {
                currentTimestamp: newTimestamp,
                timelockStatus: 'completed',
              };
            }

            return { currentTimestamp: newTimestamp };
          });
        },

        // Execution actions
        /**
         * Executes a queued proposal after the timelock period has passed.
         * Sets the execution status to 'processing' and then to 'completed' after a delay.
         * Also updates the proposal status to 'executed'.
         * @returns {void}
         */
        executeProposal: () => {
          set({
            executionStatus: 'processing',
          });

          // Simulate execution
          setTimeout(() => {
            set({
              executionStatus: 'completed',
              proposalStatus: 'executed',
            });
          }, 2000);
        },

        updateExecutionStatus: status => set({ executionStatus: status }),

        // Dynamic parameter actions
        setTotalSupply: totalSupply => {
          set({ totalSupply });
          get().updateQuorumVotes();
        },
        setQuorumPercentage: percentage => {
          set({ quorumPercentage: Math.max(1, percentage) });
          get().updateQuorumVotes();
        },
        setProposalThreshold: threshold => set({ proposalThreshold: threshold }),
        setUseSnapshot: useSnapshot => set({ useSnapshot }),
        updateQuorumVotes: () => {
          const { totalSupply, quorumPercentage } = get();
          const quorumVotes = Math.max(1, Math.floor((totalSupply * quorumPercentage) / 100));
          set({ quorumVotes });
        },
      }) satisfies GovernanceState,
    { name: 'Governance Flow Store' }
  )
);
