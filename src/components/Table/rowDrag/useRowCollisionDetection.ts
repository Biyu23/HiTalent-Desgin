import type { CollisionDetection } from '@dnd-kit/core';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { RowDropPlacement, TableRowKey } from '../type';
import { getTableViewport } from '../utils/dragPreview';

interface RowTarget {
  key: TableRowKey;
  placement: RowDropPlacement;
}

/** Hit testing uses original content slots, never the animated preview DOM. */
export function useRowCollisionDetection(
  rootRef: React.RefObject<HTMLElement>,
  originalKeys: readonly TableRowKey[],
  draggedKeys: ReadonlySet<TableRowKey>,
) {
  const options = useRef({ originalKeys, draggedKeys });
  options.current = { originalKeys, draggedKeys };
  const session = useRef<{
    heights: Map<TableRowKey, number>;
    top: number;
    keys: TableRowKey[];
  } | null>(null);
  const target = useRef<RowTarget | null>(null);

  const reset = useCallback(() => {
    session.current = null;
    target.current = null;
  }, []);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const viewport = getTableViewport(root);
    const bounds = viewport.getBoundingClientRect();
    const keys = options.current.originalKeys;
    const keyMap = new Map(keys.map((key) => [String(key), key]));
    const heights = session.current?.heights ?? new Map<TableRowKey, number>();
    const mountedKeys: TableRowKey[] = [];
    let top = Infinity;
    root.querySelectorAll<HTMLElement>('tr[data-row-key]').forEach((row) => {
      const key = keyMap.get(row.dataset.rowKey ?? '');
      if (key === undefined) return;
      const rect = row.getBoundingClientRect();
      if (rect.height <= 0) return;
      mountedKeys.push(key);
      if (!heights.has(key)) heights.set(key, rect.height);
      top = Math.min(top, rect.top - bounds.top + viewport.scrollTop);
    });
    if (!session.current) {
      // Ant Table may sort/filter/page records independently of the registry.
      session.current = { heights, top, keys: mountedKeys };
      return;
    }
    const order = session.current.keys.filter((key) => keyMap.has(String(key)));
    mountedKeys.forEach((key, index) => {
      if (order.includes(key)) return;
      // Only add newly mounted children; never adopt the moving preview order.
      const previous = mountedKeys
        .slice(0, index)
        .reverse()
        .find(
          (item) =>
            order.includes(item) && !options.current.draggedKeys.has(item),
        );
      order.splice(
        previous === undefined ? 0 : order.indexOf(previous) + 1,
        0,
        key,
      );
    });
    session.current.keys = order;
  }, [rootRef]);

  useLayoutEffect(() => {
    // Expansion must be measured after React mounts its new rows, not during
    // collision detection in DndContext's render of the previous DOM.
    if (session.current) measure();
  }, [measure, originalKeys]);

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const root = rootRef.current;
      const pointer = args.pointerCoordinates;
      target.current = null;
      if (!root || !pointer) return [];
      if (!session.current) measure();
      const current = session.current;
      if (!current) return [];
      const viewport = getTableViewport(root);
      const bounds = viewport.getBoundingClientRect();
      if (
        pointer.x < bounds.left ||
        pointer.x > bounds.left + viewport.clientWidth ||
        pointer.y < bounds.top ||
        pointer.y > bounds.top + viewport.clientHeight
      )
        return [];

      const contentY = pointer.y - bounds.top + viewport.scrollTop;
      let top = current.top;
      for (const key of current.keys) {
        const height = current.heights.get(key);
        if (!height) continue; // Rows on other pages are not drag targets.
        const bottom = top + height;
        if (contentY >= top && contentY < bottom) {
          if (key === args.active.id || options.current.draggedKeys.has(key))
            return [];
          const container = args.droppableContainers.find(
            (item) => item.id === key,
          );
          if (!container || container.disabled) return [];
          const ratio = (contentY - top) / height;
          const placement =
            ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
          target.current = { key, placement };
          return [{ id: key }];
        }
        top = bottom;
      }
      return [];
    },
    [measure, rootRef],
  );

  const getTarget = useCallback(() => target.current, []);
  return { collisionDetection, getTarget, reset };
}
