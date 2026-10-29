import React, { useState, useEffect, useRef } from "react";
import { Navbar, DEBUG_APK_URL } from "./components/Navbar";
import { DashboardHero } from "./components/DashboardHero";
import { ExamSetup } from "./components/ExamSetup";
import { ActiveExam } from "./components/ActiveExam";
import { ExamResult } from "./components/ExamResult";
import { BottomNav } from "./components/BottomNav";
import { UpdateNotification } from "./components/UpdateNotification";
import { ChapterSelectorModal } from "./components/ChapterSelectorModal";
import { SearchModal } from "./components/SearchModal";
import { HistoryModal } from "./components/HistoryModal";
import { PublicExam, ExamResultData, ExamHistoryRecord, ExamType } from "./types";
import { HSC_SUBJECTS } from "./data/hscSyllabus";

const HISTORY_STORAGE_KEY = "hsc_2027_exam_history";
const APP_STORAGE_KEY = "hsc_2027_app_state_v1";

type AppView = "SETUP" | "EXAM" | "RESULT";
const viewHash = (view: AppView) => view === "EXAM" ? "#/exam" : view === "RESULT" ? "#/result" : "#/setup";
const viewFromHash = (): AppView => window.location.hash === "#/exam" ? "EXAM" : window.location.hash === "#/result" ? "RESULT" : "SETUP";

