import { useState } from 'react';
import { Button, Toast, ToastStack } from 'onesmallui';

// <Toast> works on its own; ToastStack stacks them (inline here, or fixed at a screen edge).
export default function Example() {
  const [shown, setShown] = useState(['solid', 'dark', 'translucent', 'colors']);
  const hide = (key: string) => setShown((s) => s.filter((k) => k !== key));
  return (
    <div className="os-grid os-gap-4">
      <ToastStack placement="inline" label="Example notifications">
        {shown.includes('solid') && (
          <Toast color="primary" variant="solid" title="Solid primary" time="2 min ago" onDismiss={() => hide('solid')}>
            Themed with a color fill.
          </Toast>
        )}
        {shown.includes('dark') && (
          <Toast appearance="dark" title="Dark" description="Re-scoped to the dark theme." onDismiss={() => hide('dark')} />
        )}
        {shown.includes('translucent') && (
          <Toast
            appearance="translucent"
            color="accent"
            title="Translucent"
            description="Frosted glass over the page."
            onDismiss={() => hide('translucent')}
          />
        )}
        {shown.includes('colors') && (
          <Toast color="warning" variant="solid" title="Low fuel" description="Refuel at the next station." onDismiss={() => hide('colors')} />
        )}
      </ToastStack>
      {shown.length < 4 && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShown(['solid', 'dark', 'translucent', 'colors'])}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
