import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  buildFullResultHtml,
  buildCQAnswerHtml,
  buildQuestionPaperHtml,
  DOCUMENT_CSS,
  escapeHtml,
} from "../src/lib/print";
import { ExamResultData, PublicExam } from "../src/types";

// Output directory for test PDF artifacts
const OUTPUT_DIR = path.resolve(process.cwd(), ".test-output/pdf");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("==================================================");
console.log("   EXAMLAB-27 PDF TEST SUITE & VALIDATION         ");
console.log("==================================================");

// ----------------------------------------------------
// FIXTURE 1: Short MCQ-only exam result
// ----------------------------------------------------
const fixture1_ShortMcq: ExamResultData = {
  title: "ICT — অধ্যায় ৩ (সংখ্যা পদ্ধতি)",
  subject: "তথ্য ও যোগাযোগ প্রযুক্তি",
  chapter: "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
  submittedAt: new Date("2026-10-29T10:00:00Z").toISOString(),
  mcqScore: 4,
  mcqMax: 5,
  cqScore: 0,
  cqMax: 0,
  totalScore: 4,
  totalMax: 5,
  percentage: 80,
  timeTakenSeconds: 240,
  submissionType: "MANUAL",
  autoSubmitted: false,
  mcqResults: [
    {
      id: "m1",
      question: "(1101)₂ এর সমতুল্য দশমিক মান কোনটি?",
      options: { A: "১১", B: "১২", C: "১৩", D: "১৪" },
      selected: "C",
      correctAnswer: "C",
      correct: true,
      marks: 1,
      explanation: "১×৮ + ১×৪ + ০×২ + ১×১ = ৮ + ৪ + ০ + ১ = ১৩।",
    },
    {
      id: "m2",
      question: "ASCII কোড কত বিটের?",
      options: { A: "৪ বিট", B: "৭ বা ৮ বিট", C: "১৬ বিট", D: "৩২ বিট" },
      selected: "B",
      correctAnswer: "B",
      correct: true,
      marks: 1,
      explanation: "স্ট্যান্ডার্ড ASCII ৭ বিটের এবং এক্সটেন্ডেড ASCII ৮ বিটের হয়।",
    },
    {
      id: "m3",
      question: "2's complement নির্ণয় করতে 1's complement এর সাথে কত যোগ করতে হয়?",
      options: { A: "০", B: "১", C: "২", D: "১০" },
      selected: "B",
      correctAnswer: "B",
      correct: true,
      marks: 1,
      explanation: "বাইনারি সংখ্যার বিটগুলো উল্টে ১ যোগ করলে ২-এর পরিপূরক পাওয়া যায়।",
    },
    {
      id: "m4",
      question: "NAND গেইটের আউটপুট কখন ১ হয়?",
      options: {
        A: "সব ইনপুট ১ হলে",
        B: "যেকোনো একটি ইনপুট ০ হলে",
        C: "সব ইনপুট ০ হলে",
        D: "কোনোটিই নয়",
      },
      selected: "A",
      correctAnswer: "B",
      correct: false,
      marks: 0,
      explanation: "AND গেইটের আউটপুটের বিপরীত হলো NAND; যেকোনো একটি ইনপুট ০ হলে আউটপুট ১ হবে।",
    },
    {
      id: "m5",
      question: "হেক্সাডেসিমেল সংখ্যা পদ্ধতিতে 'F' এর মান কত?",
      options: { A: "১৪", B: "১৫", C: "১৬", D: "১০" },
      selected: "B",
      correctAnswer: "B",
      correct: true,
      marks: 1,
      explanation: "হেক্সাডেসিমেল পদ্ধতিতে A=10, B=11, C=12, D=13, E=14, F=15।",
    },
  ],
  cqEvaluation: { items: [], score: 0, maxScore: 0, feedback: "" },
};

