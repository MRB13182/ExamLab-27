import React from "react";
import { BookOpen, History, Award, Sparkles } from "lucide-react";

interface NavbarProps {
  onGoHome: () => void;
  onOpenHistory: () => void;
  onOpenGuidelines: () => void;
  historyCount: number;
  isInExam?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenHistory,
  onOpenGuidelines,
  historyCount,
  isInExam,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block">
              HSC 2027 AI Exam Lab
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={onGoHome}
            disabled={isInExam}
            className={`transition-colors whitespace-nowrap ${
              isInExam ? "opacity-40 cursor-not-allowed" : "hover:text-slate-900"
            }`}
          >
            পরীক্ষা প্রস্তুতি
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>পরীক্ষার রেকর্ড</span>
            {historyCount > 0 && (
              <span className="text-xs text-indigo-700 font-semibold ml-0.5 tabular-nums">
                ({historyCount})
              </span>
            )}
          </button>
          <button
            onClick={onOpenGuidelines}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Award className="w-4 h-4 text-slate-400" />
            <span>বোর্ড নির্দেশিকা</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenHistory}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="পরীক্ষার রেকর্ড"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenGuidelines}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="বোর্ড নির্দেশিকা"
          >
            <Award className="w-5 h-5" />
          </button>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>নতুন টেস্ট</span>
          </button>
        </div>
      </div>
    </header>
  );
};
