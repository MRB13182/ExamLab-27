import { PublicExam, ExamResultData } from "../types";

// Helper to escape HTML safely
export const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Safe file slug
export const fileSlug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "ExamLab";

// Clean, high-legibility document styling for A4 print and PDF capture
// Eliminates all rotated watermarks, decorative artifacts, and unbounded overflow
export const DOCUMENT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap');

  @page {
    size: A4 portrait;
    margin: 12mm 10mm 12mm 10mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body, .pdf-container {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #0f172a;
    font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    width: 794px;
    max-width: 794px;
  }

  .pdf-sheet {
    padding: 10mm 12mm 12mm 12mm;
    background: #ffffff;
  }

  /* Header Section */
  .doc-header {
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 8px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-left {
    flex: 1;
  }

  .app-tag {
    font-size: 8.5pt;
    font-weight: 700;
    color: #2563eb;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .doc-title {
    font-size: 16pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 3px 0;
    line-height: 1.25;
  }

  .doc-meta {
    font-size: 9pt;
    color: #475569;
    margin: 0;
    line-height: 1.4;
  }

  .header-right {
    text-align: right;
    font-size: 8.5pt;
    color: #64748b;
    border-left: 1px solid #e2e8f0;
    padding-left: 12px;
    min-width: 140px;
  }

  .header-right strong {
    color: #0f172a;
    display: block;
    font-size: 9.5pt;
  }

  /* Score Summary Table / Badges */
  .score-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 12px 0 16px 0;
  }

  .score-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 10px;
    text-align: center;
  }

  .score-card-label {
    font-size: 8pt;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 2px;
  }

  .score-card-val {
    font-size: 14pt;
    font-weight: 800;
    color: #1e3a8a;
  }

  /* Question & Section Styling */
  .section-title {
    font-size: 11pt;
    font-weight: 800;
    color: #1e3a8a;
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 4px 8px;
    margin: 16px 0 10px 0;
  }

  .doc-section {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 14px;
  }

  /* MCQ Items */
  .mcq-item {
    page-break-inside: avoid;
    break-inside: avoid;
    border-bottom: 1px solid #e2e8f0;
    padding: 8px 0;
  }

  .mcq-question {
    font-weight: 700;
    font-size: 10.5pt;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .mcq-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    font-size: 9.5pt;
    margin: 4px 0 6px 0;
    padding-left: 4px;
  }

  .mcq-opt {
    color: #334155;
  }

  .mcq-result-row {
    font-size: 8.5pt;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 4px 8px;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-correct {
    color: #15803d;
    font-weight: 700;
  }

  .tag-wrong {
    color: #b91c1c;
    font-weight: 700;
  }

  .explanation-text {
    font-size: 8.5pt;
    color: #475569;
    background: #f1f5f9;
    border-radius: 4px;
    padding: 4px 8px;
    margin-top: 4px;
  }

  /* CQ Items */
  .cq-item {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background: #ffffff;
  }

  .cq-title {
    font-weight: 800;
    font-size: 11pt;
    color: #1e3a8a;
    margin-bottom: 6px;
  }

  .stimulus-box {
    background: #f8fafc;
    border-left: 3px solid #64748b;
    padding: 6px 10px;
    font-size: 9.5pt;
    line-height: 1.5;
    margin: 6px 0 8px 0;
    border-radius: 0 4px 4px 0;
  }

  .subq-row {
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 6px 0;
    padding: 4px 0;
    border-top: 1px dashed #e2e8f0;
  }

  .subq-head {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    justify-content: space-between;
  }

  .subq-marks {
    font-size: 8.5pt;
    color: #64748b;
    font-weight: 600;
  }

  .model-ans-box {
    background: #f0fdf4;
    border-left: 3px solid #16a34a;
    padding: 4px 8px;
    font-size: 9pt;
    color: #166534;
    margin-top: 4px;
    border-radius: 0 4px 4px 0;
  }

  .feedback-box {
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
    padding: 4px 8px;
    font-size: 8.5pt;
    color: #1e40af;
    margin-top: 4px;
    border-radius: 0 4px 4px 0;
  }

  /* Footer */
  .doc-footer {
    border-top: 1px solid #cbd5e1;
    margin-top: 16px;
    padding-top: 6px;
    text-align: center;
    font-size: 8pt;
    color: #64748b;
  }

  .student-blanks {
    display: flex;
    gap: 20px;
    font-size: 9pt;
    margin: 8px 0 14px 0;
    padding: 6px 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }
`;

// Concurrency lock to avoid overlapping PDF generation
let isGeneratingPdf = false;

export interface PdfExportStatus {
  success: boolean;
  error?: string;
  filename?: string;
}

/**
 * Universal PDF generation and download engine
 * - Renders isolated off-screen container without viewport clipping
 * - Validates PDF blob integrity and header (%PDF-)
 * - Downloads directly with reliable Blob URL management
 * - Provides graceful fallback for mobile WebView and restricted environments
 */
async function generateAndDownloadPdf(
  innerHtml: string,
  filename: string,
  documentTitle: string
): Promise<PdfExportStatus> {
  if (isGeneratingPdf) {
    const msg = "আগের PDF তৈরির কাজ চলছে। অনুগ্রহ করে অপেক্ষা করুন।";
    window.alert(msg);
    return { success: false, error: msg };
  }

  isGeneratingPdf = true;

  // Visual status toast
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = "PDF প্রস্তুত করা হচ্ছে…";
  toast.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:2147483647;background:#0d2044;color:#ffffff;padding:12px 20px;border-radius:12px;font-family:'Hind Siliguri',Arial,sans-serif;font-size:14px;font-weight:600;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:1px solid #2563eb;display:flex;align-items:center;gap:8px;";
  document.body.appendChild(toast);

  let host: HTMLDivElement | null = null;

  try {
    // 1. Dynamic import of html2pdf.js
    const importedModule: any = await import("html2pdf.js");
    const html2pdf = importedModule.default || importedModule;
    if (typeof html2pdf !== "function") {
      throw new Error("PDF লাইব্রেরি লোড করা সম্ভব হয়নি।");
    }

    // 2. Create isolated off-screen mount
    // Must NOT use position:fixed to avoid viewport clipping on tall mobile pages
    host = document.createElement("div");
    host.className = "pdf-container";
    host.setAttribute("aria-hidden", "true");
    host.style.position = "absolute";
    host.style.left = "-9999px";
    host.style.top = "0";
    host.style.width = "794px";
    host.style.height = "auto";
    host.style.overflow = "visible";
    host.style.background = "#ffffff";
    host.style.opacity = "1";
    host.style.visibility = "visible";
    host.style.pointerEvents = "none";

    host.innerHTML = `<style>${DOCUMENT_CSS}</style><article class="pdf-sheet">${innerHtml}</article>`;
    document.body.appendChild(host);

    // 3. Wait for browser font layout and paint
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
      ]);
    }

    // 4. Configure html2pdf with reliable mobile-safe parameters
    const opt = {
      margin: [8, 8, 8, 8], // 8mm margins
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.5, // 144 DPI (crystal clear, avoids canvas memory overflow on mobile)
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["css", "legacy"],
        avoid: [".doc-section", ".mcq-item", ".cq-item", ".stimulus-box", ".model-ans-box", ".feedback-box", ".subq-row"],
      },
    };

    // 5. Generate PDF as a real Blob to verify integrity before download
    const worker = html2pdf().set(opt).from(host);
    const pdfBlob: Blob = await worker.outputPdf("blob");

    if (!pdfBlob || pdfBlob.size < 500) {
      throw new Error("উৎপন্ন PDF ফাইলের আকার অসংগতিপূর্ণ বা খালি।");
    }

    // Verify PDF header magic bytes (%PDF-)
    const headerSlice = await pdfBlob.slice(0, 5).text();
    if (!headerSlice.startsWith("%PDF-")) {
      throw new Error("তৈরি করা ফাইলটি সঠিক PDF ফরম্যাট নয়।");
    }

    // 6. Trigger download with persistent object URL
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = filename;
    downloadAnchor.style.display = "none";
    document.body.appendChild(downloadAnchor);

    try {
      downloadAnchor.click();
    } catch (clickErr) {
      // Fallback for restricted WebViews
      window.open(blobUrl, "_blank");
    } finally {
      document.body.removeChild(downloadAnchor);
      // Keep URL active for 60 seconds to allow mobile download manager to finish saving
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }

    return { success: true, filename };
  } catch (err: any) {
    console.error("PDF generation error:", err);
    const errorMsg =
      err?.message ||
      "PDF তৈরি বা ডাউনলোড করা যায়নি। ব্রাউজারের অনুমতি দেখে আবার চেষ্টা করুন।";
    window.alert(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
    if (host?.parentNode) host.parentNode.removeChild(host);
    isGeneratingPdf = false;
  }
}

/**
 * Native Browser Print Document Flow
 * Opens a dedicated printable iframe/window for the "প্রিন্ট / সংরক্ষণ" button
 * Provides 100% vector, selectable text, and zero raster memory overhead
 */
export function printExamDocument(innerHtml: string, title: string): void {
  try {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.setAttribute("aria-hidden", "true");
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>${DOCUMENT_CSS}</style>
      </head>
      <body>
        <article class="pdf-sheet">
          ${innerHtml}
        </article>
      </body>
      </html>
    `);
    frameDoc.close();

    window.setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (e) {
        console.warn("Print iframe trigger failed, falling back to window.print", e);
        window.print();
      } finally {
        window.setTimeout(() => {
          if (printFrame.parentNode) printFrame.parentNode.removeChild(printFrame);
        }, 30000);
      }
    }, 400);
  } catch (err) {
    console.error("Failed to trigger print document:", err);
    window.print();
  }
}

