import React, { useState } from 'react';
import { DICTIONARY, Language, BusinessPlan } from '../types';
import { ChevronRight, Play, Terminal, Users, DollarSign, Trophy } from 'lucide-react';

interface OnboardingProps {
  language: Language;
  businessPlan: BusinessPlan;
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ language, businessPlan, onComplete }) => {
  const [step, setStep] = useState(0);
  const dict = DICTIONARY[language].tutorial;

  const steps = [
    {
      icon: <Terminal size={48} className="text-indigo-400" />,
      title: dict.step1Title,
      content: (
        <div className="text-center">
            <p className="text-slate-400 mb-4">{dict.step1Desc}</p>
            <div className="bg-slate-900/50 border border-indigo-500/30 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-1">{businessPlan.name}</h3>
                <p className="text-sm text-indigo-300">{businessPlan.mission}</p>
            </div>
        </div>
      )
    },
    {
        icon: <DollarSign size={48} className="text-emerald-400" />,
        title: dict.step2Title,
        content: <p className="text-slate-300 leading-relaxed text-center px-4">{dict.step2Desc}</p>
    },
    {
        icon: <Users size={48} className="text-cyan-400" />,
        title: dict.step3Title,
        content: <p className="text-slate-300 leading-relaxed text-center px-4">{dict.step3Desc}</p>
    },
    {
        icon: <Trophy size={48} className="text-yellow-400" />,
        title: dict.step4Title,
        content: <p className="text-slate-300 leading-relaxed text-center px-4">{dict.step4Desc}</p>
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="max-w-lg w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 relative z-10">
            {steps.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${idx <= step ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            ))}
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 key={step}">
            <div className="mb-6 p-6 rounded-full bg-slate-900/80 border border-slate-700 shadow-xl">
                {currentStep.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{currentStep.title}</h2>
            <div className="text-base text-slate-300">
                {currentStep.content}
            </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-900 relative z-10">
            <button 
                onClick={() => setStep(Math.max(0, step - 1))}
                className={`text-sm text-slate-500 hover:text-white transition ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
                Back
            </button>
            <button
                onClick={() => {
                    if (step < steps.length - 1) {
                        setStep(step + 1);
                    } else {
                        onComplete();
                    }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/50 transition-all"
            >
                {step < steps.length - 1 ? (
                    <>
                       {dict.next} <ChevronRight size={16} className="ml-1" />
                    </>
                ) : (
                    <>
                       {dict.start} <Play size={16} className="ml-1 fill-current" />
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};