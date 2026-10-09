import type { ComponentType } from 'react';

// Each example file is both rendered live and shown as copyable source,
// so the code on the page is always exactly what runs.
const modules = import.meta.glob<{ default: ComponentType }>('../examples/*.tsx', { eager: true });
const sources = import.meta.glob<string>('../examples/*.tsx', { eager: true, query: '?raw', import: 'default' });

export interface ExampleEntry {
  Component: ComponentType;
  code: string;
}

const byName: Record<string, ExampleEntry> = {};
for (const [path, mod] of Object.entries(modules)) {
  const name = path.split('/').pop()!.replace(/\.tsx$/, '');
  byName[name] = { Component: mod.default, code: sources[path]! };
}

export function getExample(name: string): ExampleEntry {
  const entry = byName[name];
  if (!entry) throw new Error(`Unknown example "${name}"`);
  return entry;
}
