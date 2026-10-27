import { PublicExam, ExamResultData } from "../types";

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function openA4(title: string, inner: string) {
  const popup = window.open("", "_blank");
  if (!popup) {
    window.alert("PDF/প্রিন্ট খুলতে ব্রাউজারে pop-up অনুমতি দাও।");
    return;
  }
  popup.document.open();
  popup.document.write(
    '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + escapeHtml(title) + '</title><style>' +
    '@page{size:A4;margin:16mm 16mm 18mm}*{box-sizing:border-box}body{font-family:"Noto Sans Bengali","Nirmala UI","SolaimanLipi",Arial,sans-serif;color:#172033;font-size:12pt;line-height:1.65;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'body:before{content:"HSC 2027 AI Exam Lab";position:fixed;z-index:0;top:43%;left:7%;width:86%;text-align:center;font-size:44pt;font-weight:800;letter-spacing:1px;color:rgba(79,70,229,.075);transform:rotate(-32deg);white-space:nowrap;pointer-events:none}' +
    '.page{position:relative;z-index:1}.brand{font-size:9pt;color:#4f46e5;font-weight:700;text-align:right;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-bottom:12px}.head{text-align:center;border-bottom:2px solid #334155;padding-bottom:12px;margin-bottom:18px}.head h1{font-size:19pt;margin:0 0 5px}.head p{font-size:10pt;color:#475569;margin:2px 0}.student{display:flex;gap:18px;flex-wrap:wrap;font-size:10pt;margin:12px 0 20px}.q{margin:0 0 20px;page-break-inside:avoid;break-inside:avoid}.q-title{font-weight:800;margin-bottom:7px}.stimulus{border:1px solid #cbd5e1;border-radius:5px;padding:10px;margin:8px 0 10px}.sub{margin:7px 0}.marks{font-size:9pt;color:#475569;white-space:nowrap}.answer{border-left:3px solid #818cf8;padding:7px 10px;margin:8px 0;background:rgba(238,242,255,.52)}.feedback{font-size:10pt;color:#475569}.footer{margin-top:24px;border-top:1px solid #cbd5e1;padding-top:7px;font-size:9pt;color:#64748b;text-align:center}.notice{font-size:9pt;color:#64748b;margin-top:12px}.keep{break-inside:avoid;page-break-inside:avoid}' +
    '@media print{a{color:inherit;text-decoration:none}button{display:none}body{-webkit-print-color-adjust:exact} .q{break-inside:avoid}}' +
    '</style></head><body><main class="page"><div class="brand">HSC 2027 AI Exam Lab</div>' + inner +
    '<div class="footer">HSC 2027 AI Exam Lab · ব্যক্তিগত অনুশীলনপত্র · তৈরি: ' + escapeHtml(new Date().toLocaleString("bn-BD")) + '</div></main>' +
    '<script>window.onload=function(){setTimeout(function(){window.focus();window.print()},350)};</script></body></html>'
  );
  popup.document.close();
}

export function printCQQuestionPaper(exam: PublicExam) {
  if (!exam.cqs?.length) {
    window.alert("এই পরীক্ষায় সৃজনশীল/লিখিত প্রশ্ন নেই।");
    return;
  }
  const questions = exam.cqs.map((cq, index) =>
    '<section class="q"><div class="q-title">সৃজনশীল প্রশ্ন ' + (index + 1) + ' · ১০ নম্বর</div>' +
    '<div class="stimulus"><strong>উদ্দীপক</strong><br>' + escapeHtml(cq.stimulus) + '</div>' +
    (cq.subquestions || []).map((sub) =>
      '<div class="sub"><strong>' + escapeHtml(sub.label) + '.</strong> ' + escapeHtml(sub.question) +
      ' <span class="marks">(' + escapeHtml(sub.marks) + ' নম্বর)</span></div>'
    ).join("") + '</section>'
  ).join("");
  openA4("CQ Question Paper — " + exam.title,
    '<header class="head"><h1>সৃজনশীল প্রশ্নপত্র</h1><p>' + escapeHtml(exam.title) + '</p><p>' +
    escapeHtml(exam.subject) + ' · ' + escapeHtml(exam.paper) + '</p><p>অধ্যায়: ' + escapeHtml(exam.chapter) +
    ' · সময়: ' + escapeHtml(exam.durationMinutes) + ' মিনিট</p></header>' +
    '<div class="student"><span>শিক্ষার্থীর নাম: __________________</span><span>তারিখ: ______________</span></div>' +
    questions + '<p class="notice">নোট: এটি AI-তৈরি অনুশীলনী প্রশ্নপত্র; অফিসিয়াল বোর্ড প্রশ্নপত্র নয়।</p>'
  );
}

export function printCQAnswerPaper(result: ExamResultData) {
  const items = result.cqEvaluation?.items || [];
  if (!items.length) {
    window.alert("এই ফলাফলে কোনো CQ/লিখিত মূল্যায়ন পাওয়া যায়নি।");
    return;
  }
  const answers = items.map((item, index) =>
    '<section class="q"><div class="q-title">' + escapeHtml(item.questionId) + ' · ' +
    escapeHtml(item.label) + ' <span class="marks">প্রাপ্ত নম্বর: ' + escapeHtml(item.marksAwarded) +
    '/' + escapeHtml(item.maxMarks) + '</span></div>' +
    (item.question ? '<p><strong>প্রশ্ন:</strong> ' + escapeHtml(item.question) + '</p>' : '') +
    (item.stimulus ? '<div class="stimulus"><strong>উদ্দীপক</strong><br>' + escapeHtml(item.stimulus) + '</div>' : '') +
    '<div class="answer"><strong>আদর্শ উত্তর / প্রত্যাশিত পয়েন্ট</strong><br>' +
    escapeHtml(item.idealAnswer || "এই অংশের আদর্শ উত্তর তৈরি হয়নি।").replace(/\n/g, "<br>") + '</div>' +
    (item.feedback ? '<p class="feedback"><strong>পরীক্ষকের মন্তব্য:</strong> ' +
    escapeHtml(item.feedback).replace(/\n/g, "<br>") + '</p>' : '') + '</section>'
  ).join("");
  openA4("CQ Answer Sheet — " + result.title,
    '<header class="head"><h1>সৃজনশীল উত্তর ও মূল্যায়ন</h1><p>' + escapeHtml(result.title) + '</p><p>' +
    escapeHtml(result.subject) + ' · ' + escapeHtml(result.chapter) + '</p><p>CQ নম্বর: ' +
    escapeHtml(result.cqScore) + '/' + escapeHtml(result.cqMax) + '</p></header>' +
    answers + '<p class="notice">AI মূল্যায়ন সহায়ক হিসেবে ব্যবহার করো; চূড়ান্ত পরীক্ষকের সিদ্ধান্তের সঙ্গে নম্বর ভিন্ন হতে পারে।</p>'
  );
}
