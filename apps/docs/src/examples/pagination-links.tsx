import { Pagination } from 'onesmallui';

export default function Example() {
  // Link mode: every page is a real <a href>, so it works with any router or a full page load.
  // On the first page, "Previous" is a link without href and aria-disabled="true".
  return (
    <Pagination
      count={10}
      defaultPage={1}
      getHref={(page) => `#components/pagination?page=${page}`}
      showFirstLast
      aria-label="Search results pages"
      labels={{ page: (p) => `Results page ${p}` }}
    />
  );
}
