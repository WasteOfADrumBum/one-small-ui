// role="list" keeps list semantics in Safari when bullets are removed.
export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <div>
        <ul>
          <li>Unordered lists use discs</li>
          <li>
            Nested lists
            <ol>
              <li>Ordered lists use numbers</li>
              <li>And keep their indent</li>
            </ol>
          </li>
        </ul>
        <ul className="os-list-unstyled" role="list">
          <li>Unstyled list: no bullets, no indent</li>
          <li>Only affects direct children</li>
        </ul>
        <ul className="os-list-inline" role="list">
          <li className="os-list-inline-item">Inline</li>
          <li className="os-list-inline-item">list</li>
          <li className="os-list-inline-item">items</li>
        </ul>
      </div>
      <dl className="os-dl-horizontal">
        <dt>Description lists</dt>
        <dd>Pair a term with its description.</dd>
        <dt>Horizontal</dt>
        <dd>From the sm breakpoint terms sit beside their descriptions.</dd>
        <dt>Several</dt>
        <dd>A term can have more than one description.</dd>
        <dd>This is the second one.</dd>
      </dl>
    </div>
  );
}
