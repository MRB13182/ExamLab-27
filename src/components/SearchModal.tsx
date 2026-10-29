import React, { useState, useMemo } from "react";
import { X, Search, BookOpen, Award, ArrowRight } from "lucide-react";
import { HSC_SUBJECTS } from "../data/hscSyllabus";
import { HSC_BOARD_QUESTIONS } from "../data/boardQuestions";
import { HSC_REVISION_NOTES } from "../data/revisionNotes";
import { ExamType } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (subjectId: string, paper: string, chapter: string, format: ExamType) => void;
  onOpenNotes: () => void;
  onOpenBoardQuestions: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
  onOpenNotes,
  onOpenBoardQuestions,
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  // Flatten all chapters
  const allChapters = useMemo(() => {
    const list: Array<{ subject: string; subjectId: string; paper: string; chapter: string }> = [];
    for (const sub of HSC_SUBJECTS) {
      for (const [paper, chs] of Object.entries(sub.chapters)) {
        for (const ch of chs) {
          list.push({ subject: sub.name, subjectId: sub.id, paper, chapter: ch });
        }
      }
    }
    return list;
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { chapters: [], board: [], notes: [] };

    const chapters = allChapters.filter(
      (c) => c.chapter.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)
    ).slice(0, 6);

    const board = HSC_BOARD_QUESTIONS.filter(
      (b) =>
        b.subject.toLowerCase().includes(q) ||
        b.board.toLowerCase().includes(q) ||
        b.topicsCovered.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 4);

    const notes = HSC_REVISION_NOTES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.chapter.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
    ).slice(0, 4);

    return { chapters, board, notes };
  }, [query, allChapters]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="অধ্যায়, টপিক, বা বোর্ড পরীক্ষার প্রশ্ন খুঁজুন... (যেমন: গতিবিদ্যা, দ্রাব্যতা)"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              মুছুন
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              যেকোনো অধ্যায় বা বোর্ড প্রশ্নের নাম লিখলে তাৎক্ষণিক সাজেস্ট করা হবে
            </div>
          ) : (
            <>
              {/* Chapters match */}
              {searchResults.chapters.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    অধ্যায় ও পাঠ্যসূচি
                  </p>
                  <div className="space-y-1.5">
                    {searchResults.chapters.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                            {item.chapter}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.subject} · {item.paper}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectChapter(item.subjectId, item.paper, item.chapter, "MCQ");
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                          >
                            টেস্ট শুরু
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Board Questions match */}
              {searchResults.board.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    বোর্ড প্রশ্নপত্র
                  </p>
                  <div className="space-y-1.5">
                    {searchResults.board.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onOpenBoardQuestions();
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Award className="w-4 h-4 text-purple-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.board} — {item.year} ({item.subject})
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision Notes match */}
              {searchResults.notes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    রিভিশন নোটস ও সূত্র
                  </p>
                  <div className="space-y-1.5">
                    {searchResults.notes.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onOpenNotes();
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.subject} · {item.chapter}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
