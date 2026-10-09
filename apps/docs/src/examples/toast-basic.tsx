import { Button, useToast } from 'onesmallui';

// Wrap your app once in <ToastProvider>, then call useToast() anywhere.
export default function Example() {
  const { toast } = useToast();
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Button
        onClick={() =>
          toast({ title: 'Course plotted', description: 'Arrival in 3 hours.', color: 'success', duration: 6000 })
        }
      >
        Success (auto-dismiss)
      </Button>
      <Button
        variant="soft"
        color="warning"
        onClick={() =>
          toast({
            title: 'Asteroid field ahead',
            color: 'warning',
            action: { label: 'Reroute', onClick: () => toast({ title: 'Rerouted', color: 'info', duration: 4000 }) },
          })
        }
      >
        With action
      </Button>
      <Button variant="soft" color="danger" onClick={() => toast({ title: 'Signal lost', color: 'danger' })}>
        Error (stays until dismissed)
      </Button>
    </div>
  );
}