// ==========================================
// HTML BUILDER: FULL EXAM RESULT
// ==========================================
export function buildFullResultHtml(result: ExamResultData): string {
  const mcqHtml = (result.mcqResults || [])
    .map(
      (q, i) => `
      <div class="mcq-item">
        <div class="mcq-question">${i + 1}. ${escapeHtml(q.question)}</div>
        <div class="mcq-options">
          <div class="mcq-opt"><b>(ক)</b> ${escapeHtml(q.options?.A || "")}</div>
          <div class="mcq-opt"><b>(খ)</b> ${escapeHtml(q.options?.B || "")}</div>
          <div class="mcq-opt"><b>(গ)</b> ${escapeHtml(q.options?.C || "")}</div>
          <div class="mcq-opt"><b>(ঘ)</b> ${escapeHtml(q.options?.D || "")}</div>
        </div>
        <div class="mcq-result-row">
          <span>তোমার উত্তর: <b>${escapeHtml(q.selected || "অনুত্তরিত")}</b></span>
          <span>সঠিক উত্তর: <b>${escapeHtml(q.correctAnswer)}</b></span>
          <span class="${q.correct ? "tag-correct" : "tag-wrong"}">
            ${q.correct ? "✓ সঠিক (+1)" : "✗ ভুল (0)"}
          </span>
        </div>
        ${
          q.explanation
            ? `<div class="explanation-text"><b>ব্যাখ্যা:</b> ${escapeHtml(q.explanation)}</div>`
            : ""
        }
      </div>`
    )
    .join("");

  const cqHtml = (result.cqEvaluation?.items || [])
    .map(
      (item) => `
      <div class="cq-item doc-section">
        <div class="cq-title">প্রশ্ন ${escapeHtml(item.questionId)} · অংশ ${escapeHtml(item.label)}</div>
        ${item.question ? `<p style="margin:2px 0 6px 0; font-size:9.5pt;"><b>প্রশ্ন:</b> ${escapeHtml(item.question)}</p>` : ""}
        ${item.stimulus ? `<div class="stimulus-box"><b>উদ্দীপক:</b><br>${escapeHtml(item.stimulus)}</div>` : ""}
        <div class="subq-head">
          <span>মূল্যায়ন ও নম্বর:</span>
          <span class="subq-marks">প্রাপ্ত নম্বর: ${escapeHtml(item.marksAwarded)} / ${escapeHtml(item.maxMarks)}</span>
        </div>
        ${
          item.idealAnswer
            ? `<div class="model-ans-box"><b>আদর্শ উত্তর / মূল পয়েন্ট:</b><br>${escapeHtml(item.idealAnswer).replace(/\n/g, "<br>")}</div>`
            : ""
        }
        ${
          item.feedback
            ? `<div class="feedback-box"><b>পরীক্ষকের মন্তব্য:</b><br>${escapeHtml(item.feedback).replace(/\n/g, "<br>")}</div>`
            : ""
        }
      </div>`
    )
    .join("");

  const submittedDate = result.submittedAt
    ? new Date(result.submittedAt).toLocaleString("bn-BD")
    : new Date().toLocaleString("bn-BD");

  const grade =
    result.percentage >= 80 ? "A+" :
    result.percentage >= 70 ? "A" :
    result.percentage >= 60 ? "A-" :
    result.percentage >= 50 ? "B" :
    result.percentage >= 40 ? "C" :
    result.percentage >= 33 ? "D" : "F";

  return `
    <header class="doc-header">
      <div class="header-left">
        <div class="app-tag">HSC 2027 AI Exam Lab · মূল্যায়ন প্রতিবেদন</div>
        <h1 class="doc-title">${escapeHtml(result.title)}</h1>
        <p class="doc-meta">
          <b>বিষয়:</b> ${escapeHtml(result.subject)} &nbsp;|&nbsp;
          <b>অধ্যায়:</b> ${escapeHtml(result.chapter || "পূর্ণ সিলেবাস")} &nbsp;|&nbsp;
          <b>জমা:</b> ${escapeHtml(submittedDate)}
        </p>
      </div>
      <div class="header-right">
        <strong>${result.autoSubmitted ? "স্বয়ংক্রিয় সাবমিশন" : "ম্যানুয়াল সাবমিশন"}</strong>
        <span>গ্রেড: ${grade}</span>
      </div>
    </header>

    <div class="score-grid">
      <div class="score-card">
        <div class="score-card-label">মোট প্রাপ্ত নম্বর</div>
        <div class="score-card-val">${escapeHtml(result.totalScore)} / ${escapeHtml(result.totalMax)}</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">সাফল্যের হার</div>
        <div class="score-card-val">${escapeHtml(result.percentage)}%</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">MCQ স্কোর</div>
        <div class="score-card-val">${escapeHtml(result.mcqScore)} / ${escapeHtml(result.mcqMax)}</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">CQ স্কোর</div>
        <div class="score-card-val">${escapeHtml(result.cqScore)} / ${escapeHtml(result.cqMax)}</div>
      </div>
    </div>

    ${
      result.cqEvaluation?.feedback
        ? `<div class="doc-section"><div class="section-title">সামগ্রিক মূল্যায়ন ও দিকনির্দেশনা</div><div class="feedback-box" style="font-size:9.5pt;">${escapeHtml(result.cqEvaluation.feedback).replace(/\n/g, "<br>")}</div></div>`
        : ""
    }

    ${
      mcqHtml
        ? `<div class="doc-section"><div class="section-title">বহুনির্বাচনি (MCQ) উত্তরপত্র ও বিশ্লেষণ</div>${mcqHtml}</div>`
        : ""
    }

    ${
      cqHtml
        ? `<div class="doc-section"><div class="section-title">সৃজনশীল / লিখিত (CQ) অংশের মূল্যায়ন</div>${cqHtml}</div>`
        : ""
    }

    <footer class="doc-footer">
      HSC 2027 AI Exam Lab · জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) মানসম্পন্ন মূল্যায়নপত্র · এটি ব্যক্তিগত অনুশীলনী ফলাফল
    </footer>
  `;
}

