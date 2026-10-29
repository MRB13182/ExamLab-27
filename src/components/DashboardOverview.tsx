import React, { useMemo, useState } from "react";
import {
  Clock, BarChart2, Zap, HardDrive, Download, Upload, ChevronRight,
  Sparkles, Trophy, FileText, Award, BookOpen, TrendingUp, ShieldCheck, BookOpenCheck
} from "lucide-react";
import { ExamHistoryRecord, ExamResultData } from "../types";

interface DashboardOverviewProps {
  history: ExamHistoryRecord[];
  onSelectRecord: (result: ExamResultData) => void;
  onStartExamClick: () => void;
  onOpenChapterSelector: () => void;
  onOpenBoardQuestions: () => void;
  onOpenHistory: () => void;
  onOpenRevisionNotes: () => void;
  onOpenMistakes: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

const subjectColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  history, onSelectRecord, onStartExamClick, onOpenChapterSelector,
  onOpenBoardQuestions, onOpenHistory, onOpenRevisionNotes, onOpenMistakes, onExportData, onImportData,
}) => {
  const [timeFilter, setTimeFilter] = useState("30");
  const cutoff = timeFilter === "all" ? 0 : Date.now() - Number(timeFilter) * 86400000;
  const filteredHistory = history.filter((item) => {
    const timestamp = new Date(item.date || 0).getTime();
    return timeFilter === "all" || (Number.isFinite(timestamp) && timestamp >= cutoff);
  });
  const subjectScores = useMemo(() => {
    const map = new Map<string, { total: number; max: number; count: number }>();
    filteredHistory.forEach((item) => {
      const key = item.subject || "অন্যান্য";
      const current = map.get(key) || { total: 0, max: 0, count: 0 };
      current.total += Number(item.score) || 0;
      current.max += Number(item.maxScore) || 0;
      current.count += 1;
      map.set(key, current);
    });
    return [...map.entries()].map(([name, stats]) => ({
      name, percentage: stats.max ? Math.round(stats.total / stats.max * 100) : 0, exams: stats.count,
    })).sort((a, b) => b.exams - a.exams);
  }, [filteredHistory]);

  const relativeTime = (isoString?: string) => {
    const time = isoString ? new Date(isoString).getTime() : NaN;
    if (!Number.isFinite(time)) return "তারিখ নেই";
    const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (minutes < 60) return minutes < 1 ? "এইমাত্র" : `${minutes} মিনিট আগে`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ঘণ্টা আগে`;
    return `${Math.floor(minutes / 1440)} দিন আগে`;
  };

  return (
    <section className="mb-10" aria-label="ড্যাশবোর্ড কার্যক্রম ও অগ্রগতি">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">STUDY INSIGHTS</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">তোমার সাম্প্রতিক প্রস্তুতি</h2>
          <p className="mt-1 text-sm text-slate-500">সত্যিকারের পরীক্ষার রেকর্ড থেকে অগ্রগতি। কোনো demo score যোগ করা হয় না।</p>
        </div>
        <button type="button" onClick={onOpenHistory} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
          সব রেকর্ড <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Clock className="h-4 w-4" /></span>
            <div><h3 className="font-extrabold text-slate-900">সাম্প্রতিক পরীক্ষা</h3><p className="text-xs text-slate-500">শেষ ৫টি রেকর্ড</p></div>
          </div>
          {history.length ? (
            <div className="space-y-2.5">
              {history.slice(0, 5).map((record) => (
                <button key={record.id} type="button" onClick={() => onSelectRecord(record.result)} className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"><BookOpen className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{record.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{record.subject} · {relativeTime(record.date)}</span></span>
                  <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold tabular-nums ${(record.percentage || 0) >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{record.score}/{record.maxScore}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-9 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm"><TrendingUp className="h-6 w-6" /></span>
              <p className="font-extrabold text-slate-800">এখানেই তোমার অগ্রগতি জমবে</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">প্রথম পরীক্ষা শেষ করলেই এখানে ফলাফল, নম্বর আর সময় দেখাবে।</p>
              <button type="button" onClick={onStartExamClick} className="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600">প্রথম পরীক্ষা দাও</button>
            </div>
          )}
          <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> রেকর্ড এই ডিভাইসে সংরক্ষিত। গুরুত্বপূর্ণ data রাখতে নিয়মিত JSON backup নাও।</div>
        </div>

        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><BarChart2 className="h-4 w-4" /></span><div><h3 className="font-extrabold text-slate-900">বিষয়ভিত্তিক বিশ্লেষণ</h3><p className="text-xs text-slate-500">নির্বাচিত সময়ের গড়</p></div></div>
            <select aria-label="বিশ্লেষণের সময়সীমা" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400">
              <option value="7">৭ দিন</option><option value="30">৩০ দিন</option><option value="all">সব সময়</option>
            </select>
          </div>
          {subjectScores.length ? (
            <div className="space-y-4">
              {subjectScores.slice(0, 6).map((item, index) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs"><span className="truncate font-bold text-slate-700">{item.name}</span><span className="shrink-0 font-extrabold tabular-nums text-slate-900">{item.percentage}% <span className="font-medium text-slate-400">· {item.exams}টি</span></span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-500 ${subjectColors[index % subjectColors.length]}`} style={{ width: `${item.percentage}%` }} /></div>
                </div>
              ))}
              <p className="pt-1 text-[11px] leading-5 text-slate-500">শুধু {timeFilter === "all" ? "সব সময়ের" : `শেষ ${timeFilter} দিনের`} saved results থেকে হিসাব করা।</p>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center">
              <BarChart2 className="mb-3 h-8 w-8 text-slate-300" /><p className="font-bold text-slate-700">এখনও পর্যাপ্ত data নেই</p><p className="mt-1 text-xs leading-5 text-slate-500">কয়েকটি পরীক্ষা শেষ করলে বিষয়ভিত্তিক স্কোর এখানে তুলনা করা যাবে।</p>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Zap className="h-4 w-4" /></span><h3 className="font-extrabold text-slate-900">দ্রুত শুরু</h3></div>
            <div className="space-y-2">
              <button type="button" onClick={onStartExamClick} className="flex w-full items-center justify-between rounded-xl bg-blue-700 px-3.5 py-3 text-left text-xs font-bold text-white transition hover:bg-blue-600"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> নতুন পরীক্ষা</span><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={onOpenChapterSelector} className="flex w-full items-center justify-between rounded-xl border border-sky-100 bg-sky-50 px-3.5 py-3 text-left text-xs font-bold text-sky-800 transition hover:bg-sky-100"><span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> অধ্যায়ভিত্তিক অনুশীলন</span><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={onOpenBoardQuestions} className="flex w-full items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-left text-xs font-bold text-violet-800 transition hover:bg-violet-100"><span className="flex items-center gap-2"><Award className="h-4 w-4" /> বিগত বছরের প্রশ্ন</span><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={onOpenRevisionNotes} className="flex w-full items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-left text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> নোটস ও রিভিশন</span><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={onOpenMistakes} className="flex w-full items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-left text-xs font-bold text-rose-800 transition hover:bg-rose-100"><span className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4" /> ভুলের খাতা</span><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={onOpenHistory} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left text-xs font-bold text-slate-800 transition hover:bg-slate-100"><span className="flex items-center gap-2"><FileText className="h-4 w-4" /> ফলাফল ও রেকর্ড</span><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><HardDrive className="h-4 w-4 text-blue-700" /><div><h3 className="text-sm font-extrabold text-slate-900">ডেটা নিরাপত্তা</h3><p className="text-[11px] text-slate-500">নিজের backup নিজের কাছে রাখো</p></div></div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onExportData} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"><Download className="h-4 w-4" /> Backup</button>
              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"><Upload className="h-4 w-4" /> Restore<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) onImportData(file); e.currentTarget.value = ""; }} /></label>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">অ্যাপের data clear/uninstall করলে local record মুছে যেতে পারে; তাই backup export করে রাখবে।</p>
          </div>
        </div>
      </div>
    </section>
  );
};
