import React from "react";
import { Home, ClipboardList, History, Smartphone } from "lucide-react";

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
  currentTab, onGoHome, onStartExam, onOpenSubjects, onOpenHistory, apkDownloadUrl, isInExam,
}) => {
  if (isInExam) return null;
  const items = [
    { label: "হোম", icon: Home, onClick: onGoHome, active: currentTab === "home" },
    { label: "পরীক্ষা", icon: ClipboardList, onClick: onStartExam, active: currentTab === "exam" },
    { label: "বিষয়", icon: ClipboardList, onClick: onOpenSubjects, active: false },
    { label: "রেজাল্ট", icon: History, onClick: onOpenHistory, active: false },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 shadow-lg backdrop-blur-md md:hidden print:hidden" aria-label="স্টুডেন্ট নেভিগেশন">
      <div className="mx-auto flex max-w-lg items-center justify-around gap-2">
        {items.map(({ label, icon: Icon, onClick, active }) => (
          <button key={label} type="button" onClick={onClick} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition ${active ? "bg-blue-50 text-blue-800" : "text-slate-500 hover:bg-slate-50"}`}>
            <Icon className="h-5 w-5" /><span>{label}</span>
          </button>
        ))}
        <a href={apkDownloadUrl} download="HSC-2027-AI-Exam-Lab-debug.apk" className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">
          <Smartphone className="h-5 w-5" /><span>APK</span>
        </a>
      </div>
    </nav>
  );
};
