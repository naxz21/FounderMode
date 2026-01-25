import React from 'react';
import { Agent, AgentRole } from '../types';
import { Code2, Paintbrush, DollarSign, Megaphone, Briefcase, Camera, Sparkles, MessageSquare } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onGenerateAvatar: (agentId: string, role: string) => void;
  onClick: (agentId: string) => void;
  isGenerating?: boolean;
  thought?: string | null; // New Prop
}

const RoleIcon = ({ role }: { role: AgentRole }) => {
  switch (role) {
    case AgentRole.ENGINEER: return <Code2 size={16} className="text-cyan-400" />;
    case AgentRole.DESIGNER: return <Paintbrush size={16} className="text-pink-400" />;
    case AgentRole.FINANCE: return <DollarSign size={16} className="text-emerald-400" />;
    case AgentRole.MARKETING: return <Megaphone size={16} className="text-yellow-400" />;
    default: return <Briefcase size={16} className="text-slate-400" />;
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onGenerateAvatar, onClick, isGenerating, thought }) => {
  const isWorking = agent.status === 'WORKING';
  const isStressed = agent.status === 'STRESSED';

  let statusColor = "bg-slate-700/50 text-slate-300 border-slate-600";
  let glowClass = "";
  
  if (isWorking) {
      statusColor = "bg-indigo-900/50 text-indigo-300 border-indigo-500/50";
      glowClass = "shadow-[0_0_15px_rgba(99,102,241,0.2)]";
  }
  if (isStressed) {
      statusColor = "bg-red-900/50 text-red-300 border-red-500/50";
      glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.2)]";
  }
  if (agent.status === 'DONE') {
      statusColor = "bg-emerald-900/50 text-emerald-300 border-emerald-500/50";
  }

  // Morale Color
  const moraleColor = agent.morale > 70 ? 'bg-emerald-500' : agent.morale > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div 
      onClick={() => onClick(agent.id)}
      className={`
      relative flex flex-col p-3 rounded-xl border border-slate-800/80
      backdrop-blur-md transition-all duration-300 overflow-visible group bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/30 cursor-pointer
      ${glowClass}
    `}>
      {/* THOUGHT BUBBLE */}
      {thought && (
         <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-white text-black text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xl animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 pointer-events-none">
            {thought}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
         </div>
      )}

      {/* Click Hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <MessageSquare size={14} className="text-indigo-400" />
      </div>

      <div className="flex items-start space-x-3 mb-2">
        {/* Avatar Section */}
        <div className="relative shrink-0 w-12 h-12 rounded-lg bg-slate-800/80 overflow-hidden border border-slate-700 shadow-inner group-hover:border-slate-500 transition-colors">
           {agent.avatarUrl ? (
               <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
           ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-900">
                   <RoleIcon role={agent.role} />
               </div>
           )}
           
           {/* Hover Effect to Generate/Regenerate */}
           {!agent.avatarUrl && (
             <button 
                onClick={(e) => { e.stopPropagation(); onGenerateAvatar(agent.id, agent.role); }}
                disabled={isGenerating}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                title="Generate AI Avatar"
             >
                {isGenerating ? <Sparkles size={14} className="animate-spin text-white"/> : <Camera size={14} className="text-white" />}
             </button>
           )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-12">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-100 truncate tracking-tight">{agent.name}</div>
            <div className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor} font-mono`}>
              {agent.status}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <span>{agent.role}</span>
              <span className="text-slate-500">LVL {Math.floor(agent.skillLevel / 10)}</span>
          </div>
        </div>
      </div>
      
      {agent.traits && agent.traits.length > 0 && (
         <div className="flex gap-1 mb-2">
            {agent.traits.slice(0, 2).map((t, i) => (
                <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">{t}</span>
            ))}
         </div>
      )}

      {agent.currentTask && (
        <div className="mb-2 text-[10px] text-indigo-200 bg-indigo-950/30 px-2 py-1.5 rounded border border-indigo-500/20 truncate font-mono">
          <span className="opacity-50 mr-1 text-indigo-500">&gt;_</span>
          {agent.currentTask}
        </div>
      )}

      {/* Stats Bar */}
      <div className="mt-auto grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[9px] text-slate-500 mb-0.5 uppercase">
                <span>Skill</span>
                <span>{agent.skillLevel}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full shadow-[0_0_5px_rgba(6,182,212,0.5)]" style={{ width: `${agent.skillLevel}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-slate-500 mb-0.5 uppercase">
                <span>Morale</span>
                <span>{agent.morale}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className={`${moraleColor} h-full shadow-[0_0_5px_currentColor]`} style={{ width: `${agent.morale}%` }} />
            </div>
          </div>
      </div>
    </div>
  );
};