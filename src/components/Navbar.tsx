import React, { useState } from "react";
import { Home, Monitor, Clock, Download, Search, Menu, X, ChevronDown } from "lucide-react";

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
  onGoHome, onOpenHistory, historyCount, isInExam, onOpenChapterSelector, onOpenSearch, onNewExamClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobile = () => setMobileMenuOpen(false);

  const links = [
    { label: "হোম", action: onGoHome, icon: Home },
    { label: "নতুন পরীক্ষা", action: onNewExamClick || onGoHome, icon: Monitor },
    { label: "অধ্যায় নির্বাচন", action: onOpenChapterSelector || (() => {}), icon: ChevronDown },
    { label: `আমার রেজাল্ট${historyCount ? ` (${historyCount})` : ""}`, action: onOpenHistory, icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onGoHome} disabled={isInExam} className="flex items-center gap-3 rounded-xl text-left disabled:opacity-60">
          <img src="/logo-favicon.png" alt="Exam Lab" className="h-10 w-10 rounded-xl border border-slate-200 object-contain" />
          <span className="block"><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-blue-700">HSC Practice</span><span className="block text-lg font-extrabold tracking-tight text-slate-900">Exam Lab</span></span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ label, action, icon: Icon }, index) => (
            <button key={label} type="button" onClick={action} disabled={isInExam && index < 2} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50">
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          <a href={DEBUG_APK_URL} download="HSC-2027-AI-Exam-Lab-debug.apk" className="ml-1 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800" title="Download Android APK">
            <Download className="h-4 w-4" />APK ডাউনলোড
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenSearch} aria-label="Search subject and chapter" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Search className="h-4 w-4" /></button>
          <a href={DEBUG_APK_URL} download="HSC-2027-AI-Exam-Lab-debug.apk" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 lg:hidden"><Download className="h-4 w-4" />APK</a>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="space-y-1 border-t border-slate-200 bg-white p-3 lg:hidden">
          {links.map(({ label, action, icon: Icon }, index) => (
            <button key={label} type="button" onClick={() => { action(); closeMobile(); }} disabled={isInExam && index < 2} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:opacity-50">
              <Icon className="h-4 w-4 text-blue-700" />{label}
            </button>
          ))}
          <a href={DEBUG_APK_URL} download="HSC-2027-AI-Exam-Lab-debug.apk" onClick={closeMobile} className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800"><Download className="h-4 w-4" />Android APK ডাউনলোড</a>
        </nav>
      )}
    </header>
  );
};