export default function App() {
  const [view, setView] = useState<AppView>("SETUP");
  const [appStateRestored, setAppStateRestored] = useState(false);
  const [currentExam, setCurrentExam] = useState<PublicExam | null>(null);
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExamHistoryRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChapterSelectorOpen, setIsChapterSelectorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const setupSectionRef = useRef<HTMLDivElement>(null);

  const navigateView = (next: AppView, replace = false) => {
    setView(next);
    const hash = viewHash(next);
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState({ view: next }, "", hash);
      else window.history.pushState({ view: next }, "", hash);
    }
  };

  useEffect(() => {
    try {
      const snapshotRaw = localStorage.getItem(APP_STORAGE_KEY);
      const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null;
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (Array.isArray(snapshot?.history)) setHistory(snapshot.history);
      else if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
      if (snapshot?.currentExam?.examId) setCurrentExam(snapshot.currentExam);
      if (snapshot?.examResult) setExamResult(snapshot.examResult);
      let restored: AppView = "SETUP";
      if (snapshot?.view === "EXAM" && snapshot?.currentExam?.examId) restored = "EXAM";
      else if (snapshot?.view === "RESULT" && snapshot?.examResult) restored = "RESULT";
      else {
        const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("hsc_2027_active_exam_"));
        if (key) {
          const draft = JSON.parse(localStorage.getItem(key) || "null");
          if (draft?.exam?.examId) {
            setCurrentExam((current) => current || draft.exam);
            if (!snapshot?.currentExam?.examId) restored = "EXAM";
          }
        }
      }
      navigateView(restored, true);
    } catch (e) {
      console.error("Could not restore local exam data:", e);
      navigateView("SETUP", true);
    } finally {
      setAppStateRestored(true);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const requested = viewFromHash();
      if (requested === "EXAM" && !currentExam) return navigateView("SETUP", true);
      if (requested === "RESULT" && !examResult) return navigateView("SETUP", true);
      setView(requested);
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, [currentExam, examResult]);

  useEffect(() => {
    if (!appStateRestored) return;
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
        schemaVersion: 1, savedAt: new Date().toISOString(), view, currentExam, examResult, history,
      }));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Could not save local exam data:", e);
    }
  }, [appStateRestored, view, currentExam, examResult, history]);

  const saveRecord = (result: ExamResultData, exam: PublicExam) => {
    const record: ExamHistoryRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      examId: exam.examId, title: result.title, subject: result.subject || exam.subject,
      chapter: result.chapter || exam.chapter, score: result.totalScore, maxScore: result.totalMax,
      percentage: result.percentage, date: new Date().toISOString(),
      examType: exam.mcqs.length > 0 && exam.cqs.length > 0 ? "Both" : exam.mcqs.length > 0 ? "MCQ" : "CQ",
      result,
    };
    setHistory((previous) => [record, ...previous].slice(0, 50));
  };

  const scrollToSetup = () => {
    if (view !== "SETUP") navigateView("SETUP");
    window.setTimeout(() => setupSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  // Keep the existing local backup/restore controls used by the current app.
  const handleExportData = () => {
    const localData = Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]));
    const blob = new Blob([JSON.stringify({
      app: "HSC 2027 AI Exam Lab", schemaVersion: 1, exportedAt: new Date().toISOString(),
      syllabus: HSC_SUBJECTS, history, localStorage: localData,
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hsc-2027-examlab-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleImportData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== "HSC 2027 AI Exam Lab" || !parsed?.localStorage || typeof parsed.localStorage !== "object") {
        throw new Error("এই ফাইলটি Exam Lab backup নয়।");
      }
      Object.keys(localStorage).filter((key) => key.startsWith("hsc_2027_")).forEach((key) => localStorage.removeItem(key));
      for (const [key, value] of Object.entries(parsed.localStorage as Record<string, unknown>)) {
        if (key.startsWith("hsc_2027_") && typeof value === "string") localStorage.setItem(key, value);
      }
      if (Array.isArray(parsed.history)) localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(parsed.history));
      window.alert("ব্যাকআপ restore হয়েছে। পেজ রিলোড হচ্ছে।");
      window.location.reload();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "ব্যাকআপ restore করা যায়নি।");
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch {}
  };
  const handleExamCreated = (exam: PublicExam) => {
    setCurrentExam(exam); navigateView("EXAM"); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSubmitted = (result: ExamResultData) => {
    setExamResult(result);
    if (currentExam) saveRecord(result, currentExam);
    navigateView("RESULT"); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleRetake = () => {
    if (currentExam) navigateView("EXAM"); else navigateView("SETUP");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNewExam = () => {
    try {
      Object.keys(localStorage).filter((key) => key.startsWith("hsc_2027_active_exam_")).forEach((key) => localStorage.removeItem(key));
    } catch {}
    setCurrentExam(null); setExamResult(null); navigateView("SETUP"); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSelectRecord = (result: ExamResultData) => {
    setExamResult(result); navigateView("RESULT"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectChapterExam = (subjectId: string, paper: string, chapter: string, format: ExamType) => {
    setIsChapterSelectorOpen(false); setIsSearchOpen(false);
    try {
      localStorage.setItem("hsc_2027_exam_setup_v1", JSON.stringify({
        selectedSubjectId: subjectId, selectedPaper: paper, selectedChapters: [chapter], examType: format,
        difficulty: "Board standard", mcqCount: format === "CQ" ? 0 : 15, cqCount: format === "MCQ" ? 0 : 2,
      }));
    } catch {}
    scrollToSetup();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <UpdateNotification />
      <Navbar
        onGoHome={handleNewExam}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuidelines={scrollToSetup}
        historyCount={history.length}
        isInExam={view === "EXAM"}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onOpenChapterSelector={() => setIsChapterSelectorOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNewExamClick={scrollToSetup}
      />

      <main className={`mx-auto w-full max-w-[1240px] flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 ${view !== "EXAM" ? "lg:pb-10" : "px-0 sm:px-0 lg:px-0"}`}>
        {view === "SETUP" && (
          <div className="space-y-7 sm:space-y-9">
            <DashboardHero onStartExamClick={scrollToSetup} onExploreSubjectsClick={() => setIsChapterSelectorOpen(true)} />

            <section ref={setupSectionRef} id="exam-setup-section" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-5 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Choose & start</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">পরীক্ষার বিষয় ও ধরন বেছে নাও</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">বিষয়, পত্র, অধ্যায় এবং MCQ/CQ নির্বাচন করে পরীক্ষা শুরু করো।</p>
              </div>
              <ExamSetup onExamCreated={handleExamCreated} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError} />
            </section>

            {history.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div><h2 className="text-lg font-extrabold text-slate-900">আগের পরীক্ষার ফলাফল</h2><p className="text-sm text-slate-500">আগের প্রশ্ন ও উত্তর আবার দেখতে যেকোনো ফলাফল খোলো।</p></div>
                  <button type="button" onClick={() => setIsHistoryOpen(true)} className="text-sm font-bold text-blue-700">সব ফলাফল</button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 4).map((item) => (
                    <button key={item.id} type="button" onClick={() => handleSelectRecord(item.result)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-blue-200 hover:bg-blue-50/40">
                      <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{item.title}</span><span className="block text-xs text-slate-500">{item.subject} · {item.examType}</span></span>
                      <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{item.score}/{item.maxScore}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {view === "EXAM" && currentExam && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <ActiveExam exam={currentExam} onSubmitted={handleSubmitted} onCancel={handleNewExam} />
          </div>
        )}
        {view === "RESULT" && examResult && (
          <ExamResult result={examResult} onRetake={handleRetake} onNewExam={handleNewExam} />
        )}
      </main>

      {view !== "EXAM" && (
        <footer className="border-t border-slate-200 bg-white py-5 print:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
            <p>Exam Lab · সময়বদ্ধ অনুশীলন, উত্তর বিশ্লেষণ ও PDF রিভিউ</p>
            <a href={DEBUG_APK_URL} download="HSC-2027-AI-Exam-Lab-debug.apk" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50">Android APK ডাউনলোড</a>
          </div>
        </footer>
      )}

      {view !== "EXAM" && (
        <BottomNav
          currentTab={view === "SETUP" ? "home" : "exam"}
          onGoHome={handleNewExam}
          onStartExam={scrollToSetup}
          onOpenSubjects={() => setIsChapterSelectorOpen(true)}
          onOpenBoardQuestions={() => setIsChapterSelectorOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenNotes={() => setIsChapterSelectorOpen(true)}
          onOpenMenu={scrollToSetup}
          apkDownloadUrl={DEBUG_APK_URL}
          isInExam={false}
        />
      )}

      <ChapterSelectorModal isOpen={isChapterSelectorOpen} onClose={() => setIsChapterSelectorOpen(false)} onSelectChapterExam={handleSelectChapterExam} />
      <SearchModal
        isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectChapter={handleSelectChapterExam}
        onOpenNotes={() => setIsSearchOpen(false)} onOpenBoardQuestions={() => setIsSearchOpen(false)}
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onSelectRecord={handleSelectRecord} onClearHistory={handleClearHistory} />
    </div>
  );
}
