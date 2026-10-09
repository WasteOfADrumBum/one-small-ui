import { useState } from 'react';
import { DropZone } from 'onesmallui';

// Pass a progress map keyed by file name to show upload progress per file.
export default function Example() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  const fakeUpload = (file: File) => {
    let pct = 0;
    const t = setInterval(() => {
      pct = Math.min(100, pct + Math.random() * 25);
      setProgress((p) => ({ ...p, [file.name]: pct }));
      if (pct >= 100) clearInterval(t);
    }, 300);
  };

  return (
    <DropZone
      size="compact"
      label="Drop images to upload"
      accept="image/*"
      progress={progress}
      onFilesAdded={(files) => files.forEach(fakeUpload)}
    />
  );
}
