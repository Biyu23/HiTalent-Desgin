import type { ComponentDoc } from './types.js';
/**
 * generate_code 工具
 *
 * 根据需求描述匹配最合适的组件，返回组件完整文档和代码生成提示。
 * AI（如 Claude Code）基于返回的结构化信息生成可直接使用的 TSX 代码。
 */
export interface GenerateCodeInput {
  /**
   * 需求描述，用自然语言描述你需要的组件功能和场景
   * 例如: "我需要一个提交按钮，点击后自动 loading，并防止重复点击"
   */
  requirement: string;
  /**
   * 可选的组件名称。如果不指定，系统会根据需求描述自动匹配最合适的组件。
   */
  componentName?: string;
}
export interface GenerateCodeResult {
  /** 是否找到匹配的组件 */
  matched: boolean;
  /** 匹配到的组件名称 */
  componentName?: string;
  /** 匹配置信度: high | medium | low */
  confidence?: 'high' | 'medium' | 'low';
  /** 匹配理由 */
  matchReason?: string;
  /** 组件的完整文档（props、示例等） */
  componentDoc?: ComponentDoc;
  /** 如果匹配多个组件，列出备选 */
  alternatives?: Array<{
    name: string;
    reason: string;
  }>;
  /** 代码生成指引 — AI 基于此生成代码 */
  codeGenerationGuide?: {
    /** 必需的 import 语句 */
    imports: string;
    /** 关键 Props 说明（根据需求挑选最相关的） */
    relevantProps: Array<{
      name: string;
      type: string;
      default: string;
      description: string;
      whyRelevant: string;
    }>;
    /** 最匹配的使用示例 */
    relevantExamples: Array<{
      title: string;
      code: string;
      whyRelevant: string;
    }>;
    /** 生成代码的注意事项 */
    notes: string[];
    /** 推荐的代码骨架 */
    skeletonTemplate: string;
  };
  /** 未匹配时的建议 */
  suggestion?: string;
}
/**
 * generate_code 工具的主处理函数
 */
export declare function handleGenerateCode(
  input: GenerateCodeInput,
): GenerateCodeResult;
//# sourceMappingURL=generate-code.d.ts.map
