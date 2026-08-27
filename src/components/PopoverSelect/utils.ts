import React from 'react';

/**
 * 递归提取 React 节点中的纯文本内容，用于搜索过滤与 Tooltip 提示
 */
export function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return '';
  return React.Children.toArray(node.props.children).map(getNodeText).join('');
}

/**
 * 读取对象属性辅助函数
 */
export function readField<OptionType extends object>(
  option: OptionType,
  key: PropertyKey,
): unknown {
  return (option as Record<PropertyKey, unknown>)[key];
}
