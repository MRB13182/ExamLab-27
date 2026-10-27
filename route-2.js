import { NextResponse } from "next/server";
import { getGemini, getModel, parseJson } from "../../../lib/gemini";
import { getExam } from "../../../lib/exam-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const exam = getExam(String(body.examId || ""));
    if (!exam) return NextResponse.json({ error: "এই পরীক্ষার সেশনটি আর নেই। লোকাল ডেভেলপমেন্ট সার্ভার রিস্টার্ট হলে নতুন পরীক্ষা শুরু করতে হবে।" }, { status: 404 });
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    const mcqResults = exam.mcqs.map(q => {
      const selected = String(answers[q.id] || "");
      const correct = selected.toUpperCase() === String(q.answer).toUpperCase();
      return { id: q.id, question: q.question, selected, correctAnswer: q.answer, correct, marks: correct ? 1 : 0, explanation: q.explanation || "" };
    });
    const mcqScore = mcqResults.reduce((sum, q) => sum + q.marks, 0);
    const mcqMax = exam.mcqs.length;
    let cqEvaluation = { items: [], score: 0, maxScore: 0, feedback: "" };
    const typedCq = exam.cqs.map(cq => ({
      id: cq.id, stimulus: cq.stimulus,
      subquestions: cq.subquestions.map(sq => ({ ...sq, answer: String(answers[`${cq.id}_${sq.label}`] || "") }))
    }));
    const image = body.image && typeof body.image.data === "string" && typeof body.image.mimeType === "string" ? body.image : null;
    if (exam.cqs.length && (typedCq.some(cq => cq.subquestions.some(sq => sq.answer.trim())) || image)) {
      const ai = getGemini();
      const gradingPrompt = `You are a fair Bangladesh HSC examiner. Evaluate the student's answers against the provided question and rubric. Award partial credit only for correct relevant points, never exceed each subquestion's marks. Be constructive and use Bangla. The uploaded image, if present, is a student's answer sheet; read it carefully. If typed answers and an image are both present, assess both and avoid double-counting the same answer. Return ONLY JSON: {"items":[{"questionId":string,"label":string,"marksAwarded":number,"maxMarks":number,"feedback":string,"idealAnswer":string}],"score":number,"maxScore":number,"feedback":string}. Questions and marking rubrics: ${JSON.stringify(exam.cqs)}. Typed student answers: ${JSON.stringify(typedCq)}. Total CQ marks available: ${exam.cqs.reduce((total,cq)=>total+cq.subquestions.reduce((s,q)=>s+(Number(q.marks)||0),0),0)}.`;
      const parts = [{ text: gradingPrompt }];
      if (image) {
        const allowedMime = ["image/jpeg", "image/png", "image/webp"].includes(image.mimeType);
        if (!allowedMime || image.data.length > 7_000_000) return NextResponse.json({ error: "ছবিটি JPG, PNG বা WebP হতে হবে এবং ফাইলটি ছোট হতে হবে (প্রায় ৫ MB-এর মধ্যে)।" }, { status: 400 });
        parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
      }
      const response = await ai.models.generateContent({ model: getModel(), contents: [{ role: "user", parts }], config: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8000 } });
      cqEvaluation = parseJson(response.text);
      if (!Array.isArray(cqEvaluation.items)) cqEvaluation.items = [];
      cqEvaluation.score = Number(cqEvaluation.score) || 0;
      cqEvaluation.maxScore = Number(cqEvaluation.maxScore) || exam.cqs.reduce((t,cq)=>t+cq.subquestions.reduce((s,q)=>s+(Number(q.marks)||0),0),0);
    }
    const cqMax = exam.cqs.reduce((total,cq)=>total+cq.subquestions.reduce((s,q)=>s+(Number(q.marks)||0),0),0);
    const safeCqScore = Math.min(cqMax, Math.max(0, Number(cqEvaluation.score) || 0));
    const totalScore = mcqScore + safeCqScore;
    return NextResponse.json({ result: {
      title: exam.title, subject: body.subject || "", chapter: body.chapter || "", submittedAt: new Date().toISOString(),
      mcqScore, mcqMax, mcqResults, cqScore: safeCqScore, cqMax, cqEvaluation,
      totalScore, totalMax: mcqMax + cqMax,
      note: "AI মূল্যায়ন সহায়ক; চূড়ান্ত বোর্ড পরীক্ষার নম্বরের সঙ্গে কিছু পার্থক্য হতে পারে।"
    }});
  } catch (error) {
    console.error("Exam submission error:", error);
    const message = error.message?.includes("GEMINI_API_KEY") ? error.message : "উত্তর যাচাই করা যায়নি। Gemini quota বা connection পরীক্ষা করে আবার চেষ্টা করো।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
