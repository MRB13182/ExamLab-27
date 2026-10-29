import React, { useState } from "react";
import { X, Award, Clock, ArrowRight, Filter } from "lucide-react";
import { HSC_BOARD_QUESTIONS, BoardQuestionSet } from "../data/boardQuestions";

interface BoardQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBoardQuestion: (qSet: BoardQuestionSet) => void;
}

export const BoardQuestionsModal: React.FC<BoardQuestionsModalProps> = ({
  isOpen,
  onClose,
  onSelectBoardQuestion,
}) => {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedBoard, setSelectedBoard] = useState("all");

  if (!isOpen) return null;

  const filtered = HSC_BOARD_QUESTIONS.filter((item) => {
    if (selectedSubject !== "all" && item.subject !== selectedSubject) return false;
    if (selectedBoard !== "all" && !item.board.includes(selectedBoard)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">বিগত বছরের বোর্ড প্রশ্ন ব্যাংক</h2>
              <p className="text-xs text-slate-500">
                ঢাকা, রাজশাহী, চট্টগ্রাম সহ সকল বোর্ডের বিগত পরীক্ষার স্ট্যান্ডার্ড প্রশ্নাবলী
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">সকল বিষয়</option>
            <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
            <option value="রসায়ন">রসায়ন</option>
            <option value="উচ্চতর গণিত">উচ্চতর গণিত</option>
            <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
            <option value="তথ্য ও যোগাযোগ প্রযুক্তি">ICT</option>
          </select>

          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">সকল বোর্ড</option>
            <option value="ঢাকা">ঢাকা বোর্ড</option>
            <option value="রাজশাহী">রাজশাহী বোর্ড</option>
            <option value="চট্টগ্রাম">চট্টগ্রাম বোর্ড</option>
            <option value="কুমিল্লা">কুমিল্লা বোর্ড</option>
            <option value="যশোর">যশোর বোর্ড</option>
          </select>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              নির্বাচিত ফিল্টারে কোনো প্রশ্নপত্র পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                      {item.board} — {item.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      {item.subject} ({item.paper})
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                      {item.type === "Both" ? "CQ + MCQ" : item.type}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">{item.description}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.durationMinutes} মিনিট</span>
                    </span>
                    <span>·</span>
                    <span>মোট নম্বর: {item.totalMarks}</span>
                    <span>·</span>
                    <span className="truncate max-w-xs hidden sm:inline">
                      অধ্যায়: {item.topicsCovered.slice(0, 3).join(", ")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectBoardQuestion(item);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <span>অনুশীলন শুরু করো</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
