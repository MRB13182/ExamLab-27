import React, { useState } from "react";
import { X, BookOpen, Layers, ArrowRight } from "lucide-react";
import { HSC_SUBJECTS } from "../data/hscSyllabus";
import { ExamType } from "../types";

interface ChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapterExam: (subjectId: string, paper: string, chapter: string, format: ExamType) => void;
}

export const ChapterSelectorModal: React.FC<ChapterSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectChapterExam,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState("physics");
  const [activePaper, setActivePaper] = useState("১ম পত্র");

  if (!isOpen) return null;

  const currentSubject = HSC_SUBJECTS.find((s) => s.id === activeSubjectId) || HSC_SUBJECTS[0];
  const chapters = currentSubject.chapters[activePaper] || Object.values(currentSubject.chapters)[0] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">চ্যাপ্টারভিত্তিক সিলেবাস ব্রাউজার</h2>
              <p className="text-xs text-slate-500">
                অধ্যায় নির্বাচন করে সরাসরি নির্দিষ্ট অধ্যায়ের মডেল টেস্ট শুরু করো
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subject Navigation */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          {HSC_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setActiveSubjectId(sub.id);
                setActivePaper(sub.papers[0] || "");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSubjectId === sub.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Paper Tabs if multiple */}
        {currentSubject.papers.length > 1 && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">পত্র:</span>
            {currentSubject.papers.map((p) => (
              <button
                key={p}
                onClick={() => setActivePaper(p)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activePaper === p
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Chapters Grid */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chapters.map((ch, idx) => (
              <div
                key={ch}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {ch}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChapterExam(currentSubject.id, activePaper, ch, "MCQ");
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    MCQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChapterExam(currentSubject.id, activePaper, ch, "CQ");
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    CQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
