import React, { useState } from "react";
import { ExamResultData } from "../types";
import { downloadFullResultPdf, printCQAnswerPaper } from "../lib/print";
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  Printer,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ExamResultProps {
  result: ExamResultData;
  onRetake: () => void;
  onNewExam: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({
  result,
  onRetake,
  onNewExam,
}) => {
  const [activeTab, setActiveTab] = useState<"MCQ" | "CQ" | "FEEDBACK">(
    result.mcqResults.length > 0 ? "MCQ" : "CQ"
  );
  const [expandedCqs, setExpandedCqs] = useState<Record<string, boolean>>({});

  const toggleCqExpand = (id: string) => {
    setExpandedCqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateGrade = (pct: number) => {
    if (pct >= 80) return { grade: "A+", desc: "অসাধারণ পারফরম্যান্স", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (pct >= 70) return { grade: "A", desc: "খুব ভালো", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (pct >= 60) return { grade: "A-", desc: "সন্তোষজনক", color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
    if (pct >= 50) return { grade: "B", desc: "আরও অনুশীলনের সুযোগ আছে", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (pct >= 40) return { grade: "C", desc: "উন্নতির প্রয়োজন", color: "text-orange-700 bg-orange-50 border-orange-200" };
    if (pct >= 33) return { grade: "D", desc: "পাস নম্বর", color: "text-rose-700 bg-rose-50 border-rose-200" };
    return { grade: "F", desc: "পুনরায় মনোযোগ দিয়ে রিভিশন দাও", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const gradeInfo = calculateGrade(result.percentage);

  const formatMinutes = (secs?: number) => {
    if (!secs) return "নির্দিষ্ট সময়";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} মিনিট ${s} সেকেন্ড`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Result Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-2">
              <span>মূল্যায়ন প্রতিবেদন</span>
              <span aria-hidden="true">·</span>
              <span>{result.subject}</span>
              {result.chapter && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{result.chapter}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {result.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>সময় নেওয়া হয়েছে: {formatMinutes(result.timeTakenSeconds)}</span>
              <span aria-hidden="true">·</span>
              <span>
                জমা দেওয়ার তারিখ:{" "}
                {new Date(result.submittedAt).toLocaleDateString("bn-BD")}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => downloadFullResultPdf(result)} className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors print:hidden"><FileCheck2 className="w-4 h-4" /><span>সম্পূর্ণ Result PDF</span></button>
            {result.cqEvaluation?.items?.length > 0 && (
              <button
                onClick={() => printCQAnswerPaper(result)}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-indigo-200 hover:bg-indigo-50 text-indigo-700 flex items-center gap-1.5 transition-colors print:hidden"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>CQ উত্তর PDF</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>প্রিন্ট / সংরক্ষণ</span>
            </button>
            <button
              onClick={onNewExam}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all print:hidden"
            >
              <Sparkles className="w-4 h-4" />
              <span>নতুন টেস্ট</span>
            </button>
          </div>
        </div>

        {/* Scoreboard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1">মোট প্রাপ্ত নম্বর</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {result.totalScore}
              </span>
              <span className="text-sm font-medium text-slate-400 tabular-nums">
                / {result.totalMax}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1">শতাংশ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tabular-nums">
                {result.percentage}%
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1">HSC গ্রেড</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {gradeInfo.grade}
              </span>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                {gradeInfo.desc}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1">বিভাগীয় বিভাজন</span>
            <div className="text-xs font-semibold text-slate-700 space-y-0.5 tabular-nums">
              {result.mcqMax > 0 && (
                <div>MCQ: {result.mcqScore} / {result.mcqMax}</div>
              )}
              {result.cqMax > 0 && (
                <div>CQ: {result.cqScore} / {result.cqMax}</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Remarks Notice */}
        {result.cqEvaluation?.feedback && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs sm:text-sm leading-relaxed">
            <strong className="font-semibold block mb-0.5">পরীক্ষকের সামগ্রিক মন্তব্য:</strong>
            <p>{result.cqEvaluation.feedback}</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs mb-6">
        {result.mcqResults.length > 0 && (
          <button
            onClick={() => setActiveTab("MCQ")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "MCQ"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>MCQ সমাধান ও ব্যাখ্যা</span>
            <span className="text-xs opacity-80 tabular-nums">
              ({result.mcqScore}/{result.mcqMax})
            </span>
          </button>
        )}

        {result.cqMax > 0 && (
          <button
            onClick={() => setActiveTab("CQ")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "CQ"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>সৃজনশীল (CQ) রুব্রিক ও আদর্শ উত্তর</span>
            <span className="text-xs opacity-80 tabular-nums">
              ({result.cqScore}/{result.cqMax})
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: MCQ SOLUTIONS */}
      {activeTab === "MCQ" && result.mcqResults.length > 0 && (
        <div className="space-y-4">
          {result.mcqResults.map((item, idx) => {
            const isCorrect = item.correct;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  isCorrect
                    ? "border-emerald-200/90 shadow-2xs"
                    : "border-rose-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 tabular-nums ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>১ / ১ নম্বর</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>০ / ১ নম্বর</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Option Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {(["A", "B", "C", "D"] as const).map((key) => {
                    const optText = item.options[key] || "";
                    const isStudentChoice = item.selected === key;
                    const isTheCorrectChoice = item.correctAnswer === key;

                    let rowStyle = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isTheCorrectChoice) {
                      rowStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500/20";
                    } else if (isStudentChoice && !isCorrect) {
                      rowStyle = "bg-rose-50 border-rose-300 text-rose-950 line-through opacity-80";
                    }

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${rowStyle}`}
                      >
                        <span className="font-bold shrink-0">
                          {key === "A"
                            ? "ক"
                            : key === "B"
                            ? "খ"
                            : key === "C"
                            ? "গ"
                            : "ঘ"}
                          .
                        </span>
                        <span className="flex-1">{optText}</span>
                        {isTheCorrectChoice && (
                          <span className="text-[11px] font-bold text-emerald-700">সঠিক উত্তর</span>
                        )}
                        {isStudentChoice && !isTheCorrectChoice && (
                          <span className="text-[11px] font-bold text-rose-700">তোমার উত্তর</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                {item.explanation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block font-semibold mb-0.5">
                      ব্যাখ্যা ও ধারণা:
                    </strong>
                    <p>{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CQ EVALUATION */}
      {activeTab === "CQ" && (
        <div className="space-y-6">
          {result.cqEvaluation?.items && result.cqEvaluation.items.length > 0 ? (
            result.cqEvaluation.items.map((sub, idx) => {
              return (
                <div
                  key={`${sub.questionId}_${sub.label}_${idx}`}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                        {sub.label}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        উপপ্রশ্ন ({sub.label})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg tabular-nums">
                        প্রাপ্ত নম্বর: {sub.marksAwarded} / {sub.maxMarks}
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      পরীক্ষকের মূল্যায়ন ও সংশোধন
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {sub.feedback || "উত্তরপত্র যাচাই সম্পন্ন হয়েছে।"}
                    </p>
                  </div>

                  {/* Ideal Model Answer */}
                  {sub.idealAnswer && (
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block mb-1">
                        বোর্ড স্ট্যান্ডার্ড আদর্শ উত্তর (Model Answer)
                      </span>
                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 font-serif">
                        {sub.idealAnswer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
              <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium">
                কোনো সৃজনশীল লিখিত উত্তর বা খাতার ছবি জমা দেওয়া হয়নি।
              </p>
            </div>
          )}
        </div>
      )}

      {/* Retake and Action Bar */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>এই মডেল টেস্টটি পুনরায় দাও</span>
        </button>

        <button
          onClick={onNewExam}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>অন্য অধ্যায়ের নতুন পরীক্ষা শুরু করো</span>
        </button>
      </div>
    </div>
  );
};
