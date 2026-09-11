import type { KeyboardCoordinateGetter } from '@dnd-kit/core';

/** 使用全量顺序定位下一项，原始拖拽行卸载后仍可继续键盘排序。 */
export function createSortKeyboardCoordinates(
  items: readonly string[],
): KeyboardCoordinateGetter {
  return (event, { context, currentCoordinates }) => {
    const direction =
      event.code === 'ArrowDown' ? 1 : event.code === 'ArrowUp' ? -1 : 0;
    const { active, over, collisionRect, droppableRects } = context;
    if (!direction || !active || !collisionRect) return;
    event.preventDefault();
    const index = items.indexOf(String(over?.id ?? active.id));
    const nextId = items[index + direction];
    if (index < 0 || nextId === undefined) return;
    const nextRect = droppableRects.get(nextId);
    return {
      x: currentCoordinates.x,
      y: nextRect
        ? nextRect.top + (nextRect.height - collisionRect.height) / 2
        : currentCoordinates.y + direction * collisionRect.height,
    };
  };
}
