import { createIcon } from './Icon';

/** Four tiles of mixed widths: dashboard, overview, layout. */
export const LayoutDashboardIcon = createIcon(
  'LayoutDashboard',
  <>
    <rect x="3.5" y="3.5" width="9" height="7" rx="1.5" />
    <rect x="15.5" y="3.5" width="5" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="5" height="7" rx="1.5" />
    <rect x="11.5" y="13.5" width="9" height="7" rx="1.5" />
  </>,
);
