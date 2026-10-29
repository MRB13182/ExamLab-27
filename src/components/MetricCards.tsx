import React from "react";
import { BookOpen, CheckCircle2, Clock, Target, BarChart3, Trophy } from "lucide-react";
import { ExamHistoryRecord } from "../types";

interface MetricCardsProps {
  history: ExamHistoryRecord[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ history }) => {
  const totalExams = history.length;
  const totalQuestions = history.reduce((sum, item) => sum + (item.result?.totalMax || 0), 0);
  const totalSeconds = history.reduce((sum, item) => sum + Math.max(0, item.result?.timeTakenSeconds || 0), 0);
  const averageScore = totalExams
    ? Math.round(history.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalExams)
    : null;
  const bestRecord = history.reduce<ExamHistoryRecord | null>((best, item) => {
    if (!best || (item.percentage || 0) > (best.percentage || 0)) return item;
    return best;
  }, null);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const metrics = [
    { label: "মোট পরীক্ষা", value: String(totalExams), detail: totalExams ? "সম্পন্ন পরীক্ষা" : "এখনও কোনো পরীক্ষা নেই", icon: BookOpen, color: "emerald" },
    { label: "উত্তরযোগ্য নম্বর", value: String(totalQuestions), detail: "সংরক্ষিত ফলাফলের মোট নম্বর", icon: CheckCircle2, color: "blue" },
    { label: "অনুশীলন সময়", value: totalSeconds ? `${totalHours}ঘ ${totalMinutes}মি` : "০ মি", detail: "এই ডিভাইসে রেকর্ড করা সময়", icon: Clock, color: "purple" },
    { label: "গড় স্কোর", value: averageScore === null ? "—" : `${averageScore}%`, detail: averageScore === null ? "প্রথম পরীক্ষা দাও" : "সব পরীক্ষার গড়", icon: Target, color: "amber" },
    { label: "সর্বশেষ স্কোর", value: history[0] ? `${history[0].score}/${history[0].maxScore}` : "—", detail: history[0]?.subject || "পরীক্ষার পর এখানে দেখাবে", icon: BarChart3, color: "rose" },
    { label: "সেরা স্কোর", value: bestRecord ? `${bestRecord.score}/${bestRecord.maxScore}` : "—", detail: bestRecord?.subject || "এখনও রেকর্ড নেই", icon: Trophy, color: "yellow" },
  ] as const;

  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };

  return (
    <section className="mb-8" aria-label="বাস্তব অনুশীলন পরিসংখ্যান">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">তোমার অগ্রগতি</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">প্রস্তুতির হিসাব</h2>
        </div>
        <p className="text-xs text-slate-500">শুধু সংরক্ষিত পরীক্ষার তথ্য</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <article key={label} className="card-hover-lift min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="h-4.5 w-4.5" /></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
            <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{value}</p>
            <p className="mt-1 min-h-8 text-[10px] leading-4 text-slate-500">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
