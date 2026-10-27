// In-memory exam session store for development & runtime
interface StoredExam {
  exam: any;
  createdAt: number;
}

const globalStore = (globalThis as any).__hscExamStore || new Map<string, StoredExam>();
if (!(globalThis as any).__hscExamStore) {
  (globalThis as any).__hscExamStore = globalStore;
}

export function saveExam(id: string, exam: any): void {
  globalStore.set(id, { exam, createdAt: Date.now() });
  // Keep the in-memory store bounded
  if (globalStore.size > 100) {
    const oldestKey = globalStore.keys().next().value;
    if (oldestKey) {
      globalStore.delete(oldestKey);
    }
  }
}

export function getExam(id: string): any | null {
  const item = globalStore.get(id);
  return item ? item.exam : null;
}
