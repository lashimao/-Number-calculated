import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronRight, BookOpen, MessageSquare } from 'lucide-react';
import { COURSE_CONTENT } from './constants';
import MarkdownRenderer from './components/MarkdownRenderer';
import PracticeGenerator from './components/PracticeGenerator';
import HistoryView from './components/HistoryView';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            {/* Sidebar Content */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3 text-indigo-700">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-lg leading-tight text-academic">NumCalc<br/>Master</h1>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        <div className="px-3 mb-2">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Modules</span>
                        </div>
                        {COURSE_CONTENT.map((chapter) => (
                            <NavLink
                                key={chapter.id}
                                to={`/chapter/${chapter.id}`}
                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200
                                    ${isActive 
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <span className="mt-0.5 text-sm font-medium truncate">{chapter.title}</span>
                            </NavLink>
                        ))}

                        <div className="px-3 mt-6 mb-2">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal</span>
                        </div>
                        <NavLink
                            to="/history"
                            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                                ${isActive 
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm font-medium">我的问答 (My Q&A)</span>
                        </NavLink>
                    </nav>

                    <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <div className="text-xs text-slate-500 text-center">
                            Numerical Analysis Crash Course<br/>
                            <span className="opacity-75">Exam Prep Edition</span>
                            <div className="mt-3 pt-3 border-t border-slate-200 font-mono text-[10px] text-slate-400 tracking-wider">
                                Designed by <span className="font-bold text-indigo-400">打印打印 3123008413</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const ChapterView = () => {
    const { pathname } = useLocation();
    const chapterId = pathname.split('/').pop();
    const chapter = COURSE_CONTENT.find(c => c.id === chapterId);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    if (!chapter) return <Navigate to="/" replace />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-12 lg:py-12">
            <header className="mb-8">
                <div className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium mb-3 bg-indigo-50 px-3 py-1 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    <span>Module: {chapter.title.split('.')[0]}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-academic mb-4">
                    {chapter.title.split('. ').slice(1).join('. ')}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4">
                    {chapter.description}
                </p>
                
                {/* Key Points Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {chapter.keyPoints.map((point, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200">
                            {point}
                        </span>
                    ))}
                </div>
            </header>

            <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-10 mb-8">
                <MarkdownRenderer content={chapter.content} />
            </main>

            <PracticeGenerator 
                key={chapter.id}
                topic={chapter.title} 
                context={chapter.content} 
                chapterId={chapter.id}
            />
        </div>
    );
};

const WelcomeView = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 text-center">
            <div className="bg-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg">
                <GraduationCap className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-academic mb-6">
                Numerical Analysis<br/>Exam Crash Course
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                A streamlined guide for the final exam. Covers Errors, Non-linear Equations, Interpolation, Integration, and more. 
                Focuses on high-frequency calculation problems.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-left mb-12">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">⚡️</div>
                    <h3 className="font-serif font-bold text-slate-900 mb-2">Formula Renderer</h3>
                    <p className="text-slate-600 text-sm">Complex math rendered beautifully with LaTeX.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-serif font-bold text-slate-900 mb-2">Gemini 3 Tutor</h3>
                    <p className="text-slate-600 text-sm">Ask detailed questions and get step-by-step explanations.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-serif font-bold text-slate-900 mb-2">Exam Focused</h3>
                    <p className="text-slate-600 text-sm">Curated content targeting high-value exam questions.</p>
                </div>
            </div>

            <NavLink 
                to={`/chapter/${COURSE_CONTENT[0].id}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg shadow-indigo-200"
            >
                Start Reviewing <ChevronRight className="w-5 h-5" />
            </NavLink>

            <div className="mt-16 pt-8 border-t border-slate-100">
                <p className="text-slate-400 font-mono text-sm">
                    Created by 打印打印 3123008413
                </p>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <HashRouter>
            <div className="min-h-screen flex bg-slate-50">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-2 font-serif font-bold text-academic">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            <span>NumCalc Master</span>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="flex-1">
                        <Routes>
                            <Route path="/" element={<WelcomeView />} />
                            <Route path="/chapter/:id" element={<ChapterView />} />
                            <Route path="/history" element={<HistoryView />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </HashRouter>
    );
};

export default App;