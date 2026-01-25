import React from 'react';
import { Competitor, Language, DICTIONARY } from '../types';
import { Globe, ShieldAlert, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MarketIntelProps {
  competitors: Competitor[];
  isLoading: boolean;
  onAnalyze: () => void;
  language?: Language;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const MarketIntel: React.FC<MarketIntelProps> = ({ competitors, isLoading, onAnalyze, language }) => {
  const dict = DICTIONARY[language || 'EN'];

  const marketData = competitors.map(c => ({ name: c.name, value: c.marketShare || 10 }));
  // Add "Us" if competitors exist
  if (marketData.length > 0) {
      marketData.push({ name: 'Our Empire', value: 1 }); // Start small
  }

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
           <h3 className="text-slate-300 font-bold flex items-center">
               <ShieldAlert className="mr-2 text-red-400" size={18} /> Global Threat Analysis
           </h3>
           <button 
             onClick={onAnalyze}
             disabled={isLoading}
             className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-800 rounded text-xs transition disabled:opacity-50"
           >
             {isLoading ? 'Scanning...' : 'Scan Market (Gemini Pro)'}
           </button>
       </div>

       <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* List View */}
          <div className="space-y-3">
            {competitors.length === 0 && !isLoading && (
                <div className="text-center text-slate-600 mt-10 text-sm p-8 border border-dashed border-slate-800 rounded-xl">
                    Market intelligence unavailable. Initiate scan to visualize threats.
                </div>
            )}
            
            {competitors.map((comp, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg flex items-start space-x-4 hover:border-red-500/30 transition-colors">
                    <div className="bg-slate-800 p-2 rounded-full mt-1">
                        <Globe size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <h4 className="text-white font-bold text-sm">{comp.name}</h4>
                            <span className="text-xs font-mono text-red-400">{comp.marketShare}% Share</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{comp.description}</p>
                        {comp.url && comp.url !== '#' && (
                            <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 mt-2 block hover:underline truncate max-w-[200px]">
                                {comp.url}
                            </a>
                        )}
                        {/* Mock Progress Bar for Share */}
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-red-500/50" style={{width: `${comp.marketShare}%`}} />
                        </div>
                    </div>
                </div>
            ))}
          </div>

          {/* Chart View */}
          {competitors.length > 0 && (
             <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 flex flex-col">
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 flex items-center">
                    <PieIcon size={14} className="mr-2" /> Market Distribution
                </h4>
                <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={marketData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {marketData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Our Empire' ? '#6366f1' : COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center text-[10px] text-slate-500 mt-2">
                    Our Empire holds <span className="text-indigo-400 font-bold">~1%</span> of global market.
                </div>
             </div>
          )}
       </div>
    </div>
  );
};