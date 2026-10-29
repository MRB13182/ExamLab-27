import React, { useMemo, useState } from "react";
import { BookOpenCheck, Search, X, CheckCircle2, XCircle, Lightbulb, RotateCcw } from "lucide-react";
import { ExamHistoryRecord, ExamResultData } from "../types";

interface MistakeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExamHistoryRecord[];
  onOpenResult: (result: ExamResultData) => void;
}

export const MistakeBookModal: React.FC<MistakeBookModalProps> = ({
  isOpen, onClose, history, onOpenResult,
}) => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("সব বিষয়");

  const mistakes = useMemo(() => history.flatMap((record) =>
    (record.result?.mcqResults || [])
      .filter((question) => question.correct === false)
      .map((question) => ({ record, question }))
  ).reverse(), [history]);

  const subjects = useMemo(() => ["সব বিষয়", ...new Set(mistakes.map(({ record }) => record.subject || "অন্যান্য"))], [mistakes]);
  const query = search.trim().toLocaleLowerCase();
  const visible = mistakes.filter(({ record, question }) => {
    const subjectMatches = subjectFilter === "সব বিষয়" || (record.subject || "অন্যান্য") === subjectFilter;
    const searchable = [record.title, record.subject, record.chapter, question.question, question.explanation, question.options?.[question.correctAnswer as keyof typeof question.options]].join(" ").toLocaleLowerCase();
    return subjectMatches && (!query || searchable.includes(query));
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="mistake-book-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><BookOpenCheck className="h-5 w-5" /></span>
            <div><h2 id="mistake-book-title" className="text-lg font-extrabold text-slate-900 sm:text-xl">ভুলের খাতা</h2><p className="text-xs text-slate-500">আগের পরীক্ষার ভুল MCQ — রিভিশনের জন্য</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করো" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
        </header>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[1fr_180px] sm:px-6">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="প্রশ্ন, অধ্যায় বা ব্যাখ্যা খুঁজো..." className="min-w-0 flex-1 py-2.5 text-sm outline-none" /></label>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="বিষয় বেছে নাও" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400">{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500"><span>{visible.length}টি ভুল প্রশ্ন</span><span>উত্তর ও ব্যাখ্যা দেখে আবার অনুশীলন করো</span></div>
          {visible.length ? <div className="space-y-4">
            {visible.map(({ record, question }, index) => (
              <article key={`${record.id}-${question.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{record.subject} · {record.chapter || "অধ্যায় উল্লেখ নেই"}</span><span className="text-[11px] text-slate-400">{record.title}</span></div>
                <h3 className="font-bold leading-7 text-slate-900">{question.question}</h3>
                <div className="mt-3 space-y-2">
                  {(["A", "B", "C", "D"] as const).map((key) => {
                    const isCorrect = question.correctAnswer === key;
                    const isSelected = question.selected === key;
                    return <div key={key} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : isSelected ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-100 bg-slate-50/70 text-slate-700"}`}>
                      <span className="mt-0.5 shrink-0">{isCorrect ? <CheckCircle2 className="h-4 w-4" /> : isSelected ? <XCircle className="h-4 w-4" /> : <span className="inline-block h-4 w-4 text-center text-[11px] font-bold">{key}</span>}</span>
                      <span className="flex-1">{question.options?.[key] || "—"}</span>
                      {isCorrect && <span className="shrink-0 text-[10px] font-bold">সঠিক উত্তর</span>}
                      {isSelected && !isCorrect && <span className="shrink-0 text-[10px] font-bold">তোমার উত্তর</span>}
                    </div>;
                  })}
                </div>
                {question.explanation && <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/80 p-3 text-sm leading-6 text-amber-950"><Lightbulb className="mt-1 h-4 w-4 shrink-0 text-amber-700" /><div><strong className="block text-xs">ব্যাখ্যা</strong>{question.explanation}</div></div>}
                <div className="mt-3 flex justify-end"><button type="button" onClick={() => { onClose(); onOpenResult(record.result); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"><RotateCcw className="h-3.5 w-3.5" /> পুরো ফলাফল দেখো</button></div>
              </article>
            ))}
          </div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></span>
            <p className="font-extrabold text-slate-800">{mistakes.length ? "এই search-এ কোনো প্রশ্ন পাওয়া যায়নি" : "ভুলের খাতা এখনো খালি"}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{mistakes.length ? "অন্য শব্দ বা বিষয় দিয়ে খুঁজে দেখো।" : "পরীক্ষা শেষ হলে ভুল করা MCQ এখানে নিজে থেকেই জমবে। আগে থেকে কোনো demo প্রশ্ন দেখানো হচ্ছে না।"}</p>
          </div>}
        </div>
      </section>
    </div>
  );
};