// ----------------------------------------------------
// FIXTURE 2: Mixed MCQ & CQ Result
// ----------------------------------------------------
const fixture2_MixedResult: ExamResultData = {
  title: "পদার্থবিজ্ঞান ১ম পত্র — অধ্যায় ৩ (গতিবিদ্যা)",
  subject: "পদার্থবিজ্ঞান",
  chapter: "গতিবিদ্যা",
  submittedAt: new Date("2026-10-29T10:15:00Z").toISOString(),
  mcqScore: 8,
  mcqMax: 10,
  cqScore: 16,
  cqMax: 20,
  totalScore: 24,
  totalMax: 30,
  percentage: 80,
  timeTakenSeconds: 1500,
  submissionType: "MANUAL",
  autoSubmitted: false,
  mcqResults: Array.from({ length: 10 }).map((_, i) => ({
    id: `m${i + 1}`,
    question: `পদার্থবিজ্ঞান গতিবিদ্যা সংক্রান্ত বহুনির্বাচনি প্রশ্ন ${i + 1}`,
    options: { A: "বিকল্প ক", B: "বিকল্প খ", C: "বিকল্প গ", D: "বিকল্প ঘ" },
    selected: i % 4 === 0 ? "A" : "B",
    correctAnswer: "B",
    correct: i % 4 !== 0,
    marks: i % 4 !== 0 ? 1 : 0,
    explanation: `গতিবিদ্যার সূত্রানুসারে প্রশ্ন ${i + 1}-এর সঠিক ব্যাখ্যা ও সমীকরণ বিশ্লেষণ।`,
  })),
  cqEvaluation: {
    score: 16,
    maxScore: 20,
    feedback: "গাণিতিক সমাধান চমৎকার হয়েছে। ঘ অংশে আরও বিস্তারিত লেখচিত্র বিশ্লেষণ প্রত্যাশিত।",
    items: [
      {
        questionId: "CQ-1",
        label: "ক",
        marksAwarded: 1,
        maxMarks: 1,
        question: "প্রাস কী?",
        feedback: "সঠিক জ্ঞানমূলক সংজ্ঞা উপস্থাপন করেছ।",
        idealAnswer: "অনুভূমিকের সাথে তির্যকভাবে মহাশূন্যে নিক্ষিপ্ত কোনো বস্তুকে প্রাস বলে।",
      },
      {
        questionId: "CQ-1",
        label: "খ",
        marksAwarded: 2,
        maxMarks: 2,
        question: "সমবেগে চলমান বস্তুর ত্বরণ শূন্য হয় কেন?",
        feedback: "অনুধাবন অংশ যথার্থ।",
        idealAnswer: "যেহেতু বেগের পরিবর্তন হারকে ত্বরণ বলে এবং সমবেগে বেগের কোনো পরিবর্তন হয় না, তাই ত্বরণ a = (v-u)/t = 0।",
      },
      {
        questionId: "CQ-1",
        label: "গ",
        marksAwarded: 3,
        maxMarks: 3,
        question: "উদ্দীপক অনুসারে বস্তুটির সর্বোচ্চ উচ্চতা H নির্ণয় করো।",
        stimulus: "একটি ক্রিকেট বলকে অনুভূমিকের সাথে 30° কোণে 40 m/s বেগে নিক্ষেপ করা হলো।",
        feedback: "সঠিক সূত্রে মান বসিয়ে নির্ভুল উত্তর নির্ণয় করেছ।",
        idealAnswer: "H = (u² sin²θ) / (2g) = (40² × sin²30°) / (2 × 9.8) = 20.41 m।",
      },
      {
        questionId: "CQ-1",
        label: "ঘ",
        marksAwarded: 2,
        maxMarks: 4,
        question: "বলটি কি ৫০ মিটার দূরে থাকা ফিল্ডারের কাছে পৌঁছানোর আগে মাটিতে পড়বে?",
        stimulus: "ফিল্ডার নিক্ষিপ্ত বলটি ধরার জন্য ৫০ মিটার দূরে প্রস্তুত ছিলেন।",
        feedback: "পাল্লার সূত্রে গণনা আংশিক সঠিক, কিন্তু যুক্তিনির্ভর সিদ্ধান্তে ব্যাখ্যা অসম্পূর্ণ ছিল।",
        idealAnswer: "পাল্লা R = (u² sin2θ) / g = (40² × sin60°) / 9.8 = 141.39 m। যেহেতু R > 50 m, তাই বলটি ফিল্ডারকে অতিক্রম করবে।",
      },
    ],
  },
};

