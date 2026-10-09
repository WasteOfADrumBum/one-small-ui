// Native inline elements are styled for you; .os-mark and .os-small do the same on any element.
export default function Example() {
  return (
    <div>
      <p>
        You can use the mark tag to <mark>highlight</mark> text.
      </p>
      <p>
        <del>This line of text is meant to be treated as deleted text.</del>
      </p>
      <p>
        <s>This line of text is meant to be treated as no longer accurate.</s>
      </p>
      <p>
        <ins>This line of text is meant to be treated as an addition to the document.</ins>
      </p>
      <p>
        <u>This line of text will render as underlined.</u>
      </p>
      <p>
        <small>This line of text is meant to be treated as fine print.</small>
      </p>
      <p>
        <strong>This line rendered as bold text.</strong> <em>This one is italic.</em>
      </p>
      <p>
        <abbr title="attribute">attr</abbr> is an abbreviation;{' '}
        <abbr title="HyperText Markup Language" className="os-initialism">
          html
        </abbr>{' '}
        is an initialism. Water is H<sub>2</sub>O and energy is mc<sup>2</sup>. Press <kbd>Ctrl</kbd> + <kbd>K</kbd>.
      </p>
    </div>
  );
}
