import { flowNodes, flowEdges } from '../../components/blockchainFlows/governance/flowLayout';
import { stepHighlightMap } from '../../components/blockchainFlows/governance/stepMap';
import { governanceSteps } from '../../components/blockchainFlows/governance/steps';
import env from '../../utils/env';
import { logError, logInfo } from '../logger';

import { AIExplanationResponse, callOpenAI, generateBasePrompt } from './baseAiService';
import { currentProviderHasValidApiKey } from './providers/AIProviderFactory';

export const governanceHardcodedExplanations: Record<number, AIExplanationResponse> = {
  1: {
    explanation:
      'A DAO member initiates the creation of a governance proposal by drafting the proposal details, including the title, description, and target contracts to be modified.',
    technicalDetails:
      'The proposal creator prepares a proposal object containing the target contract addresses, function signatures, call data, and a description. The system generates a unique proposal ID using a hash of these parameters. This is the first step in the on-chain governance process.',
    simplifiedExplanation:
      "Someone is suggesting a change to how the blockchain project works. It's like writing up a motion to be discussed at a community meeting.",
    whatIfScenarios: [
      "What if the proposal creator doesn't have enough voting power? The transaction will revert with an error, preventing the proposal from being created until the creator acquires sufficient governance tokens.",
      'What if the proposal includes an invalid contract address? The transaction will fail when the governance contract attempts to interact with the non-existent or non-compliant contract.',
      "What if the proposal description is missing or too short? The transaction will revert if the description doesn't meet the minimum length requirement set by the governance contract.",
    ],
  },
  2: {
    explanation:
      'The proposal is submitted to the governance smart contract, which validates that the proposer has sufficient voting power and that the proposal meets all requirements.',
    technicalDetails:
      "The propose() function is called on the governance contract with the proposal parameters. The contract verifies that the proposer holds at least the minimum required governance tokens (proposal threshold) and hasn't submitted too many active proposals. It then stores the proposal data on-chain and sets the voting delay and period.",
    simplifiedExplanation:
      'The suggestion is officially submitted to the voting system. The system checks that the person making the suggestion has enough voting tokens to qualify and that the suggestion follows all the rules.',
    whatIfScenarios: [
      "What if the proposer's voting power changes between proposal creation and submission? The governance contract checks the voting power at the time of submission, so any changes in token holdings after creation but before submission could affect the proposal's eligibility.",
      "What if the gas price spikes during submission? The transaction might take longer to process or could be stuck in the mempool, potentially delaying the proposal's activation.",
      'What if the governance parameters (like proposal threshold) change between creation and submission? The submission will use the current parameters, which might be different from when the proposal was created.',
    ],
  },
  3: {
    explanation:
      'The proposal is officially registered on the blockchain with a unique ID, and the governance timeline is established, including the start and end blocks for voting.',
    technicalDetails:
      'The governance contract emits a ProposalCreated event with all proposal details. It sets the startBlock to the current block plus the voting delay, and the endBlock to the startBlock plus the voting period. These parameters are stored in the proposal struct and will control when voting can occur.',
    simplifiedExplanation:
      'The suggestion is now recorded on the blockchain with a unique ID number. The system also sets up the schedule for when voting will start and end.',
    whatIfScenarios: [
      'What if the blockchain experiences congestion when the voting period is supposed to start? The voting period will still begin at the specified block, but users might experience delays in seeing the voting interface update.',
      'What if someone tries to register a duplicate proposal? Each proposal gets a unique ID based on its parameters, so even identical proposals would be treated as separate entities with their own voting periods.',
      'What if the governance contract is upgraded during the registration process? Most governance contracts are upgradeable, but the upgrade would typically be queued and executed after the current governance process completes.',
    ],
  },
  4: {
    explanation:
      'The community engages in discussion about the proposal in the governance forum, asking questions, suggesting improvements, and sharing opinions.',
    technicalDetails:
      'This is primarily an off-chain process where community members discuss the proposal in forums, Discord, or other communication channels. Some DAOs integrate these discussions with on-chain data by linking forum threads to proposal IDs or by using snapshot voting for sentiment analysis before the official on-chain vote.',
    simplifiedExplanation:
      "Community members talk about the suggestion in discussion forums. They ask questions, suggest improvements, and share whether they think it's a good idea or not. This helps everyone understand the proposal before voting.",
    whatIfScenarios: [
      'What if the discussion reveals critical flaws in the proposal? The proposer can choose to cancel the proposal before voting begins, though this typically requires burning the proposal deposit.',
      'What if the discussion becomes contentious? Many DAOs have moderators or community guidelines to ensure discussions remain productive and on-topic.',
      'What if new information comes to light during the discussion period? The proposal cannot be modified once submitted, but the community can factor this new information into their voting decisions.',
    ],
  },
  5: {
    explanation:
      'The voting period officially begins after the voting delay has passed. Token holders can now cast their votes for or against the proposal.',
    technicalDetails:
      "Once the current block number exceeds the proposal's startBlock, the proposal state changes to ACTIVE. The governance contract now accepts vote transactions. The contract tracks the total votes for, against, and abstaining, as well as which addresses have voted to prevent double voting.",
    simplifiedExplanation:
      'After a waiting period, voting officially opens. People who hold governance tokens can now vote yes, no, or abstain on the suggestion.',
    whatIfScenarios: [
      "What if a whale (large token holder) suddenly dumps their tokens after voting? The vote is based on the token balance at the start of the voting period, so subsequent transfers don't affect already-cast votes.",
      'What if the voting period ends in a tie? Most governance systems require a simple majority, so a tie would typically result in the proposal failing.',
      "What if a voter delegates their tokens during the voting period? The voting power is calculated at the start of the voting period, so any delegation changes during voting won't affect the current vote.",
    ],
  },
  6: {
    explanation:
      'Token holders cast their votes on the proposal, with voting power proportional to their token holdings. Each address can only vote once per proposal.',
    technicalDetails:
      "Users call the castVote() function (or variants like castVoteWithReason() or castVoteBySig() for gasless voting) on the governance contract. The contract calculates their voting power based on their token balance at the proposal's startBlock. This prevents flash loan attacks and last-minute token purchases to influence votes.",
    simplifiedExplanation:
      'People are voting on the suggestion. The more governance tokens someone has, the more voting power they have. Each person can only vote once on each suggestion.',
    whatIfScenarios: [
      'What if someone tries to vote twice? The governance contract tracks which addresses have already voted and will reject any subsequent voting attempts from the same address.',
      'What if a voter changes their mind? Most governance systems allow voters to change their vote as long as the voting period is still active.',
      'What if a voter delegates their tokens to someone else after voting? The original vote remains valid, but the delegate can now vote with those tokens in any future proposals.',
    ],
  },
  7: {
    explanation:
      'After the voting period ends, the votes are tallied. If the proposal receives enough "for" votes to meet the required threshold, it passes and moves to the next stage.',
    technicalDetails:
      "Once the current block exceeds the proposal's endBlock, the contract calculates whether the proposal passed by checking if: 1) forVotes > againstVotes, and 2) forVotes >= quorumVotes (minimum votes required). If both conditions are met, the proposal state changes to SUCCEEDED.",
    simplifiedExplanation:
      'Voting has ended, and the votes are being counted. If enough people voted in favor of the suggestion and it reached the minimum required votes (quorum), the suggestion passes and moves to the next step.',
    whatIfScenarios: [
      'What if the proposal passes but with a very slim majority? The proposal will still pass as long as it meets the minimum quorum and has more for than against votes, though some DAOs have additional requirements for more significant changes.',
      "What if there's a technical issue during vote tallying? The process is fully on-chain and deterministic, so the results are calculated the same way by every node in the network.",
      'What if someone tries to manipulate the vote at the last second? The voting power is based on token balances at the start of the voting period, preventing last-minute manipulation.',
    ],
  },
  8: {
    explanation:
      'The passed proposal is queued in the timelock contract, which enforces a mandatory waiting period before execution. This provides a security buffer for users to exit if they disagree with the proposal.',
    technicalDetails:
      'The queue() function is called on the governance contract, which forwards the proposal actions to the timelock contract. The timelock creates a unique transaction hash for each action and stores it with an execution time (current time + delay). The proposal state changes to QUEUED.',
    simplifiedExplanation:
      'The approved suggestion is put in a waiting line for a mandatory delay period. This gives people who disagree with the decision time to exit the system before the changes take effect.',
    whatIfScenarios: [
      'What if the timelock delay is set to zero? This would be a security risk as it would allow immediate execution of proposals without giving users time to react. Most well-designed DAOs have a non-zero delay for critical operations.',
      'What if someone tries to execute the proposal before the timelock expires? The timelock contract will reject any execution attempts before the delay period has fully elapsed.',
      'What if the proposal includes multiple actions? Each action will be queued separately with its own execution timestamp, and they can be executed individually once their respective delays have passed.',
    ],
  },
  9: {
    explanation:
      'After the timelock delay has passed, the proposal can be executed. This triggers the actual on-chain changes specified in the proposal.',
    technicalDetails:
      'The execute() function is called on the governance contract, which forwards the execution request to the timelock. The timelock verifies that the delay has passed and then calls the target contracts with the specified function calls and parameters. The proposal state changes to EXECUTED.',
    simplifiedExplanation:
      'After the waiting period, the approved changes are actually implemented on the blockchain. The system automatically makes the changes that were described in the suggestion.',
    whatIfScenarios: [
      'What if the execution fails due to a revert in the target contract? The execution will fail, but the proposal will remain in the queue. The DAO would need to create a new proposal to fix the issue and try again.',
      'What if the target contract has been upgraded or modified since the proposal was created? The execution will use the current state of the target contract, which might behave differently than expected when the proposal was created.',
      'What if the gas price is too high to execute the transaction? The executor may need to wait for lower gas prices or include a higher gas price to ensure the transaction gets mined.',
    ],
  },
  10: {
    explanation:
      'If the proposal fails to receive sufficient votes or has more votes against than for, it is rejected and no changes are implemented.',
    technicalDetails:
      'If forVotes <= againstVotes or forVotes < quorumVotes after the voting period ends, the proposal state changes to DEFEATED. No further actions can be taken on this proposal, and a new proposal would need to be created to attempt the changes again.',
    simplifiedExplanation:
      "The suggestion didn't get enough votes to pass, so no changes will be made. If someone wants to try again with a similar idea, they would need to create a completely new proposal.",
    whatIfScenarios: [
      'What if the proposal was very close to passing? The proposer can analyze the voting results, address community concerns, and submit a revised proposal that might have better chances of passing.',
      'What if the proposal failed due to low voter turnout? The DAO might need to consider incentives for participation or better communication about governance processes.',
      'What if the proposal was controversial but passed with a slim majority? Some DAOs have additional safeguards like a veto process or higher thresholds for more significant changes.',
    ],
  },
  // Additional steps for Snapshot voting
  12: {
    explanation:
      'Token holders cast their votes on the Snapshot off-chain platform, which provides gasless voting and more flexible governance options.',
    technicalDetails:
      'Voters sign messages with their wallets to cast votes on Snapshot. The platform verifies token ownership and voting power based on a snapshot of token balances at a specific block height. Votes are stored off-chain but are verifiable on-chain if needed.',
    simplifiedExplanation:
      "People are voting on the suggestion using Snapshot, which doesn't require paying gas fees. The system checks how many tokens they had at a specific past time to determine their voting power.",
    whatIfScenarios: [
      'What if someone tries to vote with tokens they no longer hold? Snapshot uses a specific block height to determine token balances, so only tokens held at that time count for voting power.',
      'What if the Snapshot website goes down? The voting period would be extended, and the DAO might need to use a different voting mechanism or reschedule the vote.',
      "What if there's a dispute about the vote results? The results can be independently verified using the signed messages and the on-chain state at the snapshot block.",
    ],
  },
  13: {
    explanation:
      'The Snapshot votes are tallied and the results are used to inform the on-chain execution of the proposal.',
    technicalDetails:
      'After the voting period ends, anyone can trigger the execution of the proposal on-chain. The execution includes verification that the off-chain votes match the on-chain state at the snapshot block. The actual on-chain execution is typically performed by a relayer or the proposal creator.',
    simplifiedExplanation:
      'The votes from Snapshot are counted, and if the proposal passes, someone can trigger the actual changes on the blockchain.',
    whatIfScenarios: [
      'What if the on-chain state has changed since the snapshot? The execution will use the current on-chain state, which might be different from when the vote occurred.',
      'What if no one wants to pay the gas to execute the proposal? Some DAOs have mechanisms to reimburse gas costs for proposal execution, or they may use relayers to execute proposals automatically.',
      'What if there are multiple conflicting proposals? Each proposal is executed separately, and they might conflict if they modify the same parameters. The DAO should have clear guidelines for handling such cases.',
    ],
  },
};

