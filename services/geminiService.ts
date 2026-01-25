import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameState, BusinessPlan, SimulationResult, Competitor, Agent } from '../types';
import { SYSTEM_INSTRUCTION_GENERATOR, SYSTEM_INSTRUCTION_SIMULATOR, SYSTEM_INSTRUCTION_AGENT_CHAT } from '../constants';

const apiKey = process.env.API_KEY || ''; 
const getClient = (specificKey?: string) => new GoogleGenAI({ apiKey: specificKey || apiKey });

const businessPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    mission: { type: Type.STRING },
    targetMarket: { type: Type.STRING },
    revenueModel: { type: Type.STRING },
    estimatedValuation: { type: Type.NUMBER },
  },
  required: ['name', 'mission', 'targetMarket', 'revenueModel', 'estimatedValuation']
};

const simulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cashChange: { type: Type.NUMBER, description: "Net change in cash. Include burn rate (-$2k/agent) and revenue." },
    userChange: { type: Type.NUMBER, description: "Change in active users" },
    reputationChange: { type: Type.NUMBER, description: "Change in reputation (-10 to 10)" },
    productQualityChange: { type: Type.NUMBER, description: "Change in product quality (0 to 10)" },
    narrative: { type: Type.STRING, description: "A story snippet describing what happened this week" },
    stageProgression: { type: Type.STRING, enum: ['GARAGE', 'SEED', 'GROWTH', 'IPO'], nullable: true },
    gameStatusUpdate: { type: Type.STRING, enum: ['PLAYING', 'WON', 'LOST'], nullable: true },
    objectivesUpdate: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          reward: { type: Type.STRING },
          isCompleted: { type: Type.BOOLEAN },
          type: { type: Type.STRING, enum: ['GROWTH', 'HIRING', 'PRODUCT', 'FINANCIAL'] }
        }
      },
      description: "The full list of 3 active objectives. If one was completed this turn, mark isCompleted=true. If empty, generate 3 new ones."
    },
    newAgent: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        name: { type: Type.STRING },
        role: { type: Type.STRING, enum: ['ENGINEER', 'DESIGNER', 'MARKETING', 'FINANCE', 'PRODUCT'] },
        skillLevel: { type: Type.NUMBER },
        traits: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    agentFiredId: { type: Type.STRING, nullable: true },
    agentUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          agentId: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['IDLE', 'WORKING', 'STRESSED', 'DONE'] },
          taskDescription: { type: Type.STRING },
          moraleChange: { type: Type.NUMBER }
        }
      }
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    randomEvent: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['OPPORTUNITY', 'CRISIS', 'MARKET_NEWS'] },
        effect: { type: Type.STRING }
      }
    }
  },
  required: ['cashChange', 'userChange', 'reputationChange', 'productQualityChange', 'narrative', 'agentUpdates', 'suggestedActions', 'objectivesUpdate']
};

export const generateBusinessPlan = async (idea: string): Promise<BusinessPlan> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a business plan for this idea: ${idea}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
        responseMimeType: "application/json",
        responseSchema: businessPlanSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as BusinessPlan;
  } catch (error) {
    console.error("Gemini Business Plan Error:", error);
    return {
      name: "Stealth Startup",
      mission: "To revolutionize the industry with AI.",
      targetMarket: "Global Tech Consumers",
      revenueModel: "SaaS Subscription",
      estimatedValuation: 1000000
    };
  }
};

export const simulateTurn = async (currentState: GameState, userAction: string): Promise<SimulationResult> => {
  const context = JSON.stringify({
    stage: currentState.stage,
    turn: currentState.turn,
    cash: currentState.cash,
    users: currentState.users,
    productQuality: currentState.productQuality,
    agents: currentState.agents.map(a => ({ id: a.id, role: a.role, status: a.status, morale: a.morale })),
    currentObjectives: currentState.objectives,
    businessPlan: currentState.businessPlan
  });

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current State: ${context}\n\nUser Action: "${userAction}"\n\nSimulate the next week. Calculate financials strictly. Check objectives.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SIMULATOR,
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as SimulationResult;
  } catch (error) {
    console.error("Gemini Simulation Error:", error);
    // Fallback safe state
    return {
      cashChange: -2000,
      userChange: 0,
      reputationChange: 0,
      productQualityChange: 0,
      narrative: "Communication with the Logic Engine failed. Operations halted for safety.",
      agentUpdates: [],
      objectivesUpdate: [],
      suggestedActions: ["Retry Command", "Check Connection"]
    };
  }
};

export const interactWithAgent = async (agent: Agent, message: string): Promise<{ response: string, moraleChange: number, skillChange: number }> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Agent Profile: ${JSON.stringify(agent)}\nCEO Message: "${message}"`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_AGENT_CHAT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        response: { type: Type.STRING },
                        moraleChange: { type: Type.NUMBER },
                        skillChange: { type: Type.NUMBER }
                    },
                    required: ['response', 'moraleChange', 'skillChange']
                }
            }
        });
        const text = response.text;
        if(!text) throw new Error("No response");
        return JSON.parse(text);
    } catch (e) {
        return { response: "...", moraleChange: 0, skillChange: 0 };
    }
};

// --- MULTIMEDIA ---

export const generateGameImage = async (prompt: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image data found");
    } catch (e) { console.error("Image Gen Error", e); throw e; }
};

export const generateAvatarImage = async (prompt: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image data found");
    } catch (e) { console.error("Avatar Gen Error", e); throw e; }
};

export const generateGameVideo = async (prompt: string, specificKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: specificKey });
  try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video URI returned");
      const vidResponse = await fetch(`${downloadLink}&key=${specificKey}`);
      const blob = await vidResponse.blob();
      return URL.createObjectURL(blob);
  } catch (e) { console.error("Veo Gen Error", e); throw e; }
};

export const analyzeCompetitors = async (industry: string): Promise<Competitor[]> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Find 3 real-world startups in "${industry}" that would be competitors. Return names, descriptions, and estimate their global market share percentage (e.g., 15 for 15%). Ensure market shares sum to less than 90.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            url: { type: Type.STRING },
                            marketShare: { type: Type.NUMBER }
                        },
                        required: ['name', 'description', 'marketShare']
                    }
                }
            }
        });
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as Competitor[];
    } catch (e) { console.error("Search Grounding Error", e); return []; }
};