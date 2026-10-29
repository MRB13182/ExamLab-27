import React, { useState } from "react";
import {
  Home,
  Monitor,
  Trophy,
  FileText,
  Clock,
  BookOpen,
  BarChart2,
  Download,
  Search,
  User,
  Sparkles,
  Menu,
  X,
  Upload,
  Award,
  ChevronDown,
} from "lucide-react";

export const DEBUG_APK_URL = "https://github.com/MRB13182/ExamLab-27/raw/refs/heads/main/APK_DOWNLOAD/app-debug.apk";

interface NavbarProps {
  onGoHome: () => void;
  onOpenHistory: () => void;
  onOpenGuidelines: () => void;
  historyCount: number;
  isInExam?: boolean;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onOpenBoardQuestions?: () => void;
  onOpenRevisionNotes?: () => void;
  onOpenChapterSelector?: () => void;
  onOpenSearch?: () => void;
  onNewExamClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenHistory,
  onOpenGuidelines,
  historyCount,
  isInExam,
  onExportData,
  onImportData,
  onOpenBoardQuestions,
  onOpenRevisionNotes,
  onOpenChapterSelector,
  onOpenSearch,
  onNewExamClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0d2044] text-white border-b border-[#1b3363] shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          disabled={isInExam}
          className="flex items-center gap-2.5 text-left group rounded-xl p-1 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <img
            src="/logo-favicon.png"
            alt="ExamLab Logo"
            className="w-9 h-9 rounded-xl object-contain bg-white/10 p-0.5 border border-white/20 shadow-xs"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold tracking-wider text-sky-300 uppercase">HSC 2027</span>
            </div>
            <span className="text-base font-black tracking-tight text-white leading-tight">
              AI Exam Lab
            </span>
            <span className="hidden sm:block text-[9.5px] text-sky-200/80 -mt-0.5">
              Practice Smart. Score Higher.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold text-slate-200">
          <button
            onClick={onGoHome}
            disabled={isInExam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-500 transition-colors disabled:opacity-40"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={onNewExamClick || onGoHome}
            disabled={isInExam}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
          >
            <Monitor className="w-4 h-4 text-sky-300" />
            <span>নতুন পরীক্ষা</span>
          </button>

          <button
            onClick={onOpenChapterSelector}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <Trophy className="w-4 h-4 text-emerald-300" />
            <span>চ্যাপ্টারভিত্তিক</span>
          </button>

          <button
            onClick={onOpenBoardQuestions}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>বিগত প্রশ্ন</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors relative"
          >
            <Clock className="w-4 h-4 text-indigo-300" />
            <span>রেজাল্ট</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/40">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenRevisionNotes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4 text-orange-300" />
            <span>নোটস</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-cyan-300" />
            <span>প্রগ্রেস</span>
          </button>

          <a
            href={DEBUG_APK_URL}
            download="HSC-2027-AI-Exam-Lab-debug.apk"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white text-sky-300 transition-colors"
            title="Download Android APK"
          >
            <Download className="w-4 h-4" />
            <span>APK ডাউনলোড</span>
          </a>

          {/* "আরও" More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span>আরও</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {moreDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-[#0a1936] border border-[#1b3363] p-2 shadow-2xl text-xs space-y-1">
                  <button
                    onClick={() => {
                      onOpenGuidelines();
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 hover:text-white"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>বোর্ড নির্দেশিকা</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportData();
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 hover:text-white"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>ডেটা ব্যাকআপ ডাউনলোড</span>
                  </button>
                  <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left text-slate-200 hover:text-white cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>ব্যাকআপ রিস্টোর (JSON)</span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onImportData(file);
                        event.currentTarget.value = "";
                        setMoreDropdownOpen(false);
                      }}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Action Icons: Search, Profile, Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Search subjects, chapters, board questions"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuidelines}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 hidden sm:flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Profile & Student Info"
            aria-label="Profile"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Student Avatar 'Z' */}
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-sky-300/40 text-white font-black text-sm flex items-center justify-center shadow-xs cursor-pointer select-none"
            title="Student Profile: HSC 2027"
          >
            Z
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="xl:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors ml-1"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#1b3363] bg-[#0a1936] px-4 py-3 space-y-1.5 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onGoHome();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 text-white"
            >
              <Home className="w-4 h-4" />
              <span>হোম</span>
            </button>

            <button
              onClick={() => {
                if (onNewExamClick) onNewExamClick();
                else onGoHome();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            >
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>নতুন পরীক্ষা</span>
            </button>

            <button
              onClick={() => {
                if (onOpenChapterSelector) onOpenChapterSelector();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>চ্যাপ্টারভিত্তিক</span>
            </button>

            <button
              onClick={() => {
                if (onOpenBoardQuestions) onOpenBoardQuestions();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>বিগত প্রশ্ন</span>
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>রেজাল্ট ({historyCount})</span>
            </button>

            <button
              onClick={() => {
                if (onOpenRevisionNotes) onOpenRevisionNotes();
                closeMobile();
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            >
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span>নোটস</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#1b3363] flex flex-col gap-1.5 text-xs">
            <a
              href={DEBUG_APK_URL}
              download="HSC-2027-AI-Exam-Lab-debug.apk"
              onClick={closeMobile}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>অফিসিয়াল Android APK ডাউনলোড</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onExportData();
                  closeMobile();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ব্যাকআপ</span>
              </button>
              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>রিস্টোর</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImportData(file);
                    closeMobile();
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
