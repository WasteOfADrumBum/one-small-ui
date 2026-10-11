import { Breadcrumb, BreadcrumbItem } from 'onesmallui';

const Home = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" />
  </svg>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-2">
      <Breadcrumb>
        <BreadcrumbItem href="#home" icon={<Home />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#components/card">Fleet</BreadcrumbItem>
        <BreadcrumbItem href="#components/list-group">Shuttles</BreadcrumbItem>
        <BreadcrumbItem current>Shuttle Hopper</BreadcrumbItem>
      </Breadcrumb>

      {/* Use a distinct label when a page has more than one breadcrumb. */}
      <Breadcrumb aria-label="Docs location">
        <BreadcrumbItem href="#home">Docs</BreadcrumbItem>
        <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}
