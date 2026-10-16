import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'lightbox',
  order: 78,
  name: 'Lightbox',
  group: 'Overlays',
  summary:
    'A full-screen image viewer on Dialog. Previous/next buttons, arrow keys (swapped in RTL), Home and End, swipe, pinch and double-tap zoom, keyboard zoom and pan, an announced "3 of 12" counter, captions, srcset, adjacent-image preloading, loading and broken-image states, and an optional thumbnail strip and download link. LightboxGallery adds a responsive grid of thumbnail buttons, and useSwipe is the swipe hook behind it.',
  importLine: "import { Lightbox, LightboxGallery, useSwipe } from '@onesmall/ui';",
  examples: [
    {
      name: 'lightbox-gallery',
      title: 'Photography gallery',
      description:
        'A responsive grid of thumbnails. Open one, then use the arrows, swipe, pinch or double-tap to zoom, or press + and -. The strip at the bottom jumps to any photo; Escape returns focus to the thumbnail you opened.',
    },
    {
      name: 'lightbox-controlled',
      title: 'Controlled, looping, with a broken image',
      description: 'open and index are controlled. loop wraps from the last image to the first. The third file is missing, so it shows the broken-image state with its alt text.',
    },
    {
      name: 'lightbox-use-swipe',
      title: 'useSwipe on your own element',
      description:
        "Swipe (or drag with a mouse) across the card. Directions are logical: 'start' means toward the reading start in LTR and RTL. touch-action: pan-y leaves vertical scrolling to the browser.",
    },
  ],
  props: [
    {
      title: 'Lightbox',
      props: [
        { name: 'images', type: 'LightboxImage[]', description: 'The images, in order. Each needs alt text (see LightboxImage).' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', default: 'false', description: 'Controlled or uncontrolled open state.' },
        { name: 'index / defaultIndex / onIndexChange', type: 'number / number / (index) => void', default: '0', description: 'Controlled or uncontrolled current image. Out-of-range values are clamped.' },
        { name: 'aria-label', type: 'string', default: "'Image viewer'", description: 'Names the dialog. The counter is its description.' },
        { name: 'thumbnails', type: 'boolean', default: 'false', description: 'A strip of thumbnail buttons under the image; the current one has aria-current.' },
        { name: 'loop', type: 'boolean', default: 'false', description: 'Wrap past the ends. Without it the previous/next buttons are aria-disabled at the ends (they keep focus).' },
        { name: 'maxZoom', type: 'number', default: '4', description: 'Largest zoom factor. Zoom goes from 1× in 0.5× steps; double tap toggles 2×.' },
        { name: 'returnFocus', type: 'boolean | RefObject<HTMLElement>', default: 'true', description: 'Where focus goes on close: the opener, a specific element, or nowhere.' },
        { name: 'labels', type: 'Partial<LightboxLabels>', description: 'counter(n, total), previous, next, close, zoomIn, zoomOut, zoom(percent), download, thumbnails, thumbnail(n, total, alt), loading and error, for translation.' },
        { name: 'appearance / animation', type: 'OverlayAppearance / DialogAnimation', default: "'dark' / 'fade'", description: 'Passed to Dialog. Dark re-scopes every token so photos sit on a dark surface.' },
      ],
    },
    {
      title: 'LightboxImage',
      props: [
        { name: 'src', type: 'string', description: 'The image shown in the viewer.' },
        { name: 'alt', type: 'string', description: "Required by the types. What the image shows; also shown if it fails to load. '' warns once in development." },
        { name: 'srcSet / sizes', type: 'string', description: 'Passed to the <img> and to the preloader, so the browser fetches the right size.' },
        { name: 'caption', type: 'ReactNode', description: 'A <figcaption> under the image, linked to it with aria-describedby.' },
        { name: 'thumbnail', type: 'string', description: 'Smaller image for the strip and LightboxGallery. Defaults to src.' },
        { name: 'download', type: 'string | boolean', description: 'Shows a download link: true downloads src, a string downloads that URL (an original, say). Cross-origin files open instead of downloading.' },
        { name: 'width / height', type: 'number', description: 'Intrinsic size, so space is reserved before the image loads.' },
      ],
    },
    {
      title: 'LightboxGallery',
      props: [
        { name: 'images', type: 'LightboxImage[]', description: 'Shown as thumbnail buttons and in the viewer.' },
        { name: 'minItemSize', type: 'string', default: "'10rem'", description: 'Smallest thumbnail width; the grid fits as many columns as it can.' },
        { name: 'gap / aspectRatio', type: 'string', default: "'0.5rem' / '1'", description: 'Space between thumbnails, and their shape (CSS aspect-ratio; crops with object-fit: cover).' },
        { name: 'openLabel', type: '(image, index) => string', default: '"Open <alt>"', description: 'Accessible name of each thumbnail button.' },
        { name: 'open / onOpenChange, index / defaultIndex / onIndexChange', type: '…', description: 'Control the viewer from outside, if you need to.' },
        { name: 'lightboxProps', type: 'Partial<LightboxProps>', description: 'Passed to the Lightbox: thumbnails, loop, labels, aria-label…' },
        { name: 'ref', type: 'Ref<HTMLUListElement>', description: 'The list. Give it an aria-label to name the gallery.' },
      ],
    },
    {
      title: 'useSwipe(ref, options)',
      props: [
        { name: 'onSwipe', type: "(direction: 'start' | 'end' | 'up' | 'down', info) => void", description: 'Called once per swipe, on release. info has distance, deltaX, deltaY, pointerType and the event.' },
        { name: 'threshold', type: 'number', default: '40', description: 'Minimum travel in px.' },
        { name: 'axis', type: "'x' | 'y' | 'both'", default: "'x'", description: 'Which travel counts; both reports the larger axis.' },
        { name: 'enabled', type: 'boolean', default: 'true', description: 'Listen while true.' },
        { name: 'mouse', type: 'boolean', default: 'false', description: 'Also count mouse drags (primary button only).' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Right arrow / Left arrow', action: 'Next or previous image (swapped in RTL). While zoomed in, they pan instead.' },
    { keys: 'Up arrow / Down arrow', action: 'Pan while zoomed in.' },
    { keys: 'Home / End', action: 'First or last image.' },
    { keys: '+ / =', action: 'Zoom in by 0.5×, up to maxZoom.' },
    { keys: '-', action: 'Zoom out.' },
    { keys: '0', action: 'Reset the zoom.' },
    { keys: 'Escape', action: 'Close and return focus to the thumbnail or button that opened it.' },
    { keys: 'Tab / Shift + Tab', action: 'Moves between the toolbar, previous/next and thumbnails; focus stays inside the dialog.' },
  ],
  screenReader: [
    'The viewer is a modal dialog named "Image viewer" and described by the counter, so opening it reads "Image viewer, dialog, 3 of 12".',
    'Each change of image announces the new position ("4 of 12") politely through useAnnouncer. Zoom changes from the keyboard, the buttons or a double tap announce "Zoom 150%".',
    'The image is an <img> with its alt text, inside a <figure>; the caption is a <figcaption> also linked with aria-describedby.',
    'While loading, a Spinner with "Loading image" is shown. A broken image shows an icon, "This image couldn’t be loaded." and the alt text, so nothing is lost.',
    'Previous/next and zoom buttons are aria-disabled (not disabled) when they can’t act, so they keep focus and stay discoverable.',
    'Thumbnails are buttons named by alt text and position, with aria-current="true" on the current one. LightboxGallery is a list, so screen readers announce how many photos there are.',
  ],
  dos: [
    'Write alt text that says what the photo shows; put credits and context in the caption.',
    'Pass width and height, and srcSet with sizes, so phones download a small file and the layout doesn’t jump.',
    'Give LightboxGallery an aria-label (or a visible heading with aria-labelledby).',
    'Use thumbnails for long sets, so people can jump instead of stepping.',
  ],
  donts: [
    "Don't make the lightbox the only way to see an image's details; keep important text on the page too.",
    "Don't set alt to the file name or to the caption text repeated.",
    "Don't wrap the thumbnails in links that also open the viewer; one control per image.",
  ],
  a11y: [
    'Built on Dialog: focus is trapped, the page is inert, scroll is locked, and focus returns to the opener (in LightboxGallery, the thumbnail that opened it, even after moving to another image).',
    'Every pointer gesture has a key: swipe → arrows, pinch → + and -, double tap → + and 0, drag → arrows while zoomed.',
    'Controls are 44px targets with visible focus rings; the current thumbnail has a thick frame and full opacity, not only a color change.',
    'Reduced motion turns off the zoom and open/close transitions. Nothing auto-advances.',
    'SSR safe: nothing touches window or document during render, and the dialog renders no images until it opens.',
  ],
  classes:
    'dialog.os-lightbox > .os-lightbox__content[data-zoomed] > .os-lightbox__toolbar (__counter, __actions, __close), .os-lightbox__figure > .os-lightbox__stage[data-status="loading|loaded|error"][data-gesture] > .os-lightbox__image | .os-lightbox__spinner | .os-lightbox__error; .os-lightbox__nav[data-dir], .os-lightbox__caption, .os-lightbox__thumbnails > .os-lightbox__thumb[aria-current]; ul.os-lightbox-gallery > .os-lightbox-gallery__item > .os-lightbox-gallery__button',
};

export default doc;
