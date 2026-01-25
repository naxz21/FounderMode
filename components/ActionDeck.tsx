import React from 'react';
import { ActionCard, Language } from '../types';
import { Code, Megaphone, DollarSign, Zap, UserPlus, Mail, Feather, Shuffle, ArrowRight } from 'lucide-react';

interface ActionDeckProps {
  cards: ActionCard[];
  onPlayCard: (card: ActionCard) => void;
  disabled: boolean;
  language: Language;
}

const IconMap: Record<string, React.ReactNode> = {
  'Code': <Code size={14} />,
  'Megaphone': <Megaphone size={14} />,
  'DollarSign': <DollarSign size={14} />,
  'Zap': <Zap size={14} />,
  'UserPlus': <UserPlus size={14} />,
  'Mail': <Mail size={14} />,
  'Feather': <Feather size={14} />,
  'Shuffle': <Shuffle size={14} />,
};

export const ActionDeck: React.FC<ActionDeckProps> = ({ cards, onPlayCard, disabled, language }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-1 snap-x no-scrollbar items-end">
      {cards.map((card, idx) => {
        const typeColor = 
          card.type === 'GROWTH' ? 'border-indigo-500/50 hover:bg-indigo-900/20' :
          card.type === 'PRODUCT' ? 'border-cyan-500/50 hover:bg-cyan-900/20' :
          card.type === 'FINANCE' ? 'border-emerald-500/50 hover:bg-emerald-900/20' :
          card.type === 'RISK' ? 'border-orange-500/50 hover:bg-orange-900/20' :
          'border-slate-500/50 hover:bg-slate-900/20';
          
        const iconColor =
          card.type === 'GROWTH' ? 'text-indigo-400' :
          card.type === 'PRODUCT' ? 'text-cyan-400' :
          card.type === 'FINANCE' ? 'text-emerald-400' :
          card.type === 'RISK' ? 'text-orange-400' :
          'text-slate-400';

        return (
          <button
            key={`${card.id}-${idx}`}
            onClick={() => onPlayCard(card)}
            disabled={disabled}
            className={`
              snap-center shrink-0 w-28 h-32 bg-slate-900/90 backdrop-blur-md rounded-lg border flex flex-col p-2 text-left transition-all duration-200 group hover:-translate-y-1 hover:shadow-lg hover:z-10 relative
              ${typeColor}
              ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex justify-between items-start mb-1.5">
               <div className={`p-1 rounded bg-black/40 ${iconColor}`}>
                   {IconMap[card.icon] || <Zap size={14} />}
               </div>
               <div className="text-[9px] font-mono opacity-60 bg-black/30 px-1 py-0.5 rounded text-slate-300">
                   {card.cost}
               </div>
            </div>
            
            <h4 className="font-bold text-xs text-slate-200 leading-tight mb-0.5 group-hover:text-white line-clamp-2">{card.title}</h4>
            <p className="text-[9px] text-slate-500 leading-tight line-clamp-3">{card.description}</p>
            
            <div className="mt-auto pt-1.5 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500">{card.type}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};