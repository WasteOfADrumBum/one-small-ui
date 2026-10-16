import { Button, Popconfirm } from '@onesmall/ui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Popconfirm title="Mark all as read?" message="Unread badges clear for every channel." confirmLabel="Mark as read">
        <Button variant="outline">Mark all as read</Button>
      </Popconfirm>
      <Popconfirm
        variant="danger"
        title="Remove this crew member?"
        message="They lose access to the mission board. You can invite them again."
        confirmLabel="Remove"
        cancelLabel="Keep"
        placement="bottom"
      >
        <Button variant="soft" color="danger">
          Remove Ada
        </Button>
      </Popconfirm>
    </div>
  );
}
