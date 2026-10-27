import React, { useState, useEffect, useRef } from "react";
import { PublicExam, ExamResultData } from "../types";
import { printCQQuestionPaper } from "../lib/print";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  X,
  Bookmark,
  Send,
  AlertCircle,
  FileText
} from "lucide-react";

interface ActiveExamProps {
  exam: PublicExam;
  onSubmitted: (result: ExamResultData) => void;
  onCancel: () => void;
}

export const ActiveExam: React.FC<ActiveExamProps> = ({
  exam,
  onSubmitted,
  onCancel,
}) => {
  const totalSeconds = (exam.durationMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [activeTab, setActiveTab] = useState<"MCQ" | "CQ">(
    exam.mcqs.length > 0 ? "MCQ" : "CQ"
  );
  
  // MCQ state: { [questionId]: "A" | "B" | "C" | "D" }
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  // Flagged questions
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // CQ state: { [`${cqId}_${label}`]: "text" }
  const [cqAnswers, setCqAnswers] = useState<Record<string, string>>({});

  // Handwritten answer sheet image upload state
  const [uploadedImage, setUploadedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const submissionStartedRef = useRef(false);
  const draftKey = "hsc_2027_active_exam_" + exam.examId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore the local draft and original deadline after refresh.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.mcqAnswers && typeof saved.mcqAnswers === "object") setMcqAnswers(saved.mcqAnswers);
        if (saved.cqAnswers && typeof saved.cqAnswers === "object") setCqAnswers(saved.cqAnswers);
        if (typeof saved.expiresAt === "number") setSecondsRemaining(Math.max(0, Math.ceil((saved.expiresAt - Date.now()) / 1000)));
      }
    } catch (error) {
      console.warn("Could not restore exam draft", error);
    } finally {
      setDraftReady(true);
    }
  }, [draftKey]);

  // Keep responses and deadline on this device only.
  useEffect(() => {
    if (!draftReady || submissionStartedRef.current) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        examId: exam.examId,
        exam,
        mcqAnswers,
        cqAnswers,
        expiresAt: Date.now() + secondsRemaining * 1000,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.warn("Could not save exam draft locally", error);
    }
  }, [draftReady, draftKey, exam.examId, mcqAnswers, cqAnswers, secondsRemaining]);

  // Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 120) {
          setTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const timeProgress = Math.max(0, (secondsRemaining / totalSeconds) * 100);

  // Toggle MCQ Option
  const handleSelectMcq = (qId: string, optionKey: string) => {
    setMcqAnswers((prev) => {
      if (prev[qId] === optionKey) {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      }
      return { ...prev, [qId]: optionKey };
    });
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(qId)) {
        copy.delete(qId);
      } else {
        copy.add(qId);
      }
      return copy;
    });
  };

  // Handle Image File selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("অনুগ্রহ করে JPG, PNG বা WebP ছবি আপলোড করো।");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setSubmitError("ছবির সাইজ ৮ MB-এর চেয়ে কম হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(",")[1];
      setUploadedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: resultStr,
      });
      setSubmitError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Exam API Call
  const executeSubmission = async () => {
    if (submissionStartedRef.current) return;
    submissionStartedRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    const combinedAnswers: Record<string, string> = {
      ...mcqAnswers,
      ...cqAnswers,
    };

    try {
      const payload: any = {
        examId: exam.examId,
        subject: exam.subject,
        chapter: exam.chapter,
        answers: combinedAnswers,
      };

      if (uploadedImage) {
        payload.image = {
          mimeType: uploadedImage.mimeType,
          data: uploadedImage.data,
        };
      }

      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "উত্তরপত্র জমা নেওয়া সম্ভব হয়নি। পুনরায় চেষ্টা করো।");
      }

      if (!data.result) {
        throw new Error("ফলাফলের তথ্য পাওয়া যায়নি।");
      }

      const timeTaken = totalSeconds - secondsRemaining;
      try { localStorage.removeItem(draftKey); } catch {}
      onSubmitted({
        ...data.result,
        timeTakenSeconds: timeTaken,
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "সাবমিট করতে সমস্যা হয়েছে। সংযোগ পরীক্ষা করে আবার ক্লিক করো।");
      submissionStartedRef.current = false;
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleAutoSubmit = () => {
    executeSubmission();
  };

  const answeredMcqCount = Object.keys(mcqAnswers).length;
  const totalMcqCount = exam.mcqs.length;

  const answeredCqCount = exam.cqs.filter((cq) =>
    cq.subquestions.some((sq) => (cqAnswers[`${cq.id}_${sq.label}`] || "").trim().length > 0)
  ).length;
  const totalCqCount = exam.cqs.length;

  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      {/* Sticky Exam Top Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {exam.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{exam.paper || exam.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{exam.difficulty}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 shrink-0">
            {exam.cqs.length > 0 && (
              <button
                type="button"
                onClick={() => printCQQuestionPaper(exam)}
                title="CQ প্রশ্নপত্র A4 PDF"
                aria-label="CQ প্রশ্নপত্র PDF"
                className="p-2 rounded-xl border border-slate-200 text-indigo-700 hover:bg-indigo-50 print:hidden"
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all tabular-nums ${
                secondsRemaining <= 180
                  ? "bg-rose-100 text-rose-700 animate-pulse ring-2 ring-rose-400"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>সাবমিট</span>
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsRemaining <= 180 ? "bg-rose-500" : "bg-indigo-600"
            }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </div>

      {/* Main Exam Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {timeWarning && secondsRemaining > 0 && secondsRemaining <= 120 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3 text-rose-900 animate-bounce">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>সময় প্রায় শেষ! আর মাত্র ২ মিনিট বাকি আছে। উত্তরপত্র রিভিশন দাও।</span>
            </div>
            <button
              onClick={() => setTimeWarning(false)}
              className="text-xs text-rose-700 hover:text-rose-900 underline"
            >
              ঠিক আছে
            </button>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">সাবমিট করা যায়নি</p>
              <p className="text-xs sm:text-sm mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs (MCQ vs CQ) */}
        {exam.mcqs.length > 0 && exam.cqs.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs mb-6">
            <button
              onClick={() => setActiveTab("MCQ")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "MCQ"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>বহুনির্বাচনী প্রশ্ন (MCQ)</span>
              <span className="text-xs opacity-80 tabular-nums">
                ({answeredMcqCount}/{totalMcqCount})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("CQ")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "CQ"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>সৃজনশীল প্রশ্ন (CQ)</span>
              <span className="text-xs opacity-80 tabular-nums">
                ({answeredCqCount}/{totalCqCount})
              </span>
            </button>
          </div>
        )}

        {/* TAB 1: MCQ SECTION */}
        {activeTab === "MCQ" && exam.mcqs.length > 0 && (
          <div className="space-y-6">
            {/* Quick Question Jump Navigator */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>প্রশ্ন নেভিগেটর</span>
                <span>
                  সম্পন্ন: {answeredMcqCount} / {totalMcqCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exam.mcqs.map((q, idx) => {
                  const isAnswered = !!mcqAnswers[q.id];
                  const isFlagged = flaggedQuestions.has(q.id);
                  return (
                    <a
                      key={q.id}
                      href={`#mcq-${q.id}`}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all tabular-nums ${
                        isFlagged
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : isAnswered
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Questions List */}
            {exam.mcqs.map((q, idx) => {
              const selectedOption = mcqAnswers[q.id];
              const isFlagged = flaggedQuestions.has(q.id);

              return (
                <div
                  key={q.id}
                  id={`mcq-${q.id}`}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs transition-all hover:border-slate-300 scroll-mt-24"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(q.id)}
                      className={`p-2 rounded-xl transition-all shrink-0 ${
                        isFlagged
                          ? "bg-amber-100 text-amber-700"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                      title={isFlagged ? "মার্ক সরানো" : "পরে দেখার জন্য মার্ক করো"}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(["A", "B", "C", "D"] as const).map((optKey) => {
                      const optionText = q.options[optKey] || "";
                      const isSelected = selectedOption === optKey;

                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => handleSelectMcq(q.id, optKey)}
                          className={`w-full p-3.5 rounded-2xl text-left text-sm font-medium transition-all flex items-start gap-3 border ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/10 shadow-xs"
                              : "bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-slate-300 text-slate-600"
                            }`}
                          >
                            {optKey === "A"
                              ? "ক"
                              : optKey === "B"
                              ? "খ"
                              : optKey === "C"
                              ? "গ"
                              : "ঘ"}
                          </span>
                          <span className="flex-1 leading-snug">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CQ SECTION */}
        {activeTab === "CQ" && exam.cqs.length > 0 && (
          <div className="space-y-8">
            {/* Answer Sheet Photo Upload Banner */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-indigo-950 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>খাতার হাতে লেখা সমাধান আপলোড (ঐচ্ছিক)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-800 mt-1 max-w-xl leading-relaxed">
                    তুমি চাইলে সৃজনশীল প্রশ্নগুলোর উত্তর তোমার খাতায় লিখে সেই খাতার পাতার ছবি মোবাইল ক্যামেরা দিয়ে তুলে আপলোড করতে পারো। AI খাতাটি স্ক্যান করে তোমাকে পূর্ণাঙ্গ মার্কস ও মতামত দেবে।
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {!uploadedImage ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4" />
                      <span>খাতার ছবি আপলোড করো</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative group w-14 h-14 rounded-xl overflow-hidden border-2 border-indigo-600 shadow-xs">
                        <img
                          src={uploadedImage.previewUrl}
                          alt="Answer Sheet"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl"
                        title="ছবি মুছুন"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {uploadedImage && (
                <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center gap-2 text-xs text-indigo-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>উত্তরপত্রের ছবি সংযুক্ত আছে। সাবমিট করার সাথে সাথে মূল্যায়ন করা হবে।</span>
                </div>
              )}
            </div>

            {/* Creative Questions */}
            {exam.cqs.map((cq, cqIdx) => {
              return (
                <div
                  key={cq.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 uppercase tracking-wide">
                      সৃজনশীল প্রশ্ন {cqIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 tabular-nums">
                      মোট নম্বর: ১০
                    </span>
                  </div>

                  {/* Stimulus (উদ্দীপক) */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 mb-6">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      উদ্দীপক
                    </span>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                      {cq.stimulus}
                    </p>
                  </div>

                  {/* Subquestions ক, খ, গ, ঘ */}
                  <div className="space-y-6">
                    {cq.subquestions.map((sub) => {
                      const ansKey = `${cq.id}_${sub.label}`;
                      const currentVal = cqAnswers[ansKey] || "";

                      return (
                        <div
                          key={sub.label}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {sub.label}
                              </span>
                              <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                                {sub.question}
                              </h4>
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md tabular-nums shrink-0">
                              {sub.marks} নম্বর
                            </span>
                          </div>

                          {/* Typed Answer Field */}
                          <div className="mt-3">
                            <textarea
                              rows={sub.marks <= 2 ? 3 : 5}
                              placeholder={`${sub.label}-এর উত্তর এখানে টাইপ করো (বা খাতার ছবি আপলোড করো)...`}
                              value={currentVal}
                              onChange={(e) =>
                                setCqAnswers((prev) => ({
                                  ...prev,
                                  [ansKey]: e.target.value,
                                }))
                              }
                              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 leading-relaxed font-sans placeholder:text-slate-400 resize-y"
                            />
                            <div className="flex justify-end text-[11px] text-slate-400 mt-1 tabular-nums">
                              {currentVal.trim().length} অক্ষর
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Action Strip */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <span>
              MCQ:{" "}
              <strong className="text-slate-900 tabular-nums">
                {answeredMcqCount}/{totalMcqCount}
              </strong>
            </span>
            {exam.cqs.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  CQ:{" "}
                  <strong className="text-slate-900 tabular-nums">
                    {answeredCqCount}/{totalCqCount}
                  </strong>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>পরীক্ষা জমা দাও</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              পরীক্ষা কি এখনই জমা দেবে?
            </h3>

            <div className="space-y-2 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span>MCQ উত্তর সম্পন্ন:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {answeredMcqCount} / {totalMcqCount}
                </span>
              </div>
              {exam.cqs.length > 0 && (
                <div className="flex justify-between">
                  <span>CQ সম্পন্ন:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {answeredCqCount} / {totalCqCount}
                  </span>
                </div>
              )}
              {uploadedImage && (
                <div className="flex justify-between text-indigo-700 font-medium">
                  <span>হাতে লেখা খাতার ছবি:</span>
                  <span>সংযুক্ত আছে</span>
                </div>
              )}

              {totalMcqCount - answeredMcqCount > 0 && (
                <div className="pt-2 text-xs text-amber-700 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    সতর্কতা: তোমার {totalMcqCount - answeredMcqCount} টি MCQ এখনো অনুত্তরিত রয়েছে!
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                আরো লিখবো
              </button>
              <button
                type="button"
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="flex-1 py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>হ্যাঁ, জমা দাও</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
