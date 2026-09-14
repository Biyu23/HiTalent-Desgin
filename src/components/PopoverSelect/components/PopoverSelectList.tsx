import { Empty } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useMemo } from 'react';
import type { PopoverSelectLocale } from '../../../locales';
import { useStyles } from '../style';
import type {
  MappedOption,
  PopoverSelectBaseProps,
  PopoverSelectRenderContext,
  RawValueType,
} from '../type';
import { getNodeText, getOptionKey } from '../utils';
import PopoverSelectOption from './PopoverSelectOption';
import SortableOption from './SortableOption';
import SortableOptions from './SortableOptions';

export interface PopoverSelectListProps<
  V extends RawValueType,
  O extends object,
> {
  config: PopoverSelectBaseProps<O, V>;
  context: PopoverSelectRenderContext<V, O>;
  locale: PopoverSelectLocale;
  active: boolean;
}

/** 普通/虚拟列表共用选项视图，排序作为可选包装。 */
export default function PopoverSelectList<
  V extends RawValueType,
  O extends object,
>({ config, context, locale, active }: PopoverSelectListProps<V, O>) {
  const {
    virtual = true,
    listHeight = 150,
    listItemHeight = 34,
    sortable = false,
    optionRender,
    classNames,
    styles,
  } = config;
  const {
    options,
    displayOptions,
    selectedValues,
    searchValue,
    mode,
    toggleValue,
  } = context;
  const { styles: listStyles, cx } = useStyles();
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const sortingEnabled = active && !config.disabled && !searchValue.trim();
  const renderOption = (option: MappedOption<V, O>) => (
    <PopoverSelectOption
      key={getOptionKey(option.value)}
      multiple={mode === 'multiple'}
      selected={selectedSet.has(option.value)}
      disabled={option.disabled || !!config.disabled}
      virtual={virtual}
      onToggle={() => toggleValue(option.value)}
    >
      {optionRender ? (
        optionRender(option.source, {
          value: option.value,
          selected: selectedSet.has(option.value),
          disabled: option.disabled,
        })
      ) : (
        <span
          className={listStyles.menuItemText}
          title={typeof option.label === 'string' ? option.label : undefined}
        >
          {option.label}
        </span>
      )}
    </PopoverSelectOption>
  );
  const renderItem = (option: MappedOption<V, O>) =>
    sortable ? (
      <SortableOption
        key={getOptionKey(option.value)}
        id={getOptionKey(option.value)}
        disabled={!sortingEnabled || option.disabled}
        handleLabel={`${locale.dragHandle}: ${
          getNodeText(option.label) || String(option.value)
        }`}
      >
        {renderOption(option)}
      </SortableOption>
    ) : (
      renderOption(option)
    );
  const menu = displayOptions.length ? (
    <div
      className={cx(
        listStyles.menu,
        !virtual && listStyles.menuScroll,
        classNames?.menu,
      )}
      style={{
        ...(!virtual ? { maxHeight: listHeight } : undefined),
        ...styles?.menu,
      }}
    >
      {virtual ? (
        <VirtualList
          data={displayOptions as MappedOption<V, O>[]}
          height={Math.min(displayOptions.length * listItemHeight, listHeight)}
          itemHeight={listItemHeight}
          itemKey={(option) => getOptionKey(option.value)}
        >
          {renderItem}
        </VirtualList>
      ) : (
        displayOptions.map(renderItem)
      )}
    </div>
  ) : (
    <div className={listStyles.empty}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={options.length ? locale.noMatch : locale.noData}
      />
    </div>
  );
  const defaultMenu = sortable ? (
    <SortableOptions
      options={options}
      enabled={sortingEnabled}
      onSortChange={config.onSortChange}
      renderOption={renderOption}
      listItemHeight={listItemHeight}
      locale={locale}
    >
      {menu}
    </SortableOptions>
  ) : (
    menu
  );
  // 保留原有 dropdownRender 的实际菜单节点，兼容 cloneElement 修改 DOM 属性。
  return config.dropdownRender
    ? config.dropdownRender(defaultMenu, context)
    : defaultMenu;
}
