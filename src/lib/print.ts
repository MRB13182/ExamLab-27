import { PublicExam, ExamResultData } from "../types";

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const css = `
  *{box-sizing:border-box}
  body{font-family:"Noto Sans Bengali","Nirmala UI","SolaimanLipi",Arial,sans-serif;color:#172033;font-size:12pt;line-height:1.65;margin:0;background:#fff}
  .pdf-page{position:relative;width:100%;background:#fff;padding:8mm 12mm 12mm;color:#172033;overflow:hidden}
  .brandbar{display:flex;align-items:center;gap:10px;padding:0 0 8px;margin:0 0 12px;border-bottom:2px solid #2563eb;position:relative;z-index:2}
  .brand-logo{width:42px;height:42px;flex:0 0 42px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:linear-gradient(145deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe}
  .brand-logo svg{width:32px;height:32px;display:block}
  .brand-copy{display:flex;flex-direction:column;line-height:1.15}
  .brand-name{font-size:14pt;font-weight:900;letter-spacing:-.2px;color:#0f2b55}
  .brand-name span{color:#2563eb}
  .brand-tagline{font-size:7.5pt;color:#2563eb;font-style:italic;margin-top:4px}
  .brand-note{margin-left:auto;text-align:right;font-size:7.5pt;line-height:1.35;color:#1d4ed8;font-weight:700;max-width:95px}
  .head{text-align:center;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:18px;position:relative}
  .head h1{font-size:19pt;margin:0 0 5px;color:#0f2b55}.head p{font-size:10pt;color:#475569;margin:2px 0}
  .head:after{content:"HSC 2027 AI Exam Lab";position:absolute;left:7%;top:42%;width:86%;text-align:center;font-size:22pt;font-weight:900;color:rgba(37,99,235,.055);transform:rotate(-28deg);pointer-events:none;z-index:0}
  .head>*{position:relative;z-index:1}
  .student{display:flex;gap:18px;flex-wrap:wrap;font-size:10pt;margin:12px 0 20px}
  .q{position:relative;margin:0 0 20px;page-break-inside:avoid;break-inside:avoid;padding:4px 0}
  .q:after{content:"HSC 2027 AI Exam Lab";position:absolute;left:8%;top:42%;width:84%;text-align:center;font-size:22pt;font-weight:800;color:rgba(37,99,235,.055);transform:rotate(-28deg);pointer-events:none;z-index:0}
  .q>*{position:relative;z-index:1}
  .q-title{font-weight:800;margin-bottom:7px}.stimulus{border:1px solid #cbd5e1;border-radius:5px;padding:10px;margin:8px 0 10px}
  .sub{margin:7px 0}.marks{font-size:9pt;color:#475569;white-space:nowrap}
  .answer{border-left:3px solid #818cf8;padding:7px 10px;margin:8px 0;background:#f3f4ff}
  .feedback{font-size:10pt;color:#475569}.footer{margin-top:24px;border-top:1px solid #cbd5e1;padding-top:7px;font-size:9pt;color:#64748b;text-align:center}
  .notice{font-size:9pt;color:#64748b;margin-top:12px}.summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:14px 0}
  .metric{border:1px solid #dbe3ee;border-radius:7px;padding:8px}.metric b{display:block;font-size:9pt;color:#64748b}.metric strong{font-size:17pt}
  .mcq{position:relative;border-bottom:1px solid #dbe3ee;padding:10px 0;break-inside:avoid}
  .mcq:after{content:"HSC 2027 AI Exam Lab";position:absolute;left:10%;top:40%;width:80%;text-align:center;font-size:17pt;font-weight:900;color:rgba(37,99,235,.045);transform:rotate(-28deg);pointer-events:none;z-index:0}
  .mcq>*{position:relative;z-index:1}.correct{color:#047857}.wrong{color:#be123c}
`;

async function saveA4Pdf(title: string, inner: string, filename: string) {
  let host: HTMLDivElement | null = null;
  let overlay: HTMLDivElement | null = null;
  try {
    const imported: any = await import("html2pdf.js");
    const html2pdf = imported.default || imported;
    if (typeof html2pdf !== "function") throw new Error("PDF library did not initialize");

    // Render fully opaque HTML. The previous opacity:0.01 setting also made
    // the captured PDF almost invisible because html2canvas preserves opacity.
    host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = "794px";
    host.style.maxWidth = "none";
    host.style.height = "auto";
    host.style.maxHeight = "none";
    host.style.overflow = "visible";
    host.style.opacity = "1";
    host.style.visibility = "visible";
    host.style.pointerEvents = "none";
    host.style.zIndex = "2147483000";
    host.style.background = "#ffffff";
    host.innerHTML = '<style>' + css + '</style><article class="pdf-page">' +
      '<div class="brandbar"><div class="brand-logo" aria-hidden="true"><svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M4 20 32 7l28 13-28 13L4 20Z" fill="#2563eb"/><path d="M15 26v14c10 8 24 8 34 0V26L32 35 15 26Z" fill="#1d4ed8"/><path d="M57 22v17" stroke="#0f2b55" stroke-width="3" stroke-linecap="round"/><circle cx="57" cy="42" r="3.5" fill="#f59e0b"/><path d="M27 39h10v6H27z" fill="#93c5fd"/></svg></div><div class="brand-copy"><div class="brand-name">HSC 2027 <span>AI Exam Lab</span></div><div class="brand-tagline">Practice Smart. Score Higher.</div></div><div class="brand-note">Better Practice<br>Brighter Results</div></div>' + inner +
      '<div class="footer">HSC 2027 AI Exam Lab · ব্যক্তিগত অনুশীলনপত্র · ' + escapeHtml(new Date().toLocaleString("bn-BD")) + '</div></article>';

    // Give mobile users feedback while the opaque render page is being captured.
    overlay = document.createElement("div");
    overlay.setAttribute("role", "status");
    overlay.textContent = "PDF তৈরি হচ্ছে…";
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483500;display:flex;align-items:center;justify-content:center;background:rgba(248,250,252,.96);color:#1e3a8a;font:600 16px Arial,sans-serif;";
    document.body.appendChild(host);
    document.body.appendChild(overlay);

    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready.then(() => undefined),
        new Promise<void>(resolve => window.setTimeout(resolve, 1800))
      ]);
    }

    const worker = html2pdf().set({
      margin: [8, 0, 8, 0],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ["css", "legacy"], avoid: [".q", ".mcq", ".stimulus", ".answer"] }
    }).from(host);

    // Use html2pdf's supported save pipeline instead of treating its Worker
    // object as a Blob. This avoids generating/revoking a broken object URL.
    await worker.save(filename);
  } catch (error) {
    console.error("PDF download failed:", error);
    window.alert("PDF তৈরি বা ডাউনলোড করা যায়নি। ব্রাউজারের Downloads অনুমতি দেখে আবার চেষ্টা করো।");
  } finally {
    if (overlay?.parentNode) overlay.parentNode.removeChild(overlay);
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
