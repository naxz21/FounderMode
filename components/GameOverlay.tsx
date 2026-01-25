import React from 'react';
import { GameStatus, Language, DICTIONARY } from '../types';
import { Trophy, Skull, RotateCcw } from 'lucide-react';

interface GameOverlayProps {
  status: GameStatus;
  language: Language;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ status, language, onRestart }) => {
  if (status === GameStatus.PLAYING) return null;

  const dict = DICTIONARY[language];
  const isWon = status === GameStatus.WON;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`
        relative max-w-md w-full mx-6 p-8 rounded-2xl border-2 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]
        ${isWon ? 'border-emerald-500/50 bg-emerald-950/40' : 'border-red-500/50 bg-red-950/40'}
      `}>
        <div className={`
          mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6
          ${isWon ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
        `}>
          {isWon ? <Trophy size={40} /> : <Skull size={40} />}
        </div>

        <h2 className={`text-3xl font-black mb-2 tracking-tighter ${isWon ? 'text-white' : 'text-red-500'}`}>
          {isWon ? dict.victory : dict.gameOver}
        </h2>
        
        <p className="text-slate-300 mb-8 leading-relaxed">
          {isWon ? dict.victoryMsg : dict.bankruptMsg}
        </p>

        <button 
          onClick={onRestart}
          className={`
            w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]
            ${isWon 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'}
          `}
        >
          <RotateCcw size={20} />
          <span>{dict.restart}</span>
        </button>
      </div>
    </div>
  );
};