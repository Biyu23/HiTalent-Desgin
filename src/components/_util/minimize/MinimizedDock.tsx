import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import DockStack from './components/DockStack';
import { acquireDockContainer } from './dockRegistry';
import useDockItems from './hooks/useDockItems';
import { dockStore } from './store/dockStore';
import { useContainerStyles } from './style';
import type { DockItem, MinimizedDockProps } from './type';

let dockIdSeed = 0;

const MinimizedDockInner = memo<Omit<MinimizedDockProps, 'open' | 'minimized'>>(
  (props) => {
    const { position: dockPosition } = props;
    const dockPrefixCls = usePrefixCls('minimize');
    const { styles: containerStyles, cx } = useContainerStyles();
    const [dockId] = useState(() => props.id || `dock-${++dockIdSeed}`);
    const items = useDockItems(dockPosition);
    const [dockContainer, setDockContainer] = useState<ReturnType<
      typeof acquireDockContainer
    > | null>(null);
    const positionClassName = {
      'top-left': containerStyles.topLeft,
      'top-right': containerStyles.topRight,
      top: containerStyles.top,
      'bottom-left': containerStyles.bottomLeft,
      'bottom-right': containerStyles.bottomRight,
      bottom: containerStyles.bottom,
      left: containerStyles.left,
      right: containerStyles.right,
    }[dockPosition];
    const scrollWrapperClassName = cx(
      containerStyles.scrollWrapper,
      positionClassName,
    );

    const item = useMemo<DockItem>(
      () => ({ ...props, id: dockId }),
      [props, dockId],
    );
    // 更新卡片不注销，保留排列顺序和当前拖拽位置。
    useEffect(
      () => () => dockStore.unregister(dockPosition, dockId),
      [dockId, dockPosition],
    );

    useEffect(() => {
      dockStore.setItem(item);
    }, [item]);

    useLayoutEffect(() => {
      const entry = acquireDockContainer({
        dockPrefixCls,
        containerClassName: containerStyles.container,
        scrollWrapperClassName,
        position: dockPosition,
      });
      setDockContainer(entry);
      return entry.release;
    }, [
      containerStyles.container,
      dockPosition,
      dockPrefixCls,
      scrollWrapperClassName,
    ]);

    // 每个位置由最早注册的卡片承载容器。
    const isLeader = items[0]?.id === dockId;
    if (!dockContainer || !isLeader) return null;

    return createPortal(
      <DockStack
        items={items}
        position={dockPosition}
        dockPrefixCls={dockPrefixCls}
        presentedIds={dockContainer.presentedIds}
      />,
      dockContainer.scrollWrapper,
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>(
  ({ open, minimized, ...itemProps }) =>
    open && minimized ? <MinimizedDockInner {...itemProps} /> : null,
);

export default MinimizedDock;
