import { useState } from 'react';
import { Button, Lightbox, type LightboxImage } from '@onesmall/ui';

const images: LightboxImage[] = [
  { src: 'gallery/sunset-1280.jpg', alt: 'The sun setting over the sea', width: 1280, height: 853 },
  { src: 'gallery/peaks-1280.jpg', alt: 'Snow-covered peaks against a blue sky', width: 853, height: 1280 },
  // This file doesn't exist, to show the broken-image state.
  { src: 'gallery/missing.jpg', alt: 'A photo that failed to upload' },
];

export default function Example() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Button onClick={() => setOpen(true)}>View photos</Button>
      <Button variant="outline" onClick={() => { setIndex(2); setOpen(true); }}>
        View the broken one
      </Button>
      <span className="os-text-muted">Last viewed: {index + 1} of {images.length}</span>
      <Lightbox images={images} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} loop />
    </div>
  );
}
