import React from "react";
import { Atom, FlaskConical, Leaf, Sigma, BookOpen, ArrowRight } from "lucide-react";
import { ExamType } from "../types";

interface SubjectCardConfig {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  paper1Desc: string;
  paper2Desc: string;
  accentBg: string;
  accentBorder: string;
  iconBg: string;
  iconColor: string;
  btnBg: string;
  btnHover: string;
  btnText: string;
}

interface SubjectGridProps {
  onSelectSubjectAction: (subjectId: string, format: ExamType) => void;
  onViewAllSubjects: () => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  onSelectSubjectAction,
  onViewAllSubjects,
}) => {
  const subjects: SubjectCardConfig[] = [
    {
      id: "physics",
      name: "পদার্থবিজ্ঞান",
      nameEn: "Physics",
      icon: <Atom className="w-5 h-5" />,
      paper1Desc: "১ম পত্র: ১০ অধ্যায়",
      paper2Desc: "২য় পত্র: ১১ অধ্যায়",
      accentBg: "bg-blue-50/60",
      accentBorder: "border-blue-100 hover:border-blue-300",
      iconBg: "bg-blue-600 text-white",
      iconColor: "text-blue-600",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      btnHover: "hover:bg-blue-50 text-blue-700",
      btnText: "text-white",
    },
    {
      id: "chemistry",
      name: "রসায়ন",
      nameEn: "Chemistry",
      icon: <FlaskConical className="w-5 h-5" />,
      paper1Desc: "১ম পত্র: ৫ অধ্যায়",
      paper2Desc: "২য় পত্র: ৫ অধ্যায়",
      accentBg: "bg-rose-50/60",
      accentBorder: "border-rose-100 hover:border-rose-300",
      iconBg: "bg-rose-600 text-white",
      iconColor: "text-rose-600",
      btnBg: "bg-rose-600 hover:bg-rose-700",
      btnHover: "hover:bg-rose-50 text-rose-700",
      btnText: "text-white",
    },
    {
      id: "biology",
      name: "জীববিজ্ঞান",
      nameEn: "Biology",
      icon: <Leaf className="w-5 h-5" />,
      paper1Desc: "১ম পত্র: ১২ অধ্যায়",
      paper2Desc: "২য় পত্র: ১২ অধ্যায়",
      accentBg: "bg-emerald-50/60",
      accentBorder: "border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-emerald-600 text-white",
      iconColor: "text-emerald-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
      btnHover: "hover:bg-emerald-50 text-emerald-700",
      btnText: "text-white",
    },
    {
      id: "higher_math",
      name: "উচ্চতর গণিত",
      nameEn: "Higher Mathematics",
      icon: <Sigma className="w-5 h-5" />,
      paper1Desc: "১ম পত্র: ১০ অধ্যায়",
      paper2Desc: "২য় পত্র: ১০ অধ্যায়",
      accentBg: "bg-purple-50/60",
      accentBorder: "border-purple-100 hover:border-purple-300",
      iconBg: "bg-purple-600 text-white",
      iconColor: "text-purple-600",
      btnBg: "bg-purple-600 hover:bg-purple-700",
      btnHover: "hover:bg-purple-50 text-purple-700",
      btnText: "text-white",
    },
    {
      id: "bangla1",
      name: "বাংলা",
      nameEn: "Bangla",
      icon: <BookOpen className="w-5 h-5" />,
      paper1Desc: "১ম পত্র: ২৬টি রচনা/কবিতা",
      paper2Desc: "২য় পত্র: ব্যাকরণ + নির্মিতি",
      accentBg: "bg-amber-50/60",
      accentBorder: "border-amber-100 hover:border-amber-300",
      iconBg: "bg-amber-600 text-white",
      iconColor: "text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700",
      btnHover: "hover:bg-amber-50 text-amber-700",
      btnText: "text-white",
    },
    {
      id: "english1",
      name: "English",
      nameEn: "English",
      icon: <span className="font-extrabold text-sm leading-none">En</span>,
      paper1Desc: "1st Paper: Full Syllabus",
      paper2Desc: "2nd Paper: Grammar + Writing",
      accentBg: "bg-sky-50/60",
      accentBorder: "border-sky-100 hover:border-sky-300",
      iconBg: "bg-sky-600 text-white",
      iconColor: "text-sky-600",
      btnBg: "bg-sky-600 hover:bg-sky-700",
      btnHover: "hover:bg-sky-50 text-sky-700",
      btnText: "text-white",
    },
  ];

  return (
    <section className="mb-10" aria-label="বিষয় নির্বাচন করো">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            বিষয় নির্বাচন করো
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewAllSubjects}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          <span>সব বিষয় দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className={`rounded-2xl border ${sub.accentBg} ${sub.accentBorder} p-4 shadow-xs flex flex-col justify-between card-hover-lift transition-all`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-xl ${sub.iconBg} flex items-center justify-center shadow-xs shrink-0`}>
                  {sub.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{sub.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate">{sub.nameEn}</p>
                </div>
              </div>

              <div className="space-y-1 mb-4 text-xs text-slate-600">
                <p className="truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>{sub.paper1Desc}</span>
                </p>
                <p className="truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>{sub.paper2Desc}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => onSelectSubjectAction(sub.id, "MCQ")}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold ${sub.btnBg} ${sub.btnText} text-center shadow-xs active:scale-[0.98] transition-all cursor-pointer`}
              >
                MCQ →
              </button>
              <button
                type="button"
                onClick={() => onSelectSubjectAction(sub.id, "CQ")}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold ${sub.btnBg} ${sub.btnText} text-center shadow-xs active:scale-[0.98] transition-all cursor-pointer`}
              >
                CQ →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
