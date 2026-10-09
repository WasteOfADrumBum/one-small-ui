import { AspectRatio, Image, Video } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <Image
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=70"
        sources={[
          { srcSet: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=70&fm=avif', type: 'image/avif' },
          { srcSet: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=70&fm=webp', type: 'image/webp' },
        ]}
        alt="A colorful spiral galaxy"
        ratio={4 / 3}
        caption="AVIF → WebP → JPEG fallback, lazy-loaded with a blur-up fade."
      />
      <div className="os-grid os-gap-4">
        <Video
          label="Sample video: flower blooming"
          sources={[
            { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm', type: 'video/webm' },
            { src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', type: 'video/mp4' },
          ]}
          poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=60"
        />
        <AspectRatio ratio={1 / 1} className="os-max-w-sm" style={{ width: '9rem' }}>
          <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=70" alt="The planet Saturn" />
        </AspectRatio>
      </div>
    </div>
  );
}
