import { Tooltip } from 'antd';
import React, { memo } from 'react';
import type { MappedOption, RawValueType } from '../type';
import { getNodeText, getOptionKey } from '../utils';

export interface PopoverSelectLabelProps<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  /** 当前已选中的值列表 */
  selectedValues: readonly ValueType[];
  /** 选项 Map<value, MappedOption> */
  optionMap: ReadonlyMap<ValueType, MappedOption<ValueType, OptionType>>;
  /** 模式 */
  mode: 'single' | 'multiple';
  /** 未选择时的占位文本 */
  placeholder: React.ReactNode;
  /** 多选标签分隔符 */
  separator?: string;
  /** 最多展示标签数 */
  maxTagCount?: number;
  /** 超出省略与 Tooltip 提示配置 */
  ellipsis?: boolean | { tooltip?: string };
}

/**
 * 触发器内部选中文本展示与 Tooltip 组件：
 * 1. 无选中值时：展示占位文本 placeholder。
 * 2. 单选/多选时：渲染标签拼接内容，支持 maxTagCount 超出折叠 (+N) 标识。
 * 3. 气泡提示：当开启 ellipsis 时，悬浮展示完整选中项文本或自定义 tooltip。
 */
export const PopoverSelectLabel = memo(
  <ValueType extends RawValueType, OptionType extends object>(
    props: PopoverSelectLabelProps<ValueType, OptionType>,
  ) => {
    const {
      selectedValues,
      optionMap,
      mode,
      placeholder,
      separator = ', ',
      maxTagCount,
      ellipsis = true,
    } = props;

    if (selectedValues.length === 0) {
      return <>{placeholder}</>;
    }

    // 转换各选中项的展示文本/节点
    const labels = selectedValues.map(
      (value) => optionMap.get(value)?.label ?? String(value),
    );

    // 多选截断逻辑
    const visibleLabels =
      mode === 'multiple' && maxTagCount !== undefined
        ? labels.slice(0, Math.max(0, maxTagCount))
        : labels;

    const remainingCount = labels.length - visibleLabels.length;

    // Tooltip 展示标题文本
    const tooltipTitle =
      ellipsis === false
        ? undefined
        : typeof ellipsis === 'object' && ellipsis.tooltip
        ? ellipsis.tooltip
        : labels.map(getNodeText).join(separator);

    const labelContent = (
      <span>
        {visibleLabels.map((label, index) => (
          <React.Fragment key={getOptionKey(selectedValues[index])}>
            {index > 0 && separator}
            {label}
          </React.Fragment>
        ))}
        {remainingCount > 0 && (
          <>
            {visibleLabels.length > 0 && separator}
            {`... (+${remainingCount})`}
          </>
        )}
      </span>
    );

    if (tooltipTitle === undefined) {
      return labelContent;
    }

    return <Tooltip title={tooltipTitle}>{labelContent}</Tooltip>;
  },
);

PopoverSelectLabel.displayName = 'PopoverSelectLabel';

export default PopoverSelectLabel;
