import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/** 修改预览数据前记录位置，在 React 提交后、绘制前应用反向位移。 */
export function useLayoutMotion(axis: 'x' | 'y') {
  const pending = useRef<Map<HTMLElement, DOMRect> | null>(null);
  const animations = useRef(new Map<HTMLElement, Animation>());

  const cancel = useCallback(() => {
    pending.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current.clear();
  }, []);

  const capture = useCallback((elements: Iterable<HTMLElement>) => {
    // 多个更新合并为一次提交时，保留最初的位置快照。
    // getBoundingClientRect 包含当前动画的位置变化，因此支持反向过渡。
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
    // 仅更新已记录位置的单元格动画目标；无关列应继续完成已有动画，
    // 避免每次相邻列交换时都直接跳到动画终点。
    before.forEach((_, element) => {
      animations.current.get(element)?.cancel();
      animations.current.delete(element);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cancel();
      return;
    }

    // 启动新动画前，先完成全部几何尺寸读取。
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
