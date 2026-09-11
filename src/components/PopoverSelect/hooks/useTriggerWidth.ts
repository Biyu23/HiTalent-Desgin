import type React from 'react';
import { useLayoutEffect, useState } from 'react';

/** 弹层打开期间跟随触发器尺寸，并限制在当前窗口内。 */
export function useTriggerWidth(
  ref: React.RefObject<HTMLElement>,
  open: boolean,
) {
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const view = node.ownerDocument.defaultView;
    const update = () =>
      setWidth(
        Math.min(
          Math.ceil(node.getBoundingClientRect().width),
          Math.max(0, node.ownerDocument.documentElement.clientWidth - 16),
        ),
      );
    update();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(node);
    view?.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      view?.removeEventListener('resize', update);
    };
  }, [ref, open]);
  return width;
}
