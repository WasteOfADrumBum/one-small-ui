import { Button, ThemeToggle, useTheme } from 'onesmallui';

// <ThemeProvider> wraps the app once (see Getting started).
export default function Example() {
  const { mode, resolvedTheme, setMode } = useTheme();
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <ThemeToggle />
      {(['light', 'dark', 'system'] as const).map((m) => (
        <Button key={m} size="sm" variant={mode === m ? 'solid' : 'outline'} aria-pressed={mode === m} onClick={() => setMode(m)}>
          {m}
        </Button>
      ))}
      <span className="os-text-muted">
        Showing <strong>{resolvedTheme}</strong>
      </span>
    </div>
  );
}
