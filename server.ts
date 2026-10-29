import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { getGemini, generateWithFallback, parseJson } from "./lib/gemini.ts";
import { saveExam, getExam, createSessionToken, decryptSessionToken } from "./lib/exam-store.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// API: Version Manifest Endpoint for in-app update checks
app.get("/api/version", (_req, res) => {
  try {
    const versionPath = path.resolve(__dirname, "public", "version.json");
    if (fs.existsSync(versionPath)) {
      const data = JSON.parse(fs.readFileSync(versionPath, "utf8"));
      return res.json(data);
    }
  } catch (err) {
    console.warn("Could not read version.json directly", err);
  }
  return res.json({
    version: "2026.10.29.4",
    releaseDate: "2026-10-29",
    summary: "সম্পূর্ণ নতুন আধুনিক ExamLab ড্যাশবোর্ড, দ্রুততর AI প্রশ্ন তৈরি ও বিগত বছরের বোর্ড প্রশ্ন ব্যাংক।",
    apkUrl: "https://github.com/MRB13182/ExamLab-27/raw/refs/heads/main/APK_DOWNLOAD/app-debug.apk"
  });
});

// High payload limit to allow handwritten answer sheet image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const allowedTypes = new Set(["Both", "CQ", "MCQ"]);
const allowedDifficulty = new Set(["Board standard", "Easy to hard", "Challenging"]);

// Streamlined MCQ Generator
async function generateMcqsStreamlined(
  ai: any,
  subject: string,
  paper: string,
  chapter: string,
  questionPattern: string,
  difficulty: string,
  mcqCount: number
): Promise<{ title: string; mcqs: any[]; sources?: string[] }> {
  const prompt = `You are an expert Bangladesh HSC ${subject} (${paper || "HSC 2027"}) examiner.
Create exactly ${mcqCount} original, high-quality, syllabus-aligned Multiple Choice Questions (MCQ).
Topic/Chapter: ${chapter}
Difficulty: ${difficulty}
Guidelines: ${questionPattern.slice(0, 600)}

Requirements:
- Standard clear Bangla for question texts, math notation, formulas, and explanations (English for English subject).
- Exactly 4 options per question: "A", "B", "C", "D".
- Exactly one correct answer with concise, pedagogical 1-2 sentence explanation in Bengali.
- Return ONLY valid JSON:
{
  "title": "${subject} — ${chapter} (MCQ)",
  "mcqs": [
    {
      "id": "m1",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "answer": "A",
      "explanation": "string"
    }
  ],
  "sources": []
}`;

  const text = await generateWithFallback(ai, {
    contents: prompt,
    temperature: 0.3,
    maxOutputTokens: Math.min(8192, 500 + mcqCount * 190),
  });
  const parsed = parseJson(text);
  return {
    title: parsed?.title || `${subject} — ${chapter}`,
    mcqs: Array.isArray(parsed?.mcqs) ? parsed.mcqs : [],
    sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
  };
}

// Streamlined CQ Generator
async function generateCqsStreamlined(
  ai: any,
  subject: string,
  paper: string,
  chapter: string,
  questionPattern: string,
  difficulty: string,
  cqCount: number
): Promise<{ title: string; cqs: any[]; sources?: string[] }> {
  const prompt = `You are an expert Bangladesh HSC ${subject} (${paper || "HSC 2027"}) examiner.
Create exactly ${cqCount} original, syllabus-aligned Creative Questions (CQ) or written problems according to official HSC standards.
Topic/Chapter: ${chapter}
Difficulty: ${difficulty}
Guidelines: ${questionPattern.slice(0, 600)}

Requirements:
- Follow official Bangladesh HSC board structure:
  * For Science/Math/ICT: realistic short stimulus (উদ্দীপক) + 4 subquestions:
    - ক (জ্ঞানমূলক, 1 mark)
    - খ (অনুধাবনমূলক, 2 marks)
    - গ (প্রয়োগমূলক, 3 marks)
    - ঘ (উচ্চতর দক্ষতামূলক, 4 marks)
  * For Bangla/English: subject-appropriate literature or composition task.
- Provide expected marking rubric/model answer points for each subpart.
- Return ONLY valid JSON:
{
  "title": "${subject} — ${chapter} (CQ)",
  "cqs": [
    {
      "id": "c1",
      "stimulus": "string",
      "subquestions": [
        { "label": "ক", "question": "string", "marks": 1, "rubric": "string" },
        { "label": "খ", "question": "string", "marks": 2, "rubric": "string" },
        { "label": "গ", "question": "string", "marks": 3, "rubric": "string" },
        { "label": "ঘ", "question": "string", "marks": 4, "rubric": "string" }
      ]
    }
  ],
  "sources": []
}`;

  const text = await generateWithFallback(ai, {
    contents: prompt,
    temperature: 0.3,
    maxOutputTokens: Math.min(8192, 600 + cqCount * 750),
  });
  const parsed = parseJson(text);
  return {
    title: parsed?.title || `${subject} — ${chapter}`,
    cqs: Array.isArray(parsed?.cqs) ? parsed.cqs : [],
    sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
  };
}

