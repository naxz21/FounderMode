import React, { useState, useEffect } from 'react';
import { GameState, Language, DICTIONARY, RandomEvent } from '../types';
import { AgentCard } from './AgentCard';
import { AssetGallery } from './AssetGallery';
import { MarketIntel } from './MarketIntel';
import { ObjectivesPanel } from './ObjectivesPanel';
import { HQVisualizer } from './HQVisualizer';
import { audio } from '../services/audioService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, ShieldCheck, Palette, LayoutDashboard, MonitorPlay, Zap, AlertTriangle, Info, Timer, Target } from 'lucide-react';

interface DashboardProps {
  state: GameState;
  onGenerateAsset: (type: 'IMAGE' | 'VIDEO', prompt: string) => void;
  onAnalyzeMarket: () => void;
  onGenerateAvatar: (agentId: string, role: string) => void;
  onAgentClick: (agentId: string) => void;
}

const CHATTER_MESSAGES = [
    "Compiling...", "Need coffee.", "Server lag?", "Git push force!", 
    "Deploying...", "Bug found.", "Meeting time?", "Reviewing PR",
    "Scaling DB", "Optimizing...", "Who broke prod?", "Nice KPI!"
];

export const Dashboard: React.FC<DashboardProps> = ({ state, onGenerateAsset, onAnalyzeMarket, onGenerateAvatar, onAgentClick }) => {
  const dict = DICTIONARY[state.language];
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDIO' | 'WARROOM'>('OVERVIEW');
  const [assetPrompt, setAssetPrompt] = useState('');
  const [activeThought, setActiveThought] = useState<{agentId: string, text: string} | null>(null);

  // Audio: Play typewriter sound when typing asset prompt
  useEffect(() => {
     if(assetPrompt.length > 0) audio.playTyping();
  }, [assetPrompt]);

  // Agent Chatter Loop
  useEffect(() => {
     if (state.status !== 'PLAYING') return;
     const interval = setInterval(() => {
         if (Math.random() > 0.6 && state.agents.length > 0) {
             const randomAgent = state.agents[Math.floor(Math.random() * state.agents.length)];
             const randomMsg = CHATTER_MESSAGES[Math.floor(Math.random() * CHATTER_MESSAGES.length)];
             setActiveThought({ agentId: randomAgent.id, text: randomMsg });
             
             // Clear thought after 3s
             setTimeout(() => setActiveThought(null), 3000);
         }
     }, 4000);
     return () => clearInterval(interval);
  }, [state.agents, state.status]);

  // Transform history for charts
  const chartData = state.history.length > 0 ? state.history.slice(-15).map((entry, idx) => ({
    name: `W${entry.turn}`,
    trend: 50 + (idx * 5) + (state.users / 100)
  })) : [];

  const lastNarrative = state.history.filter(h => h.source === 'SYSTEM' || h.source === 'EVENT').pop()?.text;

  // Calculate Runway
  const burnRateEstimate = state.agents.length * 2000 + (state.users * 0.1);
  const runway = state.cash > 0 ? Math.floor(state.cash / Math.max(1000, burnRateEstimate)) : 0;
  const isRunwayLow = runway < 4;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 relative">
      
      {/* --- News Ticker (Sticky Top) --- */}
      <div className="h-8 bg-black/40 border-b border-slate-800 flex items-center overflow-hidden relative shrink-0">
          <div className="bg-indigo-600 px-3 h-full flex items-center text-[10px] font-bold tracking-wider z-10 shrink-0 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
             <Activity size={12} className="mr-1 animate-pulse" /> NET.LINK
          </div>
          <div className="whitespace-nowrap animate-marquee flex items-center text-xs text-indigo-200/80 px-4 font-mono">
             {lastNarrative ? `>> ${lastNarrative} ` : ">> SYSTEM INITIALIZED. AWAITING INPUT. "}
             <span className="mx-4 text-slate-600">///</span>
             {state.businessPlan ? `TARGET: ${state.businessPlan.targetMarket} // VALUATION: $${state.businessPlan.estimatedValuation.toLocaleString()}` : ""}
          </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex border-b border-slate-800 px-4 md:px-6 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-10 shrink-0 overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeTab === 'OVERVIEW'} 
          onClick={() => { setActiveTab('OVERVIEW'); audio.playClick(); }} 
          icon={<LayoutDashboard size={14} />}
          label={dict.dashboard} 
        />
        <TabButton 
          active={activeTab === 'STUDIO'} 
          onClick={() => { setActiveTab('STUDIO'); audio.playClick(); }} 
          icon={<Palette size={14} />}
          label={dict.studio} 
        />
        <TabButton 
          active={activeTab === 'WARROOM'} 
          onClick={() => { setActiveTab('WARROOM'); audio.playClick(); }} 
          icon={<MonitorPlay size={14} />}
          label={dict.warRoom} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-4 pb-48"> {/* INCREASED PADDING BOTTOM */}
            
            {/* Active Event Banner */}
            {state.activeEvent && (
              <div className={`p-4 rounded-xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-lg
                 ${state.activeEvent.type === 'CRISIS' ? 'bg-red-950/30 border-red-500/50 text-red-100' : 
                   state.activeEvent.type === 'OPPORTUNITY' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100' :
                   'bg-blue-950/30 border-blue-500/50 text-blue-100'}
              `}>
                  <div className={`p-2 rounded-lg shrink-0 
                     ${state.activeEvent.type === 'CRISIS' ? 'bg-red-500/20 text-red-400' : 
                       state.activeEvent.type === 'OPPORTUNITY' ? 'bg-emerald-500/20 text-emerald-400' :
                       'bg-blue-500/20 text-blue-400'}
                  `}>
                      {state.activeEvent.type === 'CRISIS' ? <AlertTriangle size={24} /> : 
                       state.activeEvent.type === 'OPPORTUNITY' ? <Zap size={24} /> : <Info size={24} />}
                  </div>
                  <div>
                      <h4 className="font-bold text-sm tracking-wide uppercase mb-1">{state.activeEvent.title}</h4>
                      <p className="text-sm opacity-90 leading-snug">{state.activeEvent.description}</p>
                      <div className="mt-2 text-xs font-mono opacity-75 bg-black/20 px-2 py-1 rounded inline-block border border-current/20">
                          EFFECT: {state.activeEvent.effect}
                      </div>
                  </div>
              </div>
            )}

            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <MetricCard 
                label={dict.cash} 
                value={`$${state.cash.toLocaleString()}`} 
                delta={state.lastCashChange}
                isCurrency
                icon={<DollarSign className="text-emerald-400" />} 
                trend={state.cash < 10000 ? 'danger' : 'neutral'}
                subMetric={
                    <div className={`flex items-center text-[10px] mt-1 font-mono ${isRunwayLow ? 'text-red-400 animate-pulse font-bold' : 'text-slate-500'}`}>
                        <Timer size={10} className="mr-1" />
                        {dict.runway}: {runway} {dict.weeks}
                    </div>
                }
              />
              <MetricCard 
                label={dict.users} 
                value={state.users.toLocaleString()} 
                delta={state.lastUserChange}
                icon={<Users className="text-cyan-400" />} 
              />
              <MetricCard 
                label={dict.reputation} 
                value={`${state.reputation}%`} 
                icon={<ShieldCheck className="text-purple-400" />} 
              />
              <MetricCard 
                label={dict.quality} 
                value={`${state.productQuality}/100`} 
                icon={<Activity className="text-orange-400" />} 
              />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Left Column: Visuals & Info */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    
                    {/* HQ Visualizer */}
                    <HQVisualizer 
                        stage={state.stage} 
                        agents={state.agents} 
                        stats={{ users: state.users, cash: state.cash, productQuality: state.productQuality }} 
                    />

                    {/* Compact Growth Chart */}
                    <div className="bg-empire-panel/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 h-[200px] flex flex-col relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <TrendingUp size={80} className="text-indigo-500" />
                        </div>
                        <div className="flex justify-between items-center mb-2 z-10">
                             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                <TrendingUp size={14} className="mr-2 text-indigo-400" /> Growth Trajectory
                            </h3>
                        </div>
                        
                        <div className="flex-1 w-full relative z-10 -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.length ? chartData : [{name: 'Start', trend: 0}]}>
                                <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={5} tick={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                                <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#818cf8' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="trend" 
                                    stroke="#6366f1" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorTrend)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Company Info Card - Compact */}
                    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center min-h-[100px]">
                        {state.businessPlan && (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-white tracking-tight">{state.businessPlan.name}</h2>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">INC.</span>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{state.businessPlan.mission}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Agents & Objectives */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                   <ObjectivesPanel objectives={state.objectives} language={state.language} />
                   
                   <div className="bg-empire-panel/40 backdrop-blur-md rounded-xl border border-slate-800 p-4 flex-1 flex flex-col">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                          <span>{dict.agents}</span>
                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400">{state.agents.length} ONLINE</span>
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin min-h-[250px] lg:min-h-0">
                          {state.agents.map(agent => (
                            <AgentCard 
                              key={agent.id} 
                              agent={agent} 
                              onGenerateAvatar={onGenerateAvatar}
                              onClick={() => { onAgentClick(agent.id); audio.playClick(); }}
                              isGenerating={state.isProcessing}
                              thought={activeThought?.agentId === agent.id ? activeThought.text : null}
                            />
                          ))}
                      </div>
                   </div>
                </div>

            </div>

          </div>
        )}

        {/* VIEW: STUDIO */}
        {activeTab === 'STUDIO' && (
          <div className="h-full flex flex-col pb-20">
             <div className="mb-6 p-6 bg-slate-900/50 border border-slate-800 rounded-xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[50px] pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                   <Palette size={16} className="mr-2 text-pink-400" /> 
                   Generator Control
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                   <input 
                      type="text" 
                      value={assetPrompt}
                      onChange={(e) => setAssetPrompt(e.target.value)}
                      placeholder="Describe asset (e.g., 'Futuristic App UI')"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition shadow-inner"
                   />
                   <div className="flex gap-2">
                       <button 
                         onClick={() => { onGenerateAsset('IMAGE', assetPrompt); setAssetPrompt(''); audio.playClick(); }}
                         disabled={state.isProcessing || !assetPrompt}
                         className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-lg text-xs font-bold transition disabled:opacity-50 border border-slate-700 whitespace-nowrap"
                       >
                         {dict.generateImage}
                       </button>
                       <button 
                         onClick={() => { onGenerateAsset('VIDEO', assetPrompt); setAssetPrompt(''); audio.playClick(); }}
                         disabled={state.isProcessing || !assetPrompt}
                         className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-indigo-900/20 whitespace-nowrap"
                       >
                         {dict.generateVideo}
                       </button>
                   </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 flex items-center">
                  <Info size={12} className="mr-1" />
                  Video generation (Veo 3.1) takes time and requires a paid API key. Image generation uses Gemini 2.5 Flash.
                </div>
             </div>
             
             <div className="flex-1">
                <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center">
                    {dict.assetGallery}
                    <span className="ml-2 h-px bg-slate-800 flex-1"></span>
                </h3>
                <AssetGallery assets={state.assets} />
             </div>
          </div>
        )}

        {/* VIEW: WAR ROOM */}
        {activeTab === 'WARROOM' && (
           <MarketIntel 
             competitors={state.competitors} 
             isLoading={state.isProcessing} 
             onAnalyze={() => { onAnalyzeMarket(); audio.playClick(); }}
             language={state.language}
           />
        )}
      </div>

    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0
      ${active ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MetricCard = ({ label, value, delta, icon, trend, isCurrency, subMetric }: { label: string, value: string, delta?: number, icon: React.ReactNode, trend?: 'danger' | 'neutral', isCurrency?: boolean, subMetric?: React.ReactNode }) => {
    const isPositive = delta !== undefined && delta > 0;
    
    return (
        <div className={`bg-empire-panel/60 backdrop-blur-sm p-4 rounded-xl border border-slate-800 flex flex-col justify-between ${trend === 'danger' ? 'border-red-900/50 bg-red-900/10' : 'hover:border-slate-700'} transition-all group`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">{label}</span>
                <span className="opacity-80 group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <div>
                <div className={`text-xl md:text-2xl font-mono font-bold tracking-tight truncate ${trend === 'danger' ? 'text-red-400' : 'text-slate-100'}`}>
                    {value}
                </div>
                {delta !== undefined && delta !== 0 && (
                    <div className={`text-[10px] font-mono mt-1 flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                        {isPositive ? '+' : ''}{isCurrency ? '$' : ''}{delta.toLocaleString()}
                    </div>
                )}
                {subMetric}
            </div>
        </div>
    );
}