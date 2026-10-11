import { Collapse, CollapseTrigger, Collapsible } from 'onesmallui';

export default function Example() {
  return (
    <Collapsible defaultOpen>
      <div className="os-grid os-gap-3">
        <CollapseTrigger variant="outline" className="os-w-fit">
          Toggle side panel
        </CollapseTrigger>
        {/* Horizontal animates width. Give the content a fixed width so text doesn't reflow. */}
        <Collapse orientation="horizontal">
          <div className="os-p-4 os-rounded-lg os-bg-surface-2" style={{ inlineSize: '18rem' }}>
            A panel that slides open sideways, such as a filter sidebar.
          </div>
        </Collapse>
      </div>
    </Collapsible>
  );
}
