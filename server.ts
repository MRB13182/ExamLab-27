import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { getGemini, generateWithFallback, parseJson } from "./lib/gemini.ts";
import { saveExam, getExam } from "./lib/exam-store.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High payload limit to allow handwritten answer sheet image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const allowedTypes = new Set(["Both", "CQ", "MCQ"]);
const allowedDifficulty = new Set(["Board standard", "Easy to hard", "Challenging"]);

// API: Generate Practice Exam
app.post("/api/exam/generate", async (req, res) => {
  try {
    const body = req.body || {};
    const subject = String(body.subject || "ICT").slice(0, 80);
    const paper = String(body.paper || "").slice(0, 80);
    const chapters = Array.isArray(body.chapters) ? body.chapters.map((v: unknown) => String(v).slice(0, 160)).filter(Boolean).slice(0, 20) : [];
    const chapter = String(body.chapter || chapters.join(" • ") || "").slice(0, 2000);
    const questionPattern = String(body.questionPattern || "Use the standard HSC question style for this subject and paper.").slice(0, 2500);
    const type = allowedTypes.has(body.type) ? body.type : "Both";
    const difficulty = allowedDifficulty.has(body.difficulty) ? body.difficulty : "Board standard";
    const durationMinutes = Math.min(180, Math.max(5, Number(body.durationMinutes) || 30));
    const mcqCount = Math.min(40, Math.max(0, Number(body.mcqCount) || 0));
    const cqCount = Math.min(8, Math.max(0, Number(body.cqCount) || 0));

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
    const prompt = `You are an expert Bangladesh HSC ${subject} examiner for HSC 2027 curriculum. Create an original, highly accurate, NCTB syllabus-aligned practice test.
Subject: ${subject}
Paper: ${paper || "not specified"}
Chapter/Topics (multiple selection allowed): ${chapter}
Subject-specific question pattern guidance: ${questionPattern}
Question Style: ${type}
Difficulty: ${difficulty}
Target Duration: ${durationMinutes} minutes

Requirements:
- Create exactly ${type === "CQ" ? 0 : mcqCount} MCQs and exactly ${type === "MCQ" ? 0 : cqCount} Creative Questions (CQ).
- Use clear, standard Bangla for all question texts, math notation, formulas, and explanations (unless English subject).
- Follow official Bangladesh HSC Board examination question standards.
- MCQs must have four options (A, B, C, D) and exactly one clear correct answer with concise pedagogical explanation.
- Follow the subject-specific question pattern guidance above. Do NOT force the science four-subpart CQ format on English or Bangla 2nd Paper.
- For science subjects and ICT, normally create a short stimulus and four subparts ক (1 mark), খ (2), গ (3), ঘ (4), total 10, unless the specified pattern says otherwise.
- For Bangla 1st Paper, build literature-based questions around the selected story, poem, novel or drama; use a short original stimulus/paraphrase and author/theme/character-aware questions. Do not reproduce long copyrighted text.
- For Bangla 2nd Paper and English 1st/2nd Paper, represent each requested written task as one subquestion labelled ক worth 10 marks, with the full task instructions in the question field and a task-specific rubric. Use the correct language for the subject and do not force the science four-part format.
- For Higher Mathematics, prioritize valid derivations and multi-step calculations; don't invent an irrelevant prose stimulus.
- Supply concise expected answer points / marking rubric for every written subpart or writing task. Ensure the total available marks reflect the chosen format, not a fixed assumption if the task differs.
- Do not output markdown conversational commentary. Return ONLY valid JSON strictly matching this schema:
{
  "title": "string",
  "mcqs": [
    {
      "id": "string",
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "answer": "A" | "B" | "C" | "D",
      "explanation": "string"
    }
  ],
  "cqs": [
    {
      "id": "string",
      "stimulus": "string",
      "subquestions": [
        {
          "label": "ক" | "খ" | "গ" | "ঘ",
          "question": "string",
          "marks": number,
          "rubric": "string"
        }
      ]
    }
  ],
  "sources": []
}`;

    const textOutput = await generateWithFallback(ai, {
      contents: prompt,
      temperature: 0.45,
    });

    const fullExam = parseJson(textOutput);
    if (!fullExam || !Array.isArray(fullExam.mcqs) || !Array.isArray(fullExam.cqs)) {
      throw new Error("AI did not return the required question format. Please try again.");
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

    // Return public representation (hide solutions/rubrics to prevent inspection cheating)
    const publicExam = {
      examId,
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
    const message = error.message?.includes("GEMINI_API_KEY")
      ? error.message
      : "প্রশ্ন তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করো।";
    return res.status(500).json({ error: message });
  }
});

// API: Submit & Grade Exam
app.post("/api/exam/submit", async (req, res) => {
  try {
    const body = req.body || {};
    const examId = String(body.examId || "");
    const exam = getExam(examId);

    if (!exam) {
      return res.status(404).json({
        error: "এই পরীক্ষার সেশনটি আর পাওয়া যাচ্ছে না। নতুন পরীক্ষা শুরু করো।",
      });
    }

    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

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
