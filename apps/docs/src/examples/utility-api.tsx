import { CodeBlock } from 'onesmallui';

const scss = `// 1. Add, change or remove utilities in the library build
@use 'onesmallui/scss' with (
  $utilities: (
    'cursor': (
      'props': cursor,
      'values': ('help': help, 'zoom-in': zoom-in),
      'name': 'cursor',
      'responsive': true,
    ),
    'opacity': null, // drop a built-in group
  )
);

// 2. Or generate extra classes in your own stylesheet
@use 'onesmallui/scss/abstracts' as os;

@layer os.utilities {
  @include os.utilities((
    'backdrop': (
      'props': backdrop-filter,
      'values': ('blur': blur(12px), 'none': none),
      'name': 'backdrop',
    ),
    'clip-card': (
      // A map value emits several declarations
      'values': ('': (overflow: hidden, isolation: isolate)),
      'name': 'clip-card',
      'container': true, // also cq-sm: … cq-xl:
    ),
  ));
}`;

const css = `.os-cursor-help { cursor: help; }
.os-cursor-zoom-in { cursor: zoom-in; }
@media (min-width: 768px) { .md\\:os-cursor-help { cursor: help; } }
.os-backdrop-blur { backdrop-filter: blur(12px); }
.os-clip-card { overflow: hidden; isolation: isolate; }
@container (min-width: 24rem) { .cq-sm\\:os-clip-card { … } }`;

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <CodeBlock language="scss" title="styles.scss" code={scss} />
      <CodeBlock language="css" title="Output (excerpt)" code={css} />
    </div>
  );
}
