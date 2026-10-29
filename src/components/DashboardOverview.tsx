import React from "react";
import { History, PlusCircle, FileText, ChevronRight } from "lucide-react";
import { ExamHistoryRecord, ExamResultData } from "../types";

interface DashboardOverviewProps {
  history: ExamHistoryRecord[];
  onSelectRecord: (result: ExamResultData) => void;
  onStartExamClick: () => void;
  onOpenChapterSelector: () => void;
  onOpenBoardQuestions: () => void;
  onOpenHistory: () => void;
  onOpenRevisionNotes: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  history, onSelectRecord, onStartExamClick, onOpenHistory,
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="আগের পরীক্ষার ফলাফল">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><History className="h-5 w-5" /></span>
        <div><h2 className="font-extrabold text-slate-900">আগের পরীক্ষার ফলাফল</h2><p className="text-xs text-slate-500">তোমার নিজের সংরক্ষিত পরীক্ষা ও উত্তর পুনরায় দেখো</p></div>
      </div>
      {history.length > 0 && <button type="button" onClick={onOpenHistory} className="text-sm font-bold text-blue-700 hover:text-blue-900">সব ফলাফল <ChevronRight className="ml-1 inline h-4 w-4" /></button>}
    </div>

    {history.length > 0 ? (
      <div className="space-y-2">
        {history.slice(0, 5).map((record) => (
          <button key={record.id} type="button" onClick={() => onSelectRecord(record.result)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40 sm:p-4">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><FileText className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{record.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{record.subject} · {record.examType} · {new Date(record.date).toLocaleDateString("bn-BD")}</span></span>
            </span>
            <span className="shrink-0 text-right"><span className="block text-sm font-extrabold text-slate-900">{record.score}/{record.maxScore}</span><span className="text-xs font-semibold text-blue-700">{record.percentage}%</span></span>
          </button>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-800">এখনও কোনো পরীক্ষা দেওয়া হয়নি</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">প্রথম পরীক্ষা শেষ করলে ফলাফল, সঠিক উত্তর ও ব্যাখ্যা এখানে আবার দেখতে পারবে।</p>
        <button type="button" onClick={onStartExamClick} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><PlusCircle className="h-4 w-4" />পরীক্ষা তৈরি করো</button>
      </div>
    )}
  </section>
);
