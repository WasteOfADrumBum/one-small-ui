import { Button, ContextMenu, ContextMenuContent, ContextMenuTrigger, MenuItem, Switch } from '@onesmall/ui';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="os-grid os-gap-3">
      <div className="os-flex os-flex-wrap os-items-center os-gap-3">
        <Switch label="Custom menu" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={!enabled}>
          Show cargo actions
        </Button>
        <span className="os-text-sm os-text-muted">
          Menu is {open ? 'open' : 'closed'}
        </span>
      </div>
      <ContextMenu open={open} onOpenChange={setOpen} disabled={!enabled}>
        <ContextMenuTrigger>
          <div role="region" aria-label="Cargo bay 3" tabIndex={0} className="os-p-6 os-rounded-lg os-border os-bg-surface-2">
            Cargo bay 3. {enabled ? 'Right-click for cargo actions.' : 'Right-click shows the browser menu.'}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Cargo actions">
          <MenuItem>Inspect</MenuItem>
          <MenuItem>Seal bay</MenuItem>
          <MenuItem>Vent to space</MenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
