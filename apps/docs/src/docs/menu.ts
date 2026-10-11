import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'menu',
  order: 80,
  name: 'Menu',
  group: 'Overlays',
  summary:
    'Dropdown menus following the WAI-ARIA menu button pattern: actions, links, checkbox and radio items, icons, descriptions, groups, nested submenus, scrolling, typeahead and configurable auto-close. Rendered in the top layer and positioned with useFloating.',
  importLine:
    "import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuGroup, MenuDivider, MenuSub } from 'onesmallui';",
  examples: [
    { name: 'menu-basic', title: 'Actions and links', description: 'Icons, descriptions, shortcuts, an active link and a disabled item.' },
    { name: 'menu-selection', title: 'Checkbox and radio items with headers', description: 'Selection items keep the menu open by default.' },
    { name: 'menu-nested', title: 'Submenus and scrolling', description: 'ArrowRight opens a submenu, ArrowLeft closes it. Type to jump to an item.' },
    { name: 'menu-form', title: 'Forms and custom content' },
    { name: 'menu-options', title: 'Auto-close, placement and appearance' },
  ],
  props: [
    {
      title: 'Menu',
      props: [
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'bottom-start'", description: 'Side and alignment, optionally per breakpoint. Flips when there is no room.' },
        { name: 'offset', type: 'number', default: '6', description: 'Gap from the trigger in px.' },
        { name: 'autoClose', type: "boolean | 'inside' | 'outside'", default: 'true', description: 'Close on item select (inside), outside click (outside), both (true) or neither (false).' },
        { name: 'contentRole', type: "'menu' | 'dialog'", default: "'menu'", description: "'dialog' for forms and custom content (Tab navigation)." },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Panel style.' },
      ],
    },
    {
      title: 'MenuContent',
      props: [{ name: 'maxHeight', type: 'string', description: "Scroll the items past this height, e.g. '16rem'." }],
    },
    {
      title: 'MenuItem',
      props: [
        { name: 'onSelect', type: '(e) => void', description: 'Called on click, Enter or Space. preventDefault() keeps the menu open.' },
        { name: 'href', type: 'string', description: 'Render a link.' },
        { name: 'active', type: 'boolean', description: 'Current page/choice: aria-current and highlight.' },
        { name: 'disabled', type: 'boolean', description: 'aria-disabled; skipped by arrow keys.' },
        { name: 'icon / description / shortcut', type: 'ReactNode', description: 'Leading icon, muted second line, trailing hint.' },
        { name: 'closeOnSelect', type: 'boolean', description: 'Override autoClose for this item.' },
      ],
    },
    {
      title: 'MenuCheckboxItem / MenuRadioGroup / MenuRadioItem',
      props: [
        { name: 'checked / defaultChecked / onCheckedChange', type: 'boolean', description: 'MenuCheckboxItem state.' },
        { name: 'value / defaultValue / onValueChange', type: 'string', description: 'MenuRadioGroup state.' },
        { name: 'label', type: 'ReactNode', description: 'MenuRadioGroup / MenuGroup header; names the group.' },
      ],
    },
    {
      title: 'MenuSub',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Submenu item text.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: 'inline end', description: 'Opens right in LTR, left in RTL.' },
        { name: 'maxHeight', type: 'string', description: 'Scroll the submenu.' },
      ],
    },
  ],
  a11y: [
    'Trigger: aria-haspopup, aria-expanded and aria-controls. Enter, Space and ArrowDown open on the first item; ArrowUp on the last.',
    'Inside: ArrowUp/ArrowDown wrap, Home/End jump, typing a letter jumps to the next matching item, Escape closes and returns focus to the trigger, Tab closes and moves on.',
    'Submenus: ArrowRight (ArrowLeft in RTL), Enter or hover opens; ArrowLeft or Escape closes and focuses the parent item.',
    'Items are menuitem, menuitemcheckbox and menuitemradio with aria-checked; groups are labelled by their header.',
    'Every item is at least 44px tall; disabled items stay readable and are skipped by arrow keys.',
    "Use contentRole='dialog' for forms: arrow keys then behave normally and Tab moves through fields.",
  ],
  classes: `.os-floating.os-menu[role=menu|dialog][data-side][data-placement]
  .os-menu__item[role=menuitem|menuitemcheckbox|menuitemradio][data-active][aria-disabled]
    .os-menu__indicator | .os-menu__icon | .os-menu__text > .os-menu__label + .os-menu__description | .os-menu__shortcut
  .os-menu__group > .os-menu__header
  .os-menu__divider  .os-menu__text-block  .os-menu__sub`,
};

export default doc;
