import { useState } from 'react';
import { Pagination } from 'onesmallui';

export default function Example() {
  const [page, setPage] = useState(6);
  return (
    <div className="os-grid os-gap-4">
      <Pagination count={20} page={page} onPageChange={setPage} aria-label="Mission logs pages" />
      <p className="os-text-sm os-text-muted" aria-live="polite">
        Showing page {page} of 20
      </p>
      {/* First / last controls and more siblings around the current page. */}
      <Pagination count={50} defaultPage={25} siblingCount={2} showFirstLast aria-label="Star catalogue pages" />
      {/* Few pages: no ellipsis needed. */}
      <Pagination count={5} defaultPage={1} aria-label="Crew pages" />
    </div>
  );
}