// Function to generate a prompt for the LLM based on the Governance flow and step number
export const generateGovernancePrompt = (stepNumber: number, defaultDescription?: string): string => {
  // For step 0, use the base prompt with defaultDescription
  if (stepNumber === 0 && defaultDescription) {
    return generateBasePrompt('DAO governance', stepNumber, 'Introduction', defaultDescription);
  }

  if (stepNumber > 0 && stepNumber <= governanceSteps.length) {
    const step = governanceSteps[stepNumber - 1];
    const highlight = stepHighlightMap[stepNumber];

    // Get active nodes and edges for this step
    const activeNodes =
      highlight?.nodes?.map((nodeId: string) => flowNodes.find(node => node.id === nodeId)).filter(Boolean) || [];

    const activeEdges =
      highlight?.edges?.map((edgeId: string) => flowEdges.find(edge => edge.id === edgeId)).filter(Boolean) || [];

    // Create a context-rich prompt
    return `
You are an expert blockchain educator explaining a DAO governance flow visualization. 
Please provide a detailed explanation for step ${stepNumber} of the governance flow: "${step.title}".

Step information:
- Description: ${step.description}
- What happens: ${step.what}
- Why it matters: ${step.why}
- Code example: ${step.codeSnippet || 'Not available'}

Active components in this step:
- Nodes: ${activeNodes.map((node: any) => `${node?.data?.label || 'Unnamed'} (${node?.data?.tooltip || 'No tooltip'})`).join(', ') || 'None specified'}
- Edges: ${activeEdges.map((edge: any) => `${edge?.data?.label || 'Unnamed'} connection`).join(', ') || 'None specified'}

Please provide three different explanations:
1. A standard explanation that balances technical accuracy with accessibility
2. A technical explanation with implementation details for developers
3. A simplified explanation for beginners with no blockchain experience

Additionally, provide 2-3 "What-if scenarios" related to this step. For example:
- "What happens if the proposal fails to reach quorum?"
- "What if a critical vulnerability is discovered during the timelock period?"
- "What if the governance parameters need to be changed?"

Format your response as a JSON object with these fields:
{
  "explanation": "Your standard explanation here",
  "technicalDetails": "Your technical explanation here",
  "technicalCode": "A code snippet that demonstrates the technical implementation of this step, based on the provided code example",
  "simplifiedExplanation": "Your simplified explanation here",
  "whatIfScenarios": ["What-if scenario 1 with answer", "What-if scenario 2 with answer", "What-if scenario 3 with answer"]
}
`;
  }

  // Default to base prompt if step number is invalid
  return generateBasePrompt('DAO governance', stepNumber, governanceSteps[stepNumber - 1]?.title || 'Unknown step');
};

