import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'dropzone',
  order: 160,
  name: 'DropZone',
  group: 'Drag & drop',
  summary: 'Upload areas with drag and drop, validation, previews, progress, and a headless hook for custom UIs.',
  importLine: "import { DropZone, useDropZone } from 'onesmallui';",
  examples: [
    { name: 'dropzone-basic', title: 'Validated drop zone', description: 'Images, video and PDF up to 10 MB, max 6 files. Try dropping something else.' },
    { name: 'dropzone-upload', title: 'Compact with upload progress' },
    { name: 'dropzone-headless', title: 'Headless hook' },
  ],
  props: [
    {
      title: 'DropZone',
      props: [
        { name: 'accept', type: 'string', description: 'Like the input accept attribute: "image/*,.pdf".' },
        { name: 'multiple', type: 'boolean', default: 'true', description: 'Allow several files.' },
        { name: 'maxSize / minSize', type: 'number', description: 'Bytes per file.' },
        { name: 'maxFiles', type: 'number', description: 'Total file limit.' },
        { name: 'validator', type: '(file) => string | null', description: 'Custom rule; return an error message.' },
        { name: 'onFilesAdded', type: '(files: File[]) => void', description: 'Each accepted batch.' },
        { name: 'onFilesRejected', type: '(rejections) => void', description: 'Rejected files with reasons.' },
        { name: 'onFilesChange', type: '(files: File[]) => void', description: 'Full list after any change.' },
        { name: 'progress', type: 'Record<fileName, number>', description: 'Upload progress per file.' },
        { name: 'size', type: "'md' | 'compact'", default: "'md'", description: 'Layout.' },
        { name: 'showFileList', type: 'boolean', default: 'true', description: 'Built-in list with previews and remove buttons.' },
      ],
    },
    {
      title: 'useDropZone(options)',
      props: [
        { name: 'getRootProps()', type: 'function', description: 'Spread on your drop area.' },
        { name: 'getInputProps()', type: 'function', description: 'Spread on a hidden file input.' },
        { name: 'open()', type: 'function', description: 'Opens the file picker.' },
        { name: 'isDragging / isDragReject', type: 'boolean', description: 'Drag state for styling.' },
      ],
    },
  ],
  a11y: [
    'A real file input sits inside the zone: Tab to it and press Enter or Space to browse.',
    'Added, rejected and removed files are announced in a live region.',
    'Each remove button is labelled with the file name.',
  ],
  classes: '.os-dropzone > .os-dropzone__area[data-state="idle|active|reject"]',
};

export default doc;
