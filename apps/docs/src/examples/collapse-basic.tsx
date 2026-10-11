import { Collapse, CollapseTrigger, Collapsible } from 'onesmallui';

export default function Example() {
  return (
    <Collapsible>
      <CollapseTrigger variant="soft">Show mission details</CollapseTrigger>
      <Collapse>
        <div className="os-mt-3 os-p-4 os-rounded-lg os-bg-surface-2">
          Launch at 06:40 from pad 39A. The crew boards two hours before launch; the hatch closes at T-45 minutes.
        </div>
      </Collapse>
    </Collapsible>
  );
}
