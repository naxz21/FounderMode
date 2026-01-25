export enum GameStage {
  GARAGE = 'GARAGE',
  SEED = 'SEED',
  GROWTH = 'GROWTH',
  IPO = 'IPO'
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

export enum AgentRole {
  ENGINEER = 'ENGINEER',
  DESIGNER = 'DESIGNER',
  MARKETING = 'MARKETING',
  FINANCE = 'FINANCE',
  PRODUCT = 'PRODUCT'
}

export enum Language {
  EN = 'EN',
  CN = 'CN'
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'IDLE' | 'WORKING' | 'STRESSED' | 'DONE';
  currentTask?: string;
  skillLevel: number; // 1-100
  avatarUrl?: string; // AI Generated Avatar
  morale: number; // 0-100
  traits?: string[]; // e.g., "Workaholic", "Creative", "Lazy"
}

export interface LogEntry {
  id: string;
  turn: number;
  source: 'SYSTEM' | 'CEO' | 'AGENT' | 'MARKET' | 'EVENT';
  text: string;
  sentiment: 'neutral' | 'positive' | 'negative' | 'critical';
  timestamp: number;
}

export interface BusinessPlan {
  name: string;
  mission: string;
  targetMarket: string;
  revenueModel: string;
  estimatedValuation: number;
}

export interface Asset {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string; // Data URL or Blob URL
  prompt: string;
  createdAt: number;
}

export interface Competitor {
  name: string;
  description: string;
  url: string;
  marketShare: number; // Percentage 0-100
}

export interface RandomEvent {
  title: string;
  description: string;
  type: 'OPPORTUNITY' | 'CRISIS' | 'MARKET_NEWS';
  effect: string; // Text description of effect
  choices?: { label: string, action: string }[]; // Interactive choices
}

export interface Objective {
  id: string;
  description: string;
  reward: string; // e.g. "$5,000" or "+5 Rep"
  isCompleted: boolean;
  type: 'GROWTH' | 'HIRING' | 'PRODUCT' | 'FINANCIAL';
}

// --- NEW: CARD SYSTEM ---
export interface ActionCard {
  id: string;
  title: string;
  description: string;
  cost: string; // Display string e.g. "$5k" or "Morale"
  type: 'GROWTH' | 'PRODUCT' | 'HR' | 'FINANCE' | 'RISK';
  promptEffect: string; // The instruction sent to LLM
  icon: string;
}

export interface GameState {
  status: GameStatus;
  stage: GameStage;
  turn: number;
  cash: number;
  lastCashChange: number; // For delta display
  users: number;
  lastUserChange: number; // For delta display
  reputation: number; // 0-100
  productQuality: number; // 0-100
  history: LogEntry[];
  agents: Agent[];
  businessPlan: BusinessPlan | null;
  assets: Asset[];
  competitors: Competitor[];
  objectives: Objective[]; // New: Active quests
  isProcessing: boolean;
  language: Language;
  suggestedCommands: string[];
  activeEvent: RandomEvent | null; // Currently active event
  tutorialActive: boolean;
  activeAgentChatId: string | null; // For 1:1 modal
  
  // Card System State
  hand: ActionCard[];
  deck: ActionCard[];
}

export interface SimulationResult {
  cashChange: number;
  userChange: number;
  reputationChange: number;
  productQualityChange: number;
  narrative: string;
  stageProgression?: GameStage;
  agentUpdates: {
    agentId: string;
    status: 'IDLE' | 'WORKING' | 'STRESSED' | 'DONE';
    taskDescription?: string;
    moraleChange?: number;
  }[];
  objectivesUpdate: Objective[]; // Return full list of updated objectives
  suggestedActions: string[];
  gameStatusUpdate?: GameStatus; 
  newAgent?: {
    name: string;
    role: AgentRole;
    skillLevel: number;
    traits: string[];
  };
  agentFiredId?: string;
  randomEvent?: RandomEvent;
}

// UI Text Dictionary
export const DICTIONARY = {
  [Language.EN]: {
    startBtn: "Initialize Empire",
    ideaPlaceholder: "Describe your startup idea (e.g., 'Uber for Dog Walkers')",
    generating: "Generating Business Plan...",
    dashboard: "Command Center",
    studio: "Creative Studio",
    warRoom: "War Room",
    cash: "Cash Reserve",
    users: "Active Users",
    reputation: "Reputation",
    quality: "Product Quality",
    agents: "Agent Army",
    feed: "Live Feed",
    inputPlaceholder: "Enter custom command or use cards...",
    execute: "Execute",
    turn: "Week",
    stage: "Stage",
    generateImage: "Generate Concept Art",
    generateVideo: "Generate Viral Ad",
    analyzeMarket: "Analyze Competitors",
    assetGallery: "Asset Gallery",
    suggestions: "Strategic Advisors:",
    visualize: "Visualize",
    gameOver: "GAME OVER",
    victory: "UNICORN STATUS ACHIEVED",
    restart: "Initialize New Venture",
    bankruptMsg: "Your startup has run out of cash. The vision is dead.",
    victoryMsg: "You have successfully taken your company public (IPO). The world is yours.",
    eventAlert: "SYSTEM ALERT",
    burnRate: "Weekly Burn",
    objectives: "Board Objectives",
    chatWith: "1:1 Meeting",
    closeChat: "End Meeting",
    chatPlaceholder: "Say something to motivate or direct them...",
    runway: "Runway",
    weeks: "weeks",
    marketShare: "Market Share",
    hand: "Action Deck",
    tutorial: {
      next: "Next Module",
      start: "Enter Command Mode",
      step1Title: "Welcome, Founder.",
      step1Desc: "The AI Logic Engine has generated a path to victory for",
      step2Title: "Resource Management",
      step2Desc: "Cash is your oxygen. Every turn (week) burns cash based on headcount. If it hits $0, it's Game Over. Grow users to increase revenue.",
      step3Title: "Command Your Army",
      step3Desc: "Use Action Cards or type custom commands to direct your agents. Strategy is key: Balance Product Quality, User Growth, and Cash.",
      step4Title: "Objectives & Scale",
      step4Desc: "Follow the 'Board Objectives' to guide your growth. Completing them unlocks funding and reputation. Progress from Garage to IPO.",
    }
  },
  [Language.CN]: {
    startBtn: "初始化帝国",
    ideaPlaceholder: "描述你的创业想法 (例如：'宠物版滴滴')",
    generating: "生成商业计划书...",
    dashboard: "指挥中心",
    studio: "创意工作室",
    warRoom: "作战室",
    cash: "现金储备",
    users: "活跃用户",
    reputation: "声誉",
    quality: "产品质量",
    agents: "AI 代理军团",
    feed: "实时动态",
    inputPlaceholder: "输入自定义指令或使用卡牌...",
    execute: "执行",
    turn: "周",
    stage: "阶段",
    generateImage: "生成概念图",
    generateVideo: "生成病毒广告",
    analyzeMarket: "竞品分析",
    assetGallery: "资产库",
    suggestions: "战略顾问建议:",
    visualize: "生成形象",
    gameOver: "游戏结束",
    victory: "独角兽成就达成",
    restart: "开启新征程",
    bankruptMsg: "你的创业公司资金链断裂。愿景破灭。",
    victoryMsg: "你已成功带领公司上市 (IPO)。世界是你的了。",
    eventAlert: "系统警报",
    burnRate: "周消耗",
    objectives: "董事会目标",
    chatWith: "1:1 会议",
    closeChat: "结束会议",
    chatPlaceholder: "说点什么来激励或指导他们...",
    runway: "生存期",
    weeks: "周",
    marketShare: "市场份额",
    hand: "行动卡牌",
    tutorial: {
      next: "下一步",
      start: "进入指挥模式",
      step1Title: "欢迎, 创始人。",
      step1Desc: "AI 逻辑引擎已为你生成通往胜利的蓝图：",
      step2Title: "资源管理",
      step2Desc: "现金就是氧气。每一周（回合）都会根据人数消耗现金。如果归零，游戏结束。增长用户以增加收入。",
      step3Title: "指挥你的军团",
      step3Desc: "使用下方的【行动卡牌】或输入指令来指挥你的代理。策略很关键：在产品质量、用户增长和现金流之间寻找平衡。",
      step4Title: "目标与扩张",
      step4Desc: "跟随‘董事会目标’来指引你的增长。完成目标可解锁资金和声誉。从车库创业到 IPO 上市。",
    }
  }
};