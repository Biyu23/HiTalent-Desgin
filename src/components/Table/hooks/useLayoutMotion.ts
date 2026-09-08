import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/** Capture before changing preview data; invert after React commits, before paint. */
export function useLayoutMotion(axis: 'x' | 'y') {
  const pending = useRef<Map<HTMLElement, DOMRect> | null>(null);
  const animations = useRef(new Map<HTMLElement, Animation>());

  const cancel = useCallback(() => {
    pending.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current.clear();
  }, []);

  const capture = useCallback((elements: Iterable<HTMLElement>) => {
    // Keep the first snapshot when several updates are batched in one commit.
    // getBoundingClientRect includes the current animation, allowing reversal.
    if (pending.current) return;
    pending.current = new Map(
      Array.from(elements, (element) => [
        element,
        element.getBoundingClientRect(),
      ]),
    );
  }, []);

  useLayoutEffect(() => {
    const before = pending.current;
    if (!before) return;
    pending.current = null;
    // Retarget only captured cells. Unrelated columns must finish their existing
    // motion instead of snapping to the end on every neighbouring swap.
    before.forEach((_, element) => {
      animations.current.get(element)?.cancel();
      animations.current.delete(element);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cancel();
      return;
    }

    // Finish all geometry reads before starting any new animation.
    const changes = Array.from(before, ([element, previous]) => {
      if (!element.isConnected) return null;
      const next = element.getBoundingClientRect();
      const offset =
        axis === 'x' ? previous.left - next.left : previous.top - next.top;
      return Math.abs(offset) >= 0.5 ? { element, offset } : null;
    });
    changes.forEach((change) => {
      if (!change || typeof change.element.animate !== 'function') return;
      const { element, offset } = change;
      const animation = element.animate(
        [
          {
            transform: `translate3d(${axis === 'x' ? offset : 0}px, ${
              axis === 'y' ? offset : 0
            }px, 0)`,
          },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        axis === 'x'
          ? { duration: 240, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }
          : { duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
      animations.current.set(element, animation);
      animation.finished
        .catch(() => undefined)
        .then(() => {
          if (animations.current.get(element) === animation) {
            animations.current.delete(element);
          }
        });
    });
  });

  useEffect(() => cancel, [cancel]);
  return { capture, cancel };
}
