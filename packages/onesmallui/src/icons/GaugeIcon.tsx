import { createIcon } from './Icon';

/** A dial with a needle: performance, speed, usage level. */
export const GaugeIcon = createIcon(
  'Gauge',
  <>
    <path d="M4.2 17.5a9 9 0 1 1 15.6 0" />
    <circle cx="12" cy="13" r="1.5" />
    <path d="m13 11.75 3-3.75" />
  </>,
);
