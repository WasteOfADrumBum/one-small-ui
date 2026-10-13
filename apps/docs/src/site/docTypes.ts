import type { PropDoc } from './PropsTable';

export const groupOrder = [
  'Actions',
  'Forms',
  'Feedback',
  'Overlays',
  'Navigation',
  'Data display',
  'Content',
  'Layout & media',
  'Utilities',
  'Accessibility',
  'Drag & drop',
  'Theming',
  'Framework',
] as const;
export type DocGroup = (typeof groupOrder)[number];

export interface ComponentDoc {
  /** URL: #components/<slug>. Must match the file name in src/docs/. */
  slug: string;
  /** Sort order inside its group (lower first). */
  order?: number;
  name: string;
  group: DocGroup;
  summary: string;
  importLine?: string;
  /** A prominent notice under the summary, for guidance readers must not miss. */
  callout?: { title: string; body: string; color?: 'info' | 'warning' | 'danger' };
  examples: { name: string; title: string; description?: string }[];
  props?: { title: string; props: PropDoc[] }[];
  /** Reference tables, e.g. utility class lists: rows of cells, first column rendered as code. */
  reference?: { title: string; columns: string[]; rows: string[][] }[];
  /** Code snippets shown after the examples (install commands, SCSS, HTML). */
  snippets?: { title: string; language: string; code: string; description?: string }[];
  a11y: string[];
  /** Keyboard interaction table. `keys` like "Shift + Tab" or "Enter / Space"; "None" for no keys. */
  keyboard?: { keys: string; action: string }[];
  /** What screen reader users hear, and how it is wired. */
  screenReader?: string[];
  dos?: string[];
  donts?: string[];
  classes?: string;
}

export const color =
  "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'inverse' | 'neutral'";
export const status = "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'inverse'";
