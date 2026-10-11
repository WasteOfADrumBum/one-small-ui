import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface PasswordRule {
  id: string;
  label: ReactNode;
  test: RegExp | ((password: string) => boolean);
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export const defaultPasswordRules: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: /[a-z]/ },
  { id: 'upper', label: 'An uppercase letter', test: /[A-Z]/ },
  { id: 'number', label: 'A number', test: /[0-9]/ },
  { id: 'symbol', label: 'A symbol', test: /[^A-Za-z0-9]/ },
];

export const defaultStrengthLabels: Record<PasswordStrengthLevel, string> = {
  empty: 'None',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

const levels: PasswordStrengthLevel[] = ['empty', 'weak', 'fair', 'good', 'strong'];

export interface PasswordStrengthResult {
  /** 0 (empty) to 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  level: PasswordStrengthLevel;
  rules: { id: string; label: ReactNode; met: boolean }[];
  /** True when every rule passes. */
  valid: boolean;
}

export interface UsePasswordStrengthOptions {
  rules?: PasswordRule[];
  /** Replace the scoring. Default: share of rules met, plus one step for 14+ characters. */
  score?: (password: string, metRules: number, totalRules: number) => number;
}

/** Scores a password against a list of rules. Pure and synchronous; pair it with `PasswordStrength` or your own UI. */
export function scorePassword(password: string, options: UsePasswordStrengthOptions = {}): PasswordStrengthResult {
  const rules = options.rules ?? defaultPasswordRules;
  const results = rules.map((r) => ({
    id: r.id,
    label: r.label,
    met: typeof r.test === 'function' ? r.test(password) : r.test.test(password),
  }));
  const met = results.filter((r) => r.met).length;
  let score: number;
  if (!password) score = 0;
  else if (options.score) score = options.score(password, met, rules.length);
  else {
    score = Math.max(1, Math.round((met / Math.max(rules.length, 1)) * 4));
    if (password.length >= 14 && score < 4 && met >= rules.length - 1) score += 1;
    if (password.length < 8) score = Math.min(score, 1);
  }
  const s = Math.max(0, Math.min(4, Math.round(score))) as PasswordStrengthResult['score'];
  return { score: s, level: levels[s]!, rules: results, valid: met === rules.length };
}

/** React wrapper around `scorePassword`, memoized on the password and rules. */
export function usePasswordStrength(password: string, options: UsePasswordStrengthOptions = {}): PasswordStrengthResult {
  const { rules, score } = options;
  return useMemo(() => scorePassword(password, { rules, score }), [password, rules, score]);
}

export interface PasswordStrengthProps extends HTMLAttributes<HTMLDivElement> {
  /** The password to rate. */
  value: string;
  /** `segments` (default) or a continuous `bar`. */
  variant?: 'segments' | 'bar';
  rules?: PasswordRule[];
  /** Show the checklist of rules. */
  showRules?: boolean;
  /** Show "Strength: Good" text. Default true. */
  showLabel?: boolean;
  labels?: Partial<Record<PasswordStrengthLevel, string>>;
  /** Accessible name of the meter. */
  meterLabel?: string;
  /** Delay before announcing a new strength to screen readers, in ms. */
  announceDelay?: number;
  score?: UsePasswordStrengthOptions['score'];
}

const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
const Dot = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

/**
 * A live strength meter with optional rules checklist. The look is driven only by
 * `data-strength` on the root, so the same classes work without JavaScript.
 * Changes are announced politely after typing pauses.
 */
export const PasswordStrength = forwardRef<HTMLDivElement, PasswordStrengthProps>(function PasswordStrength(
  {
    value,
    variant = 'segments',
    rules,
    showRules,
    showLabel = true,
    labels,
    meterLabel = 'Password strength',
    announceDelay = 800,
    score,
    className,
    ...rest
  },
  ref,
) {
  const result = usePasswordStrength(value, { rules, score });
  const names = { ...defaultStrengthLabels, ...labels };
  const levelText = names[result.level];
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!value) {
      setAnnouncement('');
      return;
    }
    const t = setTimeout(() => setAnnouncement(`${meterLabel}: ${levelText}`), announceDelay);
    return () => clearTimeout(t);
  }, [value, levelText, meterLabel, announceDelay]);

  return (
    <div
      ref={ref}
      className={cx(cls('password-strength'), className)}
      data-strength={result.level}
      data-variant={variant}
      {...rest}
    >
      <div
        role="meter"
        className={cls('password-strength__meter')}
        aria-label={meterLabel}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={result.score}
        aria-valuetext={levelText}
      >
        {variant === 'segments' ? (
          [1, 2, 3, 4].map((i) => <span key={i} className={cls('password-strength__segment')} />)
        ) : (
          <span className={cls('password-strength__bar')} />
        )}
      </div>
      {showLabel && (
        <p className={cls('password-strength__label')} aria-hidden="true">
          {meterLabel}: <strong>{levelText}</strong>
        </p>
      )}
      <span className={cls('sr-only')} aria-live="polite">
        {announcement}
      </span>
      {showRules && (
        <ul className={cls('password-strength__rules')}>
          {result.rules.map((r) => (
            <li key={r.id} className={cls('password-strength__rule')} data-met={r.met || undefined}>
              {r.met ? <Tick /> : <Dot />}
              <span>{r.label}</span>
              <span className={cls('sr-only')}>{r.met ? ' (done)' : ' (not yet)'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
