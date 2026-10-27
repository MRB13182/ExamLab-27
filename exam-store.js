// Local-development MVP store. This is intentionally server-only and never sent to the browser.
// For multi-instance/production hosting, replace with a persistent database such as Supabase.
const store = globalThis.__hscExamStore || new Map();
if (!globalThis.__hscExamStore) globalThis.__hscExamStore = store;

export function saveExam(id, exam) {
  store.set(id, { exam, createdAt: Date.now() });
  // Keep the in-memory development store bounded.
  if (store.size > 50) store.delete(store.keys().next().value);
}
export function getExam(id) { return store.get(id)?.exam || null; }
