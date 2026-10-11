import { useState } from 'react';
import { ListGroup, ListGroupItem } from 'onesmallui';

const decks = ['Bridge', 'Engineering', 'Hydroponics', 'Cargo hold'];

export default function Example() {
  const [deck, setDeck] = useState('Bridge');
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3">
      <ListGroup aria-label="Static items">
        <ListGroupItem>Oxygen</ListGroupItem>
        <ListGroupItem active>Nitrogen (active)</ListGroupItem>
        <ListGroupItem>Argon</ListGroupItem>
        <ListGroupItem disabled>Xenon (disabled)</ListGroupItem>
      </ListGroup>

      <nav aria-label="Docs sections">
        <ListGroup>
          <ListGroupItem href="#components/list-group" active current="page">
            List group
          </ListGroupItem>
          <ListGroupItem href="#components/card">Card</ListGroupItem>
          <ListGroupItem href="#components/badge">Badge</ListGroupItem>
          <ListGroupItem href="#components/pagination" disabled>
            Disabled link
          </ListGroupItem>
        </ListGroup>
      </nav>

      <ListGroup aria-label="Choose a deck">
        {decks.map((d) => (
          <ListGroupItem key={d} active={d === deck} onClick={() => setDeck(d)} disabled={d === 'Cargo hold'}>
            {d}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}
