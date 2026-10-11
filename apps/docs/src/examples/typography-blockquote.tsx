import { Blockquote } from 'onesmallui';

// Blockquote renders figure › blockquote + figcaption › cite when you give it a source.
export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <Blockquote source="Ada Lovelace" sourceTitle="Notes on the Analytical Engine">
        <p>The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.</p>
      </Blockquote>

      <Blockquote align="center" source="Grace Hopper">
        <p>The most dangerous phrase in the language is: we have always done it this way.</p>
      </Blockquote>

      <Blockquote align="end" source="Alan Kay">
        <p>The best way to predict the future is to invent it.</p>
      </Blockquote>

      {/* Plain HTML, with a nested quote */}
      <figure>
        <blockquote className="os-blockquote">
          <p>A reply that quotes the original message:</p>
          <blockquote className="os-blockquote">
            <p>Ship the smallest thing that works.</p>
          </blockquote>
        </blockquote>
        <figcaption className="os-blockquote-footer">
          Someone famous in <cite>Source Title</cite>
        </figcaption>
      </figure>
    </div>
  );
}
