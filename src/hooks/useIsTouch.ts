import { useEffect, useState } from 'react';

/**
 * Detects touch-capable devices so the UI can swap the keyboard control legend
 * for on-screen touch controls. Re-checks on resize/orientation change.
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => detect());

  useEffect(() => {
    const update = () => setIsTouch(detect());
    update();

    let mql: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(pointer: coarse)');
      if (mql.addEventListener) {
        mql.addEventListener('change', update);
      } else if ((mql as any).addListener) {
        (mql as any).addListener(update);
      }
    }

    // Upgrade to touch if a real touch event fires (some hybrids report fine).
    const onTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', onTouch, { once: true, passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', update);
        } else if ((mql as any).removeListener) {
          (mql as any).removeListener(update);
        }
      }
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isTouch;
}

function detect(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  const hasTouch =
    'ontouchstart' in window ||
    (navigator.maxTouchPoints || 0) > 0 ||
    (navigator as any).msMaxTouchPoints > 0;
  return coarse || hasTouch;
}
