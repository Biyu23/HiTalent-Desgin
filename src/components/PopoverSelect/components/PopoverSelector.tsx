import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { usePrefixCls } from '../../../configProvider';
import { useMergeState } from '../../../hooks';
import { useStyles } from '../style';
import type { SelectorProps } from '../type';

/**
 * PopoverSelect.Selector 独立气泡触发器组件：
 * 1. 外观状态：支持激活高亮 (active)、展开悬浮 (open)、禁用状态 (disabled)。
 * 2. 交互区域：
 *    - 主文本区：展示选中文本或自定义 children
 *    - 操作区：包含下拉箭头与 hover/选中时的清除图标
 * 3. 弹层承载：底层封装 Ant Design Popover，支持自定义 placement、getPopupContainer、destroyTooltipOnHide 等属性。
 */
export const Selector = forwardRef<
  React.ComponentRef<typeof Button>,
  SelectorProps
>((props, ref) => {
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles: selectStyles, cx } = useStyles();
  const {
    content,
    autoAdjustOverflow = true,
    afterOpenChange,
    placement = 'bottomLeft',
    getPopupContainer,
    destroyTooltipOnHide,
    children,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    allowClear = false,
    hasValue = false,
    onClear,
    showArrow = true,
    ellipsis = true,
    disabled = false,
    className,
    style,
    rootClassName,
    classNames,
    styles,
  } = props;

  // 内部与受控 open 状态同步
  const [open, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });
  const mergedOpen = !disabled && open;

  const triggerRef = useRef<React.ComponentRef<typeof Button> | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number>();

  useImperativeHandle(
    ref,
    () => triggerRef.current as React.ComponentRef<typeof Button>,
    [],
  );

  useLayoutEffect(() => {
    const triggerElement = triggerRef.current;
    if (!mergedOpen || !triggerElement) return;

    const updateWidth = () => {
      const width = Math.ceil(triggerElement.getBoundingClientRect().width);
      const availableWidth = Math.max(
        0,
        document.documentElement.clientWidth - 16,
      );
      setTriggerWidth(Math.min(width, availableWidth));
    };
    updateWidth();

    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateWidth);
    observer?.observe(triggerElement);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [mergedOpen]);

  useEffect(() => {
    if (disabled && open) setOpen(false);
  }, [disabled, open, setOpen]);

  const hasClear = Boolean(allowClear && hasValue && !disabled);

  // 触发器按钮节点
  const trigger = (
    <Button
      ref={triggerRef}
      type="text"
      disabled={disabled}
      className={cx(
        `${prefixCls}-selector`,
        selectStyles.selectorBtn,
        hasValue && selectStyles.selectorBtnActive,
        mergedOpen && selectStyles.selectorBtnOpen,
        disabled && selectStyles.selectorBtnDisabled,
        className,
        classNames?.trigger,
      )}
      style={{ ...styles?.trigger, ...style }}
    >
      <span
        className={cx(
          selectStyles.selectorText,
          ellipsis && selectStyles.selectorTextEllipsis,
          classNames?.triggerText,
        )}
      >
        {children}
      </span>
      {(hasClear || showArrow) && (
        <span className={cx(selectStyles.selectorActions, classNames?.actions)}>
          {hasClear && (
            <CloseCircleOutlined
              className={selectStyles.selectorClear}
              onClick={(event) => {
                event.stopPropagation();
                onClear?.(event);
              }}
            />
          )}
          {showArrow && (
            <DownOutlined
              className={cx(
                selectStyles.selectorArrow,
                mergedOpen && selectStyles.selectorArrowOpen,
              )}
            />
          )}
        </span>
      )}
    </Button>
  );

  return (
    <Popover
      trigger="click"
      placement={placement}
      getPopupContainer={getPopupContainer}
      destroyTooltipOnHide={destroyTooltipOnHide}
      autoAdjustOverflow={autoAdjustOverflow}
      rootClassName={cx(selectStyles.popover, rootClassName, classNames?.popup)}
      styles={{
        root: {
          minWidth: triggerWidth,
          maxWidth: 'calc(100vw - 16px)',
          ...styles?.popup,
        },
      }}
      afterOpenChange={afterOpenChange}
      open={mergedOpen}
      content={
        disabled ? null : typeof content === 'function' ? content() : content
      }
      onOpenChange={disabled ? undefined : setOpen}
    >
      {trigger}
    </Popover>
  );
});

Selector.displayName = 'PopoverSelect.Selector';

export default Selector;
