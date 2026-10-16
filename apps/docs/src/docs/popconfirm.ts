import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'popconfirm',
  order: 91,
  name: 'Popconfirm',
  group: 'Overlays',
  summary:
    'A small "are you sure?" anchored to the button that asked. Built on Popover, so it is placed with useFloating, flips and shifts to stay on screen and renders in the top layer. It is an alert dialog with Cancel and Confirm, a danger variant, custom labels and async confirms that show a loading button and an inline error.',
  importLine: "import { Popconfirm } from '@onesmall/ui';",
  callout: {
    color: 'warning',
    title: 'Use a Dialog for irreversible or high-impact actions',
    body: 'A popconfirm is quick to confirm without reading, and it is not modal. For anything that cannot be undone, or that affects a lot of data or other people (deleting an account, wiping a project, sending to everyone), use a full Dialog that spells out the consequence. Popconfirm suits quick actions that are easy to recover from.',
  },
  examples: [
    {
      name: 'popconfirm-basic',
      title: 'Default and danger',
      description: 'Focus starts on Cancel. The danger variant adds a warning icon as well as the red button.',
    },
    {
      name: 'popconfirm-async',
      title: 'Async confirm with an error',
      description:
        'Return a promise from onConfirm: the button shows a spinner and the popover stays open. A rejection shows its message inline so the person can retry.',
    },
    {
      name: 'popconfirm-controlled',
      title: 'Controlled, focus on Confirm',
      description: 'initialFocus="confirm" suits actions that are confirmed often and easy to undo.',
    },
  ],
  props: [
    {
      title: 'Popconfirm',
      props: [
        { name: 'title', type: 'ReactNode', description: 'The question. Names the alert dialog (aria-labelledby).' },
        { name: 'message', type: 'ReactNode', description: 'What happens on confirm. Describes the alert dialog (aria-describedby).' },
        { name: 'children', type: 'ReactElement', description: 'The trigger: one focusable element, usually a Button.' },
        {
          name: 'onConfirm',
          type: '() => void | Promise<unknown>',
          description: 'Runs on Confirm. A promise keeps it open with Confirm loading; it closes on resolve and shows the error on reject.',
        },
        { name: 'onCancel', type: '() => void', description: 'Runs on Cancel, Escape, an outside click and a second click on the trigger.' },
        { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Danger makes Confirm red and adds a warning icon to the title.' },
        { name: 'confirmLabel / cancelLabel', type: 'ReactNode', default: "'Confirm' / 'Cancel'", description: 'Name the action ("Remove"), not "OK".' },
        { name: 'initialFocus', type: "'cancel' | 'confirm'", default: "'cancel'", description: 'Which button is focused when it opens.' },
        { name: 'loadingText', type: 'string', description: 'Screen reader text inside Confirm while onConfirm is pending, e.g. "Publishing".' },
        {
          name: 'errorText',
          type: 'ReactNode | (error) => ReactNode',
          description: 'Shown when onConfirm throws or rejects. Default: the error\'s message, else "Something went wrong. Try again."',
        },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'top'", description: 'Preferred side; flips and shifts to stay in the viewport.' },
        { name: 'offset / arrow', type: 'number / boolean', default: '10 / true', description: 'Gap from the trigger in px, and the pointer arrow.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Panel style.' },
        { name: 'className / style', type: 'string / CSSProperties', description: 'Applied to the floating panel.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'On the trigger: opens it and focuses Cancel (or Confirm with initialFocus="confirm"). On a button: runs it.' },
    { keys: 'Tab / Shift + Tab', action: 'Moves between Cancel and Confirm. It is not modal, so Tab past the last button continues to the page.' },
    { keys: 'Escape', action: 'Cancels and returns focus to the trigger. Ignored while an async confirm is pending.' },
  ],
  screenReader: [
    'The panel is role="alertdialog", labelled by the title and described by the message, so opening it reads, for example, "Remove this crew member?, alert dialog, They lose access to the mission board…" and then the focused button.',
    'The trigger has aria-haspopup="dialog", aria-expanded and aria-controls.',
    'While an async confirm runs, Confirm has aria-busy and aria-disabled and keeps focus; pass loadingText to have it read. Cancel is disabled until the promise settles.',
    'A failed confirm renders the error with role="alert", so it is announced at once, and links it to Confirm with aria-describedby for the retry.',
    "The danger variant's warning icon is decorative; the title, the button label and the alert dialog role carry the meaning.",
  ],
  dos: [
    'Ask a short question in the title and say what happens in the message.',
    'Label Confirm with the action ("Remove", "Publish"), and leave Cancel as the default focus.',
    'Return a promise from onConfirm for server actions, so errors show next to the button that caused them.',
    'Move focus somewhere sensible after confirming if the trigger itself goes away, such as a deleted row.',
  ],
  donts: [
    "Don't use it for irreversible or high-impact actions. Use a Dialog.",
    "Don't put forms or long content in it. Use a Popover or Dialog.",
    "Don't rely on it alone for actions that are easy to trigger by accident; offer Undo where you can.",
  ],
  a11y: [
    'Focus moves into the panel when it opens: Cancel by default, Confirm with initialFocus="confirm".',
    'Escape, Cancel and an outside click on a non-focusable area return focus to the trigger. An outside click on another control leaves focus on that control, so the click is not undone.',
    'After a successful confirm, focus returns to the trigger if it is still on the page.',
    'Danger is shown with a warning icon and the button label as well as red, never color alone. Buttons have 44px hit areas.',
    'It renders in the top layer but sits right after the trigger in the DOM, so nothing clips it and the Tab order follows the trigger.',
  ],
  classes: `.os-floating.os-popover.os-popconfirm[role=alertdialog][data-side][data-placement]
  > .os-popover__header > .os-popover__title > .os-popconfirm__icon
  > .os-popover__body > .os-popconfirm__content[data-variant]
    > .os-popconfirm__message
    > .os-popconfirm__error[role=alert] > .os-popconfirm__error-icon
    > .os-popconfirm__actions`,
};

export default doc;
