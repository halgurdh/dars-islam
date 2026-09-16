// Two alphabets share this game, and their ids both start at 1 — so unlike
// every other game in this family, progress needs to be namespaced per
// alphabet (a factory, not a single module-level singleton) to keep
// "Arabic letter 3" and "English letter 3" from marking each other learned.
class ProgressStore {
  private key: string;
  private learned: Set<number>;

  constructor(namespace: string) {
    this.key = `letter-trace:learned:${namespace}`;
    this.learned = this.load();
  }

  private load(): Set<number> {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as number[];
      return new Set(arr);
    } catch {
      return new Set();
    }
  }

  markLearned(ids: number[]): void {
    for (const id of ids) this.learned.add(id);
    localStorage.setItem(this.key, JSON.stringify([...this.learned]));
  }

  count(): number {
    return this.learned.size;
  }

  has(id: number): boolean {
    return this.learned.has(id);
  }
}

export const arabicProgress = new ProgressStore('arabic');
export const englishProgress = new ProgressStore('english');
export const numbersProgress = new ProgressStore('numbers');
