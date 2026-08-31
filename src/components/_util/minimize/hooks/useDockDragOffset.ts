import { useCallback, useEffect, useState } from 'react';
import { dockStore, type DockDragOffset } from '../store/dockStore';
import type { MinimizePosition } from '../type';

const useDockDragOffset = (
  position: MinimizePosition,
): [DockDragOffset, (offset: DockDragOffset) => void] => {
  const [offset, setOffset] = useState<DockDragOffset>(() =>
    dockStore.getDragOffset(position),
  );

  useEffect(() => {
    const syncOffset = () => setOffset(dockStore.getDragOffset(position));
    const unsubscribe = dockStore.subscribeDragOffset(position, syncOffset);
    syncOffset();
    return unsubscribe;
  }, [position]);

  const updateOffset = useCallback(
    (nextOffset: DockDragOffset) => {
      dockStore.setDragOffset(position, nextOffset);
    },
    [position],
  );

  return [offset, updateOffset];
};

export default useDockDragOffset;
