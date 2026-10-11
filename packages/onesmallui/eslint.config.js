import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.strict,
  reactHooks.configs.flat.recommended,
  {
    // Strict, plus the options jsx-a11y's own recommended config sets for these rules, so
    // documented WAI-ARIA patterns stay allowed:
    rules: {
      // Focusable tab panels (APG Tabs) and named scroll regions (WCAG 2.1.1; axe scrollable-region-focusable).
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
      ],
      // <table role="grid"> with gridcells (APG Date Picker Dialog); <fieldset role="radiogroup">.
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        { table: ['grid'], td: ['gridcell'], fieldset: ['radiogroup'] },
      ],
      // Still flags the DOM autoFocus attribute; a component prop named autoFocus is not that attribute.
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.vitest } },
  },
  {
    files: ['*.{js,mjs,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
);
