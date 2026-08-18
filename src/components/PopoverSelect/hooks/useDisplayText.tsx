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
  /** 快速查找 Map */
  optionMap: Map<ValueType, MappedOption>;
  /** 单选 / 多选模式 */
  mode: 'single' | 'multiple';
  /** 多选模式下最多显示的标签数 */
  maxTagCount?: number;
  /** 多选值的分隔符 */
  separator: string;
  /** 无值时显示的占位文字 */
  placeholder: React.ReactNode;
  /** 是否开启省略提示 */
  ellipsis?: boolean | { tooltip?: string };
}

/** 辅助函数：从 React 节点中提取纯文本用于 Tooltip 提示 */
function getTextFromNode(node: React.ReactNode): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (React.isValidElement(node)) {
    const children = (node.props as any)?.children;
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children);
    }
    if (Array.isArray(children)) {
      return children.map(getTextFromNode).join('');
    }
    if (children) {
      return getTextFromNode(children);
    }
  }
  return '';
}

/**
 * 展示文本计算
 *
 * 根据选中值按用户选择顺序还原 label 文本，处理多选截断（+N 省略）和 tooltip 完整内容展示。
 */
export function useDisplayText<
  ValueType extends string | number,
  MappedOption extends Record<string, any>,
>(params: UseDisplayTextParams<ValueType, MappedOption>) {
  const {
    internalValue,
    optionMap,
    mode,
    maxTagCount,
    separator,
    placeholder,
    ellipsis = true,
  } = params;

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

      const labels = internalValue.map((val: ValueType) => {
        const found = optionMap.get(val);
        return found !== undefined && found.label !== undefined
          ? found.label
          : String(val);
      });

      if (mode === 'multiple' && maxTagCount && labels.length > maxTagCount) {
        return {
          selectedLabels: labels.slice(0, maxTagCount),
          allLabels: labels,
          isTruncated: true,
          omittedCount: labels.length - maxTagCount,
        };
      }

      return {
        selectedLabels: labels,
        allLabels: labels,
        isTruncated: false,
        omittedCount: 0,
      };
    }, [internalValue, optionMap, maxTagCount, mode]);

  const displayTextNode = useMemo(() => {
    if (selectedLabels.length === 0) return <>{placeholder}</>;

    const renderNodes = (list: React.ReactNode[]) => {
      return list.map((label, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && separator}
          {label}
        </React.Fragment>
      ));
    };

    const fullText = allLabels
      .map(getTextFromNode)
      .filter(Boolean)
      .join(separator);

    const tooltipTitle =
      typeof ellipsis === 'object' && ellipsis?.tooltip
        ? ellipsis.tooltip
        : fullText || undefined;

    const enableTooltip = ellipsis !== false && Boolean(tooltipTitle);

    const contentNode = isTruncated ? (
      <span>
        {renderNodes(selectedLabels)}
        {separator}... (+{omittedCount})
      </span>
    ) : (
      <span>{renderNodes(selectedLabels)}</span>
    );

    if (enableTooltip) {
      return (
        <Tooltip title={tooltipTitle} autoAdjustOverflow>
          {contentNode}
        </Tooltip>
      );
    }

    return contentNode;
  }, [
    selectedLabels,
    allLabels,
    isTruncated,
    omittedCount,
    separator,
    placeholder,
    ellipsis,
  ]);

  const hasValue = internalValue.length > 0;

  return { displayTextNode, hasValue };
}
