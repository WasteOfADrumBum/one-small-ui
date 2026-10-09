import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { formatBytes } from '../utils/format';

export interface FileRejection {
  file: File;
  reasons: string[];
}

export interface DropZoneOptions {
  /** Same syntax as the input `accept` attribute: `"image/*,.pdf,video/mp4"`. */
  accept?: string;
  multiple?: boolean;
  /** Max bytes per file. */
  maxSize?: number;
  minSize?: number;
  /** Max files accepted in a single drop or pick. */
  maxFiles?: number;
  disabled?: boolean;
  /** Custom check. Return an error message to reject the file. */
  validator?: (file: File) => string | null | undefined;
  onDrop?: (accepted: File[], rejected: FileRejection[]) => void;
}

/** Returns true when `file` matches an `accept` string. */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

/**
 * Headless drag-and-drop file selection. Spread `getRootProps()` on the drop
 * area and `getInputProps()` on a file `<input>`; build any UI you like.
 */
export function useDropZone(options: DropZoneOptions = {}) {
  const { accept, multiple = true, maxSize, minSize, maxFiles, disabled, validator, onDrop } = options;
  const [isDragging, setIsDragging] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const depth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (files: File[]) => {
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];
      files.forEach((file, i) => {
        const reasons: string[] = [];
        if (!fileMatchesAccept(file, accept)) reasons.push('File type not allowed');
        if (maxSize !== undefined && file.size > maxSize) reasons.push(`Larger than ${formatBytes(maxSize)}`);
        if (minSize !== undefined && file.size < minSize) reasons.push(`Smaller than ${formatBytes(minSize)}`);
        if (!multiple && i > 0) reasons.push('Only one file allowed');
        else if (maxFiles !== undefined && i >= maxFiles) reasons.push(`More than ${maxFiles} files`);
        const custom = validator?.(file);
        if (custom) reasons.push(custom);
        if (reasons.length) rejected.push({ file, reasons });
        else accepted.push(file);
      });
      return { accepted, rejected };
    },
    [accept, maxSize, minSize, multiple, maxFiles, validator],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (disabled || !files.length) return;
      const { accepted, rejected } = validate(files);
      onDrop?.(accepted, rejected);
    },
    [disabled, validate, onDrop],
  );

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

  const getRootProps = () => ({
    onDragEnter: (e: DragEvent<HTMLElement>) => {
      if (disabled || !hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsDragging(true);
      // During a drag only MIME types are visible, so judge by MIME rules alone and
      // stay optimistic when extension rules (".pdf") could still match.
      const items = Array.from(e.dataTransfer.items ?? []).filter((it) => it.kind === 'file');
      const rules = (accept ?? '').split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
      const hasExtRules = rules.some((r) => r.startsWith('.'));
      const mimeMismatch =
        rules.length > 0 &&
        !hasExtRules &&
        items.some((it) => !!it.type && !rules.some((r) => (r.endsWith('/*') ? it.type.startsWith(r.slice(0, -1)) : it.type === r)));
      setIsDragReject((!multiple && items.length > 1) || mimeMismatch);
    },
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (disabled || !hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (disabled) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) {
        setIsDragging(false);
        setIsDragReject(false);
      }
      e.preventDefault();
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      setIsDragReject(false);
      handleFiles(Array.from(e.dataTransfer.files ?? []));
    },
    'data-dragging': isDragging || undefined,
    'data-reject': isDragReject || undefined,
    'data-disabled': disabled || undefined,
  });

  const getInputProps = () => ({
    ref: inputRef,
    type: 'file' as const,
    accept,
    multiple,
    disabled,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(Array.from(e.target.files ?? []));
      // Allow picking the same file again.
      e.target.value = '';
    },
  });

  /** Opens the system file picker. */
  const open = useCallback(() => inputRef.current?.click(), []);

  return { getRootProps, getInputProps, open, isDragging, isDragReject, inputRef };
}
