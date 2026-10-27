import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getGemini, getModel, parseJson } from "../../../lib/gemini";
import { saveExam } from "../../../lib/exam-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const allowedTypes = new Set(["Both", "CQ", "MCQ"]);
const allowedDifficulty = new Set(["Board standard", "Easy to hard", "Challenging"]);

export async function POST(request) {
  try {
    const body = await request.json();
    const subject = String(body.subject || "ICT").slice(0, 80);
    const paper = String(body.paper || "").slice(0, 80);
    const chapter = String(body.chapter || "").slice(0, 160);
    const type = allowedTypes.has(body.type) ? body.type : "Both";
    const difficulty = allowedDifficulty.has(body.difficulty) ? body.difficulty : "Board standard";
    const durationMinutes = Math.min(180, Math.max(5, Number(body.durationMinutes) || 30));
    const mcqCount = Math.min(40, Math.max(0, Number(body.mcqCount) || 0));
    const cqCount = Math.min(8, Math.max(0, Number(body.cqCount) || 0));
    if (!chapter.trim()) return NextResponse.json({ error: "অধ্যায়ের নাম লিখো।" }, { status: 400 });
    if ((type === "MCQ" && mcqCount === 0) || (type === "CQ" && cqCount === 0) || (type === "Both" && mcqCount + cqCount === 0)) {
      return NextResponse.json({ error: "প্রশ্নের সংখ্যা ১ বা তার বেশি দাও।" }, { status: 400 });
    }

    const ai = getGemini();
    const prompt = `You are an expert Bangladesh HSC ${subject} examiner for HSC 2027. Create an original, accurate, syllabus-aligned practice test. Subject: ${subject}. Paper: ${paper || "not specified"}. Chapter/topic: ${chapter}. Question style: ${type}. Difficulty: ${difficulty}. Duration: ${durationMinutes} minutes. Create exactly ${type === "CQ" ? 0 : mcqCount} MCQs and exactly ${type === "MCQ" ? 0 : cqCount} creative questions. Use Bangla for all question text unless the subject requires English. Follow Bangladesh HSC exam conventions. Do not claim questions are actual past-board questions or guaranteed common. Make plausible original questions based on well-known syllabus concepts. Ensure MCQ has four options A-D and one unambiguous correct answer. For CQ use a short stimulus and four subquestions ক (1 mark), খ (2), গ (3), ঘ (4), with marking rubric/expected answer points for each subpart. Return ONLY valid JSON matching this schema: {"title":string,"mcqs":[{"id":string,"question":string,"options":{"A":string,"B":string,"C":string,"D":string},"answer":"A|B|C|D","explanation":string}],"cqs":[{"id":string,"stimulus":string,"subquestions":[{"label":"ক|খ|গ|ঘ","question":string,"marks":number,"rubric":string}]}],"sources":[{"title":string,"url":string,"note":string}]}. Use sources only if you can provide real relevant public URLs with confidence; otherwise use an empty array. Do not invent citations. Keep questions appropriate for students.`;
    const response = await ai.models.generateContent({
      model: getModel(), contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.55, maxOutputTokens: 12000 },
    });
    const fullExam = parseJson(response.text);
    if (!Array.isArray(fullExam.mcqs) || !Array.isArray(fullExam.cqs)) throw new Error("AI did not return the required question format. Try again.");
    fullExam.mcqs = fullExam.mcqs.slice(0, type === "CQ" ? 0 : mcqCount).map((q, i) => ({ ...q, id: q.id || `m${i + 1}` }));
    fullExam.cqs = fullExam.cqs.slice(0, type === "MCQ" ? 0 : cqCount).map((q, i) => ({ ...q, id: q.id || `c${i + 1}` }));
    if ((type !== "CQ" && fullExam.mcqs.length !== mcqCount) || (type !== "MCQ" && fullExam.cqs.length !== cqCount)) {
      throw new Error("AI generated fewer questions than requested. Please generate again.");
    }
    const examId = randomUUID();
    saveExam(examId, fullExam);
    const publicExam = {
      examId, title: fullExam.title || `${subject} — ${chapter}`, subject, paper, chapter,
      durationMinutes, difficulty, createdAt: new Date().toISOString(),
      mcqs: fullExam.mcqs.map(({ answer, explanation, ...q }) => q),
      cqs: fullExam.cqs.map(q => ({ ...q, subquestions: q.subquestions.map(({ rubric, ...sub }) => sub) })),
      sources: Array.isArray(fullExam.sources) ? fullExam.sources : [],
    };
    return NextResponse.json({ exam: publicExam });
  } catch (error) {
    console.error("Exam generation error:", error);
    const message = error.message?.includes("GEMINI_API_KEY") ? error.message : "প্রশ্ন তৈরি করা যায়নি। API key, internet connection ও Gemini quota পরীক্ষা করে আবার চেষ্টা করো।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
