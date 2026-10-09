import { CodeBlock } from 'onesmallui';

export default function Example() {
  return (
    <CodeBlock
      title="launch.ts"
      language="ts"
      code={`export async function launch(ship: Ship) {\n  await ship.systems.check();\n  return ship.engage({ warp: 9 });\n}`}
    />
  );
}