// Function to get AI explanations for the Governance flow
export const getGovernanceAIExplanation = async (
  stepNumber: number,
  useHardcoded: boolean = false,
  defaultDescription?: string
): Promise<AIExplanationResponse> => {
  // Check if we have a hardcoded explanation for this step
  const hardcodedExplanation = governanceHardcodedExplanations[stepNumber];

  // If useHardcoded is true, current provider has no valid API key, or hardcoded explanations are forced, return the hardcoded explanation
  if (useHardcoded || !currentProviderHasValidApiKey() || env.VITE_USE_HARDCODED_EXPLANATIONS === 'true') {
    if (env.NODE_ENV === 'development') {
      logInfo('Using hardcoded explanation for governance flow step', stepNumber);
    }
    return (
      hardcodedExplanation || {
        explanation: `AI explanation for governance flow step ${stepNumber} is not available yet.`,
        simplifiedExplanation: "This step's explanation is coming soon.",
      }
    );
  }

  try {
    // Generate a prompt for the LLM
    const prompt = generateGovernancePrompt(stepNumber, defaultDescription);

    // Call the OpenAI API
    const aiResponse = await callOpenAI(prompt);

    // If the API response doesn't include whatIfScenarios but we have hardcoded ones, use those
    if (!aiResponse.whatIfScenarios && hardcodedExplanation?.whatIfScenarios) {
      aiResponse.whatIfScenarios = hardcodedExplanation.whatIfScenarios;
      if (env.NODE_ENV === 'development') {
        logInfo('Using hardcoded whatIfScenarios for governance flow step', stepNumber);
      }
    }

    return aiResponse;
  } catch (error) {
    // Only log detailed error in development
    if (env.NODE_ENV === 'development') {
      logError('Error getting AI explanation for governance flow:', error);
    }

    // Fallback to hardcoded explanations if available
    if (hardcodedExplanation) {
      if (env.NODE_ENV === 'development') {
        logInfo('Falling back to hardcoded explanation for governance flow');
      }
      return hardcodedExplanation;
    }

    // Default fallback
    return {
      explanation: `We couldn't generate an AI explanation for this step. Please try again later.`,
      simplifiedExplanation: 'Sorry, the explanation is temporarily unavailable.',
    };
  }
};