// ==========================================
// HTML BUILDER: CQ ANSWER EVALUATION
// ==========================================
export function buildCQAnswerHtml(result: ExamResultData): string {
  const items = result.cqEvaluation?.items || [];
  const answersHtml = items
    .map(
      (item) => `
      <div class="cq-item doc-section">
        <div class="cq-title">প্রশ্ন ${escapeHtml(item.questionId)} · অংশ ${escapeHtml(item.label)}</div>
        ${item.question ? `<p style="margin:2px 0 6px 0; font-size:9.5pt;"><b>প্রশ্ন:</b> ${escapeHtml(item.question)}</p>` : ""}
        ${item.stimulus ? `<div class="stimulus-box"><b>উদ্দীপক:</b><br>${escapeHtml(item.stimulus)}</div>` : ""}
        <div class="subq-head">
          <span>মূল্যায়ন ও প্রাপ্ত নম্বর:</span>
          <span class="subq-marks">${escapeHtml(item.marksAwarded)} / ${escapeHtml(item.maxMarks)} নম্বর</span>
        </div>
        ${
          item.idealAnswer
            ? `<div class="model-ans-box"><b>প্রত্যাশিত আদর্শ উত্তর:</b><br>${escapeHtml(item.idealAnswer).replace(/\n/g, "<br>")}</div>`
            : ""
        }
        ${
          item.feedback
            ? `<div class="feedback-box"><b>পরীক্ষকের মন্তব্য ও ভুল সংশোধনী:</b><br>${escapeHtml(item.feedback).replace(/\n/g, "<br>")}</div>`
            : ""
        }
      </div>`
    )
    .join("");

  return `
    <header class="doc-header">
      <div class="header-left">
        <div class="app-tag">HSC 2027 AI Exam Lab · সৃজনশীল / লিখিত উত্তরপত্র</div>
        <h1 class="doc-title">${escapeHtml(result.title)}</h1>
        <p class="doc-meta">
          <b>বিষয়:</b> ${escapeHtml(result.subject)} &nbsp;|&nbsp;
          <b>অধ্যায়:</b> ${escapeHtml(result.chapter || "সিলেবাসভিত্তিক")} &nbsp;|&nbsp;
          <b>CQ নম্বর:</b> ${escapeHtml(result.cqScore)} / ${escapeHtml(result.cqMax)}
        </p>
      </div>
      <div class="header-right">
        <strong>লিখিত মূল্যায়ন</strong>
        <span>জমা: ${new Date(result.submittedAt || Date.now()).toLocaleDateString("bn-BD")}</span>
      </div>
    </header>

    ${
      result.cqEvaluation?.feedback
        ? `<div class="doc-section"><div class="section-title">প্রধান পরীক্ষকের সাধারণ মন্তব্য</div><div class="feedback-box">${escapeHtml(result.cqEvaluation.feedback).replace(/\n/g, "<br>")}</div></div>`
        : ""
    }

    <div class="doc-section">
      <div class="section-title">বিস্তারিত প্রশ্ন ও উপপ্রশ্নভিত্তিক মূল্যায়ন</div>
      ${answersHtml || "<p>কোনো উপপ্রশ্ন মূল্যায়ন পাওয়া যায়নি।</p>"}
    </div>

    <footer class="doc-footer">
      HSC 2027 AI Exam Lab · সৃজনশীল উত্তরপত্র মূল্যায়ন নির্দেশিকা
    </footer>
  `;
}

