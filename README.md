# OneSmallUI (1SmUI)

A futuristic, WCAG AAA accessible React + TypeScript + SCSS component library. Docs: https://one-small-ui.vercel.app

| Path | What |
| --- | --- |
| `packages/onesmallui` | The npm package: React components (TypeScript), SCSS, tokens |
| `apps/docs` | Showcase and documentation site with live examples and copyable code |
| `scripts/` | Token generator, AAA contrast check, axe accessibility audit |

## Develop

```bash
npm install
npm run dev            # docs site with hot reload against the library source
```

## Check

```bash
npm run check:contrast # every token pair must reach WCAG AAA
npm test               # component tests (Vitest + Testing Library + axe)
npm run build          # library (dist/) and docs site (apps/docs/dist)
npm run test:a11y      # axe WCAG A/AA/AAA audit of every docs page, light and dark
```

## Change colors

Edit `packages/onesmallui/tokens/themes.json`, then `npm run build`. The build regenerates the SCSS maps and
`src/tokens.ts`; `npm run check:contrast` tells you if a change breaks AAA.

## Publish to npm

```bash
cd packages/onesmallui
npm login
npm publish --access public
```

The docs site deploys to https://one-small-ui.vercel.app from `apps/docs/dist` (see `vercel.json`).
