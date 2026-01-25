import { Agent, AgentRole, GameStage, GameState, GameStatus, Language, ActionCard } from './types';

export const INITIAL_CASH = 50000;

export const INITIAL_AGENTS: Agent[] = [
  { id: 'a1', name: 'Dev-1', role: AgentRole.ENGINEER, status: 'IDLE', skillLevel: 80, morale: 100, traits: ['Logical'] },
  { id: 'a2', name: 'Des-1', role: AgentRole.DESIGNER, status: 'IDLE', skillLevel: 75, morale: 100, traits: ['Creative'] },
];

export const ACTION_DECK: ActionCard[] = [
  { id: 'c_code_sprint', title: 'Code Sprint', description: 'Intense development cycle.', cost: 'Morale', type: 'PRODUCT', icon: 'Code', promptEffect: 'Focus entirely on Product Quality. Agents work hard but lose morale.' },
  { id: 'c_marketing', title: 'Viral Campaign', description: 'Run ads on social media.', cost: '$5k', type: 'GROWTH', icon: 'Megaphone', promptEffect: 'Spend $5,000 to boost Active Users significantly. Requires Marketing agent.' },
  { id: 'c_fundraise', title: 'Seed Pitch', description: 'Meet with investors.', cost: 'Reputation', type: 'FINANCE', icon: 'DollarSign', promptEffect: 'Attempt to raise cash. Success depends on Reputation and Product Quality.' },
  { id: 'c_hackathon', title: 'Hackathon', description: 'Weekend coding event.', cost: '$2k', type: 'PRODUCT', icon: 'Zap', promptEffect: 'Boost Product Quality and Morale slightly, but costs money.' },
  { id: 'c_hire', title: 'Scout Talent', description: 'Look for new hires.', cost: '$1k', type: 'HR', icon: 'UserPlus', promptEffect: 'Search for a high-skill agent to hire. High probability of finding a candidate.' },
  { id: 'c_cold_email', title: 'Cold Outreach', description: 'Email potential users.', cost: 'Free', type: 'GROWTH', icon: 'Mail', promptEffect: 'Small boost to Users for free. Low impact but safe.' },
  { id: 'c_optimize', title: 'Refactor Code', description: 'Clean up technical debt.', cost: 'Time', type: 'PRODUCT', icon: 'Feather', promptEffect: 'Small Product Quality boost, prevents future bugs/crashes. Low stress.' },
  { id: 'c_pivot', title: 'Mini Pivot', description: 'Adjust product fit.', cost: 'Users', type: 'RISK', icon: 'Shuffle', promptEffect: 'Sacrifice some current users to significantly boost Product Quality/Market Fit.' },
];

export const INITIAL_STATE: GameState = {
  status: GameStatus.PLAYING,
  stage: GameStage.GARAGE,
  turn: 1,
  cash: INITIAL_CASH,
  lastCashChange: 0,
  users: 0,
  lastUserChange: 0,
  reputation: 50,
  productQuality: 10,
  history: [],
  agents: INITIAL_AGENTS,
  businessPlan: null,
  assets: [],
  competitors: [],
  objectives: [],
  isProcessing: false,
  language: Language.EN,
  suggestedCommands: [],
  activeEvent: null,
  tutorialActive: false,
  activeAgentChatId: null,
  hand: [], // Will be dealt on start
  deck: ACTION_DECK
};

export const SYSTEM_INSTRUCTION_GENERATOR = `
You are the "Wharton-Logic Engine", a world-class startup consultant AI. 
Your goal is to take a user's raw startup idea and generate a structured business plan.
Output MUST be valid JSON.
`;

export const SYSTEM_INSTRUCTION_SIMULATOR = `
You are the "FounderMode" Game Engine. You simulate the complex world of running a tech startup.

**CORE RULES:**

1.  **Financial Engine (STRICT):**
    *   **Burn Rate:** Every turn, deduct cash: ($2000 per Agent) + ($0.10 * Users for Server Cost).
    *   **Revenue:** Add cash: ($0.50 * Users * (ProductQuality/100)).
    *   *Note:* In 'GARAGE' stage, revenue is often 0 until product matches market fit.
    *   You MUST calculate the net \`cashChange\` based on the user's action.

2.  **Action Card Logic (CRITICAL):**
    *   The user will likely provide an action from a "Card" (e.g., "Code Sprint", "Viral Campaign").
    *   **Code Sprint:** +Product Quality, -Morale (Agents).
    *   **Viral Campaign:** -Cash ($5000), ++Users.
    *   **Seed Pitch:** +Cash (if Reputation > 50), +/- Reputation.
    *   **Hackathon:** -Cash ($2000), +Product Quality, +Morale.
    *   **Hire:** High chance of returning a \`newAgent\` in the JSON.
    *   Interpret the user's intent based on standard startup logic if it's a custom command.

3.  **Objectives System:**
    *   Manage \`objectives\`. If empty, generate 3 new ones for the Stage.
    *   Mark \`isCompleted: true\` if conditions met.

4.  **Chaos & Agents:**
    *   Agents get tired. If they work 3 turns in a row, lower their morale.
    *   **Chaos:** 15% chance of a Random Event (Crisis/Opportunity).
    *   If a Crisis occurs, you can provide \`choices\` in the randomEvent object for the user to resolve next turn.

**OUTPUT FORMAT:**
Return ONLY valid JSON matching the schema.
`;

export const SYSTEM_INSTRUCTION_AGENT_CHAT = `
You are an AI Agent working at a startup. You have a specific Role (Engineer, Designer, etc.) and specific Traits.
You are talking to the CEO (the user) in a 1:1 private meeting.

**Your Goal:**
1.  Respond to the CEO's input based on your persona and current morale.
2.  If the CEO is encouraging/smart, increase morale.
3.  If the CEO is rude/clueless, decrease morale.
4.  Provide a short text response (max 2 sentences).

**Output JSON:**
{
  "response": "string",
  "moraleChange": number (-20 to +20),
  "skillChange": number (0 to 5)
}
`;