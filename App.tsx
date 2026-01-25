import React, { useState, useEffect } from 'react';
import { GameState, GameStage, GameStatus, Language, DICTIONARY, LogEntry, AgentRole, Asset, Agent, ActionCard } from './types';
import { INITIAL_STATE, INITIAL_CASH, ACTION_DECK } from './constants';
import { generateBusinessPlan, simulateTurn, generateGameImage, generateGameVideo, analyzeCompetitors, generateAvatarImage } from './services/geminiService';
import { audio } from './services/audioService';
import { Dashboard } from './components/Dashboard';
import { LogFeed } from './components/LogFeed';
import { GameOverlay } from './components/GameOverlay';
import { Onboarding } from './components/Onboarding';
import { AgentChat } from './components/AgentChat';
import { ActionDeck } from './components/ActionDeck';
import { Send, Globe, Cpu, PlayCircle, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [ideaInput, setIdeaInput] = useState('');
  
  const dict = DICTIONARY[gameState.language];

  // Helper to add logs
  const addLog = (text: string, source: LogEntry['source'], sentiment: LogEntry['sentiment'] = 'neutral') => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, {
        id: Math.random().toString(36).substr(2, 9),
        turn: prev.turn,
        source,
        text,
        sentiment,
        timestamp: Date.now()
      }]
    }));
  };

  const toggleLanguage = () => {
    audio.playClick();
    setGameState(prev => ({
      ...prev,
      language: prev.language === Language.EN ? Language.CN : Language.EN
    }));
  };

  const handleRestart = () => {
    audio.playClick();
    setGameState({
      ...INITIAL_STATE,
      language: gameState.language,
      deck: ACTION_DECK,
      hand: [] // Clear hand
    });
    setIdeaInput('');
    setInput('');
  };

  // Deal cards helper
  const dealCards = (deck: ActionCard[], count: number): { hand: ActionCard[], remainingDeck: ActionCard[] } => {
     // If deck is too small, reshuffle (simple version: just reuse full deck)
     const sourceDeck = deck.length < count ? [...ACTION_DECK] : deck;
     
     // Shuffle
     const shuffled = [...sourceDeck].sort(() => Math.random() - 0.5);
     const hand = shuffled.slice(0, count);
     const remainingDeck = shuffled.slice(count);
     
     return { hand, remainingDeck };
  };

  // 1. Start Game -> Generate Plan -> Trigger Tutorial
  const handleStartGame = async () => {
    if (!ideaInput.trim()) return;
    audio.playClick();
    
    setGameState(prev => ({ ...prev, isProcessing: true }));
    try {
      const plan = await generateBusinessPlan(ideaInput);
      audio.playSuccess();
      
      const { hand, remainingDeck } = dealCards(ACTION_DECK, 4);

      setGameState(prev => ({
        ...prev,
        businessPlan: plan,
        isProcessing: false,
        cash: 50000, 
        status: GameStatus.PLAYING,
        tutorialActive: true, 
        hand: hand,
        deck: remainingDeck,
        objectives: [],
        agents: [
           { id: 'dev1', name: 'Alex', role: AgentRole.ENGINEER, status: 'IDLE', skillLevel: 85, morale: 90, traits: ['Pragmatic'] },
           { id: 'mkt1', name: 'Sarah', role: AgentRole.MARKETING, status: 'IDLE', skillLevel: 80, morale: 95, traits: ['Charismatic'] },
           { id: 'des1', name: 'Mia', role: AgentRole.DESIGNER, status: 'IDLE', skillLevel: 90, morale: 85, traits: ['Perfectionist'] }
        ]
      }));
      addLog(`Business Plan Generated: ${plan.name} - ${plan.mission}`, 'SYSTEM', 'positive');
      
      // Auto-generate a logo concept on start
      handleGenerateAsset('IMAGE', `Minimalist futuristic logo for ${plan.name} on black background`);
      
      // Trigger first simulation to populate objectives without user input
      handleCommand(undefined, "Initialize Operations");

    } catch (e) {
      setGameState(prev => ({ ...prev, isProcessing: false }));
      audio.playError();
      addLog("Failed to generate plan. Please try again.", 'SYSTEM', 'negative');
    }
  };

  const handleTutorialComplete = () => {
    audio.playSuccess();
    setGameState(prev => ({ ...prev, tutorialActive: false }));
    addLog("Onboarding Complete. Command Interface Active.", 'SYSTEM', 'neutral');
  };

  // 2. Main Simulation Loop
  const handleCommand = async (e?: React.FormEvent, cmdOverride?: string) => {
    e?.preventDefault();
    const command = cmdOverride || input;
    
    if (!command.trim() || gameState.isProcessing || gameState.status !== GameStatus.PLAYING) return;

    if(!cmdOverride) audio.playTyping(); // Play typing sound on send
    setInput('');
    if (!cmdOverride) addLog(command, 'CEO'); 
    setGameState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await simulateTurn(gameState, command);
      
      // Prepare cards for next turn
      const { hand, remainingDeck } = dealCards(gameState.deck, 4);

      setGameState(prev => {
        // 1. Handle Agent Updates (Status/Task/Morale)
        let updatedAgents = prev.agents.map(agent => {
            const update = result.agentUpdates.find(u => u.agentId === agent.id || (u.agentId === 'ANY' && agent.status === 'IDLE'));
            if (update) {
                // Apply simulation logic
                const burn = agent.status === 'WORKING' ? -5 : 5; // Resting regenerates
                const newMorale = Math.min(100, Math.max(0, agent.morale + (update.moraleChange || 0) + burn)); 
                return { 
                    ...agent, 
                    status: update.status as any, 
                    currentTask: update.taskDescription || agent.currentTask,
                    morale: newMorale
                };
            }
            if (agent.status === 'DONE') return { ...agent, status: 'IDLE', currentTask: undefined };
            return agent;
        });

        // 2. Handle Hiring
        if (result.newAgent) {
            const newAgent: Agent = {
                id: `new_${Date.now()}`,
                name: result.newAgent.name,
                role: result.newAgent.role as AgentRole,
                skillLevel: result.newAgent.skillLevel,
                status: 'IDLE',
                morale: 100,
                traits: result.newAgent.traits || []
            };
            updatedAgents = [...updatedAgents, newAgent];
            // Async generate avatar for new agent
            setTimeout(() => handleGenerateAvatar(newAgent.id, newAgent.role), 100);
        }

        // 3. Handle Firing
        if (result.agentFiredId) {
            updatedAgents = updatedAgents.filter(a => a.id !== result.agentFiredId);
        }
        
        // 4. Determine Game Status
        let newStatus = result.gameStatusUpdate 
             ? (result.gameStatusUpdate as GameStatus) 
             : prev.status;
        
        const newCash = prev.cash + result.cashChange;
        if (newCash < 0) newStatus = GameStatus.LOST;

        // Play sounds based on result
        if (result.cashChange > 0) audio.playCash();
        if (result.randomEvent && result.randomEvent.type === 'CRISIS') audio.playAlert();
        if (newStatus === GameStatus.WON) audio.playSuccess();
        if (newStatus === GameStatus.LOST) audio.playError();

        return {
          ...prev,
          status: newStatus,
          turn: prev.turn + 1,
          cash: newCash,
          lastCashChange: result.cashChange, // Delta
          users: Math.max(0, prev.users + result.userChange),
          lastUserChange: result.userChange, // Delta
          reputation: Math.min(100, Math.max(0, prev.reputation + result.reputationChange)),
          productQuality: Math.min(100, Math.max(0, prev.productQuality + result.productQualityChange)),
          stage: result.stageProgression && result.stageProgression !== prev.stage ? (result.stageProgression as GameStage) : prev.stage,
          agents: updatedAgents,
          objectives: result.objectivesUpdate && result.objectivesUpdate.length > 0 ? result.objectivesUpdate : prev.objectives,
          suggestedCommands: result.suggestedActions || ["Analyze Metrics", "Scout Talent", "Product Iteration"],
          isProcessing: false,
          activeEvent: result.randomEvent || null, // Track active event
          hand: hand, // Deal new cards
          deck: remainingDeck
        };
      });

      addLog(result.narrative, 'SYSTEM', result.cashChange > 0 || result.userChange > 0 ? 'positive' : 'neutral');
      
      if (result.randomEvent) {
          addLog(`${result.randomEvent.type}: ${result.randomEvent.title}`, 'EVENT', result.randomEvent.type === 'CRISIS' ? 'negative' : 'positive');
      }

      if (result.newAgent) addLog(`New hire onboarded: ${result.newAgent.name} (${result.newAgent.role})`, 'SYSTEM', 'positive');
      if (result.agentFiredId) addLog(`Agent has left the company.`, 'SYSTEM', 'negative');
      
      // Log Objective Completions
      if (result.objectivesUpdate) {
         result.objectivesUpdate.forEach(obj => {
             const prevObj = gameState.objectives.find(o => o.id === obj.id);
             if (obj.isCompleted && (!prevObj || !prevObj.isCompleted)) {
                 addLog(`OBJECTIVE COMPLETE: ${obj.description} (${obj.reward})`, 'SYSTEM', 'positive');
                 audio.playSuccess();
             }
         });
      }

    } catch (err) {
      console.error(err);
      setGameState(prev => ({ ...prev, isProcessing: false }));
      audio.playError();
      addLog("System Error: Simulation failed.", 'SYSTEM', 'negative');
    }
  };

  const handlePlayCard = (card: ActionCard) => {
      audio.playClick();
      // Send the card's specific prompt effect to the simulation engine
      const command = `[ACTION CARD PLAYED]: ${card.title}. Effect: ${card.promptEffect}`;
      handleCommand(undefined, command);
  };

  // 3. Asset Generation (Image/Video)
  const handleGenerateAsset = async (type: 'IMAGE' | 'VIDEO', prompt: string) => {
      addLog(`Commissioning ${type === 'IMAGE' ? 'Design Team' : 'Video Team'}: "${prompt}"`, 'CEO');
      setGameState(prev => ({ ...prev, isProcessing: true }));
      
      try {
          let url = '';
          if (type === 'IMAGE') {
             url = await generateGameImage(prompt);
          } else {
             const win = window as any;
             if (win.aistudio?.hasSelectedApiKey) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey && win.aistudio.openSelectKey) {
                    await win.aistudio.openSelectKey();
                }
             }
             url = await generateGameVideo(prompt, process.env.API_KEY || '');
          }

          const newAsset: Asset = {
              id: Date.now().toString(),
              type,
              url,
              prompt,
              createdAt: Date.now()
          };

          setGameState(prev => ({
              ...prev,
              assets: [...prev.assets, newAsset],
              isProcessing: false
          }));
          audio.playSuccess();
          addLog(`${type === 'IMAGE' ? 'Concept Art' : 'Video Ad'} generated successfully.`, 'AGENT', 'positive');

      } catch (e) {
          console.error(e);
          setGameState(prev => ({ ...prev, isProcessing: false }));
          audio.playError();
          addLog(`Creative Task Failed: ${e instanceof Error ? e.message : 'Unknown error'}`, 'AGENT', 'negative');
      }
  };

  // 3b. Agent Avatar Generation
  const handleGenerateAvatar = async (agentId: string, role: string) => {
    try {
      const prompt = `Cyberpunk pixel art portrait of a tech startup ${role}, professional, futuristic style, character face close up`;
      const url = await generateAvatarImage(prompt);
      
      setGameState(prev => ({
        ...prev,
        agents: prev.agents.map(a => a.id === agentId ? { ...a, avatarUrl: url } : a)
      }));
    } catch (e) {
       console.error("Avatar failed", e);
    }
  };

  // 4. Market Analysis
  const handleAnalyzeMarket = async () => {
      if (!gameState.businessPlan) return;
      addLog("Initiating Global Market Scan...", 'CEO');
      setGameState(prev => ({ ...prev, isProcessing: true }));
      
      try {
          const competitors = await analyzeCompetitors(gameState.businessPlan.targetMarket);
          setGameState(prev => ({
              ...prev,
              competitors,
              isProcessing: false
          }));
          audio.playSuccess();
          addLog(`Market Scan Complete. ${competitors.length} threats identified.`, 'MARKET', 'neutral');
      } catch (e) {
          setGameState(prev => ({ ...prev, isProcessing: false }));
          audio.playError();
          addLog("Market Scan Failed.", 'SYSTEM', 'negative');
      }
  };
  
  // 5. Agent Chat Interaction
  const handleAgentClick = (agentId: string) => {
      setGameState(prev => ({ ...prev, activeAgentChatId: agentId }));
  };
  
  const handleAgentUpdate = (moraleDelta: number, skillDelta: number) => {
      if(moraleDelta > 0) audio.playCash(); // Positive morale sound
      setGameState(prev => ({
          ...prev,
          agents: prev.agents.map(a => {
              if (a.id === prev.activeAgentChatId) {
                  return {
                      ...a,
                      morale: Math.min(100, Math.max(0, a.morale + moraleDelta)),
                      skillLevel: Math.min(100, Math.max(0, a.skillLevel + skillDelta))
                  };
              }
              return a;
          })
      }));
  };

  const logoAsset = gameState.assets.find(a => a.type === 'IMAGE' && a.prompt.includes('logo'));
  const activeAgent = gameState.agents.find(a => a.id === gameState.activeAgentChatId);

  // --- Dynamic Background Style ---
  const getBackgroundStyle = () => {
    switch (gameState.stage) {
      case GameStage.GARAGE: return "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black";
      case GameStage.SEED: return "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black";
      case GameStage.GROWTH: return "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-950 via-slate-950 to-black";
      case GameStage.IPO: return "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-950 to-black";
      default: return "bg-slate-950";
    }
  };

  // --- RENDERING ---

  if (!gameState.businessPlan) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 z-10 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center space-x-3">
               <div className="bg-indigo-500 p-2 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                 <Cpu className="text-white" size={24} />
               </div>
               <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                 FounderMode
               </h1>
             </div>
             <button onClick={toggleLanguage} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition">
               <Globe size={20} />
             </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {dict.ideaPlaceholder}
              </label>
              <textarea 
                value={ideaInput}
                onChange={(e) => { setIdeaInput(e.target.value); audio.playTyping(); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition h-32 resize-none placeholder-slate-600"
                placeholder="..."
              />
            </div>
            
            <button 
              onClick={handleStartGame}
              disabled={gameState.isProcessing || !ideaInput}
              className={`
                w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all
                ${gameState.isProcessing || !ideaInput 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'}
              `}
            >
              {gameState.isProcessing ? (
                <><Loader2 className="animate-spin mr-2" /> {dict.generating}</>
              ) : (
                <><PlayCircle className="mr-2" /> {dict.startBtn}</>
              )}
            </button>
          </div>
          
          <div className="absolute -bottom-8 right-0 text-[10px] text-slate-700 font-mono">
             designed by RyanYang
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden text-slate-200 font-sans transition-colors duration-1000 ease-in-out ${getBackgroundStyle()}`}>
      
      {/* ONBOARDING TUTORIAL */}
      {gameState.tutorialActive && gameState.businessPlan && (
         <Onboarding 
            language={gameState.language} 
            businessPlan={gameState.businessPlan} 
            onComplete={handleTutorialComplete} 
         />
      )}

      {/* AGENT CHAT MODAL */}
      {gameState.activeAgentChatId && activeAgent && (
          <AgentChat 
              agent={activeAgent}
              language={gameState.language}
              onClose={() => { setGameState(prev => ({ ...prev, activeAgentChatId: null })); audio.playClick(); }}
              onUpdateAgent={handleAgentUpdate}
          />
      )}

      {/* GAME OVER / VICTORY OVERLAY */}
      <GameOverlay 
        status={gameState.status} 
        language={gameState.language} 
        onRestart={handleRestart} 
      />

      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
        <div className="flex items-center space-x-4">
          {logoAsset ? (
             <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-600 shadow-md">
                <img src={logoAsset.url} alt="Company Logo" className="w-full h-full object-cover" />
             </div>
          ) : (
             <Cpu className="text-indigo-400" />
          )}
          <span className="font-bold text-lg tracking-tight hidden sm:inline">FounderMode <span className="text-xs font-normal text-slate-500 px-2 py-0.5 border border-slate-800 rounded ml-2">EMPIRE</span></span>
          <span className="font-bold text-lg tracking-tight sm:hidden">FM</span>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-6">
           <div className="flex flex-col items-end">
             <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-widest">{dict.stage}</span>
             <span className="text-xs md:text-sm font-mono text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{gameState.stage}</span>
           </div>
           <div className="h-6 md:h-8 w-px bg-slate-800" />
           <div className="flex flex-col items-end">
             <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-widest">{dict.turn}</span>
             <span className="text-xs md:text-sm font-mono text-white font-bold">{gameState.turn}</span>
           </div>
           <button onClick={toggleLanguage} className="ml-2 md:ml-4 p-2 hover:bg-slate-800 rounded-lg transition">
             <Globe size={18} className="text-slate-400" />
           </button>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        
        {/* Left: Dashboard (2 cols) */}
        <div className="lg:col-span-2 border-r border-slate-800 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 flex flex-col min-h-0">
           <Dashboard 
              state={gameState} 
              onGenerateAsset={handleGenerateAsset}
              onAnalyzeMarket={handleAnalyzeMarket}
              onGenerateAvatar={handleGenerateAvatar}
              onAgentClick={handleAgentClick}
           />
           
           {/* ACTION DECK AREA (Overlays bottom of dashboard) */}
           <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex flex-col justify-end">
                {/* Deck Container */}
                <div className="bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-10 pb-4 md:pb-6 px-4 md:px-6 pointer-events-auto">
                    {/* Hand of Cards */}
                    {gameState.status === GameStatus.PLAYING && gameState.hand && gameState.hand.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                                {dict.hand}
                            </h4>
                            <ActionDeck 
                                cards={gameState.hand} 
                                onPlayCard={handlePlayCard} 
                                disabled={gameState.isProcessing}
                                language={gameState.language}
                            />
                        </div>
                    )}

                    {/* Manual Input Fallback */}
                    <form onSubmit={handleCommand} className="relative group w-full max-w-3xl mx-auto shadow-2xl">
                        <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 focus-within:border-indigo-500 transition-colors">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => { setInput(e.target.value); audio.playTyping(); }}
                                placeholder={dict.inputPlaceholder}
                                disabled={gameState.isProcessing || gameState.status !== GameStatus.PLAYING}
                                className="flex-1 bg-transparent text-white px-4 md:px-6 py-3 md:py-4 outline-none placeholder-slate-500 font-mono text-xs md:text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={!input || gameState.isProcessing || gameState.status !== GameStatus.PLAYING}
                                className="mr-2 p-2 md:p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {gameState.isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                    </form>
                </div>
           </div>
        </div>

        {/* Right: Log Feed (1 col) */}
        <div className="hidden lg:flex lg:col-span-1 bg-black/20 p-4 flex-col gap-2 relative z-10 border-l border-slate-800/50 backdrop-blur-sm min-h-0">
           <LogFeed logs={gameState.history} title={dict.feed} />
           <div className="flex justify-end opacity-20 hover:opacity-50 transition-opacity mt-auto">
              <span className="text-[10px] font-mono text-slate-500">
                SYSTEM_KERNEL // RYAN_YANG.BUILD_RC1
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}