import type {
  CollisionDetection,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { useCallback, useMemo, useRef } from 'react';
import type { RowDropPlacement, TableRowKey } from '../type';
import { getTableViewport, tableRows } from '../utils/dragPreview';

interface RowTarget {
  key: TableRowKey;
  placement: RowDropPlacement;
}

/** 将鼠标几何位置或键盘选择转成逻辑落点；业务准入交给拖拽策略判断。 */
export function useRowCollisionDetection(
  rootRef: React.RefObject<HTMLElement>,
  originalKeys: readonly TableRowKey[],
  draggedKeys: ReadonlySet<TableRowKey>,
) {
  const keyMap = useMemo(
    () => new Map(originalKeys.map((key) => [String(key), key])),
    [originalKeys],
  );
  const options = useRef({ originalKeys, draggedKeys, keyMap });
  options.current = { originalKeys, draggedKeys, keyMap };
  const target = useRef<RowTarget | null>(null);
  const keyboardTarget = useRef<RowTarget | null>(null);
  const reset = useCallback(() => {
    target.current = null;
    keyboardTarget.current = null;
  }, []);

  const keyboardCoordinates = useCallback<KeyboardCoordinateGetter>(
    (event, { active, currentCoordinates, context }) => {
      if (
        !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          event.code,
        )
      )
        return;
      event.preventDefault();
      const { originalKeys: keys, draggedKeys: excluded } = options.current;
      let next = keyboardTarget.current;
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        const direction = event.code === 'ArrowDown' ? 1 : -1;
        const current = keys.indexOf(next?.key ?? active);
        for (
          let index = current + direction;
          index >= 0 && index < keys.length;
          index += direction
        ) {
          const key = keys[index];
          const container = context.droppableContainers.get(key);
          if (
            key === active ||
            excluded.has(key) ||
            !container?.node.current ||
            container.disabled
          )
            continue;
          next = { key, placement: direction > 0 ? 'after' : 'before' };
          container.node.current.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
          });
          break;
        }
      } else if (next) {
        const placements: RowDropPlacement[] = ['before', 'inside', 'after'];
        const index =
          placements.indexOf(next.placement) +
          (event.code === 'ArrowRight' ? 1 : -1);
        next = {
          ...next,
          placement: placements[Math.max(0, Math.min(2, index))],
        };
      }
      if (!next) return;
      keyboardTarget.current = next;
      target.current = next;
      // 树形行保持原位，传感器移动时调度碰撞与预览计算；
      // 键盘操作的逻辑目标不依赖指针坐标。
      return { ...currentCoordinates, y: currentCoordinates.y + 1 };
    },
    [],
  );

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const root = rootRef.current;
      const pointer = args.pointerCoordinates;
      target.current = null;
      if (!root) return [];
      if (!pointer) {
        const next = keyboardTarget.current;
        if (!next || options.current.draggedKeys.has(next.key)) return [];
        const container = args.droppableContainers.find(
          (item) => item.id === next.key,
        );
        if (!container || container.disabled) return [];
        target.current = next;
        return [{ id: next.key }];
      }
      const viewport = getTableViewport(root);
      const bounds = viewport.getBoundingClientRect();
      if (
        pointer.x < bounds.left ||
        pointer.x > bounds.left + viewport.clientWidth ||
        pointer.y < bounds.top ||
        pointer.y > bounds.top + viewport.clientHeight
      )
        return [];

      const { keyMap } = options.current;
      // 释放前保持树形行的顺序，使用已挂载节点的实际矩形，
      // 以兼顾详情行、展开状态和虚拟滚动。
      for (const row of tableRows(root)) {
        const key = keyMap.get(row.dataset.rowKey ?? '');
        if (key === undefined) continue;
        const rect = row.getBoundingClientRect();
        if (
          rect.height <= 0 ||
          pointer.y < rect.top ||
          pointer.y >= rect.bottom
        )
          continue;
        if (key === args.active.id || options.current.draggedKeys.has(key))
          return [];
        const container = args.droppableContainers.find(
          (item) => item.id === key,
        );
        if (!container || container.disabled) return [];
        const ratio = (pointer.y - rect.top) / rect.height;
        const placement =
          ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
        target.current = { key, placement };
        return [{ id: key }];
      }
      return [];
    },
    [rootRef],
  );

  const getTarget = useCallback(() => target.current, []);
  return { collisionDetection, getTarget, reset, keyboardCoordinates };
}
