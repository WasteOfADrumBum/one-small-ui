import { Badge, useBreakpoint, useCopyToClipboard, usePrefersReducedMotion, Button } from 'onesmallui';

export default function Example() {
  const isDesktop = useBreakpoint('lg');
  const reducedMotion = usePrefersReducedMotion();
  const { copy, copied } = useCopyToClipboard();
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Badge color={isDesktop ? 'success' : 'info'}>{isDesktop ? 'Desktop (lg+)' : 'Below lg'}</Badge>
      <Badge color={reducedMotion ? 'warning' : 'neutral'}>Reduced motion: {reducedMotion ? 'on' : 'off'}</Badge>
      <Button size="sm" variant="soft" onClick={() => copy('npm install onesmallui')}>
        {copied ? 'Copied!' : 'Copy install command'}
      </Button>
    </div>
  );
}
