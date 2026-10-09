// No React? The same look works with plain HTML classes and data attributes.
export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <button className="os-btn" data-variant="solid" data-color="primary" data-size="md">
        Plain HTML button
      </button>
      <a className="os-btn" data-variant="outline" data-color="accent" data-size="md" href="#utilities">
        Plain HTML link
      </a>
    </div>
  );
}