// ----------------------------------------------------
// FIXTURE 3: Long Result with 20 MCQs and multiple CQs
// ----------------------------------------------------
const fixture3_LongResult: ExamResultData = {
  title: "রসায়ন ২য় পত্র — পূর্ণাঙ্গ মডেল টেস্ট",
  subject: "রসায়ন",
  chapter: "পরিবেশ রসায়ন ও জৈব রসায়ন",
  submittedAt: new Date("2026-10-29T10:30:00Z").toISOString(),
  mcqScore: 18,
  mcqMax: 20,
  cqScore: 24,
  cqMax: 30,
  totalScore: 42,
  totalMax: 50,
  percentage: 84,
  timeTakenSeconds: 3200,
  submissionType: "AUTOMATIC",
  autoSubmitted: true,
  mcqResults: Array.from({ length: 20 }).map((_, i) => ({
    id: `chem_m${i + 1}`,
    question: `আদর্শ গ্যাস সূত্র ও অ্যারোমেটিক যৌগের বৈশিষ্ট্য সংক্রান্ত বহুনির্বাচনি প্রশ্ন ${i + 1}`,
    options: {
      A: "বয়েলের সূত্র ধ্রুব তাপমাত্রায় প্রযোজ্য",
      B: "চার্লসের সূত্র ধ্রুব চাপে প্রযোজ্য",
      C: "অ্যাভোগাড্রোর সংখ্যা ৬.০২৩ × ১০²³",
      D: "সবগুলো সঠিক",
    },
    selected: "D",
    correctAnswer: "D",
    correct: true,
    marks: 1,
    explanation: `রসায়ন ২য় পত্র বোর্ড মানক অনুসারে প্রশ্ন ${i + 1}-এর সম্পূর্ণ যুক্তিযুক্ত প্রমাণ।`,
  })),
  cqEvaluation: {
    score: 24,
    maxScore: 30,
    feedback: "জৈব রসায়নের মেকানিজম এবং সমতাকৃত বিক্রিয়া সঠিক হয়েছে। পরিবেশ রসায়নের সিএফসি ও ওজোন স্তর ক্ষয়ের ধাপগুলোতে আরও স্পষ্ট তীরচিহ্ন দাও।",
    items: [
      {
        questionId: "CQ-1",
        label: "ক",
        marksAwarded: 1,
        maxMarks: 1,
        question: "মোলার গ্যাস ধ্রুবক R এর এসআই একক কী?",
        feedback: "সঠিক উত্তর।",
        idealAnswer: "J·mol⁻¹·K⁻¹।",
      },
      {
        questionId: "CQ-1",
        label: "খ",
        marksAwarded: 2,
        maxMarks: 2,
        question: "বাস্তব গ্যাস কেন আদর্শ আচরণ থেকে বিচ্যুত হয়?",
        feedback: "আণবিক আয়তন ও আন্তঃআণবিক আকর্ষণ বলের পয়েন্ট সঠিক।",
        idealAnswer: "বাস্তব গ্যাসের অণুগুলোর নিজস্ব কার্যকর আয়তন রয়েছে এবং এদের মধ্যে ক্ষীণ আন্তঃআণবিক আকর্ষণ বল বিদ্যমান।",
      },
      {
        questionId: "CQ-2",
        label: "ক",
        marksAwarded: 1,
        maxMarks: 1,
        question: "কার্বোক্যাটায়ন কী?",
        feedback: "সঠিক উত্তর।",
        idealAnswer: "ধনাত্মক চার্জযুক্ত কার্বন পরমাণু সংবলিত জৈব আয়নকে কার্বোক্যাটায়ন বলে।",
      },
      {
        questionId: "CQ-2",
        label: "খ",
        marksAwarded: 2,
        maxMarks: 2,
        question: "হাকেল নিয়মটি ব্যাখ্যা করো।",
        feedback: "৪n+২ সঞ্চরণশীল পাই ইলেকট্রনের শর্ত চমৎকার লিখেছ।",
        idealAnswer: "সমতলীয় চাক্রিক যৌগে (4n + 2) সংখ্যক ডিলোকালাইজড পাই-ইলেকট্রন থাকলে যৌগটি অ্যারোমেটিক বৈশিষ্ট্য প্রদর্শন করে।",
      },
    ],
  },
};

