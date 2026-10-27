# HSC 2027 AI Exam Lab

A Bengali-first, mobile-responsive HSC practice-test app for chapter-wise MCQ and CQ/written practice.

## Included
- Science, ICT, Bangla 1st/2nd and English 1st/2nd syllabus/topic starter data.
- Multi-chapter selection and subject-specific question style guidance for Gemini.
- MCQ selection, CQ/written answers, countdown, manual submission and auto-submit at timeout.
- Local draft recovery (answers and deadline) after refresh while the running server session remains available.
- MCQ auto-marking and Gemini-assisted written/CQ marking.
- A4 CQ question-paper and CQ answer-review print views with `HSC 2027 AI Exam Lab` watermark. In the browser print dialog choose **Save as PDF**.
- Browser-local result history and a one-click JSON backup of local app data.

## Google AI Studio
1. Open this project in the AI Studio Build workspace or paste the code into Build mode.
2. Add `GEMINI_API_KEY` through the server-side Secrets panel. Never put the key in client code or a public repository.
3. Preview the app and try a short exam first to validate API quota and output formatting.

## Run locally on a computer
Requires Node.js compatible with the dependencies.

```bash
npm install
cp .env.example .env.local
# edit .env.local and set GEMINI_API_KEY to your own key
npm run dev
```

Then open `http://localhost:3000`.

## Local-data model and limitations
Exam history and active draft answers are stored in the browser's `localStorage`; the Download icon exports a JSON backup. AI calls still require internet access and a server-side Gemini secret. The question/answer-key session is held in the running development server's memory, so restarting that server can invalidate an active exam even though its local draft remains. Uploaded handwriting images are sent to Gemini for grading and aren't included in the JSON backup. A browser cannot reliably prevent screenshots, and printed-to-PDF watermarking is a branding mark, not a security boundary.

The syllabus and question-pattern notes are a preparation starter based on a student-supplied list. Always verify final HSC 2027 syllabus details and official marks distributions against current NCTB/college notices. Generated questions and AI grading are practice aids, not official board questions or official marking decisions.
