import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'context-menu',
  order: 85,
  name: 'ContextMenu',
  group: 'Overlays',
  summary:
    "A menu that opens on right-click, Shift+F10, the Menu key or a touch long press, placed at the pointer (or at the focused element from the keyboard) and kept inside the viewport. It reuses Menu's items, so checkbox and radio items, groups, separators, submenus, typeahead and disabled items all work the same way.",
  importLine:
    "import { ContextMenu, ContextMenuTrigger, ContextMenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSub, MenuDivider } from '@onesmall/ui';",
  callout: {
    color: 'warning',
    title: 'Every action needs another way in',
    body: "Right-click and long press are hidden gestures: many people never find them, and keyboard, switch, voice and screen reader users often can't perform them. Put every action in a context menu somewhere else as well: a visible button, a Menu (such as a \"More actions\" button) or a keyboard shortcut shown in the interface. The context menu is a shortcut, never the only path.",
  },
  examples: [
    {
      name: 'context-menu-basic',
      title: 'File list with a matching "More actions" menu',
      description: 'Right-click a file name, or focus it and press Shift+F10. The same items render in a visible Menu button, so nothing is right-click only.',
    },
    {
      name: 'context-menu-selection',
      title: 'Checkbox, radio and submenu items',
      description: 'Selection items keep the menu open. ArrowRight opens the submenu and ArrowLeft closes it. The grid toggle also has a keyboard shortcut, G.',
    },
    {
      name: 'context-menu-controlled',
      title: 'Controlled and disabled',
      description: 'Open it from a button with the open prop. Turn it off and the browser’s own context menu comes back.',
    },
  ],
  props: [
    {
      title: 'ContextMenu',
      props: [
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled. Opened by the prop alone, the menu anchors to the target.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: "Attaches no handlers, so the browser's native context menu shows. Closes an open menu." },
        { name: 'longPressDelay', type: 'number', default: '500', description: 'How long a touch is held before the menu opens, in ms. Moving more than 10px, lifting or scrolling cancels it.' },
        { name: 'autoClose', type: "boolean | 'inside' | 'outside'", default: 'true', description: 'Close on item select (inside), outside click (outside), both (true) or neither (false).' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Panel style.' },
      ],
    },
    {
      title: 'ContextMenuTrigger',
      props: [
        {
          name: 'children',
          type: 'ReactElement',
          description:
            "The target: one element. Use a focusable control (a button, link or row cell) or a container of focusable items; a plain element with tabIndex={0} also needs a role and a name, such as role=\"region\" with aria-label. It gets the contextmenu, keyboard and touch handlers, an id and data-state, but no role.",
        },
      ],
    },
    {
      title: 'ContextMenuContent',
      props: [
        { name: 'aria-label', type: 'string', description: 'Names the menu, e.g. "Actions for flight-plan.pdf". Without it the target labels the menu.' },
        { name: 'maxHeight', type: 'string', description: 'Scroll the items past this height. By default the menu is capped to the room beside the pointer.' },
      ],
    },
    {
      title: 'Items',
      props: [
        {
          name: 'MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuGroup, MenuSub, MenuDivider',
          type: 'Menu items',
          description: 'The same components as Menu, with the same props. See the Menu page.',
        },
      ],
    },
  ],
  keyboard: [
    { keys: 'Shift + F10 / Menu', action: 'With the target (or something inside it) focused: opens the menu at the focused element and focuses the first item.' },
    { keys: 'ArrowDown / ArrowUp', action: 'Next or previous item, wrapping. Disabled items are skipped.' },
    { keys: 'Home / End', action: 'First or last item.' },
    { keys: 'Enter / Space', action: 'Runs the item and closes the menu, or toggles a checkbox or radio item and keeps it open.' },
    { keys: 'ArrowRight', action: 'On a submenu item: opens the submenu (ArrowLeft in right-to-left layouts).' },
    { keys: 'ArrowLeft', action: 'In a submenu: closes it and focuses its parent item (ArrowRight in right-to-left layouts).' },
    { keys: 'A to Z', action: 'Typeahead: moves to the next item starting with the typed letters.' },
    { keys: 'Escape', action: 'Closes the menu (or just the open submenu) and returns focus to where it was in the target.' },
    { keys: 'Tab', action: 'Closes the menu and continues tabbing from the target.' },
  ],
  screenReader: [
    'The menu is role="menu" with menuitem, menuitemcheckbox and menuitemradio items; checked state is aria-checked, and disabled items are announced as unavailable.',
    'Name each menu with aria-label so it is announced as, for example, "Actions for flight-plan.pdf, menu".',
    'The target keeps its own role and name; nothing announces that it has a context menu. That is one more reason every action also needs a visible path.',
    'VoiceOver (VO+Shift+M) and other tools that send a keyboard contextmenu event open the menu at the focused element.',
  ],
  dos: [
    'Offer every action somewhere visible too: a "More actions" Menu button, a toolbar button or a shown keyboard shortcut.',
    'Make the target focusable, or put focusable items inside it, so Shift+F10 and the Menu key reach it. A plain element given tabIndex also needs a role and a name.',
    'Keep it short and about the thing under the pointer: the actions for that file, row or selection.',
    'Reuse one items component for the context menu and the visible Menu, so the two never drift apart.',
  ],
  donts: [
    "Don't make right-click or long press the only way to do something.",
    "Don't replace the browser menu on text, links or images people may want to copy, open or save. Use disabled there.",
    "Don't put long forms or free-form content in it. Use a Popover or Dialog.",
  ],
  a11y: [
    'Opens on right-click, Shift+F10, the Menu key and a 500ms touch long press (cancelled by moving more than 10px, lifting or scrolling). The native contextmenu and click that follow a long press are suppressed.',
    'Placed at the pointer with useFloating and a virtual anchor; it flips above the pointer and shifts sideways at the viewport edges, and its height is capped to the room on the taller side so it never leaves the screen.',
    'Escape, an outside click and item selection return focus to the element that was focused in the target. A click on another control leaves focus there.',
    'Text fields inside the target keep the browser menu (cut, copy, paste). With disabled, nothing is attached and the browser menu shows everywhere.',
    'Every item is at least 44px tall; the menu is rendered in the top layer, so no overflow or z-index can clip it.',
  ],
  classes: `[data-context-menu-trigger][data-state=open|closed]  (the target)
.os-floating.os-menu.os-context-menu[role=menu][data-side][data-placement]  --os-context-menu-max
  .os-menu__item ...  (the same parts as Menu)`,
};

export default doc;
