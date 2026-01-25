import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LogFeedProps {
  logs: LogEntry[];
  title: string;
}

export const LogFeed: React.FC<LogFeedProps> = ({ logs, title }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl border border-slate-800 overflow-hidden font-mono">
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center space-x-2">
        <Terminal size={14} className="text-slate-500" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 && (
          <div className="text-slate-600 text-sm italic text-center mt-10">System Ready. Awaiting Input...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="min-w-[40px] text-xs text-slate-600 pt-1">
              W{log.turn}
            </div>
            <div className="flex-1">
              <span className={`
                text-xs font-bold mr-2 px-1.5 py-0.5 rounded uppercase
                ${log.source === 'CEO' ? 'bg-indigo-500/20 text-indigo-300' : 
                  log.source === 'SYSTEM' ? 'bg-slate-700/30 text-slate-400' : 
                  log.source === 'MARKET' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-pink-500/20 text-pink-300'}
              `}>
                {log.source}
              </span>
              <span className={`
                ${log.sentiment === 'positive' ? 'text-emerald-200' : 
                  log.sentiment === 'negative' ? 'text-red-300' : 'text-slate-300'}
              `}>
                {log.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};