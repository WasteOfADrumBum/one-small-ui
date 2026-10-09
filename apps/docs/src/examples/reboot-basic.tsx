// No classes here: these are the element defaults Reboot gives every page.
export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <div>
        <address>
          <strong>1SmUI, Inc.</strong>
          <br />
          123 Orbit Way
          <br />
          Moonbase, Luna
        </address>
        <p>
          <abbr title="Cascading Style Sheets">CSS</abbr>, x<sup>2</sup>, log<sub>2</sub>, <kbd>Esc</kbd> and{' '}
          <small>small print</small>.
        </p>
        <details>
          <summary>Summary is a pointer and a list item</summary>
          <p>Details content.</p>
        </details>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="os-font-semibold os-mb-2">Fieldsets have no border or padding</legend>
          <label htmlFor="reboot-range">Volume</label>{' '}
          <input id="reboot-range" type="range" min={0} max={10} defaultValue={4} />{' '}
          <output htmlFor="reboot-range">4</output>
        </fieldset>
      </form>
    </div>
  );
}
