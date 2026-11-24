import { Tab, TabList, TabPanel, Tabs, themes, type ColorToken } from '@onesmall/ui';
import { Code } from '../site/Code';
import { Example } from '../site/Example';

const luminance = (hex: string) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255) as [number, number, number];
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

const pairs: { fg: ColorToken; bg: ColorToken }[] = [
  { fg: 'text', bg: 'bg' },
  { fg: 'text-muted', bg: 'surface' },
  { fg: 'on-primary', bg: 'primary' },
  { fg: 'on-secondary', bg: 'secondary' },
  { fg: 'on-accent', bg: 'accent' },
  { fg: 'on-success', bg: 'success' },
  { fg: 'on-warning', bg: 'warning' },
  { fg: 'on-danger', bg: 'danger' },
  { fg: 'on-info', bg: 'info' },
  { fg: 'on-inverse', bg: 'inverse' },
  { fg: 'secondary-text', bg: 'secondary-soft' },
  { fg: 'primary-text', bg: 'primary-soft' },
  { fg: 'accent-text', bg: 'accent-soft' },
  { fg: 'success-text', bg: 'success-soft' },
  { fg: 'warning-text', bg: 'warning-soft' },
  { fg: 'danger-text', bg: 'danger-soft' },
  { fg: 'info-text', bg: 'info-soft' },
];

