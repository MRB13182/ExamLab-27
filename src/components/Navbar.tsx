import React, { useState } from "react";
import { BookOpen, History, Award, Sparkles, Download, Menu } from "lucide-react";

interface NavbarProps {
  onGoHome: () => void;
  onOpenHistory: () => void;
  onOpenGuidelines: () => void;
  historyCount: number;
  isInExam?: boolean;
  onExportData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome, onOpenHistory, onOpenGuidelines, historyCount, isInExam, onExportData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={onGoHome} disabled={isInExam} className="flex items-center gap-2.5 text-left group rounded-lg p-1 disabled:opacity-50">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block">HSC 2027 AI Exam Lab</span>
            <span className="hidden sm:block text-[10px] text-slate-500">Practice Smart · Score Higher</span>
          </div>
        </button>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={onGoHome} disabled={isInExam} className="hover:text-slate-900 disabled:opacity-40">পরীক্ষা প্রস্তুতি</button>
          <button onClick={onOpenHistory} className="flex items-center gap-1.5 hover:text-slate-900"><History className="w-4 h-4 text-slate-400"/>পরীক্ষার রেকর্ড {historyCount > 0 ? "(" + historyCount + ")" : ""}</button>
          <button onClick={onOpenGuidelines} className="flex items-center gap-1.5 hover:text-slate-900"><Award className="w-4 h-4 text-slate-400"/>নির্দেশিকা</button>
          <button onClick={onExportData} title="সব ডেটা ডাউনলোড" className="p-2 rounded-xl text-indigo-700 border border-indigo-100 hover:bg-indigo-50"><Download className="w-5 h-5"/></button>
        </nav>
        <div className="relative flex items-center gap-2">
          <button onClick={onGoHome} disabled={isInExam} className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 shadow-sm whitespace-nowrap">
            <Sparkles className="w-4 h-4" /><span>নতুন টেস্ট</span>
          </button>
          <button onClick={() => setMenuOpen((open) => !open)} className="md:hidden p-2 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl" title="মেনু" aria-label="মেনু খুলুন">
            <Menu className="w-5 h-5"/>
          </button>
          {menuOpen && (
            <div className="md:hidden absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl flex flex-col gap-1">
              <button onClick={() => { onOpenHistory(); closeMenu(); }} className="rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"><History className="w-4 h-4"/>পরীক্ষার রেকর্ড</button>
              <button onClick={() => { onOpenGuidelines(); closeMenu(); }} className="rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"><Award className="w-4 h-4"/>নির্দেশিকা</button>
              <button onClick={() => { onExportData(); closeMenu(); }} className="rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"><Download className="w-4 h-4"/>সব ডেটা ডাউনলোড</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
