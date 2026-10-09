import { Button, ButtonGroup } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <ButtonGroup aria-label="Pagination direction" variant="outline">
        <Button>Previous</Button>
        <Button active>Today</Button>
        <Button>Next</Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Save options" dividers color="success">
        <Button>Save</Button>
        <Button>Save as</Button>
        <Button>Export</Button>
      </ButtonGroup>

      <div className="os-flex os-flex-wrap os-items-start os-gap-4">
        <ButtonGroup aria-label="Small group" size="sm" variant="soft" color="accent">
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Vertical group" orientation="vertical" variant="outline" color="secondary">
          <Button>Top</Button>
          <Button>Middle</Button>
          <Button>Bottom</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Nested group" variant="outline">
          <Button>1</Button>
          <Button>2</Button>
          <ButtonGroup aria-label="More pages" variant="soft">
            <Button>3</Button>
            <Button>4</Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </div>
  );
}