function Swatches({ theme }: { theme: 'light' | 'dark' }) {
  const t = themes[theme];
  return (
    <div className="docs-swatches" data-os-theme={theme}>
      {pairs.map(({ fg, bg }) => {
        const r = ratio(t[fg], t[bg]);
        return (
          <div key={`${fg}-${bg}`} className="docs-swatch" style={{ background: t[bg], color: t[fg] }}>
            <span className="docs-swatch__ratio">{r.toFixed(1)}:1</span>
            <span className="docs-swatch__name">
              {fg}
              <br />
              on {bg}
            </span>
            <span className="docs-swatch__badge">{r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'Fail'}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Theming() {
  return (
    <article className="docs-article">
      <h1>Theming & tokens</h1>
      <p className="docs-lead">
        Colors live in one file, <code>tokens/themes.json</code>, and are generated into SCSS maps, CSS variables and a
        TypeScript module. A build check fails if any pair drops below AAA.
      </p>

      <h2 id="switching">Switching themes</h2>
      <p>
        The provider sets <code>data-os-theme="light|dark"</code> on <code>&lt;html&gt;</code>. Without it, the OS
        preference applies automatically. You can also scope a theme to any element.
      </p>
      <Example name="theme-basic" title="useTheme and ThemeToggle" />
      <Code
        language="markup"
        title="Scoped theme"
        code={`<section data-os-theme="dark">\n  Everything in here uses the dark tokens.\n</section>`}
      />

      <h2 id="contrast">Contrast, measured live</h2>
      <p>These ratios are computed in your browser from the shipped tokens.</p>
      <Tabs defaultValue="dark" variant="pill">
        <TabList aria-label="Theme">
          <Tab value="dark">Dark</Tab>
          <Tab value="light">Light</Tab>
        </TabList>
        <TabPanel value="dark">
          <Swatches theme="dark" />
        </TabPanel>
        <TabPanel value="light">
          <Swatches theme="light" />
        </TabPanel>
      </Tabs>

      <h2 id="css-variables">CSS variables</h2>
      <p>Every token is a custom property. Override them anywhere: globally, per theme, or per component.</p>
      <Code
        language="css"
        title="overrides.css"
        code={`:root {\n  --os-radius-md: 4px;\n}\n\n[data-os-theme='dark'] {\n  --os-primary: #7cf5ff;\n}\n\n.checkout .os-btn {\n  --os-radius-md: 999px;\n}`}
      />

      <h2 id="fonts">Fonts</h2>
      <p>
        Type families are tokens too. Load your font as usual (self-hosted <code>@font-face</code> or a link), then point
        the tokens at it. Keep a system fallback at the end of the stack.
      </p>
      <Code
        language="css"
        title="fonts.css"
        code={`:root {\n  --os-font-sans: 'Figtree', system-ui, sans-serif;\n  --os-font-display: 'Figtree', system-ui, sans-serif;\n}`}
      />

      <h2 id="alongside">Alongside another UI library</h2>
      <p>
        You can move an app over one screen at a time. While both libraries load, put OneSmallUI in its own cascade layer
        so the other library's reset can't strip OneSmallUI components and its components keep their own styles. Chakra
        UI v3 already uses the layers <code>reset, base, tokens, recipes</code>; slot OneSmallUI after its reset and
        before the rest:
      </p>
      <Code
        language="css"
        title="index.css"
        code={`@layer reset, onesmall, base, tokens, recipes;\n@import '@onesmall/ui/styles.css' layer(onesmall);`}
      />
      <p>
        OneSmallUI components use their own classes, so they keep their look, and the other library's later layers keep
        its components intact. OneSmallUI's element defaults (paragraph and heading spacing, underlined links) do reach
        the other library's plain elements that set no style of their own, so expect small spacing changes on screens
        not yet moved. Point the other library's color tokens at the <code>--os-*</code> variables, or match them, so
        both share one palette during the move, and drop the layer line once the old library is gone.
      </p>

      <h2 id="scss">SCSS variables</h2>
      <p>
        All SCSS variables are <code>!default</code>. Configure them when you load the library, or reuse the mixins in your
        own styles.
      </p>
      <Code
        language="scss"
        title="theme.scss"
        code={`@use '@onesmall/ui/scss' as os with (
  $prefix: 'os',
  $radius-base: 12px,
  $font-sans: ('Inter', system-ui, sans-serif),
  $theme-dark: (
    // ...copy the map from tokens/themes.json and change values
  )
);

.my-panel {
  padding: os.space('6');
  border-radius: os.radius('lg');
  background: os.token('surface');
  @include os.focus-ring;

  @include os.up(md) {
    padding: os.space('8');
  }
}`}
      />
      <div className="docs-props">
        <table>
          <caption>Main variables</caption>
          <thead>
            <tr>
              <th scope="col">Variable</th>
              <th scope="col">Default</th>
              <th scope="col">Controls</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['$prefix', "'os'", 'Class and CSS variable prefix'],
              ['$breakpoints', 'sm 576, md 768, lg 1024, xl 1280, 2xl 1536, 3xl 1920', 'Media queries and responsive utilities'],
              ['$spacers', '0 → 24 on a 0.25rem scale', 'Spacing utilities and layout gaps'],
              ['$font-sizes', 'Fluid clamp() scale xs → 5xl', 'Type scale'],
              ['$radius-base', '10px', 'Every radius is derived from it'],
              ['$durations / $easings', 'fast 120ms → slower 600ms', 'All motion'],
              ['$target-size', '44px', 'Minimum interactive size'],
              ['$theme-light / $theme-dark', 'Generated from tokens', 'Color tokens'],
            ].map(([v, d, c]) => (
              <tr key={v}>
                <th scope="row">
                  <code>{v}</code>
                </th>
                <td>{d}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="company-theme">Generate a company theme</h2>
      <p>
        Setting <code>--os-primary</code> by hand leaves its hover, soft, text and <code>on-</code> colors to you, in both
        modes. The theme generator starts from your brand colors instead: it derives every related token for light and
        dark, keeps the library&apos;s status colors, surfaces and text unless you override them, and checks the result
        with the same pair list as <code>npm run check:contrast</code>, plus primary, secondary and accent at 3:1 on
        every surface. It has no dependencies and runs from a clone of this repository.
      </p>
      <Code
        language="bash"
        title="Terminal"
        code={`npm run theme:generate -- \\
  --primary '#0c5d56' --secondary '#92310a' --accent '#9333ea' \\
  --out src/theme

# Optional: --primary-dark (and -dark for every color), --neutral,
# --success/--warning/--danger/--info, --set dark.bg=#101216, --config brand.json`}
      />
      <p>
        Colors you pass are never replaced. Derived tokens are moved in lightness until they pass. When a color you passed
        can&apos;t pass, the report prints every failing pair with its ratio and target and offers the nearest passing
        color separately, for you to accept or not. It only reports success when every pair passes.
      </p>
      <Code
        language="bash"
        title="Report"
        code={`Contrast: 92 pairs per mode (text 7:1, UI boundaries 3:1)
  light: 91 pass, 1 fail
  FAIL light: on-accent (#ffffff) on accent (#9333ea) = 5.38 < 7
  dark: 92 pass, 0 fail

Colors you gave that cannot pass as given (kept as given, not replaced):
  light accent #9333ea: on-accent on accent reaches 5.38:1, needs 7:1;
  nearest passing: #8113d5 (to use it: --accent '#8113d5')

Result: 1 pair(s) fail. This theme does not meet the contrast targets yet.`}
      />
      <p>
        It writes three files to <code>--out</code>: an editable <code>themes.json</code> with both palettes,{' '}
        <code>theme.css</code> with <code>[data-os-theme="light"]</code> and <code>[data-os-theme="dark"]</code> blocks,
        and <code>_theme.scss</code> with <code>$theme-light</code> and <code>$theme-dark</code> maps. Use the CSS or the
        Sass, not both. After editing <code>themes.json</code>, run{' '}
        <code>npm run theme:generate -- --from src/theme/themes.json --out src/theme</code> to check it again and rewrite
        the CSS and Sass. Add <code>--strict</code> in CI to exit with an error while any pair fails.
      </p>
      <Code language="tsx" title="main.tsx" code={`import '@onesmall/ui/styles.css';\nimport './theme/theme.css'; // after the library`} />
      <Code
        language="scss"
        title="app.scss"
        code={`@use 'theme/theme' as brand;
@use '@onesmall/ui/scss' with (
  $theme-light: brand.$theme-light,
  $theme-dark: brand.$theme-dark
);`}
      />
    </article>
  );
}
