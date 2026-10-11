// One class styles raw HTML from Markdown, MDX or a CMS. Wrap widgets in .os-not-prose to opt out.
export default function Example() {
  return (
    <article className="os-prose">
      <h2>Launch notes</h2>
      <p>
        Prose gives long-form content a calm rhythm: <strong>bold</strong>, <em>italic</em>,{' '}
        <a href="#components/prose">links</a> and <code>inline code</code> all just work. Lines stay under 70
        characters for comfortable reading.
      </p>
      <h3>What changed</h3>
      <ul>
        <li>Faster builds</li>
        <li>
          New tables
          <ul>
            <li>Stacked on mobile</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Install the package</li>
        <li>Import the styles</li>
      </ol>
      <blockquote>
        <p>Small, sharp, accessible.</p>
      </blockquote>
      <pre>
        <code>npm install onesmallui</code>
      </pre>
      <figure>
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=70"
          alt="A network of lights over the Earth at night"
          width={900}
          height={500}
        />
        <figcaption>Figures and captions are styled too.</figcaption>
      </figure>
      <table>
        <caption>Plans</caption>
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free</td>
            <td>$0</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>$12</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <p>
        That&apos;s it. Use <code>data-size=&quot;sm&quot;</code> or <code>&quot;lg&quot;</code> to scale everything.
      </p>
    </article>
  );
}
