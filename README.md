# Exam Lab

A Bengali-first student practice app for timed MCQ and CQ/written exams.

## Student flow
- Select a subject, paper, chapter and exam type.
- Start the timed exam.
- Exam auto-submits when time runs out; students may submit early.
- Review MCQ answers and explanations, plus CQ marking feedback/model answers when available.
- Print or save the completed question/answer review as PDF.
- Review previous personal results from browser-local history.

## Timing
Default: 1 minute per MCQ and 20 minutes per CQ.

## Development
```bash
npm install
cp .env.example .env.local
# Configure GEMINI_API_KEY in the server environment; never put it in client code.
npm run dev
```

Build and validate with `npm run lint`, `npm run build`, and `npm test`.

No admin/teacher dashboard, leaderboard, ranking, account system, or institution flow is included. Existing APK download and update/storage behavior is preserved.
