import { Avatar, Badge, BadgeAnchor, Button } from 'onesmallui';

const Bell = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a1.9 1.9 0 0 0 3.4 0" />
  </svg>
);

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-8">
      {/* Inside a button, the badge is part of the button's accessible name. */}
      <Button variant="outline">
        Inbox
        <Badge placement="top-end" color="danger" variant="solid">
          99+<span className="os-sr-only"> unread messages</span>
        </Badge>
      </Button>

      <Button variant="soft" iconOnly aria-label="Notifications, new activity">
        <Bell />
        <Badge placement="top-end" color="danger" dot pulse />
      </Button>

      {/* BadgeAnchor positions a badge against non-interactive content. */}
      <BadgeAnchor>
        <Avatar name="Mae Jemison" size="lg" />
        <Badge placement="bottom-end" color="success" variant="solid">
          3
        </Badge>
      </BadgeAnchor>

      <BadgeAnchor>
        <Avatar name="Grace Hopper" size="lg" shape="square" />
        <Badge placement="top-start" color="info" dot>
          Has updates
        </Badge>
      </BadgeAnchor>
    </div>
  );
}
