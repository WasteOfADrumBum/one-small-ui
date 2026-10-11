import { AnnouncerProvider, Button, useAnnouncer } from '@onesmall/ui';

function SaveBar() {
  const { announce } = useAnnouncer();
  return (
    <div className="os-flex os-flex-wrap os-gap-2">
      <Button onClick={() => announce('Draft saved')}>Save draft</Button>
      <Button color="danger" variant="soft" onClick={() => announce('Upload failed. Check your connection.', { politeness: 'assertive' })}>
        Simulate an error
      </Button>
    </div>
  );
}

// Mount AnnouncerProvider once near the root; useAnnouncer works anywhere below it.
export default function Example() {
  return (
    <AnnouncerProvider>
      <SaveBar />
    </AnnouncerProvider>
  );
}
