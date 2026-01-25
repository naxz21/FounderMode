import React, { useRef, useEffect, useState } from 'react';
import { GameStage, Agent, AgentRole } from '../types';
import { Maximize2, Minimize2, Video, Eye } from 'lucide-react';

interface HQVisualizerProps {
  stage: GameStage;
  agents: Agent[];
  stats: {
      users: number;
      cash: number;
      productQuality: number;
  };
}

// Particle Class for the Canvas
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'AGENT' | 'DATA' | 'AMBIENT';
  agentId?: string;
  
  constructor(canvasWidth: number, canvasHeight: number, type: 'AGENT' | 'DATA' | 'AMBIENT', agent?: Agent) {
    this.type = type;
    
    if (type === 'AGENT' && agent) {
       this.x = Math.random() * canvasWidth;
       this.y = Math.random() * canvasHeight;
       this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
       this.vy = (Math.random() - 0.5) * 0.5;
       this.size = 5;
       this.color = this.getAgentColor(agent.role);
       this.agentId = agent.id;
    } else {
       // Data / Ambient
       this.x = Math.random() * canvasWidth;
       this.y = Math.random() * canvasHeight;
       this.size = Math.random() * 2;
       
       if (type === 'DATA') {
           this.vx = 0;
           this.vy = -1 - Math.random() * 2; // Upward stream
           this.color = 'rgba(99, 102, 241, 0.5)'; // Indigo
       } else {
           // Ambient Dust
           this.vx = (Math.random() - 0.5) * 0.2;
           this.vy = (Math.random() - 0.5) * 0.2;
           this.color = 'rgba(148, 163, 184, 0.2)'; // Slate
       }
    }
  }

  getAgentColor(role: AgentRole) {
      switch(role) {
          case AgentRole.ENGINEER: return '#22d3ee'; // Cyan
          case AgentRole.DESIGNER: return '#f472b6'; // Pink
          case AgentRole.MARKETING: return '#facc15'; // Yellow
          case AgentRole.FINANCE: return '#10b981'; // Emerald
          default: return '#94a3b8';
      }
  }

  update(width: number, height: number, stage: GameStage) {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      
      // Stage specific behavior
      if (stage === GameStage.GROWTH && this.type === 'DATA') {
           this.vy = -3; // Faster data in growth
      }
      if (stage === GameStage.IPO && this.type === 'AMBIENT') {
           this.color = `rgba(${Math.random()*255}, ${Math.random()*255}, 255, 0.5)`; // Sparkling
      }
  }

  draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Agent Glow
      if (this.type === 'AGENT') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.shadowBlur = 0;
      }
  }
}

