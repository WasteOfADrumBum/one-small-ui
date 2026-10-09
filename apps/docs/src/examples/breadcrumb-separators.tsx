import { Breadcrumb, BreadcrumbItem, type BreadcrumbSeparator } from 'onesmallui';

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="m12 4 2 5.5 5.5.5-4.2 3.6 1.3 5.4L12 16l-4.6 3 1.3-5.4L4.5 10l5.5-.5Z" />
  </svg>
);

const trail = (label: string, separator: BreadcrumbSeparator) => (
  <Breadcrumb separator={separator} aria-label={`Breadcrumb, ${label} divider`}>
    <BreadcrumbItem href="#home">Station</BreadcrumbItem>
    <BreadcrumbItem href="#components/card">Hangar</BreadcrumbItem>
    <BreadcrumbItem current>Bay 4</BreadcrumbItem>
  </Breadcrumb>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-1">
      {trail('chevron', 'chevron')}
      {trail('slash', 'slash')}
      {trail('dot', 'dot')}
      {trail('arrow', 'arrow')}
      {trail('text', '»')}
      {trail('custom SVG', <Star />)}
    </div>
  );
}
