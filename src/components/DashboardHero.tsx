import React from "react";
import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";

interface DashboardHeroProps {
  onStartExamClick: () => void;
  onExploreSubjectsClick: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ onStartExamClick, onExploreSubjectsClick }) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] lg:items-center lg:p-10">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"><BookOpen className="h-4 w-4" />HSC 2027 · Exam Lab</span>
        <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">নিজের মতো করে পরীক্ষা দাও।<span className="block text-blue-700">ভুলগুলো বুঝে নাও।</span></h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">বিষয় ও অধ্যায় বেছে timed MCQ বা CQ পরীক্ষা শুরু করো। সময় শেষ হলে পরীক্ষা নিজে থেকেই জমা হবে। শেষে উত্তর, ব্যাখ্যা ও PDF রিভিউ পাবে।</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2"><Clock className="h-4 w-4 text-blue-700" />MCQ · ১ মিনিট/প্রশ্ন</span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2"><FileText className="h-4 w-4 text-violet-700" />CQ · ২০ মিনিট/প্রশ্ন</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onStartExamClick} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">পরীক্ষা শুরু করো <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={onExploreSubjectsClick} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">অধ্যায় বেছে নাও</button>
        </div>
      </div>
      <div className="hidden lg:flex lg:justify-end">
        <img src="/assets/hero_student_illustration.png" alt="Exam Lab student illustration" className="max-h-72 w-auto rounded-2xl object-contain" />
      </div>
    </div>
  </section>
);
