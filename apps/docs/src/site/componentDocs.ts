import { groupOrder, type ComponentDoc } from './docTypes';

export type { ComponentDoc } from './docTypes';

// One file per page in src/docs/, so new pages never touch a shared list.
const modules = import.meta.glob<{ default: ComponentDoc }>('../docs/*.ts', { eager: true });

export const componentDocs: ComponentDoc[] = Object.values(modules)
  .map((m) => m.default)
  .sort(
    (a, b) =>
      groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) ||
      (a.order ?? 100) - (b.order ?? 100) ||
      a.name.localeCompare(b.name),
  );

export const groups = groupOrder.filter((g) => componentDocs.some((d) => d.group === g));
