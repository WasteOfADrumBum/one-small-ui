import { Button, useToast } from 'onesmallui';

const Bell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" />
  </svg>
);

export default function Example() {
  const { toast, dismiss } = useToast();
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Button
        onClick={() =>
          toast({ icon: <Bell />, title: 'Mission control', time: 'just now', description: 'Docking clearance granted.' })
        }
      >
        Header with icon and time
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const id = toast({
            title: 'Crew invite',
            description: 'Lt. Ortiz wants to join your squad.',
            content: (
              <div className="os-flex os-gap-2 os-mt-2">
                <Button size="sm" onClick={() => dismiss(id)}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" onClick={() => dismiss(id)}>
                  Decline
                </Button>
              </div>
            ),
          });
        }}
      >
        Custom content and actions
      </Button>
      <Button variant="soft" color="success" onClick={() => toast({ title: 'Saved', color: 'success', variant: 'solid', instant: true, duration: 4000 })}>
        Solid, instant, auto-hide
      </Button>
    </div>
  );
}
