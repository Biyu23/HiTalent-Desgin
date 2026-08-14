import type { ColumnId } from '../type';

export function moveColumnItem(
  order: readonly ColumnId[],
  activeId: ColumnId,
  overId: ColumnId,
): ColumnId[] {
  const oldIndex = order.indexOf(activeId);
  const newIndex = order.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return [...order];

  const next = [...order];
  next.splice(oldIndex, 1);
  next.splice(newIndex, 0, activeId);
  return next;
}
