import { Button, Field, Input, Menu, MenuContent, MenuText, MenuTrigger } from 'onesmallui';

// contentRole="dialog" holds free-form content: Tab moves through it, Escape closes.
export default function Example() {
  return (
    <Menu contentRole="dialog" autoClose="outside">
      <MenuTrigger>
        <Button>Sign in</Button>
      </MenuTrigger>
      <MenuContent aria-label="Sign in">
        <form className="os-grid os-gap-3" onSubmit={(e) => e.preventDefault()}>
          <Field label="Crew email">
            <Input type="email" autoComplete="email" />
          </Field>
          <Field label="Passcode">
            <Input type="password" autoComplete="current-password" />
          </Field>
          <Button type="submit">Sign in</Button>
        </form>
        <MenuText>New here? Ask your captain for an invite.</MenuText>
      </MenuContent>
    </Menu>
  );
}