// API: Generate Practice Exam
app.post("/api/exam/generate", async (req, res) => {
  try {
    const body = req.body || {};
    const subject = String(body.subject || "ICT").slice(0, 80);
    const paper = String(body.paper || "").slice(0, 80);
    const chapters = Array.isArray(body.chapters) ? body.chapters.map((v: unknown) => String(v).slice(0, 160)).filter(Boolean).slice(0, 20) : [];
    const chapter = String(body.chapter || chapters.join(" • ") || "").slice(0, 2000);
    const questionPattern = String(body.questionPattern || "Use the standard HSC question style for this subject and paper.").slice(0, 2500);
    const rawType = body.type || body.examType;
    const type = allowedTypes.has(rawType) ? rawType : "Both";
    const difficulty = allowedDifficulty.has(body.difficulty) ? body.difficulty : "Board standard";
    const mcqCount = Math.min(40, Math.max(0, Number(body.mcqCount) || 0));
    const cqCount = Math.min(8, Math.max(0, Number(body.cqCount) || 0));
    // Match the UI timer contract: 1 minute per MCQ and 20 minutes per CQ.
    const calculatedDuration = mcqCount + cqCount * 20;
    const durationMinutes = Math.min(240, Math.max(1, Number(body.durationMinutes) || calculatedDuration || 1));

    if (!chapter.trim()) {
      return res.status(400).json({ error: "অধ্যায়ের নাম লিখো বা নির্বাচন করো।" });
    }
    if (
      (type === "MCQ" && mcqCount === 0) ||
      (type === "CQ" && cqCount === 0) ||
      (type === "Both" && mcqCount + cqCount === 0)
    ) {
      return res.status(400).json({ error: "প্রশ্নের সংখ্যা ১ বা তার বেশি দাও।" });
    }

    const ai = getGemini();
    let fullExam: {
      title: string;
      mcqs: any[];
      cqs: any[];
      sources?: string[];
    } = {
      title: `${subject} (${paper || "HSC 2027"}): ${chapter}`,
      mcqs: [],
      cqs: [],
      sources: []
    };

    if (type === "Both" && mcqCount > 0 && cqCount > 0) {
      // Parallel fast generation: MCQs and CQs run simultaneously
      const [mcqRes, cqRes] = await Promise.all([
        generateMcqsStreamlined(ai, subject, paper, chapter, questionPattern, difficulty, mcqCount),
        generateCqsStreamlined(ai, subject, paper, chapter, questionPattern, difficulty, cqCount),
      ]);
      fullExam.title = mcqRes.title || cqRes.title || fullExam.title;
      fullExam.mcqs = mcqRes.mcqs;
      fullExam.cqs = cqRes.cqs;
      fullExam.sources = [...(mcqRes.sources || []), ...(cqRes.sources || [])];
    } else if (type === "MCQ" || (type === "Both" && cqCount === 0)) {
      const mcqRes = await generateMcqsStreamlined(ai, subject, paper, chapter, questionPattern, difficulty, mcqCount);
      fullExam.title = mcqRes.title || fullExam.title;
      fullExam.mcqs = mcqRes.mcqs;
      fullExam.sources = mcqRes.sources || [];
    } else {
      const cqRes = await generateCqsStreamlined(ai, subject, paper, chapter, questionPattern, difficulty, cqCount);
      fullExam.title = cqRes.title || fullExam.title;
      fullExam.cqs = cqRes.cqs;
      fullExam.sources = cqRes.sources || [];
    }

    fullExam.mcqs = fullExam.mcqs.map((q: any, i: number) => ({
      ...q,
      id: q.id || `m${i + 1}`,
      options: q.options || {},
    }));
    fullExam.cqs = fullExam.cqs.map((q: any, i: number) => ({
      ...q,
      id: q.id || `c${i + 1}`,
      subquestions: Array.isArray(q.subquestions) ? q.subquestions : [],
    }));

    const examId = randomUUID();
    saveExam(examId, fullExam);
    const sessionToken = createSessionToken({ examId, fullExam });

    // Return public representation (hide solutions/rubrics to prevent inspection cheating)
    const publicExam = {
      examId,
      sessionToken,
      title: fullExam.title || `${subject} — ${chapter}`,
      subject,
      paper,
      chapter,
      durationMinutes,
      difficulty,
      createdAt: new Date().toISOString(),
      mcqs: fullExam.mcqs.map(({ answer, explanation, ...q }: any) => q),
      cqs: fullExam.cqs.map((q: any) => ({
        ...q,
        subquestions: (q.subquestions || []).map(({ rubric, ...sub }: any) => sub),
      })),
      sources: Array.isArray(fullExam.sources) ? fullExam.sources : [],
    };

    return res.json({ exam: publicExam });
  } catch (error: any) {
    console.error("Exam generation error:", error);
    const message = error?.message || "প্রশ্ন তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করো।";
    return res.status(500).json({ error: message });
  }
});

