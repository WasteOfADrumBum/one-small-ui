import { Button, Tooltip } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3 os-py-4">
      <Tooltip
        content={
          <>
            <strong>Warp drive</strong>
            <br />
            Charged to <em>92%</em>
          </>
        }
      >
        <Button variant="outline">Rich content</Button>
      </Tooltip>
      <Tooltip content="Dark tooltip" appearance="dark" placement="bottom">
        <Button variant="outline">Dark</Button>
      </Tooltip>
      <Tooltip content="Translucent tooltip" appearance="translucent" placement="bottom">
        <Button variant="outline">Translucent</Button>
      </Tooltip>
      <Tooltip content="Custom class, no arrow" arrow={false} contentClassName="os-font-mono">
        <Button variant="outline">Custom style</Button>
      </Tooltip>
      {/* Wrap disabled controls so the tooltip can still be reached. */}
      <Tooltip content="Unlocks after training">
        <span tabIndex={0} className="os-inline-flex">
          <Button disabled style={{ pointerEvents: 'none' }}>
            Pilot mode
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
