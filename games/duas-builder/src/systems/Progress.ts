const LEARNED_KEY = 'duas-builder:learned';

function loadLearned(): Set<number> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

class ProgressStore {
  private learned: Set<number> = loadLearned();

  markLearned(ids: number[]): void {
    for (const id of ids) this.learned.add(id);
    localStorage.setItem(LEARNED_KEY, JSON.stringify([...this.learned]));
  }

  count(): number {
    return this.learned.size;
  }

  has(id: number): boolean {
    return this.learned.has(id);
  }
}

export const progress = new ProgressStore();