// ==========================================
// HTML BUILDER: QUESTION PAPER
// ==========================================
export function buildQuestionPaperHtml(exam: PublicExam): string {
  const hasCq = (exam.cqs || []).length > 0;
  const hasMcq = (exam.mcqs || []).length > 0;
  const isWrittenTask = /english|বাংলা ২য় পত্র|bangla 2nd paper/i.test(
    (exam.subject || "") + " " + (exam.paper || "")
  );

  let cqSections = "";
  if (hasCq) {
    cqSections = exam.cqs
      .map((cq, index) => {
        const subq = (cq.subquestions || [])
          .map(
            (sub) => `
          <div class="subq-row">
            <div class="subq-head">
              <span><b>(${escapeHtml(sub.label)})</b> ${escapeHtml(sub.question)}</span>
              <span class="subq-marks">(${escapeHtml(sub.marks)} নম্বর)</span>
            </div>
          </div>`
          )
          .join("");

        return `
        <div class="cq-item doc-section">
          <div class="cq-title">${isWrittenTask ? "প্রশ্ন" : "সৃজনশীল প্রশ্ন"} ${index + 1} &nbsp;·&nbsp; ১০ নম্বর</div>
          ${cq.stimulus ? `<div class="stimulus-box"><b>উদ্দীপক / প্রদত্ত তথ্য:</b><br>${escapeHtml(cq.stimulus)}</div>` : ""}
          ${subq}
        </div>`;
      })
      .join("");
  }

  let mcqSections = "";
  if (hasMcq) {
    mcqSections = exam.mcqs
      .map(
        (q, index) => `
      <div class="mcq-item">
        <div class="mcq-question">${index + 1}. ${escapeHtml(q.question)}</div>
        <div class="mcq-options">
          <div class="mcq-opt"><b>(ক)</b> ${escapeHtml(q.options?.A || "")}</div>
          <div class="mcq-opt"><b>(খ)</b> ${escapeHtml(q.options?.B || "")}</div>
          <div class="mcq-opt"><b>(গ)</b> ${escapeHtml(q.options?.C || "")}</div>
          <div class="mcq-opt"><b>(ঘ)</b> ${escapeHtml(q.options?.D || "")}</div>
        </div>
      </div>`
      )
      .join("");
  }

  const totalMarks = (exam.mcqs?.length || 0) + (exam.cqs?.length || 0) * 10;

  return `
    <header class="doc-header">
      <div class="header-left">
        <div class="app-tag">HSC 2027 AI Exam Lab · অফিশিয়াল প্রশ্নপত্র</div>
        <h1 class="doc-title">${escapeHtml(exam.title)}</h1>
        <p class="doc-meta">
          <b>বিষয়:</b> ${escapeHtml(exam.subject)} ${exam.paper ? `(${escapeHtml(exam.paper)})` : ""} &nbsp;|&nbsp;
          <b>অধ্যায়:</b> ${escapeHtml(exam.chapter)} &nbsp;|&nbsp;
          <b>সময়:</b> ${escapeHtml(exam.durationMinutes)} মিনিট
        </p>
      </div>
      <div class="header-right">
        <strong>মান: ${escapeHtml(exam.difficulty || "Board Standard")}</strong>
        <span>পূর্ণমান: ${totalMarks}</span>
      </div>
    </header>

    <div class="student-blanks">
      <span><b>পরীক্ষার্থীর নাম:</b> ___________________________</span>
      <span><b>রোল নম্বর:</b> ____________</span>
      <span><b>তারিখ:</b> ____________</span>
    </div>

    ${
      hasMcq
        ? `<div class="doc-section"><div class="section-title">বহুনির্বাচনি প্রশ্ন (প্রতিটি প্রশ্নের মান ১)</div>${mcqSections}</div>`
        : ""
    }

    ${
      hasCq
        ? `<div class="doc-section"><div class="section-title">${isWrittenTask ? "লিখিত প্রশ্নাবলি" : "সৃজনশীল প্রশ্নাবলি"}</div>${cqSections}</div>`
        : ""
    }

    <footer class="doc-footer">
      HSC 2027 AI Exam Lab · জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) মানসম্পন্ন অনুশীলনী প্রশ্নপত্র
    </footer>
  `;
}

