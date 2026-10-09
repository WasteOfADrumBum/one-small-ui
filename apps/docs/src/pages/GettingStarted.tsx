import { Alert } from 'onesmallui';
import { Code } from '../site/Code';

export function GettingStarted() {
  return (
    <article className="docs-article">
      <h1>Getting started</h1>
      <p className="docs-lead">Install the package, import the styles once, and wrap your app in the providers.</p>

      <h2 id="install">1. Install</h2>
      <Code language="bash" title="Terminal" code={`npm install onesmallui\n# or\npnpm add onesmallui\n# or\nyarn add onesmallui`} />
      <p>React 18 or newer is a peer dependency. There are no other runtime dependencies.</p>

      <h2 id="styles">2. Import the styles</h2>
      <p>Pick one. The compiled CSS is easiest; the SCSS entry lets you change any variable.</p>
      <Code language="tsx" title="main.tsx" code={`import 'onesmallui/styles.css';`} />
      <Code
        language="scss"
        title="styles.scss"
        code={`// Override variables at compile time\n@use 'onesmallui/scss' with (\n  $radius-base: 6px,\n  $prefix: 'os'\n);`}
      />

      <h2 id="providers">3. Add the providers</h2>
      <Code
        language="tsx"
        title="App.tsx"
        code={`import { ThemeProvider, ToastProvider, Button, useToast } from 'onesmallui';

export function App() {
  return (
    <ThemeProvider defaultMode="system">
      <ToastProvider>
        <Main />
      </ToastProvider>
    </ThemeProvider>
  );
}

function Main() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: 'Hello, space!' })}>Launch</Button>;
}`}
      />

      <h2 id="flash">4. Avoid the theme flash (optional)</h2>
      <p>Add this script to your HTML head so the saved theme applies before the first paint.</p>
      <Code
        language="tsx"
        title="Next.js app/layout.tsx"
        code={`import { themeInitScript } from 'onesmallui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
      />

      <h2 id="fonts">5. Fonts (optional)</h2>
      <p>
        The default stack prefers Space Grotesk, Orbitron for display text, and JetBrains Mono for code, then falls back to
        system fonts. Load them from Google Fonts or self-host them to get the full look.
      </p>
      <Code
        language="markup"
        title="index.html"
        code={`<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@600;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" />`}
      />

      <Alert color="primary" title="Server components" className="os-mt-8">
        Every module is marked <code>'use client'</code>, so you can import components straight into Next.js App Router
        pages.
      </Alert>
    </article>
  );
}
