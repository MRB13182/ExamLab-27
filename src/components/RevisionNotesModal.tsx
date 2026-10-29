import React, { useState } from "react";
import { X, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { HSC_REVISION_NOTES } from "../data/revisionNotes";

interface RevisionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevisionNotesModal: React.FC<RevisionNotesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSubject, setActiveSubject] = useState("all");

  if (!isOpen) return null;

  const filtered = HSC_REVISION_NOTES.filter((note) => {
    if (activeSubject !== "all" && note.subject !== activeSubject) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">নোটস ও কুইক রিভিশন শীট</h2>
              <p className="text-xs text-slate-500">
                পরীক্ষার আগে দ্রুত সূত্র ও গুরুত্বপূর্ণ কনসেপ্ট রিভিশন দাও
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

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: "all", label: "সকল নোট" },
            { id: "পদার্থবিজ্ঞান", label: "পদার্থবিজ্ঞান" },
            { id: "রসায়ন", label: "রসায়ন" },
            { id: "উচ্চতর গণিত", label: "উচ্চতর গণিত" },
            { id: "তথ্য ও যোগাযোগ প্রযুক্তি", label: "ICT" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubject(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeSubject === tab.id
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notes list */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold">
                      {note.subject} · {note.paper}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      অধ্যায়: {note.chapter}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{note.title}</h3>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>গুরুত্বপূর্ণ পয়েন্টসমূহ</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {note.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulas if any */}
              {note.formulas && note.formulas.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                  <p className="font-bold font-sans text-xs text-slate-500 uppercase tracking-wider mb-1">
                    প্রয়োজনীয় সূত্রাবলী:
                  </p>
                  {note.formulas.map((f, i) => (
                    <div key={i} className="py-0.5 text-indigo-900 font-semibold">
                      {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Key concepts */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  নিয়ম ও বোর্ডের টেকনিক:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {note.keyConcepts.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