// ==========================================
// PUBLIC EXPORT ACTIONS
// ==========================================
export async function downloadFullResultPdf(result: ExamResultData): Promise<PdfExportStatus> {
  const innerHtml = buildFullResultHtml(result);
  const filename = `${fileSlug(result.title)}-full-result.pdf`;
  return generateAndDownloadPdf(innerHtml, filename, result.title);
}

export async function printCQAnswerPaper(result: ExamResultData): Promise<PdfExportStatus> {
  const items = result.cqEvaluation?.items || [];
  if (!items.length) {
    const msg = "এই ফলাফলে কোনো CQ বা লিখিত মূল্যায়ন পাওয়া যায়নি।";
    window.alert(msg);
    return { success: false, error: msg };
  }
  const innerHtml = buildCQAnswerHtml(result);
  const filename = `${fileSlug(result.title)}-cq-answers.pdf`;
  return generateAndDownloadPdf(innerHtml, filename, result.title);
}

export async function printCQQuestionPaper(exam: PublicExam): Promise<PdfExportStatus> {
  return downloadQuestionPaperPdf(exam);
}

export async function downloadQuestionPaperPdf(exam: PublicExam): Promise<PdfExportStatus> {
  const hasCq = (exam.cqs || []).length > 0;
  const hasMcq = (exam.mcqs || []).length > 0;

  if (!hasCq && !hasMcq) {
    const msg = "এই পরীক্ষায় কোনো প্রশ্ন পাওয়া যায়নি।";
    window.alert(msg);
    return { success: false, error: msg };
  }

  const innerHtml = buildQuestionPaperHtml(exam);
  const filename = `${fileSlug(exam.title)}-question-paper.pdf`;
  return generateAndDownloadPdf(innerHtml, filename, exam.title);
}

export function printFullResultDocument(result: ExamResultData): void {
  const innerHtml = buildFullResultHtml(result);
  printExamDocument(innerHtml, result.title);
}