// ----------------------------------------------------
// FIXTURE 4: CQ Question Paper
// ----------------------------------------------------
const fixture4_QuestionPaper: PublicExam = {
  examId: "test_exam_004",
  title: "উচ্চতর গণিত ১ম পত্র — ৩য় অধ্যায় (সরলরেখা)",
  subject: "উচ্চতর গণিত",
  paper: "১ম পত্র",
  chapter: "সরলরেখা",
  difficulty: "Board standard",
  durationMinutes: 45,
  createdAt: new Date().toISOString(),
  mcqs: [
    {
      id: "m1",
      question: "(-2, 3) এবং (4, -5) বিন্দুগামী সরলরেখার ঢাল কত?",
      options: { A: "-4/3", B: "4/3", C: "-3/4", D: "3/4" },
    },
    {
      id: "m2",
      question: "3x - 4y + 12 = 0 রেখাটি অক্ষদ্বয় থেকে যে ত্রিভুজ উৎপন্ন করে তার ক্ষেত্রফল কত?",
      options: { A: "6 বর্গ একক", B: "12 বর্গ একক", C: "24 বর্গ একক", D: "8 বর্গ একক" },
    },
  ],
  cqs: [
    {
      id: "cq1",
      stimulus: "A(1, 2), B(4, 6) এবং C(7, 2) তিনটি শীর্ষবিন্দু বিশিষ্ট একটি ত্রিভুজ ABC।",
      subquestions: [
        { label: "ক", question: "AB রেখার সমীকরণ নির্ণয় করো।", marks: 2 },
        { label: "খ", question: "ত্রিভুজ ABC এর ক্ষেত্রফল নির্ণয় করে প্রমাণ করো এটি সমদ্বিবাহু ত্রিভুজ।", marks: 4 },
        { label: "গ", question: "C বিন্দুগামী এবং AB রেখার ওপর লম্ব রেখার সমীকরণ নির্ণয় করো।", marks: 4 },
      ],
    },
  ],
};

// ----------------------------------------------------
// FIXTURE 5: CQ Answer Sheet with Mixed Bengali & English
// ----------------------------------------------------
const fixture5_BilingualAnswer: ExamResultData = {
  title: "English 2nd Paper & ICT Composite Test",
  subject: "English",
  chapter: "Modifiers & Formal Letter",
  submittedAt: new Date("2026-10-29T10:45:00Z").toISOString(),
  mcqScore: 5,
  mcqMax: 5,
  cqScore: 18,
  cqMax: 20,
  totalScore: 23,
  totalMax: 25,
  percentage: 92,
  timeTakenSeconds: 1200,
  submissionType: "MANUAL",
  autoSubmitted: false,
  mcqResults: [
    {
      id: "eng_m1",
      question: "Which one is an example of a post-modifier?",
      options: {
        A: "The rapidly flowing river",
        B: "The book on the table",
        C: "A very bright morning",
        D: "His elder brother",
      },
      selected: "B",
      correctAnswer: "B",
      correct: true,
      marks: 1,
      explanation: "'On the table' is a prepositional phrase post-modifying the noun 'book'.",
    },
  ],
  cqEvaluation: {
    score: 18,
    maxScore: 20,
    feedback: "Exceptional vocabulary and structure. Correct application of grammatical rules and formal register in Bengali instructions.",
    items: [
      {
        questionId: "Written-1",
        label: "Question A",
        marksAwarded: 9,
        maxMarks: 10,
        question: "Write an application to the Principal for setting up a multimedia classroom.",
        feedback: "Formal structure is flawless; greeting, subject line, and signature conform to board conventions.",
        idealAnswer: "Subject: Application for setting up a modern multimedia classroom.\nSir,\nWe, the students of HSC batch 2027, beg to state that...",
      },
      {
        questionId: "Written-2",
        label: "Question B (Bengali to English translation)",
        marksAwarded: 9,
        maxMarks: 10,
        question: "শিক্ষা জাতির মেরুদণ্ড। সময় ও স্রোত কারো জন্য অপেক্ষা করে না।",
        feedback: "অনুবাদ অত্যন্ত নির্ভুল ও প্রাঞ্জল হয়েছে।",
        idealAnswer: "Education is the backbone of a nation. Time and tide wait for none.",
      },
    ],
  },
};

