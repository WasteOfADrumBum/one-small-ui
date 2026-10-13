// Layout fixtures for `npm run test:layout` (scripts/layout-test.mjs). Each fixture renders
// at `?fixture=<name>`; the runner measures real layout in Chromium, which jsdom can't do.
import { createRoot } from 'react-dom/client';
import '../../scss/index.scss';
import { fixtures } from './fixtures';

const name = new URLSearchParams(location.search).get('fixture') ?? '';
const Fixture = fixtures[name];
createRoot(document.getElementById('root')!).render(Fixture ? <Fixture /> : <p>Unknown fixture: {name}</p>);
