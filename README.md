# Exam Lab — Student Practice Platform

A Bengali-first HSC practice platform focused on guided practice, timed assessments, useful feedback, and progress you can trust.

## Student workflow
- Choose subject, paper, chapters, question format, difficulty, and question count.
- Take timed MCQ, CQ/written, or mixed practice exams.
- MCQ answers are marked automatically; written/CQ responses can be evaluated with rubric-guided AI feedback.
- Review explanations, model-answer guidance, score breakdowns, and stored exam history.
- Print question papers and answer review using browser print / Save as PDF.
- Manage revision notes, board-question practice, scheduled exams, and JSON data backup.
- Continue to use the existing APK download route.

## Timing contract
The server's default is 1 minute per MCQ and 20 minutes per CQ. A user-provided duration can override the calculated duration within the server's configured limit.

## Development
```bash
npm install
cp .env.example .env.local
# Set GEMINI_API_KEY on the server, never in client-side code.
npm run dev
```

## Build and validate
```bash
npm run lint
npm run build
npm test
```

## Data and trust
Local exam history and drafts are stored in this browser unless a future authenticated backend is added. AI-generated questions and AI-written marking are study aids, not official board questions or official results. Verify syllabus and exam formats against current official notices. This build does not claim a global leaderboard, cloud sync, verified certificates, or institutional integrations.