export const HQVisualizer: React.FC<HQVisualizerProps> = ({ stage, agents, stats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();

  // Determine Visual Style based on Stage
  const getStageConfig = () => {
      switch(stage) {
          case GameStage.GARAGE:
              return { bg: '#0f172a', dataCount: 10, ambientCount: 30, overlay: 'none' };
          case GameStage.SEED:
              return { bg: '#1e1b4b', dataCount: 30, ambientCount: 20, overlay: 'grid' };
          case GameStage.GROWTH:
              return { bg: '#020617', dataCount: 80, ambientCount: 10, overlay: 'matrix' };
          case GameStage.IPO:
              return { bg: '#000000', dataCount: 150, ambientCount: 50, overlay: 'city' };
          default:
              return { bg: '#0f172a', dataCount: 10, ambientCount: 10, overlay: 'none' };
      }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize Canvas
    const resize = () => {
        if(canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize Particles
    const config = getStageConfig();
    const particles: Particle[] = [];

    // Add Agents
    agents.forEach(agent => {
        particles.push(new Particle(canvas.width, canvas.height, 'AGENT', agent));
    });

    // Add Ambient/Data
    for(let i=0; i<config.dataCount; i++) particles.push(new Particle(canvas.width, canvas.height, 'DATA'));
    for(let i=0; i<config.ambientCount; i++) particles.push(new Particle(canvas.width, canvas.height, 'AMBIENT'));

    particlesRef.current = particles;

    // Animation Loop
    const render = () => {
        ctx.fillStyle = config.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connections for SEED stage
        if (stage === GameStage.SEED) {
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 1;
            particlesRef.current.filter(p => p.type === 'AGENT').forEach((p1, i, arr) => {
                arr.slice(i+1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });
        }
        
        // Draw Matrix rain effect for GROWTH
        if (stage === GameStage.GROWTH) {
             ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
             ctx.font = '10px monospace';
             for(let i=0; i<10; i++) {
                 ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), Math.random()*canvas.width, Math.random()*canvas.height);
             }
        }

        particlesRef.current.forEach(p => {
            p.update(canvas.width, canvas.height, stage);
            p.draw(ctx);
        });
        
        // Scanline effect
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, (Date.now() / 10) % canvas.height, canvas.width, 2);

        animationFrameId.current = requestAnimationFrame(render);
    };
    render();

    return () => {
        window.removeEventListener('resize', resize);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [stage, agents, isOpen]); // Re-init when stage or view mode changes

  return (
    <>
        {/* --- DASHBOARD MINI VIEW --- */}
        <div 
            onClick={() => setIsOpen(true)}
            className="relative h-[120px] w-full rounded-xl border border-slate-800 overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all shadow-lg"
        >
            <canvas ref={isOpen ? null : canvasRef} className="w-full h-full block" />
            
            {/* Overlay UI */}
            <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                <div className="bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-900/50 flex items-center animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                    LIVE FEED
                </div>
            </div>
            
            <div className="absolute top-2 right-2 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity">
                 <Maximize2 size={14} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                 <div className="flex justify-between items-end">
                     <div>
                         <div className="text-[10px] text-slate-400 font-mono">LOCATION</div>
                         <div className="text-sm font-bold text-white tracking-wider">{stage}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] text-slate-400 font-mono">PERSONNEL</div>
                         <div className="text-sm font-bold text-white tracking-wider">{agents.length}</div>
                     </div>
                 </div>
            </div>
            
            {/* Scanlines CSS */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
        </div>

        {/* --- FULL SCREEN IMMERSIVE VIEW --- */}
        {isOpen && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <Video className="text-red-500 animate-pulse" size={20} />
                        <div>
                             <h2 className="text-white font-bold tracking-widest">HQ SURVEILLANCE</h2>
                             <div className="text-[10px] text-slate-400 font-mono">SECURE CONNECTION // {stage}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    >
                        <Minimize2 size={24} />
                    </button>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 relative overflow-hidden">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    
                    {/* HUD Overlay */}
                    <div className="absolute top-6 left-6 w-64 space-y-4 pointer-events-none">
                        <div className="bg-black/40 border border-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">CASH FLOW</div>
                            <div className={`text-2xl font-mono ${stats.cash < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                                ${stats.cash.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-black/40 border border-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">ACTIVE USERS</div>
                            <div className="text-2xl font-mono text-cyan-400">
                                {stats.users.toLocaleString()}
                            </div>
                        </div>
                         <div className="bg-black/40 border border-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">PRODUCT QUALITY</div>
                            <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
                                <div className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_currentColor]" style={{width: `${stats.productQuality}%`}}></div>
                            </div>
                        </div>
                    </div>

                    {/* Agent List Overlay */}
                    <div className="absolute right-6 top-6 w-64 space-y-2 pointer-events-none">
                        <div className="text-right text-[10px] text-slate-500 font-bold mb-2">ACTIVE AGENTS</div>
                        {agents.map(agent => (
                            <div key={agent.id} className="bg-black/40 border border-slate-800 p-2 rounded flex items-center justify-between backdrop-blur-sm">
                                <span className="text-xs text-slate-300">{agent.name}</span>
                                <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]`} style={{
                                    backgroundColor: agent.role === 'ENGINEER' ? '#22d3ee' : 
                                                   agent.role === 'DESIGNER' ? '#f472b6' : 
                                                   '#facc15'
                                }}></div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none"></div>
                </div>
            </div>
        )}
    </>
  );
};