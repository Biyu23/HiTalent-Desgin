import { HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { forwardRef, useCallback } from 'react';
import { setRef } from '../../../utils';
import { useStyles } from '../style';

interface SortableOptionProps {
  id: string;
  disabled: boolean;
  handleLabel: string;
  children: React.ReactNode;
}

/** 将拖拽手柄放在选项外部，避免触发 Checkbox；转发虚拟列表的测量 ref。 */
const SortableOption = forwardRef<HTMLDivElement, SortableOptionProps>(
  ({ id, disabled, handleLabel, children }, ref) => {
    const { styles, cx } = useStyles();
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      disabled: { draggable: disabled, droppable: false },
    });
    const handleRef = useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node);
        setRef(ref, node);
      },
      [ref, setNodeRef],
    );

    return (
      <div
        ref={handleRef}
        className={cx(
          styles.sortableItem,
          isDragging && styles.sortableDragging,
        )}
        style={{ transform: CSS.Translate.toString(transform), transition }}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          disabled={disabled}
          className={styles.sortHandle}
          aria-label={handleLabel}
          title={handleLabel}
          onClick={(event) => event.stopPropagation()}
        >
          <HolderOutlined />
        </button>
        {children}
      </div>
    );
  },
);

SortableOption.displayName = 'PopoverSelect.SortableOption';

export default SortableOption;
