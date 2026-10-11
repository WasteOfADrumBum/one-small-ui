// No React? The same look works with plain HTML classes and data attributes,
// on <button>, <a> and <input> elements.
export default function Example() {
  return (
    <form className="os-flex os-flex-wrap os-gap-3" onSubmit={(e) => e.preventDefault()}>
      <button type="button" className="os-btn" data-variant="solid" data-color="primary" data-size="md">
        Button element
      </button>
      <a className="os-btn" data-variant="outline" data-color="accent" data-size="md" href="#utilities">
        Anchor element
      </a>
      <input type="submit" className="os-btn" data-variant="soft" data-color="success" data-size="md" value="Submit input" />
      <input type="reset" className="os-btn" data-variant="ghost" data-color="danger" data-size="md" value="Reset input" />
    </form>
  );
}
