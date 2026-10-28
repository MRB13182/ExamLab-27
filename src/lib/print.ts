import { PublicExam, ExamResultData } from "../types";

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const css = `
  *{box-sizing:border-box}
  body{font-family:"Noto Sans Bengali","Nirmala UI","SolaimanLipi",Arial,sans-serif;color:#172033;font-size:12pt;line-height:1.65;margin:0;background:#fff}
  .pdf-page{position:relative;width:100%;background:white;padding:12mm 13mm;color:#172033}
  .brand{font-size:9pt;color:#4f46e5;font-weight:700;text-align:right;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-bottom:12px}
  .head{text-align:center;border-bottom:2px solid #334155;padding-bottom:12px;margin-bottom:18px}
  .head h1{font-size:19pt;margin:0 0 5px}.head p{font-size:10pt;color:#475569;margin:2px 0}
  .student{display:flex;gap:18px;flex-wrap:wrap;font-size:10pt;margin:12px 0 20px}
  .q{position:relative;margin:0 0 20px;page-break-inside:avoid;break-inside:avoid;padding:4px 0}
  .q:after{content:"HSC 2027 AI Exam Lab";position:absolute;left:8%;top:42%;width:84%;text-align:center;font-size:26pt;font-weight:800;color:rgba(79,70,229,.065);transform:rotate(-28deg);pointer-events:none;z-index:0}
  .q>*{position:relative;z-index:1}
  .q-title{font-weight:800;margin-bottom:7px}.stimulus{border:1px solid #cbd5e1;border-radius:5px;padding:10px;margin:8px 0 10px}
  .sub{margin:7px 0}.marks{font-size:9pt;color:#475569;white-space:nowrap}
  .answer{border-left:3px solid #818cf8;padding:7px 10px;margin:8px 0;background:#f3f4ff}
  .feedback{font-size:10pt;color:#475569}.footer{margin-top:24px;border-top:1px solid #cbd5e1;padding-top:7px;font-size:9pt;color:#64748b;text-align:center}
  .notice{font-size:9pt;color:#64748b;margin-top:12px}.summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:14px 0}
  .metric{border:1px solid #dbe3ee;border-radius:7px;padding:8px}.metric b{display:block;font-size:9pt;color:#64748b}.metric strong{font-size:17pt}
  .mcq{border-bottom:1px solid #dbe3ee;padding:10px 0;break-inside:avoid}.correct{color:#047857}.wrong{color:#be123c}
`;

async function saveA4Pdf(title: string, inner: string, filename: string) {
  let host: HTMLDivElement | null = null;
  try {
    const imported: any = await import("html2pdf.js");
    const html2pdf = imported.default || imported;
    host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.width = "794px";
    host.style.background = "#ffffff";
    host.style.zIndex = "-1";
    host.innerHTML = '<style>' + css + '</style><article class="pdf-page"><div class="brand">HSC 2027 AI Exam Lab</div>' + inner +
      '<div class="footer">HSC 2027 AI Exam Lab · ব্যক্তিগত অনুশীলনপত্র · ' + escapeHtml(new Date().toLocaleString("bn-BD")) + '</div></article>';
    document.body.appendChild(host);
    await new Promise(resolve => setTimeout(resolve, 180));
    await html2pdf().set({
      margin: [8, 0, 8, 0],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, scrollX: 0, scrollY: 0, windowWidth: 794 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ["css", "legacy"], avoid: [".q", ".mcq"] }
    }).from(host).save();
  } catch (error) {
    console.error("PDF download failed:", error);
    window.alert("PDF তৈরি করা যায়নি। ইন্টারনেট সংযোগ ঠিক আছে কি না দেখো এবং আবার চেষ্টা করো।");
  } finally {
    if (host?.parentNode) host.parentNode.removeChild(host);
  }
}

