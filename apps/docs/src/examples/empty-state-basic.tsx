import { Button, EmptyState, PlusIcon } from '@onesmall/ui';

export default function Example() {
  return (
    <EmptyState
      preset="first-use"
      headingLevel={4}
      title="Plan your first mission"
      description="Missions group the crew, cargo and route for a launch. Create one to get started."
      actions={<Button leftIcon={<PlusIcon />}>New mission</Button>}
      secondaryActions={<a href="#components/empty-state">How missions work</a>}
    />
  );
}
