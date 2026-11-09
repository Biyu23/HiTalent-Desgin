import { theme } from 'antd';
import React, { memo, useLayoutEffect, useMemo, useRef } from 'react';
import useDragBounds from '../../../../hooks/useDragBounds';
import DraggablePointerContainer from '../../DraggablePointerContainer';
import useDockDragOffset from '../hooks/useDockDragOffset';
import useDockExpansion from '../hooks/useDockExpansion';
import useDockMetrics from '../hooks/useDockMetrics';
import useTransformScroll from '../hooks/useTransformScroll';
import useViewportHeight from '../hooks/useViewportHeight';
import { useStackStyles } from '../style';
import type { DockItem, MinimizePosition } from '../type';
import {
  getCollapsedStackScale,
  NOTIFICATION_STACK_LAYERS,
  NOTIFICATION_STACK_OFFSET,
  shouldCollapseStack,
} from '../utils/layout';
import { getStackTransformOrigin, isBottomPosition } from '../utils/position';
import DockCard from './DockCard';

export interface DockStackProps {
  items: DockItem[];
  position: MinimizePosition;
  dockPrefixCls: string;
  presentedIds: Set<string>;
}

const DEFAULT_CARD_HEIGHT = 48;

export const DockStack = memo<DockStackProps>(
  ({ items, position, dockPrefixCls, presentedIds }) => {
    const { token } = theme.useToken();
    const { styles, cx } = useStackStyles();
    const { dragRef, bounds, onStart, updateBounds } = useDragBounds();
    const [dragOffset, setDragOffset] = useDockDragOffset(position);
    const dragOffsetRef = useRef(dragOffset);
    dragOffsetRef.current = dragOffset;

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const viewportHeight = useViewportHeight();

    const displayItems = useMemo(() => [...items].reverse(), [items]);
    const itemIds = useMemo(
      () => displayItems.map((item) => item.id),
      [displayItems],
    );
    const itemRevision = itemIds.join('|');
    const totalCount = displayItems.length;
    const latestItem = displayItems[0];
    const collapsible = shouldCollapseStack(totalCount, latestItem?.stack);
    const expansion = useDockExpansion({
      rootRef: dragRef,
      collapsible,
      revision: itemRevision,
    });
    const expanded = expansion.expanded;
    const anchorBottom = isBottomPosition(position);
    const transformOrigin = getStackTransformOrigin(position);
    const metrics = useDockMetrics({
      contentRef,
      itemIds,
      fallbackHeight: DEFAULT_CARD_HEIGHT,
      gap: token.margin,
    });

    const maxAllowedHeight = Math.max(
      metrics.latestHeight,
      viewportHeight - token.sizeLG * 2,
    );
    const isScrollable = expanded && metrics.contentHeight > maxAllowedHeight;
    const containerHeight = expanded
      ? Math.min(metrics.contentHeight, maxAllowedHeight)
      : metrics.latestHeight;
    const maxScroll = Math.max(0, metrics.contentHeight - maxAllowedHeight);

    useTransformScroll({
      viewportRef,
      contentRef,
      scrollable: isScrollable,
      maxScroll,
      alignEnd: anchorBottom,
    });

    useLayoutEffect(() => {
      updateBounds(dragOffsetRef.current);
    }, [containerHeight, position, updateBounds, viewportHeight]);

    const latestMetrics = metrics.cards.get(latestItem.id);
    const hasMeasuredCards = metrics.cards.size === totalCount;
    const draggable = !collapsible;
    const layoutReadyRef = useRef(false);
    const layoutReady = layoutReadyRef.current;

    useLayoutEffect(() => {
      // 首次测量直接落位，避免承载组件切换后从零偏移弹入。
      if (hasMeasuredCards) layoutReadyRef.current = true;
    }, [hasMeasuredCards]);

    useLayoutEffect(() => {
      const activeIds = new Set(itemIds);
      presentedIds.forEach((id) => {
        if (!activeIds.has(id)) presentedIds.delete(id);
      });
      itemIds.forEach((id) => presentedIds.add(id));
    }, [itemIds, presentedIds]);

    return (
      <DraggablePointerContainer
        key={`${dockPrefixCls}-${position}`}
        nodeRef={dragRef}
        bounds={bounds}
        disabled={collapsible}
        position={dragOffset}
        onStart={onStart}
        onDrag={setDragOffset}
        handle={`.${styles.header}`}
        className={styles.stackWrapper}
        style={{
          height: containerHeight,
          maxHeight: maxAllowedHeight,
          transition: layoutReady ? undefined : 'none',
        }}
        onMouseEnter={expansion.onMouseEnter}
        onMouseLeave={expansion.onMouseLeave}
        onFocusCapture={expansion.onFocusCapture}
        onBlurCapture={expansion.onBlurCapture}
      >
        <div
          ref={viewportRef}
          className={cx(
            styles.viewport,
            isScrollable && styles.viewportScrollable,
          )}
        >
          <div
            ref={contentRef}
            className={cx(styles.canvas, anchorBottom && styles.canvasBottom)}
            style={{ height: metrics.contentHeight }}
          >
            {displayItems.map((item, index) => {
              const cardMetrics = metrics.cards.get(item.id);
              const interactive = expanded || index === 0;
              const visible =
                expanded ||
                index === 0 ||
                (hasMeasuredCards && index < NOTIFICATION_STACK_LAYERS);
              // 所有卡片都从停靠边缘定位，新增项只改变 transform，避免文档流跳位。
              const direction = anchorBottom ? -1 : 1;
              let transform = `translateY(${
                direction * (cardMetrics?.top ?? 0)
              }px) scaleX(1)`;

              if (!expanded && latestMetrics && cardMetrics) {
                const offsetY = direction * index * NOTIFICATION_STACK_OFFSET;
                const scaleX = getCollapsedStackScale(
                  latestMetrics.width,
                  cardMetrics.width,
                  index,
                );
                transform = `translateY(${offsetY}px) scaleX(${scaleX})`;
              }

              const itemStyle: React.CSSProperties = {
                top: anchorBottom ? undefined : 0,
                bottom: anchorBottom ? 0 : undefined,
                transform,
                transformOrigin,
                transition: layoutReady ? undefined : 'none',
                opacity: visible ? 1 : 0,
                zIndex: totalCount - index,
                pointerEvents: interactive ? 'auto' : 'none',
              };

              return (
                <div
                  key={item.id}
                  ref={metrics.getCardRef(item.id)}
                  className={styles.cardItem}
                  style={itemStyle}
                >
                  <DockCard
                    item={item}
                    entering={!presentedIds.has(item.id)}
                    interactive={interactive}
                    draggable={draggable}
                    elevated={!expanded && index < NOTIFICATION_STACK_LAYERS}
                    count={
                      index === 0 && totalCount > 1 ? totalCount : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DraggablePointerContainer>
    );
  },
);

export default DockStack;
