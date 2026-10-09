import type { ComponentDoc } from '../site/docTypes';

const site = 'https://one-small-ui.vercel.app';

const doc: ComponentDoc = {
  slug: 'ai-agents',
  order: 70,
  name: 'Docs for AI agents',
  group: 'Framework',
  summary:
    'Machine-readable documentation generated from the same data as these pages, plus an agent skill shipped inside the npm package, so coding assistants use 1SmUI correctly.',
  examples: [],
  snippets: [
    {
      title: 'Machine-readable docs',
      language: 'bash',
      code: `${site}/llms.txt         # index in llmstxt.org format
${site}/llms-full.txt    # every page: props tables, example source, accessibility notes
${site}/components.json  # structured data`,
    },
    {
      title: 'Agent skill',
      language: 'bash',
      description: 'Copy the skill into your project so Claude Code (or any agent that reads skills) picks it up.',
      code: `mkdir -p .claude/skills/onesmallui
cp node_modules/onesmallui/agent/SKILL.md .claude/skills/onesmallui/SKILL.md`,
    },
  ],
  a11y: [],
};

export default doc;
