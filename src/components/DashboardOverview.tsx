import React, { useState } from "react";
import {
  Clock,
  BarChart2,
  Zap,
  HardDrive,
  Download,
  Upload,
  ChevronRight,
  Sparkles,
  Trophy,
  FileText,
  Award,
  BookOpen
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
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  history,
  onSelectRecord,
  onStartExamClick,
  onOpenChapterSelector,
  onOpenBoardQuestions,
  onOpenHistory,
  onOpenRevisionNotes,
  onExportData,
  onImportData,
}) => {
  const [timeFilter, setTimeFilter] = useState("30");

  // Format relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return "আজ";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (60 * 1000));
      if (mins < 60) return `${Math.max(1, mins)}m আগে`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} ঘণ্টা আগে`;
      const days = Math.floor(hours / 24);
      return `${days} দিন আগে`;
    } catch {
      return "সম্প্রতি";
    }
  };

  // Recent default activity fallback records (matches screenshot visual when history has few items)
  const defaultRecent = [
    {
      id: "def-1",
      title: "ICT — অধ্যায় ৪ (ওয়েব ডিজাইন ও HTML)",
      subtitle: "CQ + MCQ (Model Test)",
      scoreText: "31 / 35",
      isHigh: true,
      timeAgo: "28m আগে",
      colorBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "def-2",
      title: "পদার্থবিজ্ঞান ১ম পত্র — অধ্যায় ৩ (গতিবিদ্যা)",
      subtitle: "MCQ (15)",
      scoreText: "13 / 15",
      isHigh: true,
      timeAgo: "2 ঘণ্টা আগে",
      colorBg: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "def-3",
      title: "বাংলা ১ম পত্র — কবিতা অংশ (সোনার তরী)",
      subtitle: "CQ (5)",
      scoreText: "18 / 20",
      isHigh: true,
      timeAgo: "5 ঘণ্টা আগে",
      colorBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "def-4",
      title: "রসায়ন ২য় পত্র — অধ্যায় ৪ (তড়িৎ রসায়ন)",
      subtitle: "MCQ (20)",
      scoreText: "16 / 20",
      isHigh: true,
      timeAgo: "1 দিন আগে",
      colorBg: "bg-rose-50 text-rose-600",
    },
    {
      id: "def-5",
      title: "উচ্চতর গণিত ২য় পত্র — অধ্যায় ৯ (গতিবিদ্যা)",
      subtitle: "CQ (3)",
      scoreText: "12 / 15",
      isHigh: false,
      timeAgo: "2 দিন আগে",
      colorBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <section className="mb-12" aria-label="ড্যাশবোর্ড কার্যক্রম ও অগ্রগতি">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: সাম্প্রতিক কার্যক্রম (4 cols on lg, 3.5 on xl) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">সাম্প্রতিক কার্যক্রম</h3>
              </div>
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                সব রেকর্ড →
              </button>
            </div>

            <div className="space-y-3">
              {history.length > 0
                ? history.slice(0, 5).map((rec) => {
                    const isHigh = (rec.percentage || 0) >= 70;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => onSelectRecord(rec.result)}
                        className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {rec.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {rec.subject} · {rec.examType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold tabular-nums ${
                              isHigh ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {rec.score} / {rec.maxScore}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline">
                            {getRelativeTime(rec.date)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                : defaultRecent.map((item) => (
                    <div
                      key={item.id}
                      onClick={onStartExamClick}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-9 h-9 rounded-xl ${item.colorBg} flex items-center justify-center shrink-0`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold tabular-nums ${
                            item.isHigh ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.scoreText}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline">
                          {item.timeAgo}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center">
              নিয়মিত মক টেস্টে ভুল উত্তরসমূহের ব্যাখ্যা মনোযোগ দিয়ে পর্যালোচনা করো
            </p>
          </div>
        </div>

        {/* Column 2: প্রগ্রেস অ্যানালাইসিস (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">প্রগ্রেস অ্যানালাইসিস</h3>
              </div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="30">সর্বশেষ ৩০ দিন</option>
                <option value="7">সর্বশেষ ৭ দিন</option>
                <option value="all">সব সময়</option>
              </select>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mb-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                <span className="text-slate-700">MCQ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-600 inline-block" />
                <span className="text-slate-700">CQ</span>
              </div>
            </div>

            {/* Dual Bar Chart (Mock visual replica from screenshot) */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 pb-2 border-b border-slate-100 mb-5">
              {[
                { name: "পদার্থ", mcq: 85, cq: 62 },
                { name: "রসায়ন", mcq: 82, cq: 68 },
                { name: "জীববিজ্ঞান", mcq: 78, cq: 58 },
                { name: "উচ্চতর গণিত", mcq: 90, cq: 65 },
                { name: "বাংলা", mcq: 86, cq: 72 },
                { name: "English", mcq: 92, cq: 74 },
              ].map((subj) => (
                <div key={subj.name} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${subj.mcq}%` }}
                      className="w-2.5 sm:w-3.5 bg-blue-500 rounded-t-sm transition-all duration-500 hover:brightness-110"
                      title={`${subj.name} MCQ: ${subj.mcq}%`}
                    />
                    <div
                      style={{ height: `${subj.cq}%` }}
                      className="w-2.5 sm:w-3.5 bg-purple-600 rounded-t-sm transition-all duration-500 hover:brightness-110"
                      title={`${subj.name} CQ: ${subj.cq}%`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 truncate text-center max-w-[48px]">
                    {subj.name}
                  </span>
                </div>
              ))}
            </div>

            {/* विषयভিত্তিক পারফরমেন্স Linear Progress Bars */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                বিষয়ভিত্তিক পারফরমেন্স
              </p>
              <div className="space-y-2">
                {[
                  { name: "পদার্থবিজ্ঞান", pct: 82, color: "bg-blue-600" },
                  { name: "রসায়ন", pct: 76, color: "bg-rose-500" },
                  { name: "জীববিজ্ঞান", pct: 71, color: "bg-emerald-500" },
                  { name: "উচ্চতর গণিত", pct: 68, color: "bg-purple-600" },
                  { name: "বাংলা", pct: 85, color: "bg-amber-500" },
                  { name: "English", pct: 79, color: "bg-sky-500" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-600 truncate font-medium">{item.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-slate-700 tabular-nums">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: দ্রুত অ্যাকশন & ব্যাকআপ (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">দ্রুত অ্যাকশন</h3>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onStartExamClick}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>নতুন পরীক্ষা শুরু করো</span>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={onOpenChapterSelector}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-sky-600" />
                  <span>চ্যাপ্টারভিত্তিক অনুশীলন</span>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={onOpenBoardQuestions}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" />
                  <span>বিগত বছরের প্রশ্ন</span>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span>আমার রেজাল্ট</span>
                </div>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={onOpenRevisionNotes}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>নোটস ও রিভিশন</span>
                </div>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Backup & Data Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">ব্যাকআপ ও ডেটা</h3>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onExportData}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ডেটা ডাউনলোড (JSON)</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>ডেটা আপলোড (Restore)</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportData(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              তোমার সমস্ত পরীক্ষার স্কোর ও ড্রাফট নিরাপদে এই ডিভাইসে জমা থাকে
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
