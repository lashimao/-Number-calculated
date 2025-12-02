import React, { useState, useEffect, useRef } from 'react';
import { askGeminiTutor } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { Loader2, Sparkles, Send, Trash2, Bot, User, Download } from 'lucide-react';
import { ChatMessage } from '../types';

interface PracticeGeneratorProps {
    topic: string;
    context: string;
    chapterId: string;
}

const PracticeGenerator: React.FC<PracticeGeneratorProps> = ({ topic, context, chapterId }) => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load history from local storage when chapterId changes
    useEffect(() => {
        const savedHistory = localStorage.getItem(`chat_history_${chapterId}`);
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            setMessages([]);
        }
    }, [chapterId]);

    // Save history to local storage whenever messages change
    useEffect(() => {
        if (chapterId) {
            localStorage.setItem(`chat_history_${chapterId}`, JSON.stringify(messages));
        }
        // Auto scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, chapterId]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userQuestion = input.trim();
        const newMessage: ChatMessage = { role: 'user', content: userQuestion, timestamp: Date.now() };
        
        // Optimistically add user message
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        // Get AI response
        const answer = await askGeminiTutor(userQuestion, messages, context);
        
        if (answer) {
            const aiMessage: ChatMessage = { role: 'model', content: answer, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMessage]);
        }
        
        setLoading(false);
    };

    const clearHistory = () => {
        if (window.confirm('确定要清空本章节的对话历史吗？')) {
            setMessages([]);
            localStorage.removeItem(`chat_history_${chapterId}`);
        }
    };

    const exportHistory = () => {
        if (messages.length === 0) return;

        const content = messages.map(m => {
            const time = new Date(m.timestamp).toLocaleString();
            const role = m.role === 'user' ? '学生' : 'Gemini助教';
            return `### ${role} (${time})\n\n${m.content}\n\n---\n\n`;
        }).join('');

        const header = `# 《${topic}》学习对话记录\n\n导出时间: ${new Date().toLocaleString()}\n\n=============================================\n\n`;
        const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NumCalc_Note_${chapterId}_${new Date().toISOString().slice(0,10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="mt-8 bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden ring-1 ring-indigo-50 flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <div>
                        <h3 className="font-serif font-bold text-lg leading-none">Gemini 3 智能助教</h3>
                        <p className="text-xs text-indigo-200 mt-1 opacity-80">Context: {topic}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/50 px-2 py-1 rounded border border-indigo-400/30 hidden sm:inline-block mr-2">
                        Pro Model
                    </span>
                    {messages.length > 0 && (
                        <>
                            <button 
                                onClick={exportHistory}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-100 transition-colors"
                                title="导出为 Markdown"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={clearHistory}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-100 transition-colors"
                                title="清空历史"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <Bot className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-sm max-w-xs">
                            你好！我是你的专属助教。
                            <br/>
                            关于 <strong>{topic}</strong>，无论是公式推导还是例题解析，随时问我！
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={msg.timestamp + idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}
                            `}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            </div>
                            
                            <div className={`
                                max-w-[85%] rounded-2xl p-4 shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}
                            `}>
                                {msg.role === 'user' ? (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                ) : (
                                    <MarkdownRenderer content={msg.content} />
                                )}
                                <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-slate-400 text-sm">正在思考中...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <form onSubmit={handleAsk} className="relative flex items-end gap-2">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="输入你的问题..."
                            className="w-full p-3 pr-10 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none max-h-32 min-h-[50px] text-slate-800 placeholder:text-slate-400 transition-all"
                            style={{ height: '52px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAsk(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm mb-[1px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PracticeGenerator;