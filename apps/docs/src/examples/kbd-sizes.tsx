import { Kbd } from '@onesmall/ui';

export default function Example() {
  return (
    <div className="os-grid os-gap-3">
      <p className="os-flex os-gap-2 os-items-center">
        <Kbd size="sm" combo="Mod+S" />
        <Kbd combo="Mod+S" />
        <Kbd size="lg" combo="Mod+S" />
      </p>
      <p>
        Save on macOS: <Kbd combo="Mod+S" platform="mac" />. Save on Windows and Linux:{' '}
        <Kbd combo="Mod+S" platform="other" />.
      </p>
    </div>
  );
}
