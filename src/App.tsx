import React, { useState, useEffect, useRef } from "react";
import { Navbar, DEBUG_APK_URL } from "./components/Navbar";
import { DashboardHero } from "./components/DashboardHero";
import { MetricCards } from "./components/MetricCards";
import { SubjectGrid } from "./components/SubjectGrid";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExamSetup } from "./components/ExamSetup";
import { ActiveExam } from "./components/ActiveExam";
import { ExamResult } from "./components/ExamResult";
import { ExamScheduler } from "./components/ExamScheduler";
import { BottomNav } from "./components/BottomNav";
import { UpdateNotification } from "./components/UpdateNotification";
import { BoardQuestionsModal } from "./components/BoardQuestionsModal";
import { RevisionNotesModal } from "./components/RevisionNotesModal";
import { ChapterSelectorModal } from "./components/ChapterSelectorModal";
import { SearchModal } from "./components/SearchModal";
import { HistoryModal } from "./components/HistoryModal";
import { GuidelineModal } from "./components/GuidelineModal";
import { PublicExam, ExamResultData, ExamHistoryRecord, ExamType } from "./types";
import { HSC_SUBJECTS } from "./data/hscSyllabus";
import { BoardQuestionSet } from "./data/boardQuestions";

const HISTORY_STORAGE_KEY = "hsc_2027_exam_history";
const APP_STORAGE_KEY = "hsc_2027_app_state_v1";

type AppView = "SETUP" | "EXAM" | "RESULT";

const viewHash = (view: AppView) =>
  view === "EXAM" ? "#/exam" : view === "RESULT" ? "#/result" : "#/setup";

const viewFromHash = (): AppView => {
  const hash = window.location.hash;
  if (hash === "#/exam") return "EXAM";
  if (hash === "#/result") return "RESULT";
  return "SETUP";
};

export default function App() {
  const [view, setView] = useState<AppView>("SETUP");
  const [appStateRestored, setAppStateRestored] = useState(false);

  const [currentExam, setCurrentExam] = useState<PublicExam | null>(null);
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<ExamHistoryRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isBoardQuestionsOpen, setIsBoardQuestionsOpen] = useState(false);
  const [isRevisionNotesOpen, setIsRevisionNotesOpen] = useState(false);
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

  // Restore snapshot and exam draft
  useEffect(() => {
    try {
      const snapshotRaw = localStorage.getItem(APP_STORAGE_KEY);
      const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null;
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);

      if (Array.isArray(snapshot?.history)) {
        setHistory(snapshot.history);
      } else if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) setHistory(parsedHistory);
      }

      if (snapshot?.currentExam?.examId) setCurrentExam(snapshot.currentExam);
      if (snapshot?.examResult) setExamResult(snapshot.examResult);

      let restoredView: AppView = "SETUP";
      if (snapshot?.view === "EXAM" && snapshot?.currentExam?.examId) {
        restoredView = "EXAM";
      } else if (snapshot?.view === "RESULT" && snapshot?.examResult) {
        restoredView = "RESULT";
      } else {
        const draftKey = Object.keys(localStorage).find((key) =>
          key.startsWith("hsc_2027_active_exam_")
        );
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

  // Hash navigation sync
  useEffect(() => {
    const onHashChange = () => {
      const requested = viewFromHash();
      if (requested === "EXAM" && !currentExam) {
        navigateView("SETUP", true);
        return;
      }
      if (requested === "RESULT" && !examResult) {
        navigateView("SETUP", true);
        return;
      }
      setView(requested);
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, [currentExam, examResult]);

  // Persist state
  useEffect(() => {
    if (!appStateRestored) return;
    try {
      const snapshot = {
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        view,
        currentExam,
        examResult,
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(snapshot));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to persist local app data:", e);
    }
  }, [appStateRestored, view, currentExam, examResult, history]);

  // Save history record
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
      examType:
        exam.mcqs.length > 0 && exam.cqs.length > 0
          ? "Both"
          : exam.mcqs.length > 0
          ? "MCQ"
          : "CQ",
      result,
    };

    setHistory((prev) => {
      const updated = [newRecord, ...prev].slice(0, 50);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save history:", err);
      }
      return updated;
    });
  };

  const scrollToSetup = () => {
    if (view !== "SETUP") {
      navigateView("SETUP");
    }
    setTimeout(() => {
      setupSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleExportData = () => {
    const keys = Object.keys(localStorage);
    const localData = Object.fromEntries(
      keys.map((key) => [key, localStorage.getItem(key)])
    );
    const payload = {
      app: "HSC 2027 AI Exam Lab",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      syllabus: HSC_SUBJECTS,
      history,
      localStorage: localData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      "hsc-2027-examlab-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleImportData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (
        parsed?.app !== "HSC 2027 AI Exam Lab" ||
        !parsed?.localStorage ||
        typeof parsed.localStorage !== "object"
      ) {
        throw new Error("এই ফাইলটি HSC 2027 AI Exam Lab backup নয়।");
      }
      Object.keys(localStorage)
        .filter((key) => key.startsWith("hsc_2027_"))
        .forEach((key) => localStorage.removeItem(key));
      for (const [key, value] of Object.entries(
        parsed.localStorage as Record<string, unknown>
      )) {
        if (!key.startsWith("hsc_2027_")) continue;
        if (typeof value === "string") localStorage.setItem(key, value);
      }
      if (Array.isArray(parsed.history)) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(parsed.history));
      }
      window.alert(
        "Backup restore হয়েছে। পূর্বের অবস্থা লোড করতে পেজ রিলোড হচ্ছে।"
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to restore backup:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Backup restore করা সম্ভব হয়নি। JSON ফাইলটি যাচাই করো।"
      );
    }
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
      Object.keys(localStorage)
        .filter((key) => key.startsWith("hsc_2027_active_exam_"))
        .forEach((key) => localStorage.removeItem(key));
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

  const handleSubjectAction = (subjectId: string, format: ExamType) => {
    const match = HSC_SUBJECTS.find((s) => s.id === subjectId);
    if (match) {
      try {
        localStorage.setItem(
          "hsc_2027_exam_setup_v1",
          JSON.stringify({
            selectedSubjectId: match.id,
            selectedPaper: match.papers[0] || "১ম পত্র",
            examType: format,
            difficulty: "Board standard",
            mcqCount: format === "CQ" ? 0 : 15,
            cqCount: format === "MCQ" ? 0 : 2,
          })
        );
      } catch {}
    }
    scrollToSetup();
  };

  const handleSelectChapterExam = (
    subjectId: string,
    paper: string,
    chapter: string,
    format: ExamType
  ) => {
    setIsChapterSelectorOpen(false);
    setIsSearchOpen(false);
    try {
      localStorage.setItem(
        "hsc_2027_exam_setup_v1",
        JSON.stringify({
          selectedSubjectId: subjectId,
          selectedPaper: paper,
          selectedChapters: [chapter],
          examType: format,
          difficulty: "Board standard",
          mcqCount: format === "CQ" ? 0 : 15,
          cqCount: format === "MCQ" ? 0 : 2,
        })
      );
    } catch {}
    scrollToSetup();
  };

  const handleStartBoardExam = (qSet: BoardQuestionSet) => {
    setIsBoardQuestionsOpen(false);
    try {
      const match = HSC_SUBJECTS.find((s) => s.name === qSet.subject);
      if (match) {
        localStorage.setItem(
          "hsc_2027_exam_setup_v1",
          JSON.stringify({
            selectedSubjectId: match.id,
            selectedPaper: qSet.paper,
            selectedChapters: qSet.topicsCovered.slice(0, 2),
            examType: qSet.type,
            difficulty: "Board standard",
            mcqCount: qSet.type === "CQ" ? 0 : 15,
            cqCount: qSet.type === "MCQ" ? 0 : 2,
          })
        );
      }
    } catch {}
    scrollToSetup();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 5-second Update Notification Banner */}
      <UpdateNotification />

      {/* Primary Navy Header Navigation */}
      <Navbar
        onGoHome={handleNewExam}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        historyCount={history.length}
        isInExam={view === "EXAM"}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onOpenBoardQuestions={() => setIsBoardQuestionsOpen(true)}
        onOpenRevisionNotes={() => setIsRevisionNotesOpen(true)}
        onOpenChapterSelector={() => setIsChapterSelectorOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNewExamClick={scrollToSetup}
      />

      {/* Main View Area with Mobile Bottom Nav Padding */}
      <main className={`flex-1 ${view !== "EXAM" ? "pb-24 lg:pb-12" : ""}`}>
        {view === "SETUP" && (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Dashboard Hero Banner with Student Illustration */}
            <DashboardHero
              onStartExamClick={scrollToSetup}
              onExploreSubjectsClick={() => setIsChapterSelectorOpen(true)}
            />

            {/* 2. 6-Card High-Level Metrics Summary */}
            <MetricCards history={history} />

            {/* 3. 6-Card Interactive Subject Grid with Quick MCQ/CQ Action Buttons */}
            <SubjectGrid
              onSelectSubjectAction={handleSubjectAction}
              onViewAllSubjects={() => setIsChapterSelectorOpen(true)}
            />

            {/* 4. 3-Column Dashboard Overview (Recent History, Progress Chart, Quick Actions) */}
            <DashboardOverview
              history={history}
              onSelectRecord={handleSelectRecord}
              onStartExamClick={scrollToSetup}
              onOpenChapterSelector={() => setIsChapterSelectorOpen(true)}
              onOpenBoardQuestions={() => setIsBoardQuestionsOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenRevisionNotes={() => setIsRevisionNotesOpen(true)}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />

            {/* 5. Exam Generator Section (Fast Parallel AI Generation) */}
            <div ref={setupSectionRef} id="exam-setup-section" className="scroll-mt-20">
              <ExamSetup
                onExamCreated={handleExamCreated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
              />
            </div>

            {/* 6. Scheduled Exams Planner & Notifications */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ExamScheduler />
            </div>
          </div>
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

      {/* Footer (Hidden during Active Exam) */}
      {view !== "EXAM" && (
        <footer className="border-t border-slate-200 bg-white py-6 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              HSC 2027 AI Exam Lab · জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) মানসম্পন্ন অধ্যায়ভিত্তিক পরীক্ষা ও মূল্যায়ন
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
                onClick={() => setIsBoardQuestionsOpen(true)}
                className="hover:text-slate-900 transition-colors"
              >
                বিগত প্রশ্নব্যাংক
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsRevisionNotesOpen(true)}
                className="hover:text-slate-900 transition-colors"
              >
                রিভিশন নোটস
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

      {/* Mobile Bottom Navigation Bar (Hidden during Active Exam) */}
      {view !== "EXAM" && (
        <BottomNav
          currentTab={view === "SETUP" ? "home" : "exam"}
          onGoHome={handleNewExam}
          onStartExam={scrollToSetup}
          onOpenSubjects={() => setIsChapterSelectorOpen(true)}
          onOpenBoardQuestions={() => setIsBoardQuestionsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenNotes={() => setIsRevisionNotesOpen(true)}
          onOpenMenu={() => setIsGuidelinesOpen(true)}
          apkDownloadUrl={DEBUG_APK_URL}
          isInExam={false}
        />
      )}

      {/* Global Modals */}
      <BoardQuestionsModal
        isOpen={isBoardQuestionsOpen}
        onClose={() => setIsBoardQuestionsOpen(false)}
        onSelectBoardQuestion={handleStartBoardExam}
      />

      <RevisionNotesModal
        isOpen={isRevisionNotesOpen}
        onClose={() => setIsRevisionNotesOpen(false)}
      />

      <ChapterSelectorModal
        isOpen={isChapterSelectorOpen}
        onClose={() => setIsChapterSelectorOpen(false)}
        onSelectChapterExam={handleSelectChapterExam}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectChapter={handleSelectChapterExam}
        onOpenNotes={() => {
          setIsSearchOpen(false);
          setIsRevisionNotesOpen(true);
        }}
        onOpenBoardQuestions={() => {
          setIsSearchOpen(false);
          setIsBoardQuestionsOpen(true);
        }}
      />

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