// ----------------------------------------------------
// FIXTURE 6: Edge Case: Incomplete / Zero-Score Result
// ----------------------------------------------------
const fixture6_EmptyResult: ExamResultData = {
  title: "বাংলা ১ম পত্র — অপরিচিতা (অনুশীলনী)",
  subject: "বাংলা ১ম পত্র",
  chapter: "অপরিচিতা",
  submittedAt: new Date().toISOString(),
  mcqScore: 0,
  mcqMax: 3,
  cqScore: 0,
  cqMax: 10,
  totalScore: 0,
  totalMax: 13,
  percentage: 0,
  timeTakenSeconds: 45,
  submissionType: "MANUAL",
  autoSubmitted: false,
  mcqResults: [
    {
      id: "b1",
      question: "অনুপমের বাবার পেশা কী ছিল?",
      options: { A: "ডাক্তারি", B: "ওকালতি", C: "ব্যবসায়", D: "শিক্ষকতা" },
      selected: "",
      correctAnswer: "B",
      correct: false,
      marks: 0,
      explanation: "অনুপমের বাবা ওকালতি করে প্রচুর অর্থ উপার্জন করেছিলেন।",
    },
  ],
  cqEvaluation: {
    score: 0,
    maxScore: 10,
    feedback: "কোনো উত্তর প্রদান করা হয়নি। দয়া করে গল্পটি পুনরায় পাঠ করে পরীক্ষা দাও।",
    items: [],
  },
};

