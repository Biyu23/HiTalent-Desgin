/**
 * list_components 工具
 *
 * 列出所有可用的 HiTalent Design 组件及其简要信息，
 * 帮助 AI 了解有哪些组件可用、各自的功能特性。
 */
export interface ListComponentsResult {
  total: number;
  components: Array<{
    name: string;
    description: string;
    category: string;
    features: string[];
  }>;
}
export declare function handleListComponents(): ListComponentsResult;
//# sourceMappingURL=list-components.d.ts.map
