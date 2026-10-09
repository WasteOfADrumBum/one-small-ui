import { useState } from 'react';
import { Button, useDropZone } from 'onesmallui';

// Build your own drop target with the headless hook.
export default function Example() {
  const [names, setNames] = useState<string[]>([]);
  const { getRootProps, getInputProps, open, isDragging } = useDropZone({
    accept: '.json,.csv',
    onDrop: (accepted) => setNames(accepted.map((f) => f.name)),
  });

  return (
    <div
      {...getRootProps()}
      className="os-p-6 os-rounded-lg os-bg-surface-2 os-text-center os-transition-all"
      style={{ outline: isDragging ? '2px solid var(--os-primary)' : '1px dashed var(--os-border-strong)' }}
    >
      <input {...getInputProps()} className="os-sr-only" aria-label="Choose JSON or CSV data files" tabIndex={-1} />
      <p className="os-mb-3 os-mx-auto">{isDragging ? 'Drop it!' : 'Drop .json or .csv data files'}</p>
      <Button variant="soft" onClick={open}>
        Choose data files
      </Button>
      {names.length > 0 && <p className="os-mt-3 os-mb-0 os-mx-auto os-text-muted">Got: {names.join(', ')}</p>}
    </div>
  );
}
