import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'carousel',
  order: 95,
  name: 'Carousel',
  group: 'Navigation',
  summary:
    'Image or custom-content slides on a native scroll-snap track (touch scrolling for free) or a crossfade. Overlay, top or bottom controls, indicators, several slides at once, peeking neighbors, variable widths, opt-in pausable autoplay with per-slide intervals, and loop, rewind or stop at the end.',
  importLine: "import { Carousel, CarouselSlide, CarouselCaption } from 'onesmallui';",
  examples: [
    { name: 'carousel-basic', title: 'Image slides with captions' },
    { name: 'carousel-options', title: 'Multiple, peek, variable widths, fade, autoplay, dark' },
  ],
  props: [
    {
      title: 'Carousel',
      props: [
        { name: 'aria-label', type: 'string', description: 'Required: names the carousel.' },
        { name: 'transition', type: "'slide' | 'fade'", default: "'slide'", description: 'Scroll-snap track or crossfade.' },
        { name: 'controls', type: "'overlay' | 'top' | 'bottom' | false", default: "'overlay'", description: 'Where previous/next (and play/pause) go.' },
        { name: 'indicators', type: 'boolean', default: 'true', description: 'One button per position.' },
        { name: 'itemsPerView', type: "number | 'auto'", default: '1', description: "Slides visible at once; 'auto' uses each slide's width." },
        { name: 'peek', type: 'boolean | string', description: "Show part of the neighbors (true = '10%')." },
        { name: 'gap', type: 'string', default: "'1rem'", description: 'Space between slides.' },
        { name: 'end', type: "'loop' | 'rewind' | 'stop'", default: "'rewind'", description: 'Past the last slide: jump around, scroll back, or disable next.' },
        { name: 'autoplay', type: 'boolean | number', default: 'false', description: 'Opt-in rotation in ms (true = 5000), with a pause button.' },
        { name: 'appearance', type: "'default' | 'dark'", default: "'default'", description: 'Dark re-scopes tokens.' },
        { name: 'index / defaultIndex / onIndexChange', type: 'number', description: 'Controlled or uncontrolled position.' },
        { name: 'labels', type: '{ previous, next, play, pause, goTo, slide }', description: 'Translate the built-in labels.' },
      ],
    },
    {
      title: 'CarouselSlide',
      props: [
        { name: 'interval', type: 'number', description: 'Time on this slide while rotating.' },
        { name: 'label', type: 'string', default: "'n of total'", description: 'Accessible slide label.' },
      ],
    },
  ],
  a11y: [
    'Follows the APG carousel pattern: a region with aria-roledescription="carousel" and slides with aria-roledescription="slide" labelled "n of total".',
    'Autoplay is off by default, never starts for prefers-reduced-motion, pauses on hover and focus, and always has a visible play/pause button first in the tab order (WCAG 2.2.2).',
    'The slide area is aria-live="polite" while not rotating, "off" while rotating.',
    'Previous/next, play/pause and each indicator are 44px buttons with labels; the track is focusable and responds to arrow keys, Home and End.',
    'Give every image meaningful alt text.',
  ],
  classes: `section.os-carousel[data-transition][data-controls][data-per-view][data-peek]
  > .os-carousel__viewport > .os-carousel__track > .os-carousel__slide[data-active] > .os-carousel__caption
  .os-carousel__btn.os-carousel__prev | .os-carousel__next | .os-carousel__play
  .os-carousel__indicators > .os-carousel__dot[aria-current]  .os-carousel__bar`,
};

export default doc;
