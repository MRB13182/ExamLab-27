import React from "react";
import { BookOpen, Zap, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

interface DashboardHeroProps {
  onStartExamClick: () => void;
  onExploreSubjectsClick: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  onStartExamClick,
  onExploreSubjectsClick,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl text-white shadow-xl mb-8 border border-slate-800/40 bg-gradient-to-br from-[#071530] via-[#0d2352] to-[#123673]">
      {/* Subtle background glow effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Headlines & Benefits */}
        <div className="w-full lg:max-w-xl xl:max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
            <span>Practice Smart. Score Higher.</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-snug">
            স্মার্ট প্র্যাকটিসে <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
              HSC 2027-তে সেরা হও!
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
            AI দিয়ে তৈরি সিলেবাসভিত্তিক প্রশ্ন, তাৎক্ষণিক মূল্যায়ন ও বিশদ বিশ্লেষণ। NCTB বোর্ড স্ট্যান্ডার্ড বহুনির্বাচনী ও সৃজনশীল প্রশ্ন সমাধান করো যেকোনো সময়।
          </p>

          {/* Three Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">সকল বিষয়</p>
                <p className="text-[11px] text-slate-300 truncate">সিলেবাসভিত্তিক প্রশ্ন</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">তাৎক্ষণিক</p>
                <p className="text-[11px] text-slate-300 truncate">রেজাল্ট ও বিশ্লেষণ</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">নিজের প্রস্তুতি</p>
                <p className="text-[11px] text-slate-300 truncate">আরও শক্তিশালী করো</p>
              </div>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartExamClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>নতুন পরীক্ষা শুরু করো</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onExploreSubjectsClick}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/15 transition-all cursor-pointer"
            >
              <span>বিষয়ভিত্তিক সিলেবাস দেখুন</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Art Illustration */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0">
          <div className="relative group max-w-sm sm:max-w-md lg:max-w-sm xl:max-w-md">
            <div className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl bg-slate-900/40">
              <img
                src="/assets/hero_student_illustration.png"
                alt="Student studying with ExamLab"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            {/* Quote badge */}
            <div className="absolute -bottom-3 -right-2 sm:right-3 px-3 py-1.5 rounded-xl bg-[#0b1a3d]/90 border border-blue-400/30 backdrop-blur-md shadow-lg">
              <p className="text-[11px] font-semibold italic text-sky-200">
                "Better Practice, Brighter Results"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