const fileSlug = (value: string) => value.normalize("NFKD").replace(/[^a-zA-Z0-9\u0980-\u09FF]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "ExamLab";

export function printCQQuestionPaper(exam: PublicExam) {
  if (!exam.cqs?.length) {
    window.alert("এই পরীক্ষায় সৃজনশীল/লিখিত প্রশ্ন নেই।");
    return;
  }
  const isWrittenTask = /english|বাংলা ২য় পত্র|bangla 2nd paper/i.test((exam.subject || "") + " " + (exam.paper || ""));
  const questionHeading = isWrittenTask ? "লিখিত প্রশ্ন" : "সৃজনশীল প্রশ্ন";
  const questions = exam.cqs.map((cq, index) =>
    '<section class="q"><div class="q-title">' + questionHeading + " " + (index + 1) + " · ১০ নম্বর</div>" +
    '<div class="stimulus"><strong>উদ্দীপক / প্রদত্ত তথ্য</strong><br>' + escapeHtml(cq.stimulus) + "</div>" +
    (cq.subquestions || []).map(sub =>
      '<div class="sub"><strong>' + escapeHtml(sub.label) + ".</strong> " + escapeHtml(sub.question) +
      ' <span class="marks">(' + escapeHtml(sub.marks) + " নম্বর)</span></div>"
    ).join("") + "</section>"
  ).join("");
  const inner = '<header class="head"><h1>' + (isWrittenTask ? "লিখিত প্রশ্নপত্র" : "সৃজনশীল প্রশ্নপত্র") + "</h1><p>" +
    escapeHtml(exam.title) + "</p><p>" + escapeHtml(exam.subject) + " · " + escapeHtml(exam.paper) + "</p><p>অধ্যায়: " +
    escapeHtml(exam.chapter) + " · সময়: " + escapeHtml(exam.durationMinutes) + " মিনিট</p></header>" +
    '<div class="student"><span>শিক্ষার্থীর নাম: __________________</span><span>তারিখ: ______________</span></div>' +
    questions + '<p class="notice">নোট: এটি AI-তৈরি অনুশীলনী প্রশ্নপত্র; অফিসিয়াল বোর্ড প্রশ্নপত্র নয়।</p>';
  void saveA4Pdf("CQ Question Paper — " + exam.title, inner, fileSlug(exam.title) + "-question-paper.pdf");
}

export function printCQAnswerPaper(result: ExamResultData) {
  const items = result.cqEvaluation?.items || [];
  if (!items.length) {
    window.alert("এই ফলাফলে কোনো CQ/লিখিত মূল্যায়ন পাওয়া যায়নি।");
    return;
  }
  const isWrittenTask = /english|বাংলা ২য় পত্র|bangla 2nd paper/i.test((result.subject || "") + " " + (result.title || ""));
  const answers = items.map(item =>
    '<section class="q"><div class="q-title">' + escapeHtml(item.questionId) + " · " + escapeHtml(item.label) +
    ' <span class="marks">প্রাপ্ত নম্বর: ' + escapeHtml(item.marksAwarded) + "/" + escapeHtml(item.maxMarks) + "</span></div>" +
    (item.question ? "<p><strong>প্রশ্ন:</strong> " + escapeHtml(item.question) + "</p>" : "") +
    (item.stimulus ? '<div class="stimulus"><strong>উদ্দীপক / প্রদত্ত তথ্য</strong><br>' + escapeHtml(item.stimulus) + "</div>" : "") +
    '<div class="answer"><strong>আদর্শ উত্তর / প্রত্যাশিত পয়েন্ট</strong><br>' + escapeHtml(item.idealAnswer || "এই অংশের আদর্শ উত্তর তৈরি হয়নি।").replace(/\n/g, "<br>") + "</div>" +
    (item.feedback ? '<p class="feedback"><strong>পরীক্ষকের মন্তব্য:</strong> ' + escapeHtml(item.feedback).replace(/\n/g, "<br>") + "</p>" : "") +
    "</section>"
  ).join("");
  const inner = '<header class="head"><h1>' + (isWrittenTask ? "লিখিত উত্তর ও মূল্যায়ন" : "সৃজনশীল উত্তর ও মূল্যায়ন") + "</h1><p>" +
    escapeHtml(result.title) + "</p><p>" + escapeHtml(result.subject) + " · " + escapeHtml(result.chapter) + "</p><p>CQ নম্বর: " +
    escapeHtml(result.cqScore) + "/" + escapeHtml(result.cqMax) + "</p></header>" + answers +
    '<p class="notice">AI মূল্যায়ন সহায়ক হিসেবে ব্যবহার করো; চূড়ান্ত পরীক্ষকের সিদ্ধান্তের সঙ্গে নম্বর ভিন্ন হতে পারে।</p>';
  void saveA4Pdf("CQ Answer Sheet — " + result.title, inner, fileSlug(result.title) + "-cq-answers.pdf");
}

export function downloadFullResultPdf(result: ExamResultData) {
  const mcq = (result.mcqResults || []).map((q, i) =>
    '<section class="mcq"><strong>' + (i + 1) + ". " + escapeHtml(q.question) + "</strong>" +
    '<p>তোমার উত্তর: ' + escapeHtml(q.selected || "উত্তর দাওনি") + " · সঠিক উত্তর: " + escapeHtml(q.correctAnswer) +
    ' · <b class="' + (q.correct ? "correct" : "wrong") + '">' + (q.correct ? "সঠিক" : "ভুল/অনুত্তরিত") + "</b> · নম্বর: " +
    escapeHtml(q.marks) + "/" + 1 + "</p>" +
    (q.explanation ? '<p class="feedback"><strong>ব্যাখ্যা:</strong> ' + escapeHtml(q.explanation) + "</p>" : "") + "</section>"
  ).join("");
  const cqs = (result.cqEvaluation?.items || []).map(item =>
    '<section class="q"><div class="q-title">' + escapeHtml(item.questionId) + " · " + escapeHtml(item.label) +
    ' · নম্বর: ' + escapeHtml(item.marksAwarded) + "/" + escapeHtml(item.maxMarks) + "</div>" +
    (item.question ? "<p><strong>প্রশ্ন:</strong> " + escapeHtml(item.question) + "</p>" : "") +
    (item.stimulus ? '<div class="stimulus"><strong>উদ্দীপক</strong><br>' + escapeHtml(item.stimulus) + "</div>" : "") +
    '<div class="answer"><strong>আদর্শ উত্তর</strong><br>' + escapeHtml(item.idealAnswer || "উপলব্ধ নয়").replace(/\n/g, "<br>") + "</div>" +
    (item.feedback ? '<p class="feedback"><strong>মন্তব্য:</strong> ' + escapeHtml(item.feedback).replace(/\n/g, "<br>") + "</p>" : "") + "</section>"
  ).join("");
  const inner = '<header class="head"><h1>পূর্ণাঙ্গ পরীক্ষার ফলাফল</h1><p>' + escapeHtml(result.title) + "</p><p>" +
    escapeHtml(result.subject) + " · " + escapeHtml(result.chapter) + "</p><p>জমা: " + escapeHtml(new Date(result.submittedAt).toLocaleString("bn-BD")) +
    "</p></header>" +
    '<div class="summary-grid"><div class="metric"><b>মোট নম্বর</b><strong>' + escapeHtml(result.totalScore) + "/" + escapeHtml(result.totalMax) +
    '</strong></div><div class="metric"><b>শতাংশ</b><strong>' + escapeHtml(result.percentage) +
    '%</strong></div><div class="metric"><b>MCQ</b><strong>' + escapeHtml(result.mcqScore) + "/" + escapeHtml(result.mcqMax) +
    '</strong></div><div class="metric"><b>CQ / Written</b><strong>' + escapeHtml(result.cqScore) + "/" + escapeHtml(result.cqMax) +
    "</strong></div></div>" +
    (result.cqEvaluation?.feedback ? '<div class="answer"><strong>সামগ্রিক মন্তব্য</strong><br>' + escapeHtml(result.cqEvaluation.feedback) + "</div>" : "") +
    (mcq ? "<h2>MCQ উত্তর ও ব্যাখ্যা</h2>" + mcq : "") + (cqs ? "<h2>CQ / Written মূল্যায়ন</h2>" + cqs : "") +
    '<p class="notice">এটি AI-সহায়তায় তৈরি অনুশীলনী ফলাফল; অফিসিয়াল বোর্ডের নম্বরপত্র নয়।</p>';
  void saveA4Pdf("Exam Result — " + result.title, inner, fileSlug(result.title) + "-full-result.pdf");
}