// API: Submit & Grade Exam
app.post("/api/exam/submit", async (req, res) => {
  try {
    const body = req.body || {};
    const examId = String(body.examId || "");
    const sessionToken = String(body.sessionToken || "");
    let exam = getExam(examId);

    // 1. Recover from encrypted session token if in-memory/file was lost
    if (!exam && sessionToken) {
      const restored = decryptSessionToken(sessionToken);
      if (restored?.fullExam) {
        exam = restored.fullExam;
        if (examId) saveExam(examId, exam);
      }
    }

    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

    // 2. Fallback AI Evaluation if exam session was lost across a server restart
    if (!exam && body.exam && typeof body.exam === "object") {
      const clientExam = body.exam;
      const ai = getGemini();
      const recoveryPrompt = `You are an expert Bangladesh HSC examiner. A student submitted their answers, but the server restarted and the question answer keys need to be resolved.
Evaluate the student answers accurately according to Bangladesh HSC Board standards.

Subject: ${body.subject || clientExam.subject || "HSC"}
Chapter: ${body.chapter || clientExam.chapter || ""}

Exam Questions:
${JSON.stringify({ mcqs: clientExam.mcqs || [], cqs: clientExam.cqs || [] }, null, 2)}

Student Answers:
${JSON.stringify(answers, null, 2)}

Requirements:
- For every MCQ: identify the correct option (A, B, C, or D), whether student is correct (1 or 0), and a clear Bengali explanation.
- For CQ: evaluate each subpart fairly according to board marks (ক: 1, খ: 2, গ: 3, ঘ: 4 or task marks), provide marks awarded, constructive feedback, and ideal model answers.
- Return ONLY valid JSON:
{
  "mcqs": [
    {
      "id": "string",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "selected": "string",
      "correctAnswer": "string",
      "correct": boolean,
      "marks": number,
      "explanation": "string"
    }
  ],
  "cqEvaluation": {
    "items": [
      {
        "questionId": "string",
        "label": "string",
        "marksAwarded": number,
        "maxMarks": number,
        "feedback": "string",
        "idealAnswer": "string"
      }
    ],
    "score": number,
    "maxScore": number,
    "feedback": "string"
  }
}`;

      try {
        const textOutput = await generateWithFallback(ai, { contents: recoveryPrompt, temperature: 0.2 });
        const parsed = parseJson(textOutput);
        const mcqResults = Array.isArray(parsed?.mcqs) ? parsed.mcqs : [];
        const mcqScore = mcqResults.reduce((s: number, q: any) => s + (q.correct ? 1 : 0), 0);
        const mcqMax = mcqResults.length;
        const cqEval = parsed?.cqEvaluation || { items: [], score: 0, maxScore: 0, feedback: "" };
        const cqScore = Number(cqEval.score) || 0;
        const cqMax = Number(cqEval.maxScore) || 0;
        const totalScore = mcqScore + cqScore;
        const totalMax = mcqMax + cqMax;

        return res.json({
          result: {
            title: clientExam.title || "HSC অনুশীলন পরীক্ষা",
            subject: body.subject || clientExam.subject || "",
            chapter: body.chapter || clientExam.chapter || "",
            difficulty: clientExam.difficulty || "Board standard",
            submittedAt: new Date().toISOString(),
            mcqScore,
            mcqMax,
            mcqResults,
            cqScore,
            cqMax,
            cqEvaluation: cqEval,
            totalScore,
            totalMax,
            percentage: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
            note: "AI সেশন রিকভারি মোডে নিরাপদে মূল্যায়ন সম্পন্ন হয়েছে।",
          },
        });
      } catch (err) {
        console.error("AI recovery grading failed:", err);
      }
    }

    if (!exam) {
      return res.status(404).json({
        error: "এই পরীক্ষার সেশনটি আর পাওয়া যাচ্ছে না। অনুগ্রহ করে 'নতুন টেস্ট' বাটনে ক্লিক করে নতুন পরীক্ষা শুরু করো।",
      });
    }

    // Deterministic MCQ Evaluation
    const mcqResults = (exam.mcqs || []).map((q: any) => {
      const selected = String(answers[q.id] || "").toUpperCase();
      const correctAnswer = String(q.answer || "").toUpperCase();
      const correct = selected !== "" && selected === correctAnswer;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selected: selected || "উত্তর দাওনি",
        correctAnswer: correctAnswer,
        correct,
        marks: correct ? 1 : 0,
        explanation: q.explanation || "",
      };
    });

    const mcqScore = mcqResults.reduce((sum: number, q: any) => sum + q.marks, 0);
    const mcqMax = (exam.mcqs || []).length;

    // Creative Question (CQ) Evaluation
    let cqEvaluation: {
      items: Array<{
        questionId: string;
        label: string;
        marksAwarded: number;
        maxMarks: number;
        feedback: string;
        idealAnswer: string;
      }>;
      score: number;
      maxScore: number;
      feedback: string;
    } = {
      items: [],
      score: 0,
      maxScore: 0,
      feedback: "",
    };

    const typedCq = (exam.cqs || []).map((cq: any) => ({
      id: cq.id,
      stimulus: cq.stimulus,
      subquestions: (cq.subquestions || []).map((sq: any) => ({
        ...sq,
        studentAnswer: String(answers[`${cq.id}_${sq.label}`] || ""),
      })),
    }));

    const image =
      body.image && typeof body.image.data === "string" && typeof body.image.mimeType === "string"
        ? body.image
        : null;

    const hasTypedAnswers = typedCq.some((cq: any) =>
      cq.subquestions.some((sq: any) => sq.studentAnswer.trim().length > 0)
    );

    const hasCqs = Array.isArray(exam.cqs) && exam.cqs.length > 0;
    const cqMax = hasCqs
      ? exam.cqs.reduce(
          (total: number, cq: any) =>
            total +
            (cq.subquestions || []).reduce(
              (s: number, q: any) => s + (Number(q.marks) || 0),
              0
            ),
          0
        )
      : 0;

    if (hasCqs && (hasTypedAnswers || image)) {
      const ai = getGemini();
      const gradingPrompt = `You are a fair, precise, experienced Bangladesh HSC Board examiner.
Evaluate the student's creative answers strictly according to HSC marking standards and the provided questions and rubrics.
- Follow each question's own rubric and max marks. For standard science CQs, ক is 1 mark, খ 2, গ 3 and ঘ 4. For Bangla/English grammar or composition tasks, use the requested task's marking criteria rather than science subpart rules.

Award partial credit fairly based on correct points. Never exceed the max marks for any subquestion.
Provide constructive, encouraging feedback in Bengali for each subquestion, pointing out what was good and what was missing, along with a concise model/ideal answer.
If an uploaded handwritten answer sheet image is provided, examine it with OCR carefully. If both typed answers and image are provided, synthesize both without double-counting.

Questions & Expected Rubrics:
${JSON.stringify(exam.cqs, null, 2)}

Typed Student Answers:
${JSON.stringify(typedCq, null, 2)}

Total available CQ marks: ${cqMax}.

Return ONLY valid JSON strictly matching this schema:
{
  "items": [
    {
      "questionId": "string",
      "label": "string",
      "marksAwarded": number,
      "maxMarks": number,
      "feedback": "string",
      "idealAnswer": "string"
    }
  ],
  "score": number,
  "maxScore": number,
  "feedback": "string"
}`;

      const parts: any[] = [{ text: gradingPrompt }];

      if (image) {
        const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
        if (allowedMimes.includes(image.mimeType) && image.data.length <= 14_000_000) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          });
        }
      }

      try {
        const textOutput = await generateWithFallback(ai, {
          contents: [{ role: "user", parts }],
          temperature: 0.2,
        });

        const parsed = parseJson(textOutput);
        if (parsed && typeof parsed === "object") {
          cqEvaluation = {
            items: Array.isArray(parsed.items) ? parsed.items.map((item: any) => {
              const cq = exam.cqs.find((candidate: any) => candidate.id === item.questionId);
              const sub = cq?.subquestions?.find((candidate: any) => candidate.label === item.label);
              return { ...item, question: item.question || sub?.question || "", stimulus: item.stimulus || cq?.stimulus || "" };
            }) : [],
            score: Number(parsed.score) || 0,
            maxScore: Number(parsed.maxScore) || cqMax,
            feedback: parsed.feedback || "সৃজনশীল প্রশ্নের উত্তর মূল্যায়ন সম্পন্ন হয়েছে।",
          };
        }
      } catch (cqErr) {
        console.error("CQ evaluation AI error:", cqErr);
        cqEvaluation.feedback = "সৃজনশীল প্রশ্নের AI মূল্যায়নে কিছুটা সময় লাগছে বা ত্রুটি হয়েছে।";
      }
    }

    const safeCqScore = Math.min(cqMax, Math.max(0, Number(cqEvaluation.score) || 0));
    const totalScore = mcqScore + safeCqScore;
    const totalMax = mcqMax + cqMax;

    return res.json({
      result: {
        title: exam.title,
        subject: body.subject || exam.subject || "",
        chapter: body.chapter || exam.chapter || "",
        difficulty: exam.difficulty || "Board standard",
        submittedAt: new Date().toISOString(),
        mcqScore,
        mcqMax,
        mcqResults,
        cqScore: safeCqScore,
        cqMax,
        cqEvaluation,
        totalScore,
        totalMax,
        percentage: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0,
        note: "AI মূল্যায়ন সহায়ক ও নির্দেশনামূলক; বোর্ড পরীক্ষায় পরীক্ষকের দৃষ্টিভঙ্গি ও ধাপভিত্তিক মূল্যায়নের ওপর চূড়ান্ত নম্বর নির্ভর করে।",
      },
    });
  } catch (error: any) {
    console.error("Exam submission error:", error);
    const message = error.message?.includes("GEMINI_API_KEY")
      ? error.message
      : "পরীক্ষার উত্তর সাবমিট করা যায়নি। অনুগ্রহ করে সংযোগ পরীক্ষা করে আবার চেষ্টা করো।";
    return res.status(500).json({ error: message });
  }
});

// Static serving for APK downloads
app.use("/APK_DOWNLOAD", express.static(path.resolve(__dirname, "APK_DOWNLOAD")));
app.use("/.build-outputs", express.static(path.resolve(__dirname, ".build-outputs")));

// Vite middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HSC 2027 AI Exam Lab running at http://localhost:${PORT}`);
  });
}

startServer();
