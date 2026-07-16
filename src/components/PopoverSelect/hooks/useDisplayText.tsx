import { Tooltip } from 'antd';
import React, { useMemo } from 'react';

interface UseDisplayTextParams<
  ValueType extends string | number,
  MappedOption extends Record<string, any>,
> {
  /** 当前已确认的选中值列表 */
  internalValue: ValueType[];
  /** 映射后的选项列表（用于获取 label） */
  options: MappedOption[];
  /** 单选 / 多选模式 */
  mode: 'single' | 'multiple';
  /** 多选模式下最多显示的标签数 */
  maxTagCount?: number;
  /** 多选值的分隔符 */
  separator: string;
  /** 无值时显示的占位文字 */
  placeholder: React.ReactNode;
}

/**
 * 展示文本计算
 *
 * 根据选中值还原 label 文本，处理多选截断（+N 省略）和 tooltip 展示。
 */
export function useDisplayText<
  ValueType extends string | number,
  MappedOption extends Record<string, any>,
>(params: UseDisplayTextParams<ValueType, MappedOption>) {
  const { internalValue, options, mode, maxTagCount, separator, placeholder } =
    params;

  const { selectedLabels, allLabels, isTruncated, omittedCount } =
    useMemo(() => {
      if (internalValue.length === 0) {
        return {
          selectedLabels: [] as React.ReactNode[],
          allLabels: [] as React.ReactNode[],
          isTruncated: false,
          omittedCount: 0,
        };
      }
      const selectedOptions = options.filter((opt: MappedOption) =>
        internalValue.includes(opt.value),
      );
      const labels = selectedOptions.map((opt: MappedOption) => opt.label);
      if (
        mode === 'multiple' &&
        maxTagCount &&
        selectedOptions.length > maxTagCount
      ) {
        return {
          selectedLabels: labels.slice(0, maxTagCount),
          allLabels: labels,
          isTruncated: true,
          omittedCount: selectedOptions.length - maxTagCount,
        };
      }
      return {
        selectedLabels: labels,
        allLabels: labels,
        isTruncated: false,
        omittedCount: 0,
      };
    }, [internalValue, options, maxTagCount, mode]);

  const displayTextNode = useMemo(() => {
    if (selectedLabels.length === 0) return <>{placeholder}</>;
    const visibleText = selectedLabels.join(separator);
    if (isTruncated) {
      const fullText = allLabels.join(separator);
      return (
        <Tooltip title={fullText} autoAdjustOverflow>
          <span>{`${visibleText}${separator}... (+${omittedCount})`}</span>
        </Tooltip>
      );
    }
    return <>{visibleText}</>;
  }, [
    selectedLabels,
    allLabels,
    isTruncated,
    omittedCount,
    separator,
    placeholder,
  ]);

  const hasValue = internalValue.length > 0;

  return { displayTextNode, hasValue };
}
