import {
  componentRegistry,
  getComponentNames,
} from '../data/component-registry.js';

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

export function handleListComponents(): ListComponentsResult {
  const names = getComponentNames();

  const components = names.map((name) => {
    const comp = componentRegistry[name];
    return {
      name: comp.name,
      description: comp.description,
      category: comp.category,
      features: comp.features,
    };
  });

  return {
    total: components.length,
    components,
  };
}
