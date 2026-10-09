import { Collapse, CollapseTrigger, Collapsible } from 'onesmallui';

export default function Example() {
  // One trigger, two panels: aria-controls lists both ids.
  return (
    <Collapsible>
      <CollapseTrigger variant="soft" color="accent">
        Toggle both reports
      </CollapseTrigger>
      <div className="os-grid os-gap-3 md:os-grid-cols-2 os-mt-3">
        <Collapse>
          <div className="os-p-4 os-rounded-lg os-bg-surface-2">Engine report: all four thrusters nominal.</div>
        </Collapse>
        <Collapse>
          <div className="os-p-4 os-rounded-lg os-bg-surface-2">Navigation report: course locked to waypoint 7.</div>
        </Collapse>
      </div>
    </Collapsible>
  );
}
