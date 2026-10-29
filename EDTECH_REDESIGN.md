# Student-only Exam Lab

This repository surface is intentionally focused on six steps:
1. Select the preferred subject, paper, chapter, and MCQ/CQ format.
2. Start a timed examination.
3. Auto-submit when time expires, or submit manually before time ends.
4. Mark MCQ answers and show the correct answer with explanation.
5. Evaluate CQ answers with rubric-based feedback/model answers where available.
6. Print or save the finished review as PDF.

Timing defaults retained: 1 minute per MCQ and 20 minutes per CQ.

Explicitly excluded: admin panels, teacher dashboards, leaderboards, ranking, institutional workflows, sign-in/accounts, and oversized analytics.

Preserve the existing APK download button/route/file and the associated update/storage flow. The local browser persistence used for exam drafts/history is also retained; it is distinct from APK download storage.

Validation required before merge: npm run lint, npm run build, npm test, and manual checks for manual-submit, timeout auto-submit, MCQ explanations, CQ review, and browser Save as PDF.