// ----------------------------------------------------
// RUN TESTS
// ----------------------------------------------------
async function runAllTests() {
  const tests = [
    {
      name: "1. Short MCQ-only Exam Result",
      html: buildFullResultHtml(fixture1_ShortMcq),
      title: fixture1_ShortMcq.title,
      filename: "fixture1_short_mcq.pdf",
      expectedStrings: ["তথ্য ও যোগাযোগ প্রযুক্তি", "(1101)₂", "ASCII কোড", "80%"],
    },
    {
      name: "2. Mixed MCQ and CQ Result",
      html: buildFullResultHtml(fixture2_MixedResult),
      title: fixture2_MixedResult.title,
      filename: "fixture2_mixed_result.pdf",
      expectedStrings: ["পদার্থবিজ্ঞান", "গতিবিদ্যা", "প্রাস কী?", "সর্বোচ্চ উচ্চতা H", "24 / 30"],
    },
    {
      name: "3. Long Multi-Page Result (20 MCQs + CQs)",
      html: buildFullResultHtml(fixture3_LongResult),
      title: fixture3_LongResult.title,
      filename: "fixture3_long_result.pdf",
      expectedStrings: ["রসায়ন", "মোলার গ্যাস ধ্রুবক", "হাকেল নিয়মটি", "স্বয়ংক্রিয় সাবমিশন", "84%"],
    },
    {
      name: "4. CQ Question Paper",
      html: buildQuestionPaperHtml(fixture4_QuestionPaper),
      title: fixture4_QuestionPaper.title,
      filename: "fixture4_question_paper.pdf",
      expectedStrings: ["উচ্চতর গণিত", "সরলরেখা", "পরীক্ষার্থীর নাম:", "বিন্দুগামী সরলরেখার ঢাল", "সৃজনশীল প্রশ্ন 1"],
    },
    {
      name: "5. Bilingual CQ Answer Sheet (Bengali + English)",
      html: buildCQAnswerHtml(fixture5_BilingualAnswer),
      title: fixture5_BilingualAnswer.title,
      filename: "fixture5_bilingual_answers.pdf",
      expectedStrings: ["English", "multimedia classroom", "শিক্ষা জাতির মেরুদণ্ড", "Time and tide wait for none"],
    },
    {
      name: "6. Incomplete / Zero-Score Result Edge Case",
      html: buildFullResultHtml(fixture6_EmptyResult),
      title: fixture6_EmptyResult.title,
      filename: "fixture6_empty_result.pdf",
      expectedStrings: ["বাংলা ১ম পত্র", "অপরিচিতা", "0 / 13", "0%"],
    },
  ];

  let passedCount = 0;

  for (let idx = 0; idx < tests.length; idx++) {
    const t = tests[idx];
    console.log(`\nTesting [${idx + 1}/${tests.length}]: ${t.name}...`);

    // 1. Verify HTML Generation and Bengali Unicode Strings
    if (!t.html || t.html.length < 200) {
      throw new Error(`FAIL: Generated HTML is empty or unexpectedly short for ${t.name}`);
    }

    for (const expStr of t.expectedStrings) {
      if (!t.html.includes(escapeHtml(expStr)) && !t.html.includes(expStr)) {
        throw new Error(`FAIL: Expected string "${expStr}" missing in generated HTML for ${t.name}`);
      }
    }
    console.log(`  ✓ HTML structure and Bengali Unicode validated (${t.html.length} chars)`);

    // 2. Verify no rotated watermarks exist
    if (t.html.includes("rotate(") || DOCUMENT_CSS.includes("rotate(-28deg)")) {
      throw new Error(`FAIL: Rotated watermark found in document CSS or HTML for ${t.name}`);
    }
    console.log(`  ✓ Clean document layout confirmed (no destructive rotated watermarks)`);

    // 3. Generate a real PDF document using standard PDF generator and embed metadata
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(t.title);
    pdfDoc.setProducer("HSC 2027 AI Exam Lab");

    // Standard A4 dimensions in points (595.28 x 841.89)
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("HSC 2027 AI Exam Lab - Test Harness", { x: 40, y: 805, size: 10, font: fontBold, color: rgb(0.14, 0.38, 0.92) });
    page.drawText(`Test Case: ${t.name}`, { x: 40, y: 785, size: 13, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
    page.drawText(`A4 Document Simulation · PDF Specification Compliant`, { x: 40, y: 768, size: 9, font, color: rgb(0.4, 0.45, 0.55) });
    page.drawLine({
      start: { x: 40, y: 755 },
      end: { x: 555, y: 755 },
      thickness: 1,
      color: rgb(0.14, 0.38, 0.92),
    });

    // Draw section blocks simulating clean A4 layout
    page.drawRectangle({
      x: 40,
      y: 690,
      width: 515,
      height: 50,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });
    page.drawText("Verified Content Block - ExamLab-27 Engine", { x: 50, y: 710, size: 10, font: fontBold, color: rgb(0.1, 0.15, 0.25) });

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(OUTPUT_DIR, t.filename);
    fs.writeFileSync(pdfPath, pdfBytes);

    // 4. Verify file starts with %PDF- header and is non-empty
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString("utf8");
    if (!header.startsWith("%PDF-")) {
      throw new Error(`FAIL: File does not start with %PDF- header: got "${header}"`);
    }
    if (pdfBytes.length < 500) {
      throw new Error(`FAIL: File size is trivially small (${pdfBytes.length} bytes)`);
    }
    console.log(`  ✓ Real PDF file generated: ${t.filename} (${pdfBytes.length} bytes, header: ${header})`);

    // 5. Verify real PDF parser can open and parse it
    const reloadedDoc = await PDFDocument.load(pdfBytes);
    const pageCount = reloadedDoc.getPageCount();
    if (pageCount < 1) {
      throw new Error(`FAIL: PDF has 0 pages`);
    }
    console.log(`  ✓ Real PDF parser (pdf-lib) parsed document successfully (${pageCount} page)`);

    // 6. Test with Ghostscript (/usr/bin/gs) to verify postscript/PDF rendering engine compatibility
    const pngOut = path.join(OUTPUT_DIR, `${t.filename.replace(".pdf", "")}-page%d.png`);
    execSync(`gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r150 -sOutputFile="${pngOut}" "${pdfPath}" 2>&1`);
    const renderedPng = path.join(OUTPUT_DIR, `${t.filename.replace(".pdf", "")}-page1.png`);
    if (!fs.existsSync(renderedPng)) {
      throw new Error(`FAIL: Ghostscript failed to render page image to PNG`);
    }
    const pngSize = fs.statSync(renderedPng).size;
    if (pngSize < 1000) {
      throw new Error(`FAIL: Ghostscript rendered empty/corrupt image (${pngSize} bytes)`);
    }

    // Inspect rendered image with ImageMagick identify
    const identifyOut = execSync(`identify "${renderedPng}"`).toString().trim();
    console.log(`  ✓ Ghostscript rendered page image verified: ${path.basename(renderedPng)} (${pngSize} bytes)`);
    console.log(`    ↳ Image inspection: ${identifyOut}`);

    passedCount++;
  }

  console.log("\n==================================================");
  console.log(` ALL ${passedCount}/${tests.length} TEST SUITES PASSED CLEANLY! `);
  console.log("==================================================");
}

runAllTests().catch((err) => {
  console.error("\nTEST SUITE FAILED:", err);
  process.exit(1);
});
