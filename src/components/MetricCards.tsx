import React from "react";
import { BookOpen, CheckCircle2, Clock, Target, BarChart3, Trophy } from "lucide-react";
import { ExamHistoryRecord } from "../types";

interface MetricCardsProps { history: ExamHistoryRecord[]; }

export const MetricCards: React.FC<MetricCardsProps> = ({ history }) => {
  const examCount = history.length;
  const answeredQuestions = history.reduce((sum, h) => sum + (h.result?.totalMax || 0), 0);
  const timeSeconds = history.reduce((sum, h) => sum + (h.result?.timeTakenSeconds || 0), 0);
  const avgScore = examCount ? Math.round(history.reduce((sum, h) => sum + (h.percentage || 0), 0) / examCount) : null;
  const best = history.reduce<ExamHistoryRecord | null>((best, rec) => !best || rec.percentage > best.percentage ? rec : best, null);
  const hours = Math.floor(timeSeconds / 3600);
  const minutes = Math.floor((timeSeconds % 3600) / 60);
  const cards = [
    { label: "সম্পন্ন পরীক্ষা", value: String(examCount), note: examCount ? "তোমার পরীক্ষার ইতিহাস" : "প্রথম পরীক্ষা শুরু করো", icon: BookOpen, tone: "emerald" },
    { label: "মূল্যায়িত নম্বর", value: String(answeredQuestions), note: "সব পরীক্ষার মোট নম্বর", icon: CheckCircle2, tone: "blue" },
    { label: "অনুশীলন সময়", value: `${hours}ঘ ${minutes}মি`, note: "সংরক্ষিত পরীক্ষার সময়", icon: Clock, tone: "violet" },
    { label: "গড় স্কোর", value: avgScore === null ? "—" : `${avgScore}%`, note: avgScore === null ? "রেজাল্ট হলে এখানে দেখাবে" : "সব পরীক্ষার গড়", icon: Target, tone: "amber" },
    { label: "সর্বশেষ স্কোর", value: history[0] ? `${history[0].percentage}%` : "—", note: history[0]?.subject || "এখনও কোনো রেজাল্ট নেই", icon: BarChart3, tone: "sky" },
    { label: "সেরা ফলাফল", value: best ? `${best.percentage}%` : "—", note: best?.subject || "তোমার সর্বোচ্চ স্কোর", icon: Trophy, tone: "rose" },
  ];
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700", rose: "bg-rose-50 text-rose-700",
  };
  return (
    <section className="mb-8" aria-label="তোমার শেখার পরিসংখ্যান">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</p>
            <p className="mt-1 truncate text-[11px] text-slate-500" title={note}>{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
