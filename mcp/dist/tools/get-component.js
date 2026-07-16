import { getComponent, getComponentNames } from '../data/component-registry.js';
export function handleGetComponent(input) {
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
//# sourceMappingURL=get-component.js.map
