export type ClassValue = string | number | false | null | undefined | ClassValue[] | Record<string, unknown>;

/** Joins class names, skipping falsy values. Accepts strings, arrays and `{ class: condition }` objects. */
export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === 'string' || typeof v === 'number') out.push(String(v));
    else if (Array.isArray(v)) {
      const inner = cx(...v);
      if (inner) out.push(inner);
    } else {
      for (const [k, on] of Object.entries(v)) if (on) out.push(k);
    }
  }
  return out.join(' ');
}
