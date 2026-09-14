import React, { forwardRef, memo } from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { attachPropertiesToComponent } from '../../utils';
import PopoverSelectContent from './components/PopoverSelectContent';
import PopoverSelectLabel from './components/PopoverSelectLabel';
import Selector from './components/PopoverSelector';
import { usePopoverSelectState } from './hooks/usePopoverSelectState';
import { useStyles } from './style';
import type {
  DefaultOptionType,
  PopoverSelectComponent,
  PopoverSelectProps,
  RawValueType,
} from './type';

export type * from './type';
export { Selector };

/** 组合层：连接选择状态、面板和独立 Selector。 */
function InternalPopoverSelect<
  V extends RawValueType = RawValueType,
  O extends object = DefaultOptionType,
>(props: PopoverSelectProps<V, O>, ref: React.Ref<HTMLDivElement>) {
  const locale = useLocale('PopoverSelect');
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles, cx } = useStyles();
  const state = usePopoverSelectState(props);
  const { selectedValues, optionMap } = state;
  const label = (
    <PopoverSelectLabel
      selectedValues={selectedValues}
      optionMap={optionMap}
      mode={state.context.mode}
      placeholder={
        props.placeholder === undefined ? locale.placeholder : props.placeholder
      }
      separator={props.separator ?? ', '}
      maxTagCount={props.maxTagCount}
      ellipsis={props.ellipsis ?? true}
    />
  );
  return (
    <div
      ref={ref}
      className={cx(prefixCls, styles.root, props.className)}
      style={props.style}
    >
      <Selector
        prefixCls={prefixCls}
        autoAdjustOverflow={props.autoAdjustOverflow}
        afterOpenChange={props.afterOpenChange}
        placement={props.placement}
        getPopupContainer={props.getPopupContainer}
        destroyTooltipOnHide={props.destroyTooltipOnHide}
        content={
          <PopoverSelectContent
            config={props}
            context={state.context}
            locale={locale}
            active={state.open}
            onSearchChange={state.setSearchValue}
          />
        }
        open={state.open}
        onOpenChange={state.setOpen}
        allowClear={props.allowClear}
        hasValue={selectedValues.length > 0}
        onClear={state.clearCommitted}
        showArrow={props.showArrow}
        ellipsis={props.ellipsis !== false}
        disabled={props.disabled}
        classNames={props.classNames}
        styles={props.styles}
      >
        {props.labelRender
          ? props.labelRender(label, {
              values: selectedValues,
              options: selectedValues
                .map((value) => optionMap.get(value)?.source)
                .filter((option): option is O => option !== undefined),
            })
          : label}
      </Selector>
    </div>
  );
}

const ForwardPopoverSelect = forwardRef(
  InternalPopoverSelect as never,
) as unknown as PopoverSelectComponent;
const PopoverSelect = memo(
  ForwardPopoverSelect as React.ComponentType<
    PopoverSelectProps<RawValueType, DefaultOptionType>
  >,
) as unknown as PopoverSelectComponent;
export default attachPropertiesToComponent(PopoverSelect, { Selector });
