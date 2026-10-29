# EdTech structure refresh

## Design goals
- Organize the student experience around practice, assessment, feedback, and progress.
- Keep scores and activity statistics derived from actual local history; avoid illustrative numbers that look like the student's own results.
- Preserve existing exam mechanics, API contracts, answer review, syllabus tools, print/PDF behavior, and APK download route.

## Preserved contract
- MCQ default: 1 minute per question.
- CQ default: 20 minutes per question.
- Existing API can accept a duration override and caps it server-side.
- PDF workflows remain browser print / Save as PDF. No APK artifacts are changed.

## Next recommended structural phases
1. Separate student dashboard, practice creation, exam taking, and result analysis into explicit routes.
2. Add backend persistence and student identity before claiming cross-device progress or leaderboards.
3. Add question-bank provenance, content review, assessment blueprints, and admin-authored tests.
4. Add unit/integration tests for timer expiry, MCQ marking, CQ rubric limits, recovery, and PDF print layouts.
5. Ensure generated assets and authenticated data are handled in a server-only boundary.
