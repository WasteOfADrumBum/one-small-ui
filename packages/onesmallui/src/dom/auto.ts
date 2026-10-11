/** IIFE entry for `<script src=".../onesmallui-dom.iife.js">`: exposes `window.OneSmallUI` and calls init(). */
import * as OneSmallUI from './index';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => OneSmallUI.init());
else OneSmallUI.init();

export * from './index';
