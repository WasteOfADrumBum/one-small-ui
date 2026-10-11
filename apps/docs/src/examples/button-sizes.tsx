import { useState } from 'react';
import { Button } from 'onesmallui';

const Rocket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m-1-3 4 4m-4-4c1-5 5-10 12-11-1 7-6 11-11 12m6-8h.01" />
  </svg>
);

export default function Example() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg" leftIcon={<Rocket />}>
        Large with icon
      </Button>
      <Button rightIcon={<Rocket />} variant="soft">
        Icon right
      </Button>
      <Button iconOnly aria-label="Launch" color="accent">
        <Rocket />
      </Button>
      <Button
        loading={loading}
        loadingText="Saving changes"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        {loading ? 'Saving…' : 'Click to load'}
      </Button>
      <Button href="#getting-started" variant="outline">
        I am a link
      </Button>
      <Button fullWidth variant="soft" color="secondary">
        Full width
      </Button>
    </div>
  );
}
