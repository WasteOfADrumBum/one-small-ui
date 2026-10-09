// Real headings carry the document outline; .os-h1 … .os-h6 borrow a size without changing it.
export default function Example() {
  return (
    <div>
      <h1>h1. Heading</h1>
      <h2>h2. Heading</h2>
      <h3>h3. Heading</h3>
      <h4>h4. Heading</h4>
      <h5>h5. Heading</h5>
      <h6>h6. Heading</h6>
      <p className="os-h3">A paragraph that looks like an h3</p>
      <p className="os-h5">
        Muted secondary text <small className="os-text-muted">sits beside it</small>
      </p>
    </div>
  );
}
