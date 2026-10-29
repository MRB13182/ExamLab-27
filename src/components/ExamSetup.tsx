import React, { useState, useEffect } from "react";
import { HSC_SUBJECTS } from "../data/hscSyllabus";
import { ExamType, ExamDifficulty, PublicExam } from "../types";
import { Sparkles, Clock, HelpCircle, Layers, CheckCircle2, ChevronRight, AlertCircle, FileText } from "lucide-react";

interface ExamSetupProps {
  onExamCreated: (exam: PublicExam) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export const ExamSetup: React.FC<ExamSetupProps> = ({
  onExamCreated,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  const SETUP_STORAGE_KEY = "hsc_2027_exam_setup_v1";
  const [selectedSubjectId, setSelectedSubjectId] = useState("physics");
  const [selectedPaper, setSelectedPaper] = useState("১ম পত্র");
  const [selectedChapters, setSelectedChapters] = useState<string[]>(["ভৌতজগৎ ও পরিমাপ"]);
  const [customChapter, setCustomChapter] = useState("");
  const [examType, setExamType] = useState<ExamType>("Both");
  const [difficulty, setDifficulty] = useState<ExamDifficulty>("Board standard");
  const [mcqCount, setMcqCount] = useState(10);
  const [cqCount, setCqCount] = useState(2);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETUP_STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      if (HSC_SUBJECTS.some((subject) => subject.id === saved.selectedSubjectId)) setSelectedSubjectId(saved.selectedSubjectId);
      if (typeof saved.selectedPaper === "string") setSelectedPaper(saved.selectedPaper);
      if (Array.isArray(saved.selectedChapters)) setSelectedChapters(saved.selectedChapters.filter((x: unknown) => typeof x === "string"));
      if (typeof saved.customChapter === "string") setCustomChapter(saved.customChapter);
      if (["Both", "CQ", "MCQ"].includes(saved.examType)) setExamType(saved.examType);
      if (["Board standard", "Easy to hard", "Challenging"].includes(saved.difficulty)) setDifficulty(saved.difficulty);
      if ([5, 10, 15, 20, 25, 30, 35, 40].includes(saved.mcqCount)) setMcqCount(saved.mcqCount);
      if ([1, 2, 3, 4, 5, 6, 7, 8].includes(saved.cqCount)) setCqCount(saved.cqCount);
    } catch (error) {
      console.warn("Could not restore exam setup preferences", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({
        selectedSubjectId, selectedPaper, selectedChapters, customChapter,
        examType, difficulty, mcqCount, cqCount
      }));
    } catch (error) {
      console.warn("Could not save exam setup preferences", error);
    }
  }, [selectedSubjectId, selectedPaper, selectedChapters, customChapter, examType, difficulty, mcqCount, cqCount]);

  const currentSubject = HSC_SUBJECTS.find((s) => s.id === selectedSubjectId) || HSC_SUBJECTS[0];
  const availablePapers = currentSubject.papers;
  const availableChapters = currentSubject.chapters[selectedPaper] || [];

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = HSC_SUBJECTS.find((s) => s.id === subjectId) || HSC_SUBJECTS[0];
    const defaultPaper = sub.papers[0];
    setSelectedPaper(defaultPaper);
    const chapters = sub.chapters[defaultPaper] || [];
    setSelectedChapters(chapters.length ? [chapters[0]] : []);
    setCustomChapter("");
  };

  const handlePaperChange = (paper: string) => {
    setSelectedPaper(paper);
    const chapters = currentSubject.chapters[paper] || [];
    setSelectedChapters(chapters.length ? [chapters[0]] : []);
    setCustomChapter("");
  };

  const activeChapterName = customChapter.trim() || selectedChapters.join(" • ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeChapterName) {
      setError("অনুগ্রহ করে একটি অধ্যায় বা বিষয় নির্বাচন করো।");
      return;
    }

    const finalMcq = examType === "CQ" ? 0 : mcqCount;
    const finalCq = examType === "MCQ" ? 0 : cqCount;
    const durationMinutes = finalMcq + finalCq * 20;

    if (finalMcq + finalCq === 0) {
      setError("অন্তত একটি প্রশ্ন সংখ্যা নির্ধারণ করো।");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `${currentSubject.name} (${currentSubject.nameEn})`,
          paper: selectedPaper,
          chapter: activeChapterName,
          chapters: customChapter.trim() ? [customChapter.trim()] : selectedChapters,
          questionPattern: currentSubject.questionPattern || "Use standard HSC question style for this subject and paper.",
          type: examType,
          difficulty,
          durationMinutes,
          mcqCount: finalMcq,
          cqCount: finalCq,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "প্রশ্ন তৈরি করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করো।");
      }

      if (!data.exam) {
        throw new Error("সার্ভার থেকে সঠিক পরীক্ষার তথ্য পাওয়া যায়নি।");
      }

      onExamCreated(data.exam);
    } catch (err: any) {
      console.error("Exam generation failed:", err);
      setError(err.message || "ইন্টারনেট সংযোগ বা API কোটা পরীক্ষা করে আবার চেষ্টা করো।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Hero Visual & Intro Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-8 sm:mb-12">
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-3">
              <span>HSC 2027 Syllabus Standard</span>
              <span aria-hidden="true">·</span>
              <span>Subject-specific patterns</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              অধ্যায়ভিত্তিক HSC মডেল টেস্ট ও AI লিখিত মূল্যায়ন ল্যাব
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              বোর্ড স্ট্যান্ডার্ড বহুনির্বাচনী (MCQ) এবং সৃজনশীল (CQ) প্রশ্নপত্রে নির্ধারিত সময়ে পরীক্ষা দাও। তোমার টাইপ করা কিংবা খাতায় হাতে লেখা উত্তরপত্রের ছবি আপলোড করলে AI সহায়তায় OCR ও মার্কিং রুব্রিক অনুযায়ী মূল্যায়ন পাবে।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 mt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">৪ স্তরের CQ</span>
              <span className="text-xs text-slate-500 mt-1 block">ক, খ, গ, ঘ রুব্রিক</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">হাতে লেখা OCR</span>
              <span className="text-xs text-slate-500 mt-1 block">খাতার ছবি পরীক্ষণ</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">বোর্ড নম্বর</span>
              <span className="text-xs text-slate-500 mt-1 block">ব্যাখ্যাসহ সঠিক উত্তর</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[280px] border border-slate-200">
          <img
            src="/src/assets/images/hsc_lab_hero_banner_1793111324035.jpg"
            alt="Bangladeshi student preparing for HSC exams"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6">
            <p className="text-white text-xs sm:text-sm font-medium">
              "নিয়মিত অধ্যায়ভিত্তিক অনুশীলন, সময় ধরে পরীক্ষা এবং ভুলের বিশ্লেষণে প্রস্তুতি আরও কার্যকর হয়।"
            </p>
          </div>
        </div>
      </div>
      <p className="mb-6 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        সিলেবাসটি প্রস্তুতির জন্য প্রাথমিক তালিকা। HSC 2027-এর চূড়ান্ত অধ্যায় ও মানবণ্টন কলেজ/NCTB-এর সর্বশেষ নির্দেশনার সঙ্গে মিলিয়ে নাও।
      </p>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              তোমার পরীক্ষার বিষয় ও সিলেবাস সাজাও
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              বিষয়, অধ্যায় ও প্রশ্নের ধরন নির্ধারণ করে শুরু করো
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>লাইভ জেনারেশন</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">পরীক্ষা শুরু করা যায়নি</p>
              <p className="text-xs sm:text-sm mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* 1. Subject Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              ১. বিষয় নির্বাচন করো
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {HSC_SUBJECTS.map((sub) => {
                const isActive = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubjectChange(sub.id)}
                    className={`p-3 text-left rounded-2xl border transition-all text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/20"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="block font-semibold truncate">{sub.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{sub.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Paper Selector */}
          {availablePapers.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ২. পত্র নির্বাচন
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePapers.map((paper) => {
                  const isActive = paper === selectedPaper;
                  return (
                    <button
                      key={paper}
                      type="button"
                      onClick={() => handlePaperChange(paper)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {paper}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Chapter Selector & Custom Topic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                ৩. অধ্যায় / পাঠ্যসূচি
              </label>
              <span className="text-xs text-slate-400">{selectedChapters.length}টি অধ্যায় নির্বাচিত · একাধিক বাছাই করা যাবে</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
              {availableChapters.map((ch) => {
                const isSelected = selectedChapters.includes(ch) && !customChapter.trim();
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setSelectedChapters((prev) => prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]);
                      setCustomChapter("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="অথবা নির্দিষ্ট কোনো টপিক বা অধ্যায় লিখো (যেমন: গতিবিদ্যা ও প্রাস)"
                value={customChapter}
                onChange={(e) => {
                  setCustomChapter(e.target.value);
                  if (e.target.value.trim()) setSelectedChapters([]);
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
              />
              {customChapter.trim() && (
                <button
                  type="button"
                  onClick={() => setCustomChapter("")}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>

          {/* 4. Exam Question Style and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Exam Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ৪. পরীক্ষার ফরম্যাট
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setExamType("Both")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    examType === "Both" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  MCQ + CQ
                </button>
                <button
                  type="button"
                  onClick={() => setExamType("MCQ")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    examType === "MCQ" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  শুধু MCQ
                </button>
                <button
                  type="button"
                  onClick={() => setExamType("CQ")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    examType === "CQ" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  শুধু CQ
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ৫. কাঠিন্য মাত্রা
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(
                  [
                    { key: "Board standard", label: "বোর্ড মান" },
                    { key: "Easy to hard", label: "সহজ-কঠিন" },
                    { key: "Challenging", label: "এডমিশন" },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDifficulty(d.key)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      difficulty === d.key ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 5. Question Numbers Config; exam time is automatically calculated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {examType !== "CQ" && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">MCQ প্রশ্নের সংখ্যা</span>
                  <span className="text-sm font-bold text-indigo-700 tabular-nums">{mcqCount} টি</span>
                </div>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMcqCount(count)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all tabular-nums ${
                        mcqCount === count ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {examType !== "MCQ" && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">সৃজনশীল (CQ) প্রশ্নের সংখ্যা</span>
                  <span className="text-sm font-bold text-indigo-700 tabular-nums">{cqCount} টি (১০ নম্বর করে)</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setCqCount(count)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all tabular-nums ${
                        cqCount === count ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      {count} টি
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-md ${
                isLoading
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>প্রশ্ন তৈরি হচ্ছে… সাধারণত সংক্ষিপ্ত সেট দ্রুত তৈরি হয়</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>পরীক্ষা শুরু করো — {activeChapterName}</span>
                  <ChevronRight className="w-5 h-5 opacity-80" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2.5">
              দ্রুত আউটপুটের জন্য অপ্রয়োজনীয় অতিরিক্ত ব্যাখ্যা সীমিত রাখা হয় · স্বয়ংক্রিয় সময়: MCQ ১ মিনিট + CQ ২০ মিনিট · মোট {((examType === "CQ" ? 0 : mcqCount) + (examType === "MCQ" ? 0 : cqCount) * 20)} মিনিট
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
