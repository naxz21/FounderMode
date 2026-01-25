import React from 'react';
import { Objective, Language, DICTIONARY } from '../types';
import { CheckCircle2, Circle, Target } from 'lucide-react';

interface ObjectivesPanelProps {
    objectives: Objective[];
    language: Language;
}

export const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({ objectives, language }) => {
    const dict = DICTIONARY[language];

    if (!objectives || objectives.length === 0) return null;

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <Target size={14} className="mr-2 text-indigo-400" />
                {dict.objectives}
            </h3>
            <div className="space-y-2">
                {objectives.map(obj => (
                    <div key={obj.id} className={`
                        flex items-center justify-between p-3 rounded-lg border transition-all
                        ${obj.isCompleted 
                            ? 'bg-emerald-950/20 border-emerald-900/50 opacity-60' 
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}
                    `}>
                        <div className="flex items-center gap-3">
                            <div className={obj.isCompleted ? 'text-emerald-500' : 'text-slate-500'}>
                                {obj.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </div>
                            <span className={`text-sm ${obj.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {obj.description}
                            </span>
                        </div>
                        {!obj.isCompleted && (
                            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded">
                                {obj.reward}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};