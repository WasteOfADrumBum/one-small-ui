import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Button } from '@onesmall/ui';

// Stand-in for your router's link. React Router's `Link` takes `to`, so map it once:
//   const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
//     ({ href = '', ...props }, ref) => <Link ref={ref} to={href} {...props} />,
//   );
// Next.js `Link` takes `href` and can be passed to `as` directly.
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink(
  { children, ...props },
  ref,
) {
  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
});

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-2">
      {/* `as`: the component gets href, className, aria-current and every other prop. */}
      <Button as={RouterLink} href="#components/button">
        Button docs
      </Button>
      {/* `render`: full control; spread every prop onto your element. */}
      <Button href="#components/breadcrumb" variant="outline" render={(props) => <RouterLink {...props} />}>
        Breadcrumb docs
      </Button>
    </div>
  );
}
