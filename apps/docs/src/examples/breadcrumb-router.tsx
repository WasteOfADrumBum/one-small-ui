import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Breadcrumb, BreadcrumbItem } from '@onesmall/ui';

// Stand-in for your router's link (Next.js `Link`, or React Router's `Link` mapped from `href` to `to`).
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
    <Breadcrumb aria-label="Router example">
      <BreadcrumbItem as={RouterLink} href="#home">
        Docs
      </BreadcrumbItem>
      <BreadcrumbItem href="#components/sidebar" render={(props) => <RouterLink {...props} />}>
        Navigation
      </BreadcrumbItem>
      <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  );
}
