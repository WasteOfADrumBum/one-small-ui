import { Button, ButtonGroup, ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'onesmallui';

// One Tab stop for the whole toolbar; arrow keys move between controls.
export default function Example() {
  return (
    <ButtonToolbar aria-label="Text formatting">
      <ToggleButtonGroup aria-label="Style" type="multiple" size="sm" color="secondary">
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
      </ToggleButtonGroup>
      <ButtonGroup aria-label="History" size="sm" variant="outline" color="secondary">
        <Button>Undo</Button>
        <Button>Redo</Button>
      </ButtonGroup>
      <Button size="sm" variant="ghost" color="danger">
        Clear
      </Button>
    </ButtonToolbar>
  );
}
