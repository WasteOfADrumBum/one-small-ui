import { createContext } from 'react';

/** Internal: lets components built on Popover (Popconfirm) close it from inside the panel. Not exported from the barrel. */
export interface PopoverControls {
  /** Closes the panel; `true` (default) moves focus back to the trigger once it has closed. */
  close: (returnFocus?: boolean) => void;
}

export const PopoverContext = createContext<PopoverControls | null>(null);
