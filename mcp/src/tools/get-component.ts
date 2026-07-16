import { getComponent, getComponentNames } from '../data/component-registry.js';
import type { ComponentDoc } from './types.js';

/**
 * get_component 工具
 *
 * 获取单个组件的完整 API 文档，包括 Props 定义、使用示例、注意事项。
 * AI 可据此生成正确的组件代码。
 */
export interface GetComponentInput {
  /** 组件名称 */
  componentName: string;
}

export interface GetComponentResult {
  found: boolean;
  component?: ComponentDoc;
  suggestion?: string;
}

export function handleGetComponent(
  input: GetComponentInput,
): GetComponentResult {
  const doc = getComponent(input.componentName);

  if (!doc) {
    const names = getComponentNames();
    return {
      found: false,
      suggestion: `组件 "${
        input.componentName
      }" 不存在。可用的组件有：${names.join(', ')}。`,
    };
  }

  return {
    found: true,
    component: doc,
  };
}
