/**
 * MCP 工具共享类型定义
 */
export interface PropDoc {
  /** 属性名称 */
  name: string;
  /** TypeScript 类型 */
  type: string;
  /** 默认值 */
  default: string;
  /** 是否必填 */
  required: boolean;
  /** 属性说明 */
  description: string;
}
export interface RefAPIDoc {
  /** 方法名称 */
  name: string;
  /** 方法签名 */
  signature: string;
  /** 方法说明 */
  description: string;
}
export interface ExampleDoc {
  /** 示例标题 */
  title: string;
  /** 示例代码 */
  code: string;
}
export interface ComponentDoc {
  /** 组件名称 */
  name: string;
  /** 组件描述 */
  description: string;
  /** 组件分类 */
  category: string;
  /** 功能特性标签 */
  features: string[];
  /** 推荐的 import 语句 */
  imports: string;
  /** Props 文档 */
  props: PropDoc[];
  /** 命令式 API 文档（仅 Modal 等暴露 ref 的组件） */
  refAPI?: RefAPIDoc[];
  /** 使用示例 */
  examples: ExampleDoc[];
  /** 注意事项 */
  notes: string[];
}
//# sourceMappingURL=types.d.ts.map
