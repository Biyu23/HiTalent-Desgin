import type { ComponentDoc } from '../tools/types.js';
/**
 * HiTalent Design 组件注册表
 *
 * 包含所有组件的完整元数据：Props 定义、使用示例、注意事项等。
 * 这是 MCP 工具返回 AI 可消费结构化组件文档的核心数据源。
 */
type AnyComponentDoc = ComponentDoc;
export declare const componentRegistry: Record<string, AnyComponentDoc>;
/**
 * 获取所有组件名称列表
 */
export declare function getComponentNames(): string[];
/**
 * 根据名称获取组件文档
 */
export declare function getComponent(name: string): ComponentDoc | undefined;
export {};
//# sourceMappingURL=component-registry.d.ts.map
