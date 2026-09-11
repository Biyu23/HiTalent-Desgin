import { Checkbox } from 'antd';
import React, { forwardRef } from 'react';
import { useStyles } from '../style';

interface PopoverSelectOptionProps {
  multiple: boolean;
  selected: boolean;
  disabled: boolean;
  virtual: boolean;
  className?: string;
  onToggle: () => void;
  children: React.ReactNode;
}

/** 单项选择视图，不依赖数据映射或拖拽。转发虚拟列表测量 ref。 */
const PopoverSelectOption = forwardRef<
  HTMLDivElement,
  PopoverSelectOptionProps
>(
  (
    { multiple, selected, disabled, virtual, className, onToggle, children },
    ref,
  ) => {
    const { styles, cx } = useStyles();
    return (
      <div ref={ref} className={styles.optionContainer}>
        {multiple ? (
          <Checkbox
            checked={selected}
            disabled={disabled}
            className={cx(
              styles.menuCheckbox,
              virtual && styles.menuItemVirtual,
              className,
            )}
            onChange={onToggle}
          >
            {children}
          </Checkbox>
        ) : (
          <div
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cx(
              styles.menuRadio,
              virtual && styles.menuItemVirtual,
              selected && styles.menuRadioActive,
              disabled && styles.menuRadioDisabled,
              className,
            )}
            onClick={() => !disabled && onToggle()}
            onKeyDown={(event) => {
              if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onToggle();
              }
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);
PopoverSelectOption.displayName = 'PopoverSelect.Option';
export default PopoverSelectOption;
