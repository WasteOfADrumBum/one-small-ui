import { Pagination } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <Pagination count={12} defaultPage={4} variant="outline" aria-label="Outline variant" />
      <Pagination count={12} defaultPage={4} variant="soft" color="accent" aria-label="Soft variant" />
      <Pagination count={12} defaultPage={4} variant="ghost" color="success" aria-label="Ghost variant" />

      <Pagination count={8} defaultPage={2} size="sm" aria-label="Small size" />
      <Pagination count={8} defaultPage={2} size="lg" aria-label="Large size" />

      <Pagination count={6} defaultPage={3} align="center" aria-label="Centered" />
      <Pagination count={6} defaultPage={3} align="end" aria-label="End aligned" />
    </div>
  );
}
