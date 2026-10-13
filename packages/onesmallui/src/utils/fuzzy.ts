/** Dependency-free fuzzy matching, used by CommandPalette and available for your own lists. */

export interface FuzzyMatch {
  /** Higher is better. Only meaningful relative to other scores for the same query. */
  score: number;
  /** Indices in the text of the matched characters, ascending. Use them to highlight. */
  indices: number[];
}

const WORD_START = 8;
const CONSECUTIVE = 5;
const FIRST_CHAR = 4;
const GAP = 1;

const isAlnum = (c: string) => /[\p{L}\p{N}]/u.test(c);

/** True when `text[i]` starts a word: after a separator, at a camelCase hump, or at the start. */
function wordStart(text: string, i: number): boolean {
  if (i === 0) return true;
  const prev = text[i - 1]!;
  const ch = text[i]!;
  if (!isAlnum(prev)) return isAlnum(ch);
  return prev === prev.toLowerCase() && ch !== ch.toLowerCase();
}

/**
 * Matches `query` as a case-insensitive subsequence of `text` and scores it: matches at
 * word starts and consecutive runs score higher, gaps score lower. Whitespace in the
 * query is ignored, so "op set" matches "Open settings". Returns `null` when the query's
 * characters don't all appear in order. An empty query matches with score 0.
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  const q = query.replace(/\s+/g, '').toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const n = q.length;
  const m = t.length;
  if (n > m) return null;

  // Quick reject: is q a subsequence of t at all?
  for (let i = 0, j = 0; i < n; i++, j++) {
    while (j < m && t[j] !== q[i]) j++;
    if (j === m) return null;
  }

  // best[i][j]: best score with q[i] matched at t[j]; from[i][j]: where q[i-1] was matched.
  const NONE = -Infinity;
  const best: number[][] = [];
  const from: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row = new Array<number>(m).fill(NONE);
    const back = new Array<number>(m).fill(-1);
    // Running maximum of best[i-1][k] for k < j - 1 (non-consecutive predecessors).
    let runMax = NONE;
    let runArg = -1;
    for (let j = i; j < m; j++) {
      if (i > 0 && j >= 2) {
        const v = best[i - 1]![j - 2]!;
        if (v > runMax) {
          runMax = v;
          runArg = j - 2;
        }
      }
      if (t[j] !== q[i]) continue;
      const bonus = 1 + (wordStart(text, j) ? WORD_START : 0);
      if (i === 0) {
        row[j] = bonus + (j === 0 ? FIRST_CHAR : 0) - Math.min(j, 10) * 0.1;
        continue;
      }
      const consecutive = best[i - 1]![j - 1]!;
      const viaRun = consecutive > NONE ? consecutive + bonus + CONSECUTIVE : NONE;
      const viaGap = runMax > NONE ? runMax + bonus - GAP : NONE;
      if (viaRun >= viaGap && viaRun > NONE) {
        row[j] = viaRun;
        back[j] = j - 1;
      } else if (viaGap > NONE) {
        row[j] = viaGap;
        back[j] = runArg;
      }
    }
    best.push(row);
    from.push(back);
  }

  let end = -1;
  let score = NONE;
  const last = best[n - 1]!;
  for (let j = 0; j < m; j++) {
    if (last[j]! > score) {
      score = last[j]!;
      end = j;
    }
  }
  if (end < 0) return null;
  const indices = new Array<number>(n);
  for (let i = n - 1, j = end; i >= 0; i--) {
    indices[i] = j;
    j = from[i]![j]!;
  }
  // Prefer exact and prefix matches, then shorter texts.
  if (t === q) score += 20;
  else if (t.startsWith(q)) score += 10;
  score -= m * 0.01;
  return { score, indices };
}

export interface FuzzyFilterOptions<T> {
  /** The main text of an item; its match indices are returned for highlighting. Default: `String(item)`. */
  getText?: (item: T) => string;
  /** Extra strings to match (aliases, tags). They rank a little below a match on the main text. */
  getKeywords?: (item: T) => readonly string[] | undefined;
}

export interface FuzzyResult<T> extends FuzzyMatch {
  item: T;
}

/**
 * Filters and sorts `items` by `fuzzyMatch` against their text and keywords, best first.
 * Ties keep the original order. An empty query returns every item, unsorted, with score 0.
 */
export function fuzzyFilter<T>(items: readonly T[], query: string, options: FuzzyFilterOptions<T> = {}): FuzzyResult<T>[] {
  const { getText = (item: T) => String(item), getKeywords } = options;
  const out: (FuzzyResult<T> & { order: number })[] = [];
  items.forEach((item, order) => {
    const main = fuzzyMatch(query, getText(item));
    let score = main?.score ?? -Infinity;
    for (const kw of getKeywords?.(item) ?? []) {
      const r = fuzzyMatch(query, kw);
      if (r && r.score * 0.8 > score) score = r.score * 0.8;
    }
    if (score === -Infinity) return;
    out.push({ item, score, indices: main?.indices ?? [], order });
  });
  if (query.trim()) out.sort((a, b) => b.score - a.score || a.order - b.order);
  return out.map(({ item, score, indices }) => ({ item, score, indices }));
}
