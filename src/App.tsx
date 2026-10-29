import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ExamSetup } from "./components/ExamSetup";
import { ActiveExam } from "./components/ActiveExam";
import { ExamResult } from "./components/ExamResult";
import { HistoryModal } from "./components/HistoryModal";
import { GuidelineModal } from "./components/GuidelineModal";
import { PublicExam, ExamResultData, ExamHistoryRecord } from "./types";
import { HSC_SUBJECTS } from "./data/hscSyllabus";

const HISTORY_STORAGE_KEY = "hsc_2027_exam_history";
const APP_STORAGE_KEY = "hsc_2027_app_state_v1";

type AppView = "SETUP" | "EXAM" | "RESULT";
const viewHash = (view: AppView) => view === "EXAM" ? "#/exam" : view === "RESULT" ? "#/result" : "#/setup";
const viewFromHash = (): AppView => {
  const hash = window.location.hash;
  if (hash === "#/exam") return "EXAM";
  if (hash === "#/result") return "RESULT";
  return "SETUP";
};

export default function App() {
  const [view, setView] = useState<AppView>("SETUP");
  const [appStateRestored, setAppStateRestored] = useState(false);

  const navigateView = (next: AppView, replace = false) => {
    setView(next);
    const hash = viewHash(next);
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState({ view: next }, "", hash);
      else window.history.pushState({ view: next }, "", hash);
    }
  };
  const [currentExam, setCurrentExam] = useState<PublicExam | null>(null);
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ExamHistoryRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Restore the complete local snapshot (exam, current result, records and screen),
  // then fall back to legacy keys for users upgrading from an earlier version.
  useEffect(() => {
    try {
      const snapshotRaw = localStorage.getItem(APP_STORAGE_KEY);
      const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null;
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (Array.isArray(snapshot?.history)) setHistory(snapshot.history);
      else if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) setHistory(parsedHistory);
      }

      if (snapshot?.currentExam?.examId) setCurrentExam(snapshot.currentExam);
      if (snapshot?.examResult) setExamResult(snapshot.examResult);

      let restoredView: AppView = "SETUP";
      if (snapshot?.view === "EXAM" && snapshot?.currentExam?.examId) restoredView = "EXAM";
      else if (snapshot?.view === "RESULT" && snapshot?.examResult) restoredView = "RESULT";
      else {
        const draftKey = Object.keys(localStorage).find((key) => key.startsWith("hsc_2027_active_exam_"));
        if (draftKey) {
          const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
          if (draft?.exam?.examId) {
            setCurrentExam((current) => current || draft.exam);
            if (!snapshot?.currentExam?.examId) restoredView = "EXAM";
          }
        }
      }
      navigateView(restoredView, true);
    } catch (e) {
      console.error("Failed to restore local app data:", e);
      navigateView("SETUP", true);
    } finally {
      setAppStateRestored(true);
    }
  }, []);

  // Browser back/forward navigates between real app screens, including in WebView
  // where hash navigation is supported for file:// offline builds too.
  useEffect(() => {
    const onHashChange = () => {
      const requested = viewFromHash();
      if (requested === "EXAM" && !currentExam) { navigateView("SETUP", true); return; }
      if (requested === "RESULT" && !examResult) { navigateView("SETUP", true); return; }
      setView(requested);
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, [currentExam, examResult]);

  // Persist full application state on this device after restoration completes.
  useEffect(() => {
    if (!appStateRestored) return;
    try {
      // Keep records in one key only to avoid duplicating the full history in
      // the app snapshot and exhausting the browser's localStorage quota.
      const snapshot = { schemaVersion: 1, savedAt: new Date().toISOString(), view, currentExam, examResult };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(snapshot));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to persist local app data:", e);
    }
  }, [appStateRestored, view, currentExam, examResult, history]);

  // Save history to localStorage
  const saveRecord = (result: ExamResultData, exam: PublicExam) => {
    const newRecord: ExamHistoryRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      examId: exam.examId,
      title: result.title,
      subject: result.subject || exam.subject,
      chapter: result.chapter || exam.chapter,
      score: result.totalScore,
      maxScore: result.totalMax,
      percentage: result.percentage,
      date: new Date().toISOString(),
      examType: exam.mcqs.length > 0 && exam.cqs.length > 0 ? "Both" : exam.mcqs.length > 0 ? "MCQ" : "CQ",
      result,
    };

    setHistory((prev) => {
      const updated = [newRecord, ...prev].slice(0, 50); // Keep last 50
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save history to localStorage:", err);
      }
      return updated;
    });
  };

  const handleExportData = () => {
    const keys = Object.keys(localStorage);
    const localData = Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)]));
    const payload = {
      app: "HSC 2027 AI Exam Lab",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      syllabus: HSC_SUBJECTS,
      history,
      localStorage: localData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hsc-2027-examlab-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExamCreated = (exam: PublicExam) => {
    setCurrentExam(exam);
    navigateView("EXAM");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitted = (result: ExamResultData) => {
    setExamResult(result);
    if (currentExam) {
      saveRecord(result, currentExam);
    }
    navigateView("RESULT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetake = () => {
    if (currentExam) {
      navigateView("EXAM");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigateView("SETUP");
    }
  };

  const handleNewExam = () => {
    try {
      Object.keys(localStorage).filter((key) => key.startsWith("hsc_2027_active_exam_")).forEach((key) => localStorage.removeItem(key));
    } catch {}
    setCurrentExam(null);
    setExamResult(null);
    navigateView("SETUP");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectRecord = (res: ExamResultData) => {
    setExamResult(res);
    navigateView("RESULT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onGoHome={handleNewExam}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        historyCount={history.length}
        isInExam={view === "EXAM"}
        onExportData={handleExportData}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {view === "SETUP" && (
          <ExamSetup
            onExamCreated={handleExamCreated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        )}

        {view === "EXAM" && currentExam && (
          <ActiveExam
            exam={currentExam}
            onSubmitted={handleSubmitted}
            onCancel={handleNewExam}
          />
        )}

        {view === "RESULT" && examResult && (
          <ExamResult
            result={examResult}
            onRetake={handleRetake}
            onNewExam={handleNewExam}
          />
        )}
      </main>

      {/* Footer */}
      {view !== "EXAM" && (
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              HSC 2027 AI Exam Lab · জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) মানসম্পন্ন অধ্যায়ভিত্তিক পরীক্ষা
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsGuidelinesOpen(true)}
                className="hover:text-slate-900 transition-colors"
              >
                বোর্ড নির্দেশিকা
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="hover:text-slate-900 transition-colors"
              >
                ফলাফল রেকর্ড
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRecord={handleSelectRecord}
        onClearHistory={handleClearHistory}
      />

      <GuidelineModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />
    </div>
  );
}
