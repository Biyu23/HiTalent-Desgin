import React from 'react';
import { isNullOrBlank } from '../../utils';
import type { RawValueType } from './type';

/**
 * 递归提取 React 节点中的纯文本内容，用于搜索过滤与 Tooltip 提示
 */
export function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return '';
  return React.Children.toArray(node.props.children).map(getNodeText).join('');
}

/**
 * 为字符串和数字选项生成不会互相冲突的渲染 key
 */
export function getOptionKey(value: RawValueType): string {
  return `${typeof value}:${String(value)}`;
}

/**
 * 读取对象指定属性值的辅助函数
 */
export function readField<OptionType extends object>(
  option: OptionType,
  key: PropertyKey,
): unknown {
  return (option as Record<PropertyKey, unknown>)[key];
}

/**
 * 将外部传入的受控/非受控值解析为内部统一维护的数组格式：
 * 1. 空值解析为空数组 []
 * 2. 多选字符串模式（valueType === 'string'）：按分隔符拆分并根据选项恢复原始值类型
 * 3. 数组格式：直接转换为 ValueType[]
 * 4. 单值格式：包装为 [value] 数组
 *
 * @param value 外部传入的 value 或 defaultValue
 * @param mode 单选或多选模式
 * @param valueType 数组或分隔符字符串
 * @param valueSeparator 字符串值的分隔符
 * @param stringValueMap 选项字符串值到原始值的映射
 */
export function parseExternalValue<ValueType extends RawValueType>(
  value: unknown,
  mode: 'single' | 'multiple',
  valueType: 'array' | 'string' | undefined,
  valueSeparator: string,
  stringValueMap: ReadonlyMap<string, ValueType>,
): ValueType[] {
  if (isNullOrBlank(value)) return [];

  if (mode === 'multiple' && valueType === 'string') {
    return (value as string)
      .split(valueSeparator)
      .map(
        (item) => stringValueMap.get(item) ?? (item as unknown as ValueType),
      );
  }

  if (Array.isArray(value)) return value as ValueType[];

  return [value as ValueType];
}
