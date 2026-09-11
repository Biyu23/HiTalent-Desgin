import { HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PopoverSelectLocale } from '../../../locales';
import { createSortKeyboardCoordinates } from '../hooks/sortKeyboardCoordinates';
import { useStyles } from '../style';
import type { MappedOption, RawValueType } from '../type';
import { getNodeText, getOptionKey } from '../utils';

interface SortableOptionsProps<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  options: readonly MappedOption<ValueType, OptionType>[];
  enabled: boolean;
  onSortChange?: (options: OptionType[]) => void;
  renderOption: (
    option: MappedOption<ValueType, OptionType>,
  ) => React.ReactNode;
  listItemHeight: number;
  locale: PopoverSelectLocale;
  children: React.ReactNode;
}

export default function SortableOptions<
  ValueType extends RawValueType,
  OptionType extends object,
>({
  options,
  enabled,
  onSortChange,
  renderOption,
  listItemHeight,
  locale,
  children,
}: SortableOptionsProps<ValueType, OptionType>) {
  const { styles, cx, theme } = useStyles();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const dragOptions = useRef<typeof options | null>(null);
  useEffect(() => {
    if (!enabled) {
      dragOptions.current = null;
      setActiveId(null);
    }
  }, [enabled]);
  const items = useMemo(
    () => options.map((option) => getOptionKey(option.value)),
    [options],
  );
  const activeOption = options.find(
    (option) => getOptionKey(option.value) === activeId,
  );
  const keyboardCoordinates = useMemo(
    () => createSortKeyboardCoordinates(items),
    [items],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      scrollBehavior: 'auto',
    }),
  );

  const cancel = () => {
    dragOptions.current = null;
    setActiveId(null);
  };
  const end = ({ active, over }: DragEndEvent) => {
    const originalOptions = dragOptions.current;
    cancel();
    if (
      !enabled ||
      originalOptions !== options ||
      !over ||
      active.id === over.id
    )
      return;
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (from < 0 || to < 0 || options[from].disabled) return;
    onSortChange?.(
      arrayMove([...options], from, to).map((option) => option.source),
    );
  };
  const describePosition = (id: UniqueIdentifier) => {
    const index = items.indexOf(String(id));
    return index < 0 ? undefined : locale.sortPosition(index + 1, items.length);
  };

  return (
    <DndContext
      key={enabled ? 'enabled' : 'disabled'}
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        screenReaderInstructions: { draggable: locale.sortInstructions },
        announcements: {
          onDragStart: ({ active }) =>
            `${locale.dragHandle}: ${getNodeText(
              options.find((option) => getOptionKey(option.value) === active.id)
                ?.label,
            )}. ${describePosition(active.id) ?? ''}`,
          onDragOver: ({ over }) =>
            over ? describePosition(over.id) : undefined,
          onDragEnd: ({ over }) =>
            over
              ? `${locale.sortEnd}. ${describePosition(over.id) ?? ''}`
              : locale.sortCancel,
          onDragCancel: () => locale.sortCancel,
        },
      }}
      onDragStart={({ active }) => {
        if (!enabled) return;
        dragOptions.current = options;
        setActiveId(active.id);
      }}
      onDragCancel={cancel}
      onDragEnd={end}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay
            dropAnimation={null}
            zIndex={theme.zIndexPopupBase + 100}
          >
            {enabled && dragOptions.current === options && activeOption ? (
              <div
                aria-hidden
                className={cx(styles.sortableItem, styles.sortOverlay)}
                style={
                  {
                    '--popover-select-item-height': `${listItemHeight}px`,
                  } as React.CSSProperties
                }
              >
                <span className={styles.sortHandle}>
                  <HolderOutlined />
                </span>
                {renderOption(activeOption)}
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
