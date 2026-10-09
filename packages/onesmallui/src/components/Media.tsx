import { forwardRef, useState, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode, type VideoHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width / height, e.g. `16 / 9`, `1`, `4 / 3`. */
  ratio?: number;
}

/** Keeps its child (image, video, iframe, map) at a fixed aspect ratio. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(cls('aspect'), className)} style={{ aspectRatio: String(ratio), ...style }} {...rest} />;
});

export interface ImageSource {
  srcSet: string;
  /** MIME type, e.g. `image/avif`, `image/webp`. */
  type?: string;
  media?: string;
}

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  /** Required. Use `alt=""` for purely decorative images. */
  alt: string;
  /** Modern formats offered before the fallback `src` (renders a `<picture>`). */
  sources?: ImageSource[];
  ratio?: number;
  fit?: 'cover' | 'contain';
  rounded?: boolean;
  /** Shown if the image fails to load. */
  fallback?: ReactNode;
  caption?: ReactNode;
}

/** A responsive, lazy-loading image that fades in when ready and supports AVIF/WebP sources. */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { alt, sources, ratio, fit = 'cover', rounded = true, fallback, caption, className, onLoad, onError, loading = 'lazy', ...rest },
  ref,
) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const img = (
    <img
      ref={ref}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cls('image__img')}
      onLoad={(e) => {
        setState('loaded');
        onLoad?.(e);
      }}
      onError={(e) => {
        setState('error');
        onError?.(e);
      }}
      {...rest}
    />
  );
  const body = (
    <div
      className={cx(cls('image'), !caption && className)}
      data-state={state}
      data-fit={fit}
      data-rounded={rounded || undefined}
      style={ratio ? { aspectRatio: String(ratio) } : undefined}
    >
      {state === 'error' && fallback ? (
        <div className={cls('image__fallback')}>{fallback}</div>
      ) : sources?.length ? (
        <picture>
          {sources.map((s) => (
            <source key={s.srcSet} srcSet={s.srcSet} type={s.type} media={s.media} />
          ))}
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
  if (!caption) return body;
  return (
    <figure className={cx(cls('figure'), className)}>
      {body}
      <figcaption className={cls('figure__caption')}>{caption}</figcaption>
    </figure>
  );
});

export interface VideoSource {
  src: string;
  /** MIME type, e.g. `video/webm`, `video/mp4`. */
  type?: string;
}

export interface VideoTrack {
  src: string;
  kind?: 'captions' | 'subtitles' | 'descriptions' | 'chapters';
  srcLang: string;
  label: string;
  default?: boolean;
}

export interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  sources?: VideoSource[];
  /** Captions and audio descriptions (WCAG 1.2.x). */
  tracks?: VideoTrack[];
  ratio?: number;
  /** Accessible name for the video. */
  label?: string;
}

/** A responsive video with multiple source formats and caption tracks. */
export const Video = forwardRef<HTMLVideoElement, VideoProps>(function Video(
  { sources, tracks, ratio = 16 / 9, label, className, controls = true, preload = 'metadata', children, ...rest },
  ref,
) {
  return (
    <div className={cx(cls('video'), className)} style={{ aspectRatio: String(ratio) }}>
      <video ref={ref} controls={controls} preload={preload} aria-label={label} playsInline {...rest}>
        {sources?.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
        {tracks?.map((t) => (
          <track key={t.src} src={t.src} kind={t.kind ?? 'captions'} srcLang={t.srcLang} label={t.label} default={t.default} />
        ))}
        {children}
      </video>
    </div>
  );
});
