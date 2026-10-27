import React from "react";
import { ExamHistoryRecord, ExamResultData } from "../types";
import { X, History, Trash2, ChevronRight, BookOpen, Clock, Award } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExamHistoryRecord[];
  onSelectRecord: (result: ExamResultData) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">পরীক্ষার রেকর্ড ও অগ্রগতি</h3>
              <p className="text-xs text-slate-500">তোমার এই ব্রাউজারে সংরক্ষিত বিগত পরীক্ষার ফলাফল</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">কোনো পূর্ববর্তী পরীক্ষার রেকর্ড নেই</p>
              <p className="text-xs text-slate-400 mt-1">
                মডেল টেস্ট সম্পন্ন করলে স্বয়ংক্রিয়ভাবে তোমার স্কোর সংরক্ষিত থাকবে।
              </p>
            </div>
          ) : (
            history.map((rec) => {
              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    onSelectRecord(rec.result);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-indigo-700 block truncate">
                      {rec.subject}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {rec.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{new Date(rec.date).toLocaleDateString("bn-BD")}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{rec.examType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 block tabular-nums">
                        {rec.score} / {rec.maxScore}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 tabular-nums">
                        {rec.percentage}%
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">মোট পরীক্ষা: {history.length} টি</span>
            <button
              onClick={() => {
                if (window.confirm("তুমি কি সব পরীক্ষার ইতিহাস মুছে ফেলতে চাও?")) {
                  onClearHistory();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ইতিহাস মুছুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
