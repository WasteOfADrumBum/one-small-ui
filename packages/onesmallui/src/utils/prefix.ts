/** Class-name prefix used by every component. Matches `$prefix` in the SCSS. */
export const PREFIX = 'os';

/** `cls('btn')` → `'os-btn'` */
export const cls = (name: string): string => `${PREFIX}-${name}`;
