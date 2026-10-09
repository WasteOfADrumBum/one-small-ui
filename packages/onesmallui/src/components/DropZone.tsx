import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useDropZone, type DropZoneOptions, type FileRejection } from '../hooks/useDropZone';
import { cx } from '../utils/cx';
import { formatBytes } from '../utils/format';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';

export interface DropZoneFile {
  id: string;
  file: File;
  /** Object URL for image/video previews. Revoked automatically on removal. */
  previewUrl?: string;
  /** 0–100 while uploading. Set via the `progress` prop. */
  progress?: number;
}

export interface DropZoneProps extends Omit<DropZoneOptions, 'onDrop'> {
  /** Main prompt text. */
  label?: ReactNode;
  /** Secondary text, e.g. allowed types and size. Auto-generated when omitted. */
  description?: ReactNode;
  /** Icon shown above the prompt. */
  icon?: ReactNode;
  /** Called with every accepted batch. */
  onFilesAdded?: (files: File[]) => void;
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Called with the full list whenever it changes. */
  onFilesChange?: (files: File[]) => void;
  /** Show the built-in list with previews and remove buttons. */
  showFileList?: boolean;
  /** Upload progress per file name (0–100), if you upload as files arrive. */
  progress?: Record<string, number>;
  /** Layout: a large target or a compact single row. */
  size?: 'md' | 'compact';
  name?: string;
  className?: string;
}

let fileCounter = 0;

/**
 * A drop area for uploads. Works with drag and drop, click, and keyboard
 * (Tab to it, then Enter or Space opens the file picker). Results are
 * announced to screen readers.
 */
export function DropZone({
  label = 'Drag and drop files here',
  description,
  icon,
  onFilesAdded,
  onFilesRejected,
  onFilesChange,
  showFileList = true,
  progress,
  size = 'md',
  name,
  className,
  ...options
}: DropZoneProps) {
  const id = `os-dz-${useId().replace(/:/g, '')}`;
  const [files, setFiles] = useState<DropZoneFile[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const filesRef = useRef(files);
  filesRef.current = files;

  const update = (next: DropZoneFile[]) => {
    setFiles(next);
    onFilesChange?.(next.map((f) => f.file));
  };

  const { getRootProps, getInputProps, isDragging, isDragReject } = useDropZone({
    ...options,
    onDrop: (accepted, rejected) => {
      const slots = options.maxFiles !== undefined ? Math.max(0, options.maxFiles - filesRef.current.length) : Infinity;
      const fits = accepted.slice(0, slots);
      const overflow = accepted.slice(slots).map((file) => ({ file, reasons: [`Limit of ${options.maxFiles} files reached`] }));
      const allRejected = [...rejected, ...overflow];
      const added: DropZoneFile[] = fits.map((file) => ({
        id: `f${++fileCounter}`,
        file,
        previewUrl: /^(image|video)\//.test(file.type) ? URL.createObjectURL(file) : undefined,
      }));
      const base = options.multiple === false ? [] : filesRef.current;
      if (options.multiple === false) filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      if (added.length) update([...base, ...added]);
      setRejections(allRejected);
      if (added.length) onFilesAdded?.(fits);
      if (allRejected.length) onFilesRejected?.(allRejected);
      const parts = [];
      if (added.length) parts.push(`${added.length} file${added.length > 1 ? 's' : ''} added`);
      if (allRejected.length) parts.push(`${allRejected.length} rejected`);
      setAnnouncement(parts.join(', ') + '.');
    },
  });

  useEffect(
    () => () => {
      filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    },
    [],
  );

  const remove = (f: DropZoneFile) => {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    update(files.filter((x) => x.id !== f.id));
    setAnnouncement(`${f.file.name} removed.`);
  };

  const autoDescription = [
    options.accept && `Accepted: ${options.accept.split(',').map((s) => s.trim()).join(', ')}`,
    options.maxSize && `up to ${formatBytes(options.maxSize)} each`,
    options.maxFiles && `max ${options.maxFiles} files`,
  ]
    .filter(Boolean)
    .join(' · ');
  const desc = description ?? (autoDescription || undefined);

  return (
    <div className={cx(cls('dropzone'), className)} data-size={size}>
      <div
        className={cls('dropzone__area')}
        {...getRootProps()}
        data-state={isDragReject ? 'reject' : isDragging ? 'active' : 'idle'}
      >
        <input
          {...getInputProps()}
          id={id}
          name={name}
          className={cls('dropzone__input')}
          aria-describedby={desc ? `${id}-desc` : undefined}
        />
        <label htmlFor={id} className={cls('dropzone__label')}>
          <span className={cls('dropzone__icon')} aria-hidden="true">
            {icon ?? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </span>
          <span className={cls('dropzone__prompt')}>
            {isDragReject ? 'Some of these files are not allowed' : isDragging ? 'Release to upload' : label}
          </span>
          <span className={cls('dropzone__browse')}>or browse your device</span>
          {desc && (
            <span id={`${id}-desc`} className={cls('dropzone__description')}>
              {desc}
            </span>
          )}
        </label>
        <span className={cls('dropzone__scan')} aria-hidden="true" />
      </div>

      <div className={cls('sr-only')} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {rejections.length > 0 && (
        <ul className={cls('dropzone__errors')} aria-label="Rejected files">
          {rejections.map((r, i) => (
            <li key={`${r.file.name}-${i}`}>
              <strong>{r.file.name}</strong>: {r.reasons.join('; ')}
            </li>
          ))}
        </ul>
      )}

      {showFileList && files.length > 0 && (
        <ul className={cls('dropzone__files')} aria-label="Selected files">
          {files.map((f) => {
            const pct = progress?.[f.file.name];
            return (
              <li key={f.id} className={cls('dropzone__file')}>
                <span className={cls('dropzone__thumb')} aria-hidden="true">
                  {f.previewUrl && f.file.type.startsWith('image/') ? (
                    <img src={f.previewUrl} alt="" />
                  ) : f.previewUrl && f.file.type.startsWith('video/') ? (
                    <video src={f.previewUrl} muted />
                  ) : (
                    <span className={cls('dropzone__ext')}>{f.file.name.split('.').pop()?.slice(0, 4) || 'file'}</span>
                  )}
                </span>
                <span className={cls('dropzone__meta')}>
                  <span className={cls('dropzone__name')}>{f.file.name}</span>
                  <span className={cls('dropzone__size')}>{formatBytes(f.file.size)}</span>
                  {pct !== undefined && (
                    <span
                      className={cls('dropzone__progress')}
                      role="progressbar"
                      aria-label={`Uploading ${f.file.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pct)}
                    >
                      <span style={{ width: `${pct}%` }} />
                    </span>
                  )}
                </span>
                <CloseButton label={`Remove ${f.file.name}`} onClick={() => remove(f)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
