import { DropZone } from 'onesmallui';

export default function Example() {
  return (
    <DropZone
      accept="image/*,video/*,.pdf"
      maxSize={10 * 1024 * 1024}
      maxFiles={6}
      onFilesChange={(files) => console.log('Selected files', files)}
    />
  );
}
