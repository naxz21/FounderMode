import React, { useState, useEffect, useRef } from 'react';
import { Agent, Language, DICTIONARY } from '../types';
import { interactWithAgent } from '../services/geminiService';
import { X, Send, User, Cpu, Loader2 } from 'lucide-react';

interface AgentChatProps {
    agent: Agent;
    language: Language;
    onClose: () => void;
    onUpdateAgent: (moraleDelta: number, skillDelta: number) => void;
}

interface ChatMessage {
    id: string;
    sender: 'CEO' | 'AGENT';
    text: string;
}

export const AgentChat: React.FC<AgentChatProps> = ({ agent, language, onClose, onUpdateAgent }) => {
    const dict = DICTIONARY[language];
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        setMessages([{
            id: 'init',
            sender: 'AGENT',
            text: `Hey boss. What's on your mind?`
        }]);
    }, [agent.id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'CEO', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const result = await interactWithAgent(agent, userMsg.text);
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'AGENT',
                text: result.response
            }]);

            // Apply updates
            onUpdateAgent(result.moraleChange, result.skillChange);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'AGENT',
                text: "*Connection lost...*"
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
                
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                             {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-slate-800" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {agent.name} 
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wider">{dict.chatWith}</span>
                            </h3>
                            <div className="flex gap-2 text-xs text-slate-400">
                                <span>Morale: <span className={agent.morale < 30 ? 'text-red-400' : 'text-emerald-400'}>{agent.morale}</span></span>
                                <span>Skill: {agent.skillLevel}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'CEO' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg
                                ${msg.sender === 'CEO' 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700">
                                 <Loader2 size={16} className="animate-spin text-slate-400" />
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={dict.chatPlaceholder}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={!input || loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg transition disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};