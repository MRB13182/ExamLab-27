import React from "react";
import {
  Home,
  Sparkles,
  Layers,
  Award,
  BarChart3,
  BookOpen,
  Smartphone,
  Menu,
  Plus
} from "lucide-react";

interface BottomNavProps {
  currentTab: string;
  onGoHome: () => void;
  onStartExam: () => void;
  onOpenSubjects: () => void;
  onOpenBoardQuestions: () => void;
  onOpenHistory: () => void;
  onOpenNotes: () => void;
  onOpenMenu: () => void;
  apkDownloadUrl: string;
  isInExam?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onGoHome,
  onStartExam,
  onOpenSubjects,
  onOpenBoardQuestions,
  onOpenHistory,
  onOpenNotes,
  onOpenMenu,
  apkDownloadUrl,
  isInExam,
}) => {
  if (isInExam) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
        {/* 1: Home */}
        <button
          type="button"
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentTab === "home" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">হোম</span>
        </button>

        {/* 2: পরীক্ষা (Exam) */}
        <button
          type="button"
          onClick={onStartExam}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${
            currentTab === "exam" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">পরীক্ষা</span>
        </button>

        {/* 3: বিষয় (Subjects) */}
        <button
          type="button"
          onClick={onOpenSubjects}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">বিষয়</span>
        </button>

        {/* 4: বিগত প্রশ্ন (Board Questions) */}
        <button
          type="button"
          onClick={onOpenBoardQuestions}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">বিগত প্রশ্ন</span>
        </button>

        {/* 5: Floating Center Quick Action */}
        <button
          type="button"
          onClick={onStartExam}
          aria-label="নতুন টেস্ট তৈরি"
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-white active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* 6: রেজাল্ট (Results) */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">রেজাল্ট</span>
        </button>

        {/* 7: নোটস (Notes) */}
        <button
          type="button"
          onClick={onOpenNotes}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">নোটস</span>
        </button>

        {/* 8: APK ডাউনলোড */}
        <a
          href={apkDownloadUrl}
          download="HSC-2027-AI-Exam-Lab-debug.apk"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-indigo-700 hover:text-indigo-900 transition-all cursor-pointer"
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">APK</span>
        </a>

        {/* 9: মেনু (Menu) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">মেনু</span>
        </button>
      </div>
    </nav>
  );
};
