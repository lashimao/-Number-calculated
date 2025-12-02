import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Calendar, ArrowRight, Download, BookOpen, Trash2 } from 'lucide-react';
import { COURSE_CONTENT } from '../constants';
import { ChatMessage } from '../types';

interface ChapterHistory {
    chapterId: string;
    chapterTitle: string;
    messageCount: number;
    lastUpdated: number;
    messages: ChatMessage[];
}

const HistoryView: React.FC = () => {
    const [histories, setHistories] = useState<ChapterHistory[]>([]);

    const loadHistories = () => {
        const loadedHistories: ChapterHistory[] = [];
        
        COURSE_CONTENT.forEach(chapter => {
            const saved = localStorage.getItem(`chat_history_${chapter.id}`);
            if (saved) {
                try {
                    const messages: ChatMessage[] = JSON.parse(saved);
                    if (messages.length > 0) {
                        loadedHistories.push({
                            chapterId: chapter.id,
                            chapterTitle: chapter.title,
                            messageCount: messages.length,
                            lastUpdated: messages[messages.length - 1].timestamp,
                            messages: messages
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse history", e);
                }
            }
        });

        // Sort by last updated (newest first)
        loadedHistories.sort((a, b) => b.lastUpdated - a.lastUpdated);
        setHistories(loadedHistories);
    };

    useEffect(() => {
        loadHistories();
    }, []);

    const exportChapterHistory = (h: ChapterHistory) => {
        const content = h.messages.map(m => {
            const time = new Date(m.timestamp).toLocaleString();
            const role = m.role === 'user' ? '学生' : 'Gemini助教';
            return `### ${role} (${time})\n\n${m.content}\n\n---\n\n`;
        }).join('');

        const header = `# 《${h.chapterTitle}》学习对话记录\n\n导出时间: ${new Date().toLocaleString()}\n\n=============================================\n\n`;
        const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NumCalc_History_${h.chapterId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const clearChapterHistory = (chapterId: string) => {
        if(window.confirm("确定要删除此章节的所有对话记录吗？此操作不可撤销。")) {
            localStorage.removeItem(`chat_history_${chapterId}`);
            loadHistories();
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-12 lg:py-12">
            <header className="mb-8">
                <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium mb-3 bg-indigo-50 px-3 py-1 rounded-full">
                    <MessageSquare className="w-4 h-4" />
                    <span>My Q&A Archive</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-academic mb-4">
                    我的问答记录
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    随时回顾你与 Gemini 助教的对话，复习难点，或将知识导出保存。
                </p>
            </header>

            {histories.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">暂无对话记录</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        你还没有开始提问。前往任意章节，点击底部的“Gemini 3 智能助教”开始学习吧！
                    </p>
                    <NavLink 
                        to={`/chapter/${COURSE_CONTENT[0].id}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        开始学习 <ArrowRight className="w-4 h-4" />
                    </NavLink>
                </div>
            ) : (
                <div className="grid gap-6">
                    {histories.map((h) => (
                        <div key={h.chapterId} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 font-serif">
                                            {h.chapterTitle}
                                        </h3>
                                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                            {h.messageCount} 条对话
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            上次活跃: {new Date(h.lastUpdated).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {/* Preview last message */}
                                    <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 max-w-2xl">
                                        <span className="font-bold text-xs text-indigo-600 uppercase tracking-wide mb-1 block">
                                            Last Question
                                        </span>
                                        <p className="line-clamp-2">
                                            {[...h.messages].reverse().find(m => m.role === 'user')?.content || "No user messages"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                                    <button 
                                        onClick={() => exportChapterHistory(h)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        导出
                                    </button>
                                    <NavLink 
                                        to={`/chapter/${h.chapterId}`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        继续提问
                                    </NavLink>
                                    <button
                                        onClick={() => clearChapterHistory(h.chapterId)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="删除记录"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryView;