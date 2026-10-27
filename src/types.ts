export type ExamType = "Both" | "CQ" | "MCQ";
export type ExamDifficulty = "Board standard" | "Easy to hard" | "Challenging";

export interface MCQQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface CQSubquestion {
  label: "ক" | "খ" | "গ" | "ঘ";
  question: string;
  marks: number;
}

export interface CreativeQuestion {
  id: string;
  stimulus: string;
  subquestions: CQSubquestion[];
}

export interface ExamSource {
  title: string;
  url: string;
  note?: string;
}

export interface PublicExam {
  examId: string;
  title: string;
  subject: string;
  paper: string;
  chapter: string;
  durationMinutes: number;
  difficulty: ExamDifficulty;
  createdAt: string;
  mcqs: MCQQuestion[];
  cqs: CreativeQuestion[];
  sources?: ExamSource[];
}

export interface MCQResultItem {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selected: string;
  correctAnswer: string;
  correct: boolean;
  marks: number;
  explanation: string;
}

export interface CQEvaluationItem {
  questionId: string;
  label: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
  idealAnswer: string;
  question?: string;
  stimulus?: string;
}

export interface ExamResultData {
  title: string;
  subject: string;
  chapter: string;
  difficulty?: string;
  submittedAt: string;
  mcqScore: number;
  mcqMax: number;
  mcqResults: MCQResultItem[];
  cqScore: number;
  cqMax: number;
  cqEvaluation: {
    items: CQEvaluationItem[];
    score: number;
    maxScore: number;
    feedback: string;
  };
  totalScore: number;
  totalMax: number;
  percentage: number;
  note?: string;
  timeTakenSeconds?: number;
}

export interface ExamHistoryRecord {
  id: string;
  examId: string;
  title: string;
  subject: string;
  chapter: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  examType: ExamType;
  result: ExamResultData;
}
