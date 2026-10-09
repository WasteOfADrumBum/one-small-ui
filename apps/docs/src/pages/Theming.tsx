import { Tab, TabList, TabPanel, Tabs, themes, type ColorToken } from 'onesmallui';
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
  { fg: 'on-accent', bg: 'accent' },
  { fg: 'on-success', bg: 'success' },
  { fg: 'on-warning', bg: 'warning' },
  { fg: 'on-danger', bg: 'danger' },
  { fg: 'on-info', bg: 'info' },
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

      <h2 id="scss">SCSS variables</h2>
      <p>
        All SCSS variables are <code>!default</code>. Configure them when you load the library, or reuse the mixins in your
        own styles.
      </p>
      <Code
        language="scss"
        title="theme.scss"
        code={`@use 'onesmallui/scss' as os with (
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
              ['$breakpoints', 'sm 480, md 768, lg 1024, xl 1280, 2xl 1536, 3xl 1920', 'Media queries and responsive utilities'],
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
    </article>
  );
}
