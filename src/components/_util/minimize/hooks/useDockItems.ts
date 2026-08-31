import { useEffect, useState } from 'react';
import { dockStore } from '../store/dockStore';
import type { DockItem, MinimizePosition } from '../type';

/**
 * 订阅指定停靠方位下的所有最小化卡片。
 */
const useDockItems = (position: MinimizePosition): DockItem[] => {
  const [items, setItems] = useState<DockItem[]>(() =>
    dockStore.getItems(position),
  );

  useEffect(() => {
    const syncItems = () => setItems(dockStore.getItems(position));
    const unsubscribe = dockStore.subscribeItems(position, syncItems);
    syncItems();
    return unsubscribe;
  }, [position]);

  return items;
};

export default useDockItems;
