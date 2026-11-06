// Fixture for `npm run test:browsers` (scripts/browser-compat.mjs): the interactive behaviour that differs
// most between engines (native <dialog>, nested modals, top-layer popovers, focus movement, keyboard
// patterns), run in Firefox and WebKit as well as Chromium.
import { useState } from 'react';
import { Combobox, Dialog, Menu, MenuContent, MenuItem, MenuTrigger, Popover, Tooltip } from '../../src';

const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter'].map((p) => ({ value: p.toLowerCase(), label: p }));

export function CompatFixture() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  return (
    <div style={{ padding: 24, display: 'grid', gap: 16, justifyItems: 'start', minBlockSize: '150vh' }}>
      <button type="button" data-test="open-dialog" onClick={() => setOuter(true)}>
        Open dialog
      </button>
      <Dialog open={outer} onClose={() => setOuter(false)} title="Outer dialog" animation="none">
        <input aria-label="First field" data-test="dialog-input" />
        <button type="button" data-test="open-inner" onClick={() => setInner(true)}>
          Open inner
        </button>
        <Dialog open={inner} onClose={() => setInner(false)} title="Inner dialog" animation="none">
          <button type="button" data-test="inner-button">
            Inner action
          </button>
        </Dialog>
      </Dialog>
      <Popover title="Details" content={<button type="button">Inside</button>}>
        <button type="button" data-test="popover-trigger">
          Popover
        </button>
      </Popover>
      <div style={{ inlineSize: 240 }}>
        <Combobox aria-label="Planet" options={planets} />
      </div>
      <Menu>
        <MenuTrigger>
          <button type="button" data-test="menu-trigger">
            Actions
          </button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Edit</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
          <MenuItem>Share</MenuItem>
        </MenuContent>
      </Menu>
      <Tooltip content="Saves the file">
        <button type="button" data-test="tooltip-trigger">
          Save
        </button>
      </Tooltip>
    </div>
  );
}
