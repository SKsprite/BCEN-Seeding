// hooks/useDragToScroll.ts
import { useRef, useEffect } from 'react';

export function useDragToScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX      = 0;
    let scrollStart = 0;

    const handleDown = (e: PointerEvent) => {
      if (e.button !== 0) return;           // left mouse only

      if ((e.target as HTMLElement).closest('[data-draggable]')) return;

      el.setPointerCapture(e.pointerId);    // capture all pointer events
      startX      = e.clientX;
      scrollStart = el.scrollLeft;
      el.style.cursor     = 'grabbing';
      el.style.userSelect = 'none';
    };

    const handleMove = (e: PointerEvent) => {
      // only if we’ve captured
      if (el.hasPointerCapture(e.pointerId)) {
        const delta = e.clientX - startX;
        el.scrollLeft = scrollStart - delta;
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
        el.style.cursor     = 'grab';
        el.style.userSelect = '';
      }
    };

    el.addEventListener('pointerdown', handleDown);
    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerup',   handleUp);
    el.addEventListener('pointerleave', handleUp);

    // initial style
    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('pointerdown', handleDown);
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerup',   handleUp);
      el.removeEventListener('pointerleave', handleUp);
    };
  }, []);

  return ref;
}
