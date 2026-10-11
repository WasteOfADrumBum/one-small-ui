import { CloseButton } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-6">
      <CloseButton size="sm" label="Close (small)" />
      <CloseButton label="Close (medium)" />
      <CloseButton size="lg" label="Close (large)" />
      <CloseButton disabled label="Close (disabled)" />

      {/* On photos and dark imagery: the overlay variant brings its own backdrop. */}
      <div
        className="os-relative os-rounded-lg os-overflow-hidden"
        style={{ inlineSize: '16rem', blockSize: '9rem' }}
      >
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=70"
          alt="A colorful nebula"
          className="os-w-full os-h-full os-object-cover"
        />
        <CloseButton
          variant="overlay"
          label="Remove photo"
          className="os-absolute"
          style={{ insetBlockStart: '0.5rem', insetInlineEnd: '0.5rem' }}
        />
      </div>
    </div>
  );
}
